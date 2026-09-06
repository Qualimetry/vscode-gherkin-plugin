/**
 * Holds which SonarQube project a workspace is bound to and translates between local file
 * paths and SonarQube component keys.
 */

import * as vscode from 'vscode';
import { collectCandidates, type DiscoveryInput, type WorkspaceFile } from './bindingDiscovery';

export const CONFIG_SECTION = 'gherkinAnalyzer';

export interface ProjectBinding {
    projectKey: string;
    branch?: string;
    pathPrefix: string;
}

const SCANNER_CONFIG_GLOB =
    '{sonar-project.properties,pom.xml,build.gradle,build.gradle.kts,gradle.properties,azure-pipelines.yml,azure-pipelines.yaml,Jenkinsfile,.github/workflows/*.yml,.github/workflows/*.yaml}';

const MAX_DISCOVERY_FILES = 40;

export function readBinding(): ProjectBinding | undefined {
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const projectKey = cfg.get<string>('sonar.projectKey', '').trim();
    if (!projectKey) {
        return undefined;
    }
    return {
        projectKey,
        branch: cfg.get<string>('sonar.branch', '').trim() || undefined,
        pathPrefix: normalizePrefix(cfg.get<string>('sonar.pathPrefix', '')),
    };
}

export async function writeBinding(binding: ProjectBinding): Promise<void> {
    const hasWorkspace = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
    const target = hasWorkspace
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION, null);
    await cfg.update('sonar.projectKey', binding.projectKey, target);
    await cfg.update('sonar.branch', binding.branch ?? '', target);
    await cfg.update('sonar.pathPrefix', binding.pathPrefix, target);
}

export function issueSyncEnabled(): boolean {
    return vscode.workspace.getConfiguration(CONFIG_SECTION).get<boolean>('sonar.issueSync', true);
}

export function hideResolvedIssuesEnabled(): boolean {
    return vscode.workspace.getConfiguration(CONFIG_SECTION).get<boolean>('sonar.hideResolvedIssues', true);
}

function normalizePrefix(prefix: string): string {
    const trimmed = prefix.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    return trimmed ? trimmed + '/' : '';
}

export function workspaceRelativePath(uri: vscode.Uri): string | undefined {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (!folder) {
        return undefined;
    }
    const relative = vscode.workspace.asRelativePath(uri, false);
    return relative.replace(/\\/g, '/');
}

export function componentKeyFor(binding: ProjectBinding, relativePath: string): string {
    return `${binding.projectKey}:${binding.pathPrefix}${relativePath}`;
}

async function readWorkspaceFiles(): Promise<WorkspaceFile[]> {
    const uris = await vscode.workspace.findFiles(
        SCANNER_CONFIG_GLOB,
        '**/node_modules/**',
        MAX_DISCOVERY_FILES
    );
    const files: WorkspaceFile[] = [];
    for (const uri of uris) {
        const relative = workspaceRelativePath(uri);
        if (!relative) {
            continue;
        }
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            files.push({ path: relative, content: Buffer.from(bytes).toString('utf8') });
        } catch {
            // An unreadable candidate simply contributes no signal.
        }
    }
    return files;
}

/**
 * Reads the checked-out branch without shelling out, using the built-in git extension when it
 * is available. Absence is normal and simply means the branch is resolved from the server.
 */
export function currentGitState(): { remoteUrl?: string; branch?: string } {
    const gitExtension = vscode.extensions.getExtension<{
        getAPI(version: number): {
            repositories: Array<{
                state: { HEAD?: { name?: string }; remotes: Array<{ name: string; fetchUrl?: string; pushUrl?: string }> };
            }>;
        };
    }>('vscode.git');
    if (!gitExtension?.isActive) {
        return {};
    }
    const repositories = gitExtension.exports.getAPI(1).repositories;
    const repository = repositories[0];
    if (!repository) {
        return {};
    }
    const origin = repository.state.remotes.find((r) => r.name === 'origin') ?? repository.state.remotes[0];
    return {
        remoteUrl: origin?.fetchUrl ?? origin?.pushUrl,
        branch: repository.state.HEAD?.name,
    };
}

export async function buildDiscoveryInput(): Promise<DiscoveryInput> {
    const git = currentGitState();
    return {
        files: await readWorkspaceFiles(),
        gitRemoteUrl: git.remoteUrl,
        folderName: vscode.workspace.workspaceFolders?.[0]?.name,
    };
}

export async function discoverCandidates() {
    return collectCandidates(await buildDiscoveryInput());
}
