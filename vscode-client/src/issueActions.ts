/**
 * Offers the SonarQube resolutions on a finding that matched a server issue.
 */

import * as vscode from 'vscode';
import type { ServerIssueStore } from './serverIssueStore';
import type { RuleCatalogue } from './ruleContent';
import {
    resolveIssue,
    selectAcceptTransition,
    selectFalsePositiveTransition,
    type ServerIssue,
} from './sonarIssues';
import type { SonarConnection } from './sonarHttp';

export const MARK_FALSE_POSITIVE = 'gherkin.markIssueFalsePositive';
export const MARK_ACCEPTED = 'gherkin.markIssueAccepted';
export const SHOW_RULE = 'gherkin.showRuleDescription';

export interface ResolutionRequest {
    issue: ServerIssue;
    transition: string;
    label: string;
}

export class IssueCodeActionProvider implements vscode.CodeActionProvider {
    static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    constructor(
        private readonly store: ServerIssueStore,
        private readonly catalogue: RuleCatalogue | undefined,
        private readonly serverVersion: () => string | undefined
    ) {}

    provideCodeActions(
        document: vscode.TextDocument,
        _range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source !== 'qualimetry-gherkin') {
                continue;
            }

            const ruleKey = readRuleKey(diagnostic);
            if (ruleKey && this.catalogue?.get(ruleKey)) {
                const explain = new vscode.CodeAction(
                    `Explain rule "${this.catalogue.get(ruleKey)?.name ?? ruleKey}"`,
                    vscode.CodeActionKind.QuickFix
                );
                explain.command = { command: SHOW_RULE, title: 'Show rule description', arguments: [ruleKey] };
                explain.diagnostics = [diagnostic];
                actions.push(explain);
            }

            const { open } = this.store.lookup(document, diagnostic);
            if (!open) {
                continue;
            }

            const falsePositive = selectFalsePositiveTransition(open.transitions);
            if (falsePositive) {
                actions.push(this.resolutionAction(diagnostic, open, falsePositive, 'False Positive'));
            }
            const accept = selectAcceptTransition(open.transitions, this.serverVersion());
            if (accept) {
                actions.push(this.resolutionAction(diagnostic, open, accept, 'Accepted'));
            }
        }

        return actions;
    }

    private resolutionAction(
        diagnostic: vscode.Diagnostic,
        issue: ServerIssue,
        transition: string,
        label: string
    ): vscode.CodeAction {
        const action = new vscode.CodeAction(
            `Mark as ${label} on SonarQube`,
            vscode.CodeActionKind.QuickFix
        );
        action.command = {
            command: label === 'False Positive' ? MARK_FALSE_POSITIVE : MARK_ACCEPTED,
            title: action.title,
            arguments: [{ issue, transition, label } satisfies ResolutionRequest],
        };
        action.diagnostics = [diagnostic];
        return action;
    }
}

function readRuleKey(diagnostic: vscode.Diagnostic): string | undefined {
    const code = diagnostic.code;
    if (typeof code === 'string') {
        return code;
    }
    if (typeof code === 'object' && code !== null && 'value' in code) {
        return String((code as { value: string | number }).value);
    }
    return undefined;
}

/**
 * SonarQube records these resolutions with a justification, so the comment is required rather
 * than optional; cancelling the prompt cancels the resolution.
 */
export async function applyResolution(
    connection: SonarConnection,
    request: ResolutionRequest,
    store: ServerIssueStore,
    onApplied: () => void
): Promise<void> {
    const comment = await vscode.window.showInputBox({
        title: `Mark as ${request.label}`,
        prompt: 'Explain why. The comment is recorded on the issue in SonarQube.',
        ignoreFocusOut: true,
        validateInput: (value) => (value.trim() ? undefined : 'A comment is required'),
    });
    if (comment === undefined || !comment.trim()) {
        return;
    }

    await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Marking issue as ${request.label}` },
        async () => {
            try {
                await resolveIssue(connection, request.issue.key, request.transition, comment.trim());
                store.markResolvedLocally(request.issue.key);
                onApplied();
                vscode.window.showInformationMessage(
                    `Marked as ${request.label} on SonarQube.`
                );
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Could not mark the issue as ${request.label}: ${message}`);
            }
        }
    );
}
