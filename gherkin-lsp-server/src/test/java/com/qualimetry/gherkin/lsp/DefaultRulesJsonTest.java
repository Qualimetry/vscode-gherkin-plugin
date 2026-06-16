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

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.qualimetry.sonar.gherkin.analyzer.checks.CheckList;
import org.junit.jupiter.api.Test;
import org.sonar.check.Rule;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class DefaultRulesJsonTest {

    @Test
    void toJson_producesValidJson() {
        JsonObject rules = DefaultRulesJson.toJson();

        String json = new GsonBuilder().setPrettyPrinting().create().toJson(rules);

        JsonObject reparsed = JsonParser.parseString(json).getAsJsonObject();
        assertThat(reparsed.entrySet()).hasSameSizeAs(rules.entrySet());
    }

    @Test
    void toJson_containsAllChecksExceptSpelling() {
        JsonObject rules = DefaultRulesJson.toJson();

        Set<String> annotatedKeys = CheckList.getAllChecks().stream()
                .map(c -> c.getAnnotation(Rule.class))
                .filter(a -> a != null)
                .map(Rule::key)
                .filter(k -> !"spelling-accuracy".equals(k))
                .collect(Collectors.toSet());

        assertThat(rules.keySet()).containsExactlyInAnyOrderElementsOf(annotatedKeys);
    }

    @Test
    void toJson_excludesSpellingAccuracy() {
        JsonObject rules = DefaultRulesJson.toJson();

        assertThat(rules.has("spelling-accuracy")).isFalse();
    }

    @Test
    void eachRule_hasEnabledField() {
        JsonObject rules = DefaultRulesJson.toJson();

        for (Map.Entry<String, JsonElement> entry : rules.entrySet()) {
            JsonObject ruleObj = entry.getValue().getAsJsonObject();
            assertThat(ruleObj.has("enabled"))
                    .as("Rule '%s' should have 'enabled' field", entry.getKey())
                    .isTrue();
            assertThat(ruleObj.get("enabled").isJsonPrimitive())
                    .as("Rule '%s' enabled should be a primitive", entry.getKey())
                    .isTrue();
        }
    }

    @Test
    void eachRule_hasSeverityField() {
        JsonObject rules = DefaultRulesJson.toJson();

        Set<String> validSeverities = Set.of("blocker", "critical", "major", "minor", "info");

        for (Map.Entry<String, JsonElement> entry : rules.entrySet()) {
            JsonObject ruleObj = entry.getValue().getAsJsonObject();
            assertThat(ruleObj.has("severity"))
                    .as("Rule '%s' should have 'severity' field", entry.getKey())
                    .isTrue();
            String severity = ruleObj.get("severity").getAsString();
            assertThat(validSeverities).contains(severity);
        }
    }

    @Test
    void defaultRuleKeys_areEnabledByDefault() {
        JsonObject rules = DefaultRulesJson.toJson();
        Set<String> defaultKeys = Set.copyOf(CheckList.getDefaultRuleKeys());

        for (String key : defaultKeys) {
            if ("spelling-accuracy".equals(key)) {
                continue;
            }
            assertThat(rules.has(key))
                    .as("Default rule '%s' should be present", key)
                    .isTrue();
            assertThat(rules.getAsJsonObject(key).get("enabled").getAsBoolean())
                    .as("Default rule '%s' should be enabled", key)
                    .isTrue();
        }
    }

    @Test
    void nonDefaultRuleKeys_areDisabledByDefault() {
        JsonObject rules = DefaultRulesJson.toJson();
        Set<String> defaultKeys = Set.copyOf(CheckList.getDefaultRuleKeys());

        for (Map.Entry<String, JsonElement> entry : rules.entrySet()) {
            if (defaultKeys.contains(entry.getKey())) {
                continue;
            }
            boolean enabled = entry.getValue().getAsJsonObject().get("enabled").getAsBoolean();
            assertThat(enabled)
                    .as("Non-default rule '%s' should be disabled", entry.getKey())
                    .isFalse();
        }
    }
}
