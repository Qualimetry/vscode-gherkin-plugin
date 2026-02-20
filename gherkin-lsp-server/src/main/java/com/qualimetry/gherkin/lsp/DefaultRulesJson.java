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
import com.google.gson.JsonObject;
import com.qualimetry.sonar.gherkin.analyzer.checks.CheckList;
import com.qualimetry.sonar.gherkin.analyzer.visitor.BaseCheck;
import org.sonar.check.Rule;
import org.sonar.check.RuleProperty;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

/**
 * Exports the full default rules configuration (all rules with default
 * enabled state, severity, and rule parameters) as JSON for use by the
 * VS Code extension so users see every rule and edit in place.
 * <p>
 * Run as main to print JSON to stdout (e.g. for build-time generation).
 */
public final class DefaultRulesJson {

    private static final String EXCLUDED_RULE = "spelling-accuracy";

    private DefaultRulesJson() {
        // utility class
    }

    /**
     * Builds the default rules configuration as a JSON object.
     * Each key is a rule ID; each value is an object with "enabled", "severity",
     * and any rule parameter keys with their default values.
     *
     * @return the rules object (suitable for gherkinAnalyzer.rules)
     */
    public static JsonObject toJson() {
        Set<String> defaultKeys = new HashSet<>(CheckList.getDefaultRuleKeys());
        JsonObject rules = new JsonObject();

        for (Class<? extends BaseCheck> clazz : CheckList.getAllChecks()) {
            Rule ruleAnnotation = clazz.getAnnotation(Rule.class);
            if (ruleAnnotation == null) {
                continue;
            }
            String key = ruleAnnotation.key();
            if (EXCLUDED_RULE.equals(key)) {
                continue;
            }

            JsonObject ruleObj = new JsonObject();
            ruleObj.addProperty("enabled", defaultKeys.contains(key));
            ruleObj.addProperty("severity", severityToString(key));
            addRulePropertyDefaults(ruleObj, clazz);
            rules.add(key, ruleObj);
        }

        return rules;
    }

    private static String severityToString(String ruleKey) {
        return SeverityMap.getSeverityString(ruleKey);
    }

    private static void addRulePropertyDefaults(JsonObject ruleObj, Class<? extends BaseCheck> clazz) {
        for (Field field : clazz.getDeclaredFields()) {
            if (!field.isAnnotationPresent(RuleProperty.class)) {
                continue;
            }
            RuleProperty rp = field.getAnnotation(RuleProperty.class);
            String propKey = rp.key().isEmpty() ? field.getName() : rp.key();
            String defaultValue = rp.defaultValue();
            if (defaultValue != null && !defaultValue.isEmpty()) {
                ruleObj.addProperty(propKey, defaultValue);
            }
        }
    }

    /**
     * Prints the default rules JSON to stdout (pretty-printed).
     * Used at build time to generate vscode-client default rules file.
     */
    public static void main(String[] args) {
        JsonObject rules = toJson();
        String json = new GsonBuilder().setPrettyPrinting().create().toJson(rules);
        System.out.println(json);
    }
}
