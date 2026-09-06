/**
 * Reads issues from SonarQube and applies workflow transitions to them.
 */

import {
    MAX_PAGE_SIZE,
    MAX_SEARCHABLE_RESULTS,
    sonarFetch,
    sonarGetJson,
    type SonarConnection,
} from './sonarHttp';
import { RULE_KEY_PREFIX } from './sonarImport';

export const RESOLVED_RESOLUTIONS = 'FALSE-POSITIVE,WONTFIX,ACCEPTED';

export const TRANSITION_FALSE_POSITIVE = 'falsepositive';
export const TRANSITION_WONT_FIX = 'wontfix';
export const TRANSITION_ACCEPT = 'accept';

export interface ServerIssue {
    key: string;
    rule: string;
    component: string;
    message: string;
    line?: number;
    hash?: string;
    status: string;
    resolution?: string;
    /** Transitions this user may perform, as reported by the server. */
    transitions: string[];
    creationDate?: string;
    author?: string;
}

export interface IssueFetchResult {
    issues: ServerIssue[];
    /** Set when the server holds more issues than paging could reach. */
    droppedByPagingCap: number;
}

interface IssuesSearchResponse {
    total?: number;
    paging?: { total?: number };
    issues?: Array<{
        key?: string;
        rule?: string;
        component?: string;
        message?: string;
        line?: number;
        hash?: string;
        status?: string;
        resolution?: string;
        transitions?: string[];
        creationDate?: string;
        author?: string;
    }>;
}

function toServerIssues(response: IssuesSearchResponse): ServerIssue[] {
    const issues: ServerIssue[] = [];
    for (const raw of response.issues ?? []) {
        if (!raw.key || !raw.rule || !raw.component) {
            continue;
        }
        if (!raw.rule.startsWith(RULE_KEY_PREFIX)) {
            continue;
        }
        issues.push({
            key: raw.key,
            rule: raw.rule,
            component: raw.component,
            message: raw.message ?? '',
            line: raw.line,
            hash: raw.hash,
            status: raw.status ?? 'OPEN',
            resolution: raw.resolution,
            transitions: raw.transitions ?? [],
            creationDate: raw.creationDate,
            author: raw.author,
        });
    }
    return issues;
}

export interface IssueQuery {
    componentKeys: string;
    branch?: string;
    /** Omitted entirely to let the server return both resolved and unresolved. */
    resolved?: boolean;
    resolutions?: string;
}

function buildQueryString(query: IssueQuery, page: number, pageSize: number): string {
    const params = new URLSearchParams({
        componentKeys: query.componentKeys,
        ps: String(pageSize),
        p: String(page),
        additionalFields: 'transitions',
    });
    if (query.branch) {
        params.set('branch', query.branch);
    }
    if (query.resolved !== undefined) {
        params.set('resolved', String(query.resolved));
    }
    if (query.resolutions) {
        params.set('resolutions', query.resolutions);
    }
    return params.toString();
}

/**
 * Pages through the matching issues. SonarQube refuses to page past a fixed ceiling, so the
 * shortfall is reported rather than silently returning a partial set.
 */
export async function fetchIssues(
    connection: SonarConnection,
    query: IssueQuery,
    pageSize: number = MAX_PAGE_SIZE
): Promise<IssueFetchResult> {
    const issues: ServerIssue[] = [];
    let page = 1;
    let total = 0;

    while (true) {
        const data = await sonarGetJson<IssuesSearchResponse>(
            connection,
            `/api/issues/search?${buildQueryString(query, page, pageSize)}`,
            'issues'
        );
        total = data.paging?.total ?? data.total ?? 0;
        const batch = toServerIssues(data);
        issues.push(...batch);

        const fetched = page * pageSize;
        if ((data.issues?.length ?? 0) === 0 || fetched >= total || fetched >= MAX_SEARCHABLE_RESULTS) {
            break;
        }
        page += 1;
    }

    const reachable = Math.min(total, MAX_SEARCHABLE_RESULTS);
    return { issues, droppedByPagingCap: Math.max(0, total - reachable) };
}

