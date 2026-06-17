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
package com.qualimetry.sonar.gherkin.analyzer.checks;

/**
 * Computes the public documentation URL for a rule key.
 * <p>
 * The target is the per-rule Markdown page published alongside the SonarQube
 * plugin snapshot. The same URL is used by the SonarQube plugin, the LSP server
 * (VS Code), and the JetBrains inspection so a click on any diagnostic opens the
 * same page.
 */
public final class RuleHelpUrls {

    public static final String DOCS_BASE_URL =
            "https://github.com/Qualimetry/sonarqube-gherkin-plugin/blob/main/docs/rules/";

    private RuleHelpUrls() {
        // utility class
    }

    /**
     * Returns the documentation URL for the given rule key.
     *
     * @param ruleKey the kebab-case rule key (e.g. {@code shared-given-to-background})
     * @return the URL of the rule's Markdown documentation page
     */
    public static String helpUrl(String ruleKey) {
        return DOCS_BASE_URL + ruleKey + ".md";
    }
}
