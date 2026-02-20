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
    fetchQualityProfiles,
    fetchActiveRules,
    resolveProfileKey,
    type SonarConfig,
} from './sonarImport';

const MIN_JAVA_VERSION = 17;

let client: LanguageClient | undefined;
let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    outputChannel = vscode.window.createOutputChannel('Gherkin Analyzer');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('Gherkin Analyzer: activating...');

    // Register command first so it is always available (does not depend on Java or LSP)
    context.subscriptions.push(
        vscode.commands.registerCommand('gherkin.importRulesFromSonarQube', () =>
            importRulesFromSonarQube(context)
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
}

const SONAR_LAST_URL_KEY = 'gherkin.sonar.lastServerUrl';
const SONAR_LAST_PROFILE_KEY = 'gherkin.sonar.lastProfile';

async function importRulesFromSonarQube(context: vscode.ExtensionContext): Promise<void> {
    const lastUrl = context.globalState.get<string>(SONAR_LAST_URL_KEY) ?? '';
    const lastProfile = context.globalState.get<string>(SONAR_LAST_PROFILE_KEY) ?? '';

    const serverUrl = await vscode.window.showInputBox({
        title: 'SonarQube server URL',
        prompt: 'e.g. https://sonar.mycompany.com or https://myorg.sonarcloud.io',
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

    const profileNameOrKey = await vscode.window.showInputBox({
        title: 'Gherkin quality profile',
        prompt: 'Profile name or key (e.g. "Qualimetry Gherkin" or the profile key)',
        value: lastProfile,
        placeHolder: 'Qualimetry Gherkin',
        ignoreFocusOut: true,
    });
    if (profileNameOrKey === undefined) return;
    const profileTrimmed = profileNameOrKey.trim();
    await context.globalState.update(SONAR_LAST_PROFILE_KEY, profileTrimmed);

    const token = await vscode.window.showInputBox({
        title: 'SonarQube token (optional)',
        prompt: 'Paste token here. If this box closes when you switch apps, run the command again - URL and profile are already saved.',
        password: true,
        ignoreFocusOut: true,
    });
    if (token === undefined) return;

    const config: SonarConfig = {
        serverUrl: serverUrl.trim(),
        profileNameOrKey: profileNameOrKey.trim(),
        token: (token ?? '').trim() || undefined,
    };

    let result: { count: number; targetLabel: string } | undefined;
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Importing rules from SonarQube',
            cancellable: false,
        },
        async () => {
            try {
                const profiles = await fetchQualityProfiles(config);
                if (profiles.length === 0) {
                    vscode.window.showErrorMessage(
                        'No Gherkin quality profiles found on this SonarQube server.'
                    );
                    return;
                }
                const profileKey = resolveProfileKey(profiles, config.profileNameOrKey);
                if (!profileKey) {
                    vscode.window.showErrorMessage(
                        `No matching Gherkin profile for "${config.profileNameOrKey}". ` +
                        `Available: ${profiles.map((p) => p.name).join(', ')}`
                    );
                    return;
                }
                const rules = await fetchActiveRules(config, profileKey);
                if (Object.keys(rules).length === 0) {
                    vscode.window.showErrorMessage(
                        'No active rules found in the selected profile (or profile is not for Qualimetry Gherkin).'
                    );
                    return;
                }
                const hasWorkspace = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
                const configTarget = hasWorkspace
                    ? vscode.ConfigurationTarget.Workspace
                    : vscode.ConfigurationTarget.Global;
                const targetLabel = hasWorkspace ? 'workspace' : 'user';
                const cfg = vscode.workspace.getConfiguration('gherkinAnalyzer', null);
                await cfg.update('rules', rules, configTarget);
                await cfg.update('rulesReplaceDefaults', true, configTarget);
                context.globalState.update(SONAR_LAST_URL_KEY, config.serverUrl);
                context.globalState.update(SONAR_LAST_PROFILE_KEY, config.profileNameOrKey);
                const count = Object.keys(rules).length;
                result = { count, targetLabel };
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                outputChannel.appendLine(`Import from SonarQube failed: ${message}`);
                vscode.window.showErrorMessage(`Import from SonarQube failed: ${message}`);
            }
        }
    );
    if (result) {
        vscode.window.showInformationMessage(
            `Imported ${result.count} rule${result.count === 1 ? '' : 's'} from SonarQube into ${result.targetLabel} settings. Use File > Preferences to open settings and view the rules.`
        );
    }
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
        client = undefined;
    }
}
