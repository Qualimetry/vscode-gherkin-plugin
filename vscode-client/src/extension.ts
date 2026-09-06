import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from 'vscode-languageclient/node';
import { findJavaExecutable, getConfiguration, getJavaVersion } from './configuration';
import {
    fetchActiveRules,
    fetchProjectQualityProfiles,
    fetchQualityProfiles,
    resolveProfileKey,
    type SonarConfig,
} from './sonarImport';
import {
    findFirstExistingProject,
    projectExists,
    repositoryNameFromRemote,
    resolveBranch,
    tokenIsValid,
} from './bindingDiscovery';
import {
    componentKeyFor,
    currentGitState,
    discoverCandidates,
    issueSyncEnabled,
    readBinding,
    workspaceRelativePath,
    writeBinding,
    type ProjectBinding,
} from './sonarBinding';
import { pickProject } from './projectPicker';
import { ServerIssueStore } from './serverIssueStore';
import { IssueCodeActionProvider, MARK_ACCEPTED, MARK_FALSE_POSITIVE, SHOW_RULE, applyResolution, type ResolutionRequest } from './issueActions';
import { RuleCatalogue } from './ruleContent';
import { showRuleDescription } from './ruleView';
import { fetchServerVersion } from './sonarIssues';
import type { SonarConnection } from './sonarHttp';

const MIN_JAVA_VERSION = 17;

let client: LanguageClient | undefined;
let outputChannel: vscode.OutputChannel;
let issueStore: ServerIssueStore;
let ruleCatalogue: RuleCatalogue | undefined;
let cachedServerVersion: string | undefined;

const SONAR_LAST_URL_KEY = 'gherkin.sonar.lastServerUrl';
const SONAR_LAST_PROFILE_KEY = 'gherkin.sonar.lastProfile';
const SONAR_TOKEN_SECRET_KEY = 'gherkin.sonar.token';
const BINDING_PROMPT_DISMISSED_KEY = 'gherkin.sonar.bindingPromptDismissed';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    outputChannel = vscode.window.createOutputChannel('Gherkin Analyzer');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('Gherkin Analyzer: activating...');

    issueStore = new ServerIssueStore(outputChannel);
    ruleCatalogue = RuleCatalogue.load(context.extensionPath);
    if (!ruleCatalogue) {
        outputChannel.appendLine('Rule descriptions are unavailable: rules/rule-content.json is missing.');
    }

    // Registered first so they work regardless of Java or the language server.
    context.subscriptions.push(
        vscode.commands.registerCommand('gherkin.importRulesFromSonarQube', () =>
            connectToSonarQube(context)
        ),
        vscode.commands.registerCommand('gherkin.syncServerIssues', () =>
            syncServerIssues(context, true)
        ),
        vscode.commands.registerCommand(SHOW_RULE, (ruleKey?: string) =>
            showRuleForKey(ruleKey)
        ),
        vscode.commands.registerCommand(MARK_FALSE_POSITIVE, (request: ResolutionRequest) =>
            resolve(context, request)
        ),
        vscode.commands.registerCommand(MARK_ACCEPTED, (request: ResolutionRequest) =>
            resolve(context, request)
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { scheme: 'file', language: 'gherkin' },
            new IssueCodeActionProvider(issueStore, ruleCatalogue, () => cachedServerVersion),
            { providedCodeActionKinds: IssueCodeActionProvider.providedCodeActionKinds }
        )
    );

    const config = getConfiguration();

    if (!config.enabled) {
        outputChannel.appendLine('Gherkin Analyzer is disabled via settings.');
        return;
    }

    const javaPath = findJavaExecutable(config.javaHome);
    if (!javaPath) {
        const msg = 'Gherkin Analyzer: Java 17+ is required but was not found. ' +
            'Set "gherkinAnalyzer.java.home" in settings, or ensure JAVA_HOME or java is on PATH.';
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }
    outputChannel.appendLine(`Java executable: ${javaPath}`);

    const version = getJavaVersion(javaPath);
    outputChannel.appendLine(`Java version detected: ${version ?? 'unknown'}`);
    if (version !== undefined && version < MIN_JAVA_VERSION) {
        const msg = `Gherkin Analyzer: Java ${MIN_JAVA_VERSION}+ is required, but found Java ${version} at "${javaPath}". ` +
            'Set "gherkinAnalyzer.java.home" to a JDK 17+ installation.';
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }

    const serverJar = path.join(context.extensionPath, 'server', 'gherkin-lsp-server.jar');
    if (!fs.existsSync(serverJar)) {
        const msg = `Gherkin Analyzer: Server JAR not found at ${serverJar}.`;
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }
    outputChannel.appendLine(`Server JAR: ${serverJar}`);

    const serverOptions: ServerOptions = {
        command: javaPath,
        args: ['-jar', serverJar],
        options: { env: process.env },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'gherkin' }],
        synchronize: {
            configurationSection: 'gherkinAnalyzer',
        },
        outputChannel,
        middleware: {
            // The only point at which findings can be withheld before the editor shows them.
            handleDiagnostics: (uri, diagnostics, next) => {
                next(uri, issueStore.filterResolved(uri, diagnostics));
            },
        },
    };

    client = new LanguageClient(
        'gherkinAnalyzer',
        'Gherkin Analyzer',
        serverOptions,
        clientOptions
    );

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = '$(checklist) Gherkin Analyzer';
    statusBar.tooltip = 'Gherkin Analyzer is active';
    statusBar.show();
    context.subscriptions.push(statusBar);

    outputChannel.appendLine('Starting language server...');
    try {
        await client.start();
        outputChannel.appendLine('Language server started successfully.');
    } catch (err) {
        const msg = `Gherkin Analyzer: Failed to start language server: ${err}`;
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(msg);
        return;
    }
    context.subscriptions.push({ dispose: () => client?.stop() });

    autoSyncRulesOnStartup(context).catch((err) => {
        outputChannel.appendLine(`SonarQube rule auto-sync failed: ${err}`);
    });

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === 'gherkin') {
                loadIssuesForDocument(context, document).catch((err) => {
                    outputChannel.appendLine(`SonarQube issue sync failed: ${err}`);
                });
            }
        })
    );

    syncServerIssues(context, false).catch((err) => {
        outputChannel.appendLine(`SonarQube issue sync failed: ${err}`);
    });

    suggestBindingIfUnbound(context).catch((err) => {
        outputChannel.appendLine(`SonarQube binding discovery failed: ${err}`);
    });
}

