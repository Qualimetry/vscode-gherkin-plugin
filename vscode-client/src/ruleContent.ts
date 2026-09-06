/**
 * Loads the rule catalogue bundled with the extension.
 *
 * The catalogue ships inside the VSIX rather than being fetched, so a rule can be read with no
 * SonarQube connection and even when Java is unavailable and the language server never started.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RuleSections {
    root_cause?: string;
    assess_the_problem?: string;
    how_to_fix?: string;
    resources?: string;
}

export interface RuleContent {
    key: string;
    name: string;
    severity: string;
    type: string;
    tags: string[];
    remediation: string | null;
    defaultActive: boolean;
    helpUrl: string;
    sections: RuleSections;
}

interface RuleContentDocument {
    repositoryKey: string;
    sectionOrder: Array<keyof RuleSections>;
    sectionTitles: Record<string, string>;
    rules: RuleContent[];
}

export class RuleCatalogue {
    private readonly rulesByKey: Map<string, RuleContent>;

    private constructor(private readonly document: RuleContentDocument) {
        this.rulesByKey = new Map(document.rules.map((rule) => [rule.key, rule]));
    }

    static load(extensionPath: string): RuleCatalogue | undefined {
        const file = path.join(extensionPath, 'rules', 'rule-content.json');
        if (!fs.existsSync(file)) {
            return undefined;
        }
        const document = JSON.parse(fs.readFileSync(file, 'utf8')) as RuleContentDocument;
        return new RuleCatalogue(document);
    }

    get(ruleKey: string): RuleContent | undefined {
        return this.rulesByKey.get(ruleKey);
    }

    get size(): number {
        return this.rulesByKey.size;
    }

    /** Sections in display order, skipping any the rule does not define. */
    orderedSections(rule: RuleContent): Array<{ key: string; title: string; html: string }> {
        return this.document.sectionOrder
            .map((key) => ({
                key: key as string,
                title: this.document.sectionTitles[key as string] ?? (key as string),
                html: rule.sections[key] ?? '',
            }))
            .filter((section) => section.html.trim().length > 0);
    }
}
