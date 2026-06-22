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

import com.qualimetry.sonar.gherkin.analyzer.parser.model.BackgroundDefinition;
import com.qualimetry.sonar.gherkin.analyzer.parser.model.FeatureDefinition;
import com.qualimetry.sonar.gherkin.analyzer.parser.model.FeatureFile;
import com.qualimetry.sonar.gherkin.analyzer.parser.model.RuleDefinition;
import com.qualimetry.sonar.gherkin.analyzer.parser.model.ScenarioDefinition;
import com.qualimetry.sonar.gherkin.analyzer.parser.model.StepDefinition;
import com.qualimetry.sonar.gherkin.analyzer.visitor.BaseCheck;
import org.sonar.check.Rule;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Checks that Given steps common to all scenarios are moved to the Background.
 * <p>
 * Scopes the analysis per container (Feature or Rule) independently. When every
 * scenario within a container starts with the same Given step(s), those steps
 * should be extracted into a Background section to reduce duplication. Feature-level
 * analysis excludes Rule-scoped scenarios. Rule-level analysis checks within each
 * Rule independently.
 */
@Rule(key = "shared-given-to-background")
public class SharedGivenToBackgroundCheck extends BaseCheck {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("<[^>]+>");

    private List<List<String>> featureLevelGivens;
    private List<List<String>> ruleLevelGivens;
    private boolean insideRule;

    @Override
    public void visitFeatureFile(FeatureFile file) {
        featureLevelGivens = new ArrayList<>();
        ruleLevelGivens = new ArrayList<>();
        insideRule = false;
    }

    @Override
    public void visitScenario(ScenarioDefinition scenario) {
        List<String> givenSteps = new ArrayList<>();
        for (StepDefinition step : scenario.steps()) {
            String keywordType = step.keywordType();
            if ("CONTEXT".equals(keywordType) || "CONJUNCTION".equals(keywordType)) {
                String key = stepKey(step);
                if (scenario.isOutline() && PLACEHOLDER_PATTERN.matcher(key).find()) {
                    break; // value varies per Examples row; steps after it cannot be hoisted without reordering
                }
                givenSteps.add(key);
            } else {
                break; // stop at the first non-Given step
            }
        }
        if (insideRule) {
            ruleLevelGivens.add(givenSteps);
        } else {
            featureLevelGivens.add(givenSteps);
        }
    }

    @Override
    public void visitRule(RuleDefinition rule) {
        insideRule = true;
        ruleLevelGivens = new ArrayList<>();
    }

    @Override
    public void leaveRule(RuleDefinition rule) {
        if (ruleLevelGivens.size() >= 2) {
            List<String> movableGivens = findMovableGivens(ruleLevelGivens, rule.background());
            if (!movableGivens.isEmpty()) {
                addIssue(rule.position(), rule.background() == null
                        ? "Move the common Given step(s) to a Background section within this Rule."
                        : "Move the common Given step(s) into the existing Background section of this Rule.");
            }
        }
        insideRule = false;
    }

    @Override
    public void leaveFeature(FeatureDefinition feature) {
        if (featureLevelGivens.size() < 2) {
            return;
        }

        List<String> movableGivens = findMovableGivens(featureLevelGivens, feature.background());
        if (!movableGivens.isEmpty()) {
            addIssue(feature.position(), feature.background() == null
                    ? "Move the common Given step(s) to a Background section."
                    : "Move the common Given step(s) into the existing Background section.");
        }
    }

    private static List<String> findMovableGivens(List<List<String>> allGivens,
            BackgroundDefinition background) {
        List<String> common = findCommonLeadingGivens(allGivens);
        if (background != null) {
            Set<String> backgroundKeys = background.steps().stream()
                    .map(SharedGivenToBackgroundCheck::stepKey)
                    .collect(Collectors.toSet());
            common.removeIf(backgroundKeys::contains);
        }
        return common;
    }

    private static List<String> findCommonLeadingGivens(List<List<String>> allGivens) {
        List<String> common = new ArrayList<>();
        if (allGivens.stream().anyMatch(List::isEmpty)) {
            return common; // at least one scenario has no Given steps
        }

        int shortest = allGivens.stream().mapToInt(List::size).min().orElse(0);
        for (int position = 0; position < shortest; position++) {
            String candidate = allGivens.get(0).get(position);
            for (List<String> givens : allGivens) {
                if (!candidate.equals(givens.get(position))) {
                    return common; // prefix diverges; nothing after this point can be hoisted
                }
            }
            common.add(candidate);
        }
        return common;
    }

    private static String stepKey(StepDefinition step) {
        StringBuilder key = new StringBuilder(step.text());
        if (step.dataTable() != null) {
            key.append('\u0000');
            key.append(step.dataTable().rows().stream()
                    .map(row -> String.join("|", row))
                    .collect(Collectors.joining("\n")));
        }
        if (step.docString() != null) {
            key.append('\u0001').append(step.docString().content());
        }
        return key.toString();
    }
}