async function readConnection(
    context: vscode.ExtensionContext
): Promise<SonarConnection | undefined> {
    const serverUrl = context.globalState.get<string>(SONAR_LAST_URL_KEY);
    if (!serverUrl) {
        return undefined;
    }
    return { serverUrl, token: (await context.secrets.get(SONAR_TOKEN_SECRET_KEY)) ?? undefined };
}

function showRuleForKey(ruleKey: string | undefined): void {
    if (ruleKey) {
        showRuleDescription(ruleCatalogue, ruleKey);
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const diagnostic = editor
        ? vscode.languages
            .getDiagnostics(editor.document.uri)
            .find((d) => d.source === 'qualimetry-gherkin' && d.range.contains(editor.selection.active))
        : undefined;
    const code = diagnostic?.code;
    const key = typeof code === 'string'
        ? code
        : typeof code === 'object' && code !== null && 'value' in code
            ? String((code as { value: string | number }).value)
            : undefined;
    if (!key) {
        vscode.window.showInformationMessage(
            'Qualimetry Gherkin: put the cursor on a Gherkin finding to see its rule.'
        );
        return;
    }
    showRuleDescription(ruleCatalogue, key);
}

async function resolve(
    context: vscode.ExtensionContext,
    request: ResolutionRequest
): Promise<void> {
    const connection = await readConnection(context);
    if (!connection) {
        vscode.window.showWarningMessage(
            'Qualimetry Gherkin: connect to SonarQube before resolving issues.'
        );
        return;
    }
    await applyResolution(connection, request, issueStore, () => {
        void syncServerIssues(context, false);
    });
}

/**
 * Fetches one file's issues on open. Per-file scoping keeps every request small however large
 * the bound project is.
 */
async function loadIssuesForDocument(
    context: vscode.ExtensionContext,
    document: vscode.TextDocument
): Promise<void> {
    if (!issueSyncEnabled()) {
        return;
    }
    const binding = readBinding();
    const connection = await readConnection(context);
    if (!binding || !connection) {
        return;
    }
    const relativePath = workspaceRelativePath(document.uri);
    if (!relativePath) {
        return;
    }
    await issueStore.loadComponent(connection, binding, componentKeyFor(binding, relativePath));
}

async function syncServerIssues(
    context: vscode.ExtensionContext,
    interactive: boolean
): Promise<void> {
    if (!issueSyncEnabled() && !interactive) {
        return;
    }
    const binding = readBinding();
    const connection = await readConnection(context);
    if (!binding || !connection) {
        if (interactive) {
            vscode.window.showWarningMessage(
                'Qualimetry Gherkin: run "Gherkin: Connect to SonarQube" first to bind this workspace to a project.'
            );
        }
        return;
    }

    cachedServerVersion = cachedServerVersion ?? (await fetchServerVersion(connection));

    try {
        const count = await issueStore.loadProject(connection, binding);
        outputChannel.appendLine(
            `SonarQube issue sync: read ${count} issue(s) for ${binding.projectKey}` +
            (binding.branch ? ` on branch ${binding.branch}` : '') + '.'
        );
        if (interactive) {
            vscode.window.showInformationMessage(
                `Read ${count} issue${count === 1 ? '' : 's'} from SonarQube.`
            );
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        outputChannel.appendLine(`SonarQube issue sync failed: ${message}`);
        if (interactive) {
            vscode.window.showErrorMessage(`Reading issues from SonarQube failed: ${message}`);
        }
    }
}

/**
 * Offers a binding when one can be worked out from the workspace. Nothing is bound without the
 * user agreeing, and declining is remembered.
 */
async function suggestBindingIfUnbound(context: vscode.ExtensionContext): Promise<void> {
    if (readBinding() || context.workspaceState.get<boolean>(BINDING_PROMPT_DISMISSED_KEY)) {
        return;
    }
    const connection = await readConnection(context);
    if (!connection) {
        return;
    }
    const candidates = await discoverCandidates();
    if (candidates.length === 0) {
        return;
    }
    const match = await findFirstExistingProject(connection, candidates);
    if (!match) {
        return;
    }

    const choice = await vscode.window.showInformationMessage(
        `Bind this workspace to SonarQube project "${match.projectKey}"?`,
        'Bind',
        'Choose another',
        "Don't ask again"
    );
    if (choice === "Don't ask again") {
        await context.workspaceState.update(BINDING_PROMPT_DISMISSED_KEY, true);
        return;
    }
    if (choice === 'Bind') {
        await bindTo(context, connection, match.projectKey);
    } else if (choice === 'Choose another') {
        const picked = await pickProject(connection, repositoryNameFromRemote(currentGitState().remoteUrl));
        if (picked) {
            await bindTo(context, connection, picked);
        }
    }
}

async function bindTo(
    context: vscode.ExtensionContext,
    connection: SonarConnection,
    projectKey: string
): Promise<ProjectBinding> {
    let branch: string | undefined;
    try {
        branch = await resolveBranch(connection, projectKey, currentGitState().branch);
    } catch {
        // A server that does not expose branches simply leaves the default in play.
    }
    const binding: ProjectBinding = { projectKey, branch, pathPrefix: '' };
    await writeBinding(binding);
    outputChannel.appendLine(
        `Bound to SonarQube project ${projectKey}${branch ? ` on branch ${branch}` : ''}.`
    );
    await syncServerIssues(context, false);
    return binding;
}

interface SonarSyncOptions {
    serverUrl: string;
    profileNameOrKey: string;
    token?: string;
}

/**
 * Fetches the active rules from a SonarQube quality profile and writes them to
 * gherkinAnalyzer.rules + gherkinAnalyzer.rulesReplaceDefaults. Throws on failure.
 */
async function syncRulesFromSonarQube(
    context: vscode.ExtensionContext,
    opts: SonarSyncOptions
): Promise<{ count: number; targetLabel: string }> {
    const config: SonarConfig = {
        serverUrl: opts.serverUrl.trim(),
        profileNameOrKey: opts.profileNameOrKey.trim(),
        token: opts.token?.trim() || undefined,
    };
    const profileKey = await resolveProfileForBinding(config);
    const rules = await fetchActiveRules(config, profileKey);
    if (Object.keys(rules).length === 0) {
        throw new Error(
            'No active rules found in the selected profile (or profile is not for Qualimetry Gherkin).'
        );
    }
    const hasWorkspace = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
    const configTarget = hasWorkspace
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
    const targetLabel = hasWorkspace ? 'workspace' : 'user';
    const cfg = vscode.workspace.getConfiguration('gherkinAnalyzer', null);
    await cfg.update('rules', rules, configTarget);
    await cfg.update('rulesReplaceDefaults', true, configTarget);
    await context.globalState.update(SONAR_LAST_URL_KEY, config.serverUrl);
    return { count: Object.keys(rules).length, targetLabel };
}

/**
 * A bound project names the profile the server actually applies to it, which is more reliable
 * than a profile name typed by hand. The typed name remains the fallback for unbound workspaces.
 */
async function resolveProfileForBinding(config: SonarConfig): Promise<string> {
    const binding = readBinding();
    if (binding) {
        const projectProfiles = await fetchProjectQualityProfiles(config, binding.projectKey);
        if (projectProfiles.length > 0) {
            return projectProfiles[0].key;
        }
    }

    const profiles = await fetchQualityProfiles(config);
    if (profiles.length === 0) {
        throw new Error('No Gherkin quality profiles found on this SonarQube server.');
    }
    const requested = config.profileNameOrKey?.trim();
    if (!requested) {
        return (profiles.find((p) => p.isDefault) ?? profiles[0]).key;
    }
    const profileKey = resolveProfileKey(profiles, requested);
    if (!profileKey) {
        throw new Error(
            `No matching Gherkin profile for "${requested}". ` +
            `Available: ${profiles.map((p) => p.name).join(', ')}`
        );
    }
    return profileKey;
}

async function autoSyncRulesOnStartup(context: vscode.ExtensionContext): Promise<void> {
    const autoSync = vscode.workspace
        .getConfiguration('gherkinAnalyzer')
        .get<boolean>('sonar.autoSyncOnStartup', true);
    if (!autoSync) {
        return;
    }
    const serverUrl = context.globalState.get<string>(SONAR_LAST_URL_KEY);
    if (!serverUrl) {
        return;
    }
    const profileNameOrKey = context.globalState.get<string>(SONAR_LAST_PROFILE_KEY) ?? '';
    const token = await context.secrets.get(SONAR_TOKEN_SECRET_KEY);
    try {
        const result = await syncRulesFromSonarQube(context, {
            serverUrl,
            profileNameOrKey,
            token: token ?? undefined,
        });
        outputChannel.appendLine(
            `SonarQube rule auto-sync: ${result.count} rule(s) refreshed into ${result.targetLabel} settings.`
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputChannel.appendLine(`SonarQube rule auto-sync failed: ${message}`);
        vscode.window.showWarningMessage(
            `Qualimetry Gherkin: SonarQube rule sync failed: ${message}`
        );
    }
}

/**
 * Server URL, then token, then project. The profile is derived from the project rather than
 * asked for, so a mistyped profile name can no longer silently select the wrong rule set.
 */
async function connectToSonarQube(context: vscode.ExtensionContext): Promise<void> {
    const lastUrl = context.globalState.get<string>(SONAR_LAST_URL_KEY) ?? '';

    const serverUrl = await vscode.window.showInputBox({
        title: 'SonarQube server URL',
        prompt: 'e.g. https://sonar.mycompany.com',
        value: lastUrl,
        placeHolder: 'https://',
        ignoreFocusOut: true,
        validateInput: (v) => {
            const s = v?.trim() ?? '';
            if (!s) return 'URL is required';
            if (!/^https?:\/\//i.test(s) && !/^[a-zA-Z0-9.-]+/.test(s)) return 'Enter a valid URL';
            return undefined;
        },
    });
    if (serverUrl === undefined) return;
    const urlTrimmed = serverUrl.trim();
    await context.globalState.update(SONAR_LAST_URL_KEY, urlTrimmed);

    const token = await vscode.window.showInputBox({
        title: 'SonarQube token',
        prompt: 'Paste a user token. It is stored in the editor secret store, not in settings.',
        password: true,
        ignoreFocusOut: true,
    });
    if (token === undefined) return;
    const tokenTrimmed = token.trim();

    const connection: SonarConnection = { serverUrl: urlTrimmed, token: tokenTrimmed || undefined };

    if (tokenTrimmed) {
        try {
            if (!(await tokenIsValid(connection))) {
                vscode.window.showErrorMessage('SonarQube rejected that token.');
                return;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Could not reach SonarQube: ${message}`);
            return;
        }
        await context.secrets.store(SONAR_TOKEN_SECRET_KEY, tokenTrimmed);
    } else {
        await context.secrets.delete(SONAR_TOKEN_SECRET_KEY);
    }

    const projectKey = await chooseProject(connection);
    if (!projectKey) {
        return;
    }
    await bindTo(context, connection, projectKey);

    let result: { count: number; targetLabel: string } | undefined;
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Importing rules from SonarQube',
            cancellable: false,
        },
        async () => {
            try {
                result = await syncRulesFromSonarQube(context, {
                    serverUrl: urlTrimmed,
                    profileNameOrKey: '',
                    token: tokenTrimmed || undefined,
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                outputChannel.appendLine(`Import from SonarQube failed: ${message}`);
                vscode.window.showErrorMessage(`Import from SonarQube failed: ${message}`);
            }
        }
    );
    if (result) {
        const location = result.targetLabel === 'workspace'
            ? 'workspace settings (.vscode/settings.json)'
            : 'user settings (global settings.json)';
        vscode.window.showInformationMessage(
            `Imported ${result.count} rule${result.count === 1 ? '' : 's'} from SonarQube into ${location}.`
        );
    }
}

/**
 * Proposes whatever the workspace already reveals before asking the user to search.
 */
async function chooseProject(connection: SonarConnection): Promise<string | undefined> {
    const candidates = await discoverCandidates();
    for (const candidate of candidates) {
        if (!(await projectExists(connection, candidate.projectKey))) {
            continue;
        }
        const choice = await vscode.window.showInformationMessage(
            `Use SonarQube project "${candidate.projectKey}" for this workspace?`,
            'Use it',
            'Choose another'
        );
        if (choice === 'Use it') {
            return candidate.projectKey;
        }
        break;
    }
    return pickProject(connection, repositoryNameFromRemote(currentGitState().remoteUrl));
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
        client = undefined;
    }
}
