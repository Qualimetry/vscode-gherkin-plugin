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
import org.eclipse.lsp4j.Position;
import org.eclipse.lsp4j.Range;

/**
 * Converts analyzer {@link Issue} and {@link CrossFileIssue} instances to LSP
 * {@link Diagnostic} objects.
 */
public final class DiagnosticMapper {

    private static final String SOURCE = "gherkin-analyzer";

    private DiagnosticMapper() {
        // utility class
    }

    /**
     * Converts an analyzer {@link Issue} to an LSP {@link Diagnostic}.
     * <p>
     * Position mapping (1-based to 0-based):
     * <ul>
     *   <li>If {@code issue.position()} is non-null, use its line and column (both minus 1).</li>
     *   <li>Else if {@code issue.line()} is non-null, use line minus 1 with column 0.</li>
     *   <li>Otherwise default to line 0, column 0.</li>
     * </ul>
     * The end position is set to the same line at column 0 of the next line (or start column + 1
     * if start column is non-zero).
     *
     * @param issue the analyzer issue
     * @return an LSP diagnostic
     */
    public static Diagnostic toDiagnostic(Issue issue) {
        int startLine;
        int startCol;

        TextPosition pos = issue.position();
        if (pos != null) {
            startLine = pos.line() - 1;
            startCol = pos.column() - 1;
        } else if (issue.line() != null) {
            startLine = issue.line() - 1;
            startCol = 0;
        } else {
            startLine = 0;
            startCol = 0;
        }

        Range range = buildRange(startLine, startCol);

        Diagnostic diagnostic = new Diagnostic();
        diagnostic.setRange(range);
        diagnostic.setMessage(issue.message());
        diagnostic.setSeverity(SeverityMap.getSeverity(issue.ruleKey()));
        diagnostic.setSource(SOURCE);
        diagnostic.setCode(issue.ruleKey());
        return diagnostic;
    }

    /**
     * Converts a {@link CrossFileIssue} to an LSP {@link Diagnostic}.
     * <p>
     * The line is 1-based and is converted to 0-based for LSP.
     *
     * @param issue the cross-file issue
     * @return an LSP diagnostic
     */
    public static Diagnostic toDiagnostic(CrossFileIssue issue) {
        int startLine = issue.line() - 1;
        int startCol = 0;

        Range range = buildRange(startLine, startCol);

        Diagnostic diagnostic = new Diagnostic();
        diagnostic.setRange(range);
        diagnostic.setMessage(issue.message());
        diagnostic.setSeverity(SeverityMap.getSeverity(issue.ruleKey()));
        diagnostic.setSource(SOURCE);
        diagnostic.setCode(issue.ruleKey());
        return diagnostic;
    }

    private static Range buildRange(int startLine, int startCol) {
        Position start = new Position(startLine, startCol);
        Position end;
        if (startCol == 0) {
            end = new Position(startLine + 1, 0);
        } else {
            end = new Position(startLine, startCol + 1);
        }
        return new Range(start, end);
    }
}
