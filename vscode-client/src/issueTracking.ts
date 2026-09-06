/**
 * Matches locally reported diagnostics to the issues SonarQube already holds.
 *
 * A wrong match resolves the wrong finding on the server, so every rung requires the candidate
 * set to narrow to exactly one issue. An ambiguous set yields no match by design.
 */

import { createHash } from 'crypto';
import { RULE_KEY_PREFIX } from './sonarImport';
import type { ServerIssue } from './sonarIssues';

export interface LocalIssue {
    /** Bare rule key as reported by the analyzer, without the repository prefix. */
    ruleKey: string;
    component: string;
    line: number;
    message: string;
    /** Hash of the line the issue sits on, when the line text is available. */
    hash?: string;
}

/**
 * SonarQube identifies a line by the MD5 of its text with all whitespace removed, which is what
 * lets an issue survive reindentation and lines being added above it.
 */
export function computeLineHash(lineText: string): string {
    return createHash('md5').update(lineText.replace(/\s/g, ''), 'utf8').digest('hex');
}

export function lineHashAt(lines: string[], line: number): string | undefined {
    if (line < 1 || line > lines.length) {
        return undefined;
    }
    return computeLineHash(lines[line - 1]);
}

/** Local diagnostics carry the bare key; the server always qualifies it with its repository. */
export function qualifyRuleKey(bareRuleKey: string): string {
    return bareRuleKey.startsWith(RULE_KEY_PREFIX) ? bareRuleKey : RULE_KEY_PREFIX + bareRuleKey;
}

export function bareRuleKey(qualifiedRuleKey: string): string {
    return qualifiedRuleKey.startsWith(RULE_KEY_PREFIX)
        ? qualifiedRuleKey.slice(RULE_KEY_PREFIX.length)
        : qualifiedRuleKey;
}

function onlyOne(candidates: ServerIssue[]): ServerIssue | undefined {
    return candidates.length === 1 ? candidates[0] : undefined;
}

/**
 * Walks the rungs in descending order of confidence. Each rung either identifies a single
 * issue or hands the whole candidate set to the next; it never picks arbitrarily from a tie.
 */
export function matchIssue(local: LocalIssue, serverIssues: ServerIssue[]): ServerIssue | undefined {
    const qualified = qualifyRuleKey(local.ruleKey);
    const candidates = serverIssues.filter(
        (issue) => issue.rule === qualified && issue.component === local.component
    );
    if (candidates.length === 0) {
        return undefined;
    }
    if (candidates.length === 1) {
        return candidates[0];
    }

    if (local.hash) {
        const sameHashAndLine = candidates.filter(
            (issue) => issue.hash === local.hash && issue.line === local.line
        );
        const exact = onlyOne(sameHashAndLine);
        if (exact) {
            return exact;
        }

        const sameHash = candidates.filter((issue) => issue.hash === local.hash);
        const moved = onlyOne(sameHash);
        if (moved) {
            return moved;
        }
    }

    const sameLineAndMessage = candidates.filter(
        (issue) => issue.line === local.line && issue.message === local.message
    );
    return onlyOne(sameLineAndMessage);
}

export interface MatchedIssue {
    local: LocalIssue;
    server: ServerIssue;
}

export function matchAll(locals: LocalIssue[], serverIssues: ServerIssue[]): MatchedIssue[] {
    const matches: MatchedIssue[] = [];
    for (const local of locals) {
        const server = matchIssue(local, serverIssues);
        if (server) {
            matches.push({ local, server });
        }
    }
    return matches;
}

export function isResolved(issue: ServerIssue): boolean {
    return Boolean(issue.resolution);
}
