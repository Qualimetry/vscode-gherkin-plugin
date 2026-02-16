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

import org.eclipse.lsp4j.DiagnosticSeverity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SeverityMapTest {

    @Test
    void errorLevelRules() {
        assertThat(SeverityMap.getSeverity("feature-name-required")).isEqualTo(DiagnosticSeverity.Error);
        assertThat(SeverityMap.getSeverity("parse-error")).isEqualTo(DiagnosticSeverity.Error);
        assertThat(SeverityMap.getSeverity("no-duplicate-steps")).isEqualTo(DiagnosticSeverity.Error);
    }

    @Test
    void warningLevelRules() {
        assertThat(SeverityMap.getSeverity("scenario-required")).isEqualTo(DiagnosticSeverity.Warning);
        assertThat(SeverityMap.getSeverity("unique-feature-name")).isEqualTo(DiagnosticSeverity.Warning);
        assertThat(SeverityMap.getSeverity("no-restricted-tags")).isEqualTo(DiagnosticSeverity.Warning);
    }

    @Test
    void informationLevelRules() {
        assertThat(SeverityMap.getSeverity("consistent-indentation")).isEqualTo(DiagnosticSeverity.Information);
        assertThat(SeverityMap.getSeverity("no-trailing-whitespace")).isEqualTo(DiagnosticSeverity.Information);
        assertThat(SeverityMap.getSeverity("no-empty-doc-strings")).isEqualTo(DiagnosticSeverity.Information);
    }

    @Test
    void hintLevelRules() {
        assertThat(SeverityMap.getSeverity("feature-description-recommended")).isEqualTo(DiagnosticSeverity.Hint);
        assertThat(SeverityMap.getSeverity("todo-comment")).isEqualTo(DiagnosticSeverity.Hint);
        assertThat(SeverityMap.getSeverity("spelling-accuracy")).isEqualTo(DiagnosticSeverity.Hint);
    }

    @Test
    void unknownRuleDefaultsToWarning() {
        assertThat(SeverityMap.getSeverity("non-existent-rule")).isEqualTo(DiagnosticSeverity.Warning);
        assertThat(SeverityMap.getSeverity("")).isEqualTo(DiagnosticSeverity.Warning);
    }
}
