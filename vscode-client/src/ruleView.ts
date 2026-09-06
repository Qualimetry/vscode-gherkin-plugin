/**
 * Renders a rule as a tabbed panel inside the editor so the reader never leaves it to
 * understand a finding.
 */

import * as vscode from 'vscode';
import type { RuleCatalogue, RuleContent } from './ruleContent';

const VIEW_TYPE = 'gherkin.ruleDescription';

let panel: vscode.WebviewPanel | undefined;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function severityClass(severity: string): string {
    return 'badge badge-' + severity.toLowerCase();
}

function renderTabs(sections: Array<{ key: string; title: string; html: string }>): string {
    const buttons = sections
        .map(
            (section, index) =>
                `<button class="tab${index === 0 ? ' active' : ''}" data-target="${section.key}">` +
                `${escapeHtml(section.title)}</button>`
        )
        .join('');
    const panels = sections
        .map(
            (section, index) =>
                `<div class="panel${index === 0 ? ' active' : ''}" id="${section.key}">${section.html}</div>`
        )
        .join('');
    return `<div class="tabs">${buttons}</div>${panels}`;
}

function renderDocument(rule: RuleContent, catalogue: RuleCatalogue, nonce: string, csp: string): string {
    const sections = catalogue.orderedSections(rule);
    const tags = rule.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    const profileNote = rule.defaultActive
        ? 'Enabled in the recommended profile'
        : 'Not enabled by default';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    padding: 0 1rem 2rem;
    line-height: 1.5;
  }
  h1 { font-size: 1.3rem; margin-bottom: 0.25rem; }
  .meta { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin-bottom: 0.75rem; }
  .badge, .tag, .key {
    border-radius: 3px;
    padding: 0.1rem 0.45rem;
    font-size: 0.8rem;
    border: 1px solid var(--vscode-contrastBorder, transparent);
  }
  .key { font-family: var(--vscode-editor-font-family); background: var(--vscode-textBlockQuote-background); }
  .tag { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  .badge { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); font-weight: 600; }
  .badge-blocker, .badge-critical { background: var(--vscode-editorError-foreground); color: var(--vscode-editor-background); }
  .badge-major { background: var(--vscode-editorWarning-foreground); color: var(--vscode-editor-background); }
  .badge-minor, .badge-info { background: var(--vscode-editorInfo-foreground); color: var(--vscode-editor-background); }
  .note { color: var(--vscode-descriptionForeground); font-size: 0.85rem; }
  .tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid var(--vscode-panel-border); margin: 1rem 0 0; }
  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--vscode-foreground);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.4rem 0.7rem;
  }
  .tab:hover { background: var(--vscode-list-hoverBackground); }
  .tab.active { border-bottom-color: var(--vscode-focusBorder); font-weight: 600; }
  .panel { display: none; padding-top: 0.75rem; }
  .panel.active { display: block; }
  .panel h2 { font-size: 1rem; margin: 1rem 0 0.4rem; }
  pre {
    background: var(--vscode-textCodeBlock-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    overflow-x: auto;
    padding: 0.7rem;
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
  }
  code { font-family: var(--vscode-editor-font-family); }
  table { border-collapse: collapse; }
  th, td { border: 1px solid var(--vscode-panel-border); padding: 0.3rem 0.6rem; text-align: left; }
  a { color: var(--vscode-textLink-foreground); }
</style>
</head>
<body>
  <h1>${escapeHtml(rule.name)}</h1>
  <div class="meta">
    <span class="key">${escapeHtml(rule.key)}</span>
    <span class="${severityClass(rule.severity)}">${escapeHtml(rule.severity)}</span>
    <span class="badge">${escapeHtml(rule.type.replace(/_/g, ' '))}</span>
    ${tags}
  </div>
  <div class="note">${escapeHtml(profileNote)}${rule.remediation ? ` &middot; about ${escapeHtml(rule.remediation)} to fix` : ''}</div>
  ${renderTabs(sections)}
  <script nonce="${nonce}">
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const panels = Array.from(document.querySelectorAll('.panel'));
    for (const tab of tabs) {
      tab.addEventListener('click', () => {
        for (const other of tabs) { other.classList.remove('active'); }
        for (const panel of panels) { panel.classList.remove('active'); }
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.target);
        if (target) { target.classList.add('active'); }
      });
    }
  </script>
</body>
</html>`;
}

function createNonce(): string {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i += 1) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

/**
 * Reuses a single panel so opening rule after rule does not fill the editor with tabs.
 */
export function showRuleDescription(catalogue: RuleCatalogue | undefined, ruleKey: string): void {
    const rule = catalogue?.get(ruleKey);
    if (!rule) {
        vscode.window.showWarningMessage(
            `Qualimetry Gherkin: no bundled description for rule "${ruleKey}".`
        );
        return;
    }

    if (!panel) {
        panel = vscode.window.createWebviewPanel(
            VIEW_TYPE,
            'Gherkin rule',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            { enableScripts: true, retainContextWhenHidden: true }
        );
        panel.onDidDispose(() => {
            panel = undefined;
        });
    }

    const nonce = createNonce();
    const csp = `default-src 'none'; style-src ${panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';`;
    panel.title = rule.name;
    panel.webview.html = renderDocument(rule, catalogue as RuleCatalogue, nonce, csp);
    panel.reveal(vscode.ViewColumn.Beside, true);
}