export async function fetchOpenAndResolvedIssues(
    connection: SonarConnection,
    componentKeys: string,
    branch?: string
): Promise<{ open: ServerIssue[]; resolved: ServerIssue[]; droppedByPagingCap: number }> {
    const open = await fetchIssues(connection, { componentKeys, branch, resolved: false });
    const resolved = await fetchIssues(connection, {
        componentKeys,
        branch,
        resolved: true,
        resolutions: RESOLVED_RESOLUTIONS,
    });
    return {
        open: open.issues,
        resolved: resolved.issues,
        droppedByPagingCap: open.droppedByPagingCap + resolved.droppedByPagingCap,
    };
}

/**
 * SonarQube 10.4 renamed the "Won't Fix" transition to "accept". The issue's own transition
 * list is authoritative and permission-aware, so it decides; the server version is only
 * consulted when the server did not supply one.
 */
export function selectAcceptTransition(
    availableTransitions: string[],
    serverVersion: string | undefined
): string | undefined {
    if (availableTransitions.includes(TRANSITION_ACCEPT)) {
        return TRANSITION_ACCEPT;
    }
    if (availableTransitions.includes(TRANSITION_WONT_FIX)) {
        return TRANSITION_WONT_FIX;
    }
    if (availableTransitions.length > 0) {
        return undefined;
    }
    return supportsAcceptTransition(serverVersion) ? TRANSITION_ACCEPT : TRANSITION_WONT_FIX;
}

export function selectFalsePositiveTransition(
    availableTransitions: string[]
): string | undefined {
    if (availableTransitions.length === 0) {
        return TRANSITION_FALSE_POSITIVE;
    }
    return availableTransitions.includes(TRANSITION_FALSE_POSITIVE)
        ? TRANSITION_FALSE_POSITIVE
        : undefined;
}

/**
 * Unparsable versions are treated as legacy so we never target a transition the server does
 * not expose.
 */
export function supportsAcceptTransition(serverVersion: string | undefined): boolean {
    if (!serverVersion) {
        return false;
    }
    const match = /^(\d+)\.(\d+)/.exec(serverVersion.trim());
    if (!match) {
        return false;
    }
    const major = Number(match[1]);
    const minor = Number(match[2]);
    if (major > 10) {
        return true;
    }
    return major === 10 && minor >= 4;
}

export async function fetchServerVersion(connection: SonarConnection): Promise<string | undefined> {
    const response = await sonarFetch(connection, '/api/server/version');
    if (!response.ok) {
        return undefined;
    }
    return (await response.text()).trim();
}

export async function addComment(
    connection: SonarConnection,
    issueKey: string,
    text: string
): Promise<void> {
    const response = await sonarFetch(connection, '/api/issues/add_comment', {
        method: 'POST',
        form: { issue: issueKey, text },
    });
    if (!response.ok) {
        throw new Error(`Adding the comment failed: ${response.status} ${response.statusText}`);
    }
}

export async function doTransition(
    connection: SonarConnection,
    issueKey: string,
    transition: string
): Promise<void> {
    const response = await sonarFetch(connection, '/api/issues/do_transition', {
        method: 'POST',
        form: { issue: issueKey, transition },
    });
    if (!response.ok) {
        throw new Error(`Applying "${transition}" failed: ${response.status} ${response.statusText}`);
    }
}

/**
 * Comments first so the justification is recorded even if the transition is rejected; a
 * resolution without its reason is worse than a comment without its resolution.
 */
export async function resolveIssue(
    connection: SonarConnection,
    issueKey: string,
    transition: string,
    comment: string
): Promise<void> {
    await addComment(connection, issueKey, comment);
    await doTransition(connection, issueKey, transition);
}
