/*
 * Copyright 2026 SHAZAM Analytics Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.qualimetry.gherkin.lsp;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.lsp4j.DiagnosticSeverity;

/**
 * Maps analyzer rule keys to LSP {@link DiagnosticSeverity} values.
 * <p>
 * Unknown rule keys default to {@link DiagnosticSeverity#Warning}.
 */
public final class SeverityMap {

    private static final Map<String, DiagnosticSeverity> MAP = new HashMap<>();

    static {
        // Error
        MAP.put("feature-name-required", DiagnosticSeverity.Error);
        MAP.put("scenario-name-required", DiagnosticSeverity.Error);
        MAP.put("examples-minimum-rows", DiagnosticSeverity.Error);
        MAP.put("examples-column-coverage", DiagnosticSeverity.Error);
        MAP.put("background-given-only", DiagnosticSeverity.Error);
        MAP.put("step-order-given-when-then", DiagnosticSeverity.Error);
        MAP.put("when-then-required", DiagnosticSeverity.Error);
        MAP.put("no-duplicate-steps", DiagnosticSeverity.Error);
        MAP.put("parse-error", DiagnosticSeverity.Error);
        MAP.put("rule-name-required", DiagnosticSeverity.Error);
        MAP.put("unique-examples-headers", DiagnosticSeverity.Error);

        // Warning
        MAP.put("feature-file-required", DiagnosticSeverity.Warning);
        MAP.put("scenario-required", DiagnosticSeverity.Warning);
        MAP.put("step-required", DiagnosticSeverity.Warning);
        MAP.put("scenario-count-limit", DiagnosticSeverity.Warning);
        MAP.put("step-count-limit", DiagnosticSeverity.Warning);
        MAP.put("shared-given-to-background", DiagnosticSeverity.Warning);
        MAP.put("single-when-per-scenario", DiagnosticSeverity.Warning);
        MAP.put("unique-feature-name", DiagnosticSeverity.Warning);
        MAP.put("unique-scenario-name", DiagnosticSeverity.Warning);
        MAP.put("use-scenario-outline-for-examples", DiagnosticSeverity.Warning);
        MAP.put("business-language-only", DiagnosticSeverity.Warning);
        MAP.put("consistent-feature-language", DiagnosticSeverity.Warning);
        MAP.put("no-byte-order-mark", DiagnosticSeverity.Warning);
        MAP.put("step-sentence-max-length", DiagnosticSeverity.Warning);
        MAP.put("no-unused-variables", DiagnosticSeverity.Warning);
        MAP.put("no-unknown-step-type", DiagnosticSeverity.Warning);
        MAP.put("comment-pattern-match", DiagnosticSeverity.Warning);
        MAP.put("rule-scenario-required", DiagnosticSeverity.Warning);
        MAP.put("unique-rule-name", DiagnosticSeverity.Warning);
        MAP.put("outline-placeholder-required", DiagnosticSeverity.Warning);
        MAP.put("scenario-outline-requires-examples", DiagnosticSeverity.Warning);
        MAP.put("rule-scenario-count-limit", DiagnosticSeverity.Warning);
        MAP.put("feature-rule-count-limit", DiagnosticSeverity.Warning);
        MAP.put("required-tags", DiagnosticSeverity.Warning);
        MAP.put("no-restricted-tags", DiagnosticSeverity.Warning);
        MAP.put("no-restricted-patterns", DiagnosticSeverity.Warning);
        MAP.put("no-empty-examples-cells", DiagnosticSeverity.Warning);
        MAP.put("no-duplicate-scenario-bodies", DiagnosticSeverity.Warning);
        MAP.put("no-conflicting-tags", DiagnosticSeverity.Warning);
        MAP.put("background-step-count-limit", DiagnosticSeverity.Warning);

        // Information
        MAP.put("consistent-indentation", DiagnosticSeverity.Information);
        MAP.put("no-tab-characters", DiagnosticSeverity.Information);
        MAP.put("no-trailing-whitespace", DiagnosticSeverity.Information);
        MAP.put("newline-at-end-of-file", DiagnosticSeverity.Information);
        MAP.put("consistent-line-endings", DiagnosticSeverity.Information);
        MAP.put("file-name-convention", DiagnosticSeverity.Information);
        MAP.put("comment-format", DiagnosticSeverity.Information);
        MAP.put("prefer-and-but-keywords", DiagnosticSeverity.Information);
        MAP.put("no-star-step-prefix", DiagnosticSeverity.Information);
        MAP.put("examples-separator-line", DiagnosticSeverity.Information);
        MAP.put("tag-name-pattern", DiagnosticSeverity.Information);
        MAP.put("tag-permitted-values", DiagnosticSeverity.Information);
        MAP.put("tag-placement", DiagnosticSeverity.Information);
        MAP.put("no-redundant-tags", DiagnosticSeverity.Information);
        MAP.put("no-examples-tags", DiagnosticSeverity.Information);
        MAP.put("given-step-pattern", DiagnosticSeverity.Information);
        MAP.put("when-step-pattern", DiagnosticSeverity.Information);
        MAP.put("then-step-pattern", DiagnosticSeverity.Information);
        MAP.put("background-needs-multiple-scenarios", DiagnosticSeverity.Information);
        MAP.put("blank-line-before-scenario", DiagnosticSeverity.Information);
        MAP.put("no-redundant-rule-tags", DiagnosticSeverity.Information);
        MAP.put("rule-tag-placement", DiagnosticSeverity.Information);
        MAP.put("examples-name-when-multiple", DiagnosticSeverity.Information);
        MAP.put("consistent-scenario-keyword", DiagnosticSeverity.Information);
        MAP.put("no-duplicate-tags", DiagnosticSeverity.Information);
        MAP.put("no-multiple-empty-lines", DiagnosticSeverity.Information);
        MAP.put("name-max-length", DiagnosticSeverity.Information);
        MAP.put("one-space-between-tags", DiagnosticSeverity.Information);
        MAP.put("no-partially-commented-tag-lines", DiagnosticSeverity.Information);
        MAP.put("outline-single-example-row", DiagnosticSeverity.Information);
        MAP.put("max-tags-per-element", DiagnosticSeverity.Information);
        MAP.put("feature-file-max-lines", DiagnosticSeverity.Information);
        MAP.put("data-table-max-columns", DiagnosticSeverity.Information);
        MAP.put("no-commented-out-steps", DiagnosticSeverity.Information);
        MAP.put("feature-name-matches-filename", DiagnosticSeverity.Information);
        MAP.put("no-empty-doc-strings", DiagnosticSeverity.Information);

        // Hint
        MAP.put("feature-description-recommended", DiagnosticSeverity.Hint);
        MAP.put("todo-comment", DiagnosticSeverity.Hint);
        MAP.put("fixme-comment", DiagnosticSeverity.Hint);
        MAP.put("spelling-accuracy", DiagnosticSeverity.Hint);
        MAP.put("rule-description-recommended", DiagnosticSeverity.Hint);
        MAP.put("scenario-description-recommended", DiagnosticSeverity.Hint);
    }

    private SeverityMap() {
        // utility class
    }

    /**
     * Returns the LSP diagnostic severity for the given rule key.
     *
     * @param ruleKey the analyzer rule key
     * @return the mapped {@link DiagnosticSeverity}, or {@link DiagnosticSeverity#Warning} if unknown
     */
    public static DiagnosticSeverity getSeverity(String ruleKey) {
        return MAP.getOrDefault(ruleKey, DiagnosticSeverity.Warning);
    }
}
