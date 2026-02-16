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

import com.qualimetry.sonar.gherkin.analyzer.checks.ConsistentFeatureLanguageCheck;
import com.qualimetry.sonar.gherkin.analyzer.checks.UniqueFeatureNameCheck;
import com.qualimetry.sonar.gherkin.analyzer.checks.UniqueScenarioNameCheck;
import com.qualimetry.sonar.gherkin.analyzer.parser.FeatureParser;
import com.qualimetry.sonar.gherkin.analyzer.parser.model.FeatureFile;
import com.qualimetry.sonar.gherkin.analyzer.visitor.BaseCheck;
import com.qualimetry.sonar.gherkin.analyzer.visitor.CrossFileIssue;
import com.qualimetry.sonar.gherkin.analyzer.visitor.FeatureContext;
import com.qualimetry.sonar.gherkin.analyzer.visitor.FeatureWalker;
import com.qualimetry.sonar.gherkin.analyzer.visitor.Issue;
import org.eclipse.lsp4j.Diagnostic;
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.eclipse.lsp4j.Position;
import org.eclipse.lsp4j.Range;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Core analysis orchestrator for the LSP server.
 * <p>
 * Replaces the role of SonarQube's {@code GherkinSensor} by parsing feature
 * files, running active checks, and producing LSP {@link Diagnostic} objects.
 * Maintains a map of parsed features by URI to support cross-file analysis.
 */
public class AnalysisEngine {

    private static final String SOURCE = "gherkin-analyzer";

    private final Map<String, FeatureFile> featuresByUri = new ConcurrentHashMap<>();
    private volatile RuleConfiguration ruleConfiguration;

    /**
     * Creates an analysis engine with the given rule configuration.
     *
     * @param ruleConfiguration the active rule configuration
     */
    public AnalysisEngine(RuleConfiguration ruleConfiguration) {
        this.ruleConfiguration = ruleConfiguration;
    }

    /**
     * Parses and analyzes a single feature file, returning diagnostics.
     * <p>
     * A fresh {@link FeatureContext} is created for each check so that issues
     * do not accumulate across checks and cause double-counting.
     *
     * @param uri     the file URI
     * @param content the raw file content
     * @return the list of diagnostics found
     */
    public List<Diagnostic> analyzeFile(String uri, String content) {
        FeatureFile featureFile;
        try {
            featureFile = new FeatureParser().parse(uri, content);
        } catch (IOException e) {
            Diagnostic parseError = new Diagnostic();
            parseError.setRange(new Range(new Position(0, 0), new Position(0, 1)));
            parseError.setSeverity(DiagnosticSeverity.Error);
            parseError.setSource(SOURCE);
            parseError.setCode("parse-error");
            parseError.setMessage(e.getMessage());
            return List.of(parseError);
        }

        featuresByUri.put(uri, featureFile);

        List<Diagnostic> diagnostics = new ArrayList<>();

        for (BaseCheck check : ruleConfiguration.getActiveChecks()) {
            FeatureContext context = new FeatureContext(featureFile, null, content);
            check.setContext(context);
            FeatureWalker.walk(featureFile, check);

            for (Issue issue : context.getIssues()) {
                diagnostics.add(DiagnosticMapper.toDiagnostic(issue));
            }
        }

        return diagnostics;
    }

    /**
     * Runs cross-file checks across all stored feature files and returns
     * diagnostics grouped by URI.
     * <p>
     * Only cross-file checks whose rule key is in the active rule keys set
     * are executed.
     *
     * @return a map of URI to diagnostics from cross-file analysis
     */
    public Map<String, List<Diagnostic>> getCrossFileDiagnostics() {
        Map<String, List<Diagnostic>> result = new HashMap<>();

        List<BaseCheck> crossFileChecks = new ArrayList<>();
        var activeKeys = ruleConfiguration.getActiveRuleKeys();

        if (activeKeys.contains("unique-feature-name")) {
            crossFileChecks.add(new UniqueFeatureNameCheck());
        }
        if (activeKeys.contains("unique-scenario-name")) {
            crossFileChecks.add(new UniqueScenarioNameCheck());
        }
        if (activeKeys.contains("consistent-feature-language")) {
            crossFileChecks.add(new ConsistentFeatureLanguageCheck());
        }

        for (BaseCheck check : crossFileChecks) {
            for (FeatureFile featureFile : featuresByUri.values()) {
                check.setContext(new FeatureContext(featureFile));
                FeatureWalker.walk(featureFile, check);
            }
        }

        for (BaseCheck check : crossFileChecks) {
            List<CrossFileIssue> issues;
            if (check instanceof UniqueFeatureNameCheck ufc) {
                issues = ufc.afterAllFiles();
            } else if (check instanceof UniqueScenarioNameCheck usc) {
                issues = usc.afterAllFiles();
            } else if (check instanceof ConsistentFeatureLanguageCheck cfl) {
                issues = cfl.afterAllFiles();
            } else {
                continue;
            }

            for (CrossFileIssue cfi : issues) {
                result.computeIfAbsent(cfi.uri(), k -> new ArrayList<>())
                        .add(DiagnosticMapper.toDiagnostic(cfi));
            }
        }

        return result;
    }

    /**
     * Removes a file from the stored feature map.
     *
     * @param uri the URI of the file to remove
     */
    public void removeFile(String uri) {
        featuresByUri.remove(uri);
    }

    /**
     * Replaces the current rule configuration.
     *
     * @param newConfig the new rule configuration
     */
    public void updateConfiguration(RuleConfiguration newConfig) {
        this.ruleConfiguration = newConfig;
    }

    /**
     * Returns the number of stored feature files (visible for testing).
     */
    int getStoredFileCount() {
        return featuresByUri.size();
    }

    /**
     * Returns whether a file is stored (visible for testing).
     */
    boolean hasFile(String uri) {
        return featuresByUri.containsKey(uri);
    }
}
