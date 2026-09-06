/**
 * Caches the issues SonarQube holds for the bound project and matches them to local findings.
 */

import * as vscode from 'vscode';
import {
    componentKeyFor,
    hideResolvedIssuesEnabled,
    readBinding,
    workspaceRelativePath,
    type ProjectBinding,
} from './sonarBinding';
import { isResolved, lineHashAt, matchIssue, type LocalIssue } from './issueTracking';
import { fetchOpenAndResolvedIssues, type ServerIssue } from './sonarIssues';
import type { SonarConnection } from './sonarHttp';

export interface IssueLookup {
    open?: ServerIssue;
    resolved?: ServerIssue;
}

export class ServerIssueStore {
    private readonly openByComponent = new Map<string, ServerIssue[]>();
    private readonly resolvedByComponent = new Map<string, ServerIssue[]>();

    constructor(private readonly log: vscode.OutputChannel) {}

    clear(): void {
        this.openByComponent.clear();
        this.resolvedByComponent.clear();
    }

    hasComponent(componentKey: string): boolean {
        return this.openByComponent.has(componentKey);
    }

    /**
     * Loads one file's issues. Scoping to a component keeps each request bounded and sidesteps
     * the server's cap on how deep a search may page.
     */
    async loadComponent(
        connection: SonarConnection,
        binding: ProjectBinding,
        componentKey: string
    ): Promise<void> {
        const result = await fetchOpenAndResolvedIssues(connection, componentKey, binding.branch);
        this.openByComponent.set(componentKey, result.open);
        this.resolvedByComponent.set(componentKey, result.resolved);
        if (result.droppedByPagingCap > 0) {
            this.log.appendLine(
                `SonarQube issue sync: ${result.droppedByPagingCap} issue(s) for ${componentKey} ` +
                'were beyond the server paging limit and were not read.'
            );
        }
    }

    async loadProject(connection: SonarConnection, binding: ProjectBinding): Promise<number> {
        const result = await fetchOpenAndResolvedIssues(connection, binding.projectKey, binding.branch);
        this.clear();
        for (const issue of result.open) {
            append(this.openByComponent, issue);
        }
        for (const issue of result.resolved) {
            append(this.resolvedByComponent, issue);
        }
        if (result.droppedByPagingCap > 0) {
            this.log.appendLine(
                `SonarQube issue sync: ${result.droppedByPagingCap} issue(s) were beyond the ` +
                'server paging limit and were not read. Narrow the branch or sync per file.'
            );
        }
        return result.open.length + result.resolved.length;
    }

    lookup(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): IssueLookup {
        const binding = readBinding();
        if (!binding) {
            return {};
        }
        const local = toLocalIssue(document, diagnostic, binding);
        if (!local) {
            return {};
        }
        return {
            open: matchIssue(local, this.openByComponent.get(local.component) ?? []),
            resolved: matchIssue(local, this.resolvedByComponent.get(local.component) ?? []),
        };
    }

    /**
     * Drops findings the team has already accepted on the server so the editor reflects the
     * decision that was made rather than repeating it.
     */
    filterResolved(uri: vscode.Uri, diagnostics: vscode.Diagnostic[]): vscode.Diagnostic[] {
        if (!hideResolvedIssuesEnabled()) {
            return diagnostics;
        }
        const binding = readBinding();
        if (!binding) {
            return diagnostics;
        }
        const relativePath = workspaceRelativePath(uri);
        if (!relativePath) {
            return diagnostics;
        }
        const componentKey = componentKeyFor(binding, relativePath);
        const resolved = this.resolvedByComponent.get(componentKey);
        if (!resolved || resolved.length === 0) {
            return diagnostics;
        }
        const lines = readDocumentLines(uri);
        return diagnostics.filter((diagnostic) => {
            const local = buildLocalIssue(diagnostic, componentKey, lines);
            if (!local) {
                return true;
            }
            const match = matchIssue(local, resolved);
            return !(match && isResolved(match));
        });
    }

    markResolvedLocally(issueKey: string): void {
        for (const [componentKey, issues] of this.openByComponent) {
            const index = issues.findIndex((issue) => issue.key === issueKey);
            if (index < 0) {
                continue;
            }
            const [issue] = issues.splice(index, 1);
            const resolved = this.resolvedByComponent.get(componentKey) ?? [];
            resolved.push(issue);
            this.resolvedByComponent.set(componentKey, resolved);
            return;
        }
    }
}

function append(target: Map<string, ServerIssue[]>, issue: ServerIssue): void {
    const existing = target.get(issue.component) ?? [];
    existing.push(issue);
    target.set(issue.component, existing);
}

function readDocumentLines(uri: vscode.Uri): string[] | undefined {
    const open = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === uri.toString());
    return open ? open.getText().split(/\r?\n/) : undefined;
}

function diagnosticRuleKey(diagnostic: vscode.Diagnostic): string | undefined {
    const code = diagnostic.code;
    if (typeof code === 'string') {
        return code;
    }
    if (typeof code === 'object' && code !== null && 'value' in code) {
        return String((code as { value: string | number }).value);
    }
    return undefined;
}

function buildLocalIssue(
    diagnostic: vscode.Diagnostic,
    componentKey: string,
    lines: string[] | undefined
): LocalIssue | undefined {
    const ruleKey = diagnosticRuleKey(diagnostic);
    if (!ruleKey) {
        return undefined;
    }
    const line = diagnostic.range.start.line + 1;
    return {
        ruleKey,
        component: componentKey,
        line,
        message: diagnostic.message,
        hash: lines ? lineHashAt(lines, line) : undefined,
    };
}

export function toLocalIssue(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    binding: ProjectBinding
): LocalIssue | undefined {
    const relativePath = workspaceRelativePath(document.uri);
    if (!relativePath) {
        return undefined;
    }
    return buildLocalIssue(
        diagnostic,
        componentKeyFor(binding, relativePath),
        document.getText().split(/\r?\n/)
    );
}
