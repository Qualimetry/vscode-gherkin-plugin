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
import com.qualimetry.sonar.gherkin.analyzer.visitor.BaseCheck;
import org.sonar.check.Rule;
import org.sonar.check.RuleProperty;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Manages which analysis rules are active and applies configurable properties
 * from user settings.
 * <p>
 * Rules are sourced from {@link CheckList#getAllChecks()}. Each rule can be
 * enabled or disabled through a JSON settings object. Properties annotated
 * with {@link RuleProperty} are set via reflection when a matching value
 * appears in the settings.
 */
public class RuleConfiguration {

    private static final String EXCLUDED_RULE = "spelling-accuracy";

    private final List<BaseCheck> activeChecks = new ArrayList<>();
    private final Set<String> activeRuleKeys = new LinkedHashSet<>();

    /**
     * Builds the rule configuration from user settings.
     *
     * @param settings a JSON object representing user settings, or {@code null}
     *                 to use all defaults from {@link CheckList#getDefaultRuleKeys()}
     */
    public RuleConfiguration(JsonObject settings) {
        Set<String> defaultKeys = new HashSet<>(CheckList.getDefaultRuleKeys());
        JsonObject rulesConfig = resolveRulesConfig(settings);

        for (Class<? extends BaseCheck> clazz : CheckList.getAllChecks()) {
            try {
                Rule ruleAnnotation = clazz.getAnnotation(Rule.class);
                if (ruleAnnotation == null) {
                    continue;
                }
                String key = ruleAnnotation.key();

                if (EXCLUDED_RULE.equals(key)) {
                    continue;
                }

                boolean enabled = isEnabled(key, rulesConfig, defaultKeys);
                if (!enabled) {
                    continue;
                }

                BaseCheck check = clazz.getDeclaredConstructor().newInstance();

                if (rulesConfig != null && rulesConfig.has(key)
                        && rulesConfig.get(key).isJsonObject()) {
                    applyProperties(check, clazz, rulesConfig.getAsJsonObject(key));
                }

                activeChecks.add(check);
                activeRuleKeys.add(key);
            } catch (ReflectiveOperationException e) {
                // Skip checks that cannot be instantiated
            }
        }
    }

    /**
     * Returns the list of active (enabled) check instances with properties applied.
     */
    public List<BaseCheck> getActiveChecks() {
        return Collections.unmodifiableList(activeChecks);
    }

    /**
     * Returns the set of active rule keys.
     */
    public Set<String> getActiveRuleKeys() {
        return Collections.unmodifiableSet(activeRuleKeys);
    }

    private static JsonObject resolveRulesConfig(JsonObject settings) {
        if (settings != null && settings.has("rules")
                && settings.get("rules").isJsonObject()) {
            return settings.getAsJsonObject("rules");
        }
        return null;
    }

    private static boolean isEnabled(String key, JsonObject rulesConfig,
                                     Set<String> defaultKeys) {
        if (rulesConfig != null && rulesConfig.has(key)
                && rulesConfig.get(key).isJsonObject()) {
            JsonObject ruleObj = rulesConfig.getAsJsonObject(key);
            if (ruleObj.has("enabled")) {
                return ruleObj.get("enabled").getAsBoolean();
            }
        }
        return defaultKeys.contains(key);
    }

    private static void applyProperties(BaseCheck check,
                                         Class<? extends BaseCheck> clazz,
                                         JsonObject ruleObj) {
        for (Field field : clazz.getDeclaredFields()) {
            if (!field.isAnnotationPresent(RuleProperty.class)) {
                continue;
            }
            String fieldName = field.getName();
            if (!ruleObj.has(fieldName) || ruleObj.get(fieldName).isJsonNull()) {
                continue;
            }
            field.setAccessible(true);
            try {
                String value = ruleObj.get(fieldName).getAsString();
                if (field.getType() == int.class || field.getType() == Integer.class) {
                    field.setInt(check, Integer.parseInt(value));
                } else if (field.getType() == String.class) {
                    field.set(check, value);
                }
            } catch (ReflectiveOperationException | NumberFormatException e) {
                // Ignore invalid property values
            }
        }
    }
}
