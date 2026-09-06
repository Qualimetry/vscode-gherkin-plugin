/**
 * Works out which SonarQube project a workspace belongs to, so the user never types a project key.
 *
 * The parsers here are deliberately free of any editor API so they can be exercised directly.
 */

import { sonarGetJson, sonarResourceExists, type SonarConnection } from './sonarHttp';

export type DiscoverySource = 'scannerConfig' | 'gitRemote' | 'folderName';

export interface ProjectCandidate {
    projectKey: string;
    source: DiscoverySource;
}

export interface WorkspaceFile {
    /** Path relative to the workspace root, forward-slashed. */
    path: string;
    content: string;
}

const SCANNER_PROPERTY = /^[ \t]*sonar\.projectKey[ \t]*=[ \t]*(.+?)[ \t]*$/m;
const MAVEN_PROPERTY = /<sonar\.projectKey>\s*([^<\s][^<]*?)\s*<\/sonar\.projectKey>/;
const MAVEN_GROUP_ID = /<groupId>\s*([^<\s][^<]*?)\s*<\/groupId>/;
const MAVEN_ARTIFACT_ID = /<artifactId>\s*([^<\s][^<]*?)\s*<\/artifactId>/;
/** Covers both gradle.properties assignment and the sonarqube block's property("key", "value"). */
const GRADLE_PROPERTY = /(?:systemProp\.)?["']?sonar\.projectKey["']?\s*[=:,]\s*["']?([^"'\s,)]+)["']?/;
const CLI_PROPERTY = /-D\s*sonar\.projectKey\s*=\s*["']?([^"'\s]+)["']?/;
const DOTNET_SCANNER_KEY = /\/k:\s*"([^"]+)"|\/k:([^\s"]+)/;

function firstCapture(pattern: RegExp, content: string): string | undefined {
    const match = pattern.exec(content);
    if (!match) {
        return undefined;
    }
    for (let i = 1; i < match.length; i += 1) {
        const value = match[i]?.trim();
        if (value) {
            return value;
        }
    }
    return undefined;
}

/**
 * Maven coordinates only identify a project when both halves are present and neither is
 * inherited from a parent block we did not read.
 */
function mavenCoordinates(content: string): string | undefined {
    const withoutParent = content.replace(/<parent>[\s\S]*?<\/parent>/g, '');
    const groupId = firstCapture(MAVEN_GROUP_ID, withoutParent);
    const artifactId = firstCapture(MAVEN_ARTIFACT_ID, withoutParent);
    if (!groupId || !artifactId) {
        return undefined;
    }
    if (groupId.includes('${') || artifactId.includes('${')) {
        return undefined;
    }
    return `${groupId}:${artifactId}`;
}

function isCiDefinition(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    return (
        lower.startsWith('.github/workflows/') ||
        lower.endsWith('azure-pipelines.yml') ||
        lower.endsWith('azure-pipelines.yaml') ||
        lower.endsWith('jenkinsfile')
    );
}

/**
 * Reads a project key out of whatever scanner configuration the workspace already carries.
 * This is the strongest signal available because it is what the scan itself uses.
 */
export function projectKeyFromScannerConfig(files: WorkspaceFile[]): string | undefined {
    for (const file of files) {
        const name = file.path.toLowerCase();
        if (name.endsWith('sonar-project.properties')) {
            const key = firstCapture(SCANNER_PROPERTY, file.content);
            if (key) {
                return key;
            }
        }
    }
    for (const file of files) {
        const name = file.path.toLowerCase();
        if (name.endsWith('pom.xml')) {
            const explicit = firstCapture(MAVEN_PROPERTY, file.content);
            if (explicit) {
                return explicit;
            }
        }
    }
    for (const file of files) {
        const name = file.path.toLowerCase();
        if (name.endsWith('build.gradle') || name.endsWith('build.gradle.kts') || name.endsWith('gradle.properties')) {
            const key = firstCapture(GRADLE_PROPERTY, file.content);
            if (key) {
                return key;
            }
        }
    }
    for (const file of files) {
        if (!isCiDefinition(file.path)) {
            continue;
        }
        const key = firstCapture(CLI_PROPERTY, file.content) ?? firstCapture(DOTNET_SCANNER_KEY, file.content);
        if (key) {
            return key;
        }
    }
    for (const file of files) {
        if (file.path.toLowerCase().endsWith('pom.xml')) {
            const coordinates = mavenCoordinates(file.content);
            if (coordinates) {
                return coordinates;
            }
        }
    }
    return undefined;
}

/** Extracts the bare repository name from any of the git remote URL forms. */
export function repositoryNameFromRemote(remoteUrl: string | undefined): string | undefined {
    if (!remoteUrl) {
        return undefined;
    }
    const trimmed = remoteUrl.trim().replace(/\.git$/i, '').replace(/\/+$/, '');
    if (!trimmed) {
        return undefined;
    }
    const lastSegment = trimmed.split(/[/:]/).filter(Boolean).pop();
    return lastSegment || undefined;
}

export interface DiscoveryInput {
    files: WorkspaceFile[];
    gitRemoteUrl?: string;
    folderName?: string;
}

/**
 * Produces the ordered candidate list. Returning an empty list is a valid outcome and is
 * preferred over a guess the user would have to notice was wrong.
 */
export function collectCandidates(input: DiscoveryInput): ProjectCandidate[] {
    const candidates: ProjectCandidate[] = [];
    const seen = new Set<string>();
    const add = (projectKey: string | undefined, source: DiscoverySource) => {
        if (!projectKey || seen.has(projectKey)) {
            return;
        }
        seen.add(projectKey);
        candidates.push({ projectKey, source });
    };

    add(projectKeyFromScannerConfig(input.files), 'scannerConfig');
    add(repositoryNameFromRemote(input.gitRemoteUrl), 'gitRemote');
    add(input.folderName?.trim() || undefined, 'folderName');
    return candidates;
}

/**
 * Confirms a candidate key without needing permission to list projects, so the zero-config
 * path works for every user regardless of their role.
 */
export async function projectExists(
    connection: SonarConnection,
    projectKey: string
): Promise<boolean> {
    return sonarResourceExists(connection, `/api/components/show?component=${encodeURIComponent(projectKey)}`);
}

export async function findFirstExistingProject(
    connection: SonarConnection,
    candidates: ProjectCandidate[]
): Promise<ProjectCandidate | undefined> {
    for (const candidate of candidates) {
        if (await projectExists(connection, candidate.projectKey)) {
            return candidate;
        }
    }
    return undefined;
}

interface BranchListResponse {
    branches?: Array<{ name?: string; isMain?: boolean }>;
}

/**
 * Prefers the checked-out branch when the server knows it, so issues line up with what the
 * developer is actually editing, and falls back to main rather than guessing.
 */
export async function resolveBranch(
    connection: SonarConnection,
    projectKey: string,
    currentBranch: string | undefined
): Promise<string | undefined> {
    const data = await sonarGetJson<BranchListResponse>(
        connection,
        `/api/project_branches/list?project=${encodeURIComponent(projectKey)}`,
        'branches'
    );
    const branches = data.branches ?? [];
    if (currentBranch && branches.some((b) => b.name === currentBranch)) {
        return currentBranch;
    }
    return branches.find((b) => b.isMain)?.name;
}

export async function tokenIsValid(connection: SonarConnection): Promise<boolean> {
    const data = await sonarGetJson<{ valid?: boolean }>(
        connection,
        '/api/authentication/validate',
        'authentication'
    );
    return data.valid === true;
}
