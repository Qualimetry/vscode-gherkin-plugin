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

import com.qualimetry.sonar.gherkin.analyzer.checks.RuleSeverities;
import org.eclipse.lsp4j.DiagnosticSeverity;

/**
 * Maps analyzer rule keys to LSP {@link DiagnosticSeverity} and Sonar severity names.
 * Uses the shared {@link RuleSeverities} from the analyzer so IDE and SonarQube plugin
 * defaults stay aligned.
 */
public final class SeverityMap {

    private SeverityMap() {
        // utility class
    }

    /**
     * Returns the LSP diagnostic severity for the given rule key.
     * Derived from the canonical {@link RuleSeverities} (same as SonarQube plugin).
     *
     * @param ruleKey the analyzer rule key
     * @return the mapped {@link DiagnosticSeverity}, or {@link DiagnosticSeverity#Warning} if unknown
     */
    public static DiagnosticSeverity getSeverity(String ruleKey) {
        return sonarToDiagnosticSeverity(getSeverityString(ruleKey));
    }

    /**
     * SonarQube severity names used in the Sonar plugin (GherkinRulesDefinition).
     * Use these in config so IDE and Sonar stay aligned.
     */
    public static final String SONAR_BLOCKER = "blocker";
    public static final String SONAR_CRITICAL = "critical";
    public static final String SONAR_MAJOR = "major";
    public static final String SONAR_MINOR = "minor";
    public static final String SONAR_INFO = "info";

    /**
     * Returns the Sonar severity string for the given rule key (for default config export).
     * Uses the canonical {@link RuleSeverities} so IDE and SonarQube plugin align.
     *
     * @param ruleKey the analyzer rule key
     * @return "blocker", "critical", "major", "minor", or "info"
     */
    public static String getSeverityString(String ruleKey) {
        return RuleSeverities.getSeverity(ruleKey).toLowerCase();
    }

    /**
     * Parses a Sonar severity string to LSP diagnostic severity.
     * Accepts: blocker, critical, major, minor, info (case-insensitive).
     *
     * @param s the severity string from config
     * @return the LSP severity, or null if invalid
     */
    public static DiagnosticSeverity sonarToDiagnosticSeverity(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        switch (s.trim().toLowerCase()) {
            case "blocker":
            case "critical":
                return DiagnosticSeverity.Error;
            case "major":
                return DiagnosticSeverity.Warning;
            case "minor":
                return DiagnosticSeverity.Information;
            case "info":
                return DiagnosticSeverity.Hint;
            default:
                return null;
        }
    }
}
