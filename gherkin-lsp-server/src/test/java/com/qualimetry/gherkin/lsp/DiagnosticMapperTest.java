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

import com.qualimetry.sonar.gherkin.analyzer.parser.model.TextPosition;
import com.qualimetry.sonar.gherkin.analyzer.visitor.CrossFileIssue;
import com.qualimetry.sonar.gherkin.analyzer.visitor.Issue;
import org.eclipse.lsp4j.Diagnostic;
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DiagnosticMapperTest {

    @Test
    void issueWithPositionMapsTo0Based() {
        Issue issue = new Issue("parse-error", "Unexpected token", new TextPosition(5, 10), 5, null);

        Diagnostic diag = DiagnosticMapper.toDiagnostic(issue);

        assertThat(diag.getRange().getStart().getLine()).isEqualTo(4);
        assertThat(diag.getRange().getStart().getCharacter()).isEqualTo(9);
        // non-zero start column → end is same line, col+1
        assertThat(diag.getRange().getEnd().getLine()).isEqualTo(4);
        assertThat(diag.getRange().getEnd().getCharacter()).isEqualTo(10);
    }

    @Test
    void issueWithOnlyLineMapsTo0Based() {
        Issue issue = new Issue("scenario-required", "Missing scenario", null, 3, null);

        Diagnostic diag = DiagnosticMapper.toDiagnostic(issue);

        assertThat(diag.getRange().getStart().getLine()).isEqualTo(2);
        assertThat(diag.getRange().getStart().getCharacter()).isZero();
        // col 0 → end is next line col 0
        assertThat(diag.getRange().getEnd().getLine()).isEqualTo(3);
        assertThat(diag.getRange().getEnd().getCharacter()).isZero();
    }

    @Test
    void issueWithNeitherPositionNorLineDefaultsToZero() {
        Issue issue = new Issue("feature-file-required", "No feature keyword", null, null, null);

        Diagnostic diag = DiagnosticMapper.toDiagnostic(issue);

        assertThat(diag.getRange().getStart().getLine()).isZero();
        assertThat(diag.getRange().getStart().getCharacter()).isZero();
        assertThat(diag.getRange().getEnd().getLine()).isEqualTo(1);
        assertThat(diag.getRange().getEnd().getCharacter()).isZero();
    }

    @Test
    void crossFileIssueMapsCorrectly() {
        CrossFileIssue issue = new CrossFileIssue(
                "unique-feature-name", "file:///features/login.feature", 7, "Duplicate feature name");

        Diagnostic diag = DiagnosticMapper.toDiagnostic(issue);

        assertThat(diag.getRange().getStart().getLine()).isEqualTo(6);
        assertThat(diag.getRange().getStart().getCharacter()).isZero();
        assertThat(diag.getRange().getEnd().getLine()).isEqualTo(7);
        assertThat(diag.getRange().getEnd().getCharacter()).isZero();
        assertThat(diag.getMessage()).isEqualTo("Duplicate feature name");
        assertThat(diag.getCode().getLeft()).isEqualTo("unique-feature-name");
    }

    @Test
    void severityIsSetFromSeverityMap() {
        Issue errorIssue = new Issue("parse-error", "msg", null, 1, null);
        Issue warningIssue = new Issue("scenario-required", "msg", null, 1, null);
        Issue infoIssue = new Issue("consistent-indentation", "msg", null, 1, null);
        Issue hintIssue = new Issue("todo-comment", "msg", null, 1, null);

        assertThat(DiagnosticMapper.toDiagnostic(errorIssue).getSeverity()).isEqualTo(DiagnosticSeverity.Error);
        assertThat(DiagnosticMapper.toDiagnostic(warningIssue).getSeverity()).isEqualTo(DiagnosticSeverity.Warning);
        assertThat(DiagnosticMapper.toDiagnostic(infoIssue).getSeverity()).isEqualTo(DiagnosticSeverity.Information);
        assertThat(DiagnosticMapper.toDiagnostic(hintIssue).getSeverity()).isEqualTo(DiagnosticSeverity.Hint);
    }

    @Test
    void sourceIsGherkinAnalyzer() {
        Issue issue = new Issue("parse-error", "msg", null, 1, null);

        Diagnostic diag = DiagnosticMapper.toDiagnostic(issue);

        assertThat(diag.getSource()).isEqualTo("gherkin-analyzer");
    }

    @Test
    void codeIsRuleKey() {
        Issue issue = new Issue("step-required", "msg", null, 1, null);

        Diagnostic diag = DiagnosticMapper.toDiagnostic(issue);

        assertThat(diag.getCode().getLeft()).isEqualTo("step-required");
    }
}
