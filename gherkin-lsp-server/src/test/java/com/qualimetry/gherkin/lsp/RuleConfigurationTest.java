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

import com.google.gson.JsonObject;
import com.qualimetry.sonar.gherkin.analyzer.checks.CheckList;
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RuleConfigurationTest {

    private static final String SPELLING_RULE = "spelling-accuracy";

    @Test
    void defaultConfig_returnsDefaultRuleKeysMinusSpelling() {
        RuleConfiguration config = new RuleConfiguration(null);

        Set<String> expected = new HashSet<>(CheckList.getDefaultRuleKeys());
        expected.remove(SPELLING_RULE);

        assertThat(config.getActiveRuleKeys()).containsExactlyInAnyOrderElementsOf(expected);
        assertThat(config.getActiveChecks()).hasSameSizeAs(config.getActiveRuleKeys());
    }

    @Test
    void spellingAccuracy_isAlwaysExcluded() {
        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", true);

        JsonObject rules = new JsonObject();
        rules.add(SPELLING_RULE, ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getActiveRuleKeys()).doesNotContain(SPELLING_RULE);
    }

    @Test
    void disablingDefaultRule_removesItFromActiveKeys() {
        String ruleToDisable = "feature-name-required";
        assertThat(CheckList.getDefaultRuleKeys()).contains(ruleToDisable);

        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", false);

        JsonObject rules = new JsonObject();
        rules.add(ruleToDisable, ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getActiveRuleKeys()).doesNotContain(ruleToDisable);
    }

    @Test
    void enablingNonDefaultRule_addsItToActiveKeys() {
        String ruleToEnable = "feature-description-recommended";
        assertThat(CheckList.getDefaultRuleKeys()).doesNotContain(ruleToEnable);

        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", true);

        JsonObject rules = new JsonObject();
        rules.add(ruleToEnable, ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getActiveRuleKeys()).contains(ruleToEnable);
    }

    @Test
    void severityOverride_isUsedWhenSet() {
        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", true);
        ruleObj.addProperty("severity", "info"); // Sonar severity; maps to LSP Hint

        JsonObject rules = new JsonObject();
        rules.add("feature-name-required", ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getSeverity("feature-name-required")).isEqualTo(DiagnosticSeverity.Hint);
        assertThat(config.getSeverity("scenario-required")).isEqualTo(SeverityMap.getSeverity("scenario-required"));
    }

    @Test
    void severityOverride_blockerMapsToError() {
        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", true);
        ruleObj.addProperty("severity", "blocker");

        JsonObject rules = new JsonObject();
        rules.add("scenario-required", ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getSeverity("scenario-required")).isEqualTo(DiagnosticSeverity.Error);
    }

    @Test
    void explicitRulesOnly_whenRulesReplaceDefaults_rulesNotInConfigAreDisabled() {
        assertThat(CheckList.getDefaultRuleKeys()).contains("business-language-only");

        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", true);
        JsonObject rules = new JsonObject();
        rules.add("feature-name-required", ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);
        settings.addProperty("rulesReplaceDefaults", true);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getActiveRuleKeys()).contains("feature-name-required");
        assertThat(config.getActiveRuleKeys()).doesNotContain("business-language-only");
    }

    @Test
    void overrideOneRule_withoutRulesReplaceDefaults_mergesWithDefaults() {
        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("severity", "info");
        JsonObject rules = new JsonObject();
        rules.add("feature-name-required", ruleObj);

        JsonObject settings = new JsonObject();
        settings.add("rules", rules);

        RuleConfiguration config = new RuleConfiguration(settings);

        assertThat(config.getActiveRuleKeys()).contains("feature-name-required");
        assertThat(config.getActiveRuleKeys()).contains("business-language-only");
        assertThat(config.getSeverity("feature-name-required")).isEqualTo(DiagnosticSeverity.Hint);
    }
}
