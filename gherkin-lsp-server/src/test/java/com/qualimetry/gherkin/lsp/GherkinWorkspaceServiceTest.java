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
import org.eclipse.lsp4j.DidChangeConfigurationParams;
import org.eclipse.lsp4j.DidChangeWatchedFilesParams;
import org.eclipse.lsp4j.InitializeParams;
import org.eclipse.lsp4j.services.LanguageClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;

class GherkinWorkspaceServiceTest {

    private GherkinLanguageServer server;
    private GherkinWorkspaceService workspaceService;

    @BeforeEach
    void setUp() throws ExecutionException, InterruptedException {
        server = new GherkinLanguageServer();
        server.connect(mock(LanguageClient.class));
        server.initialize(new InitializeParams()).get();
        workspaceService = (GherkinWorkspaceService) server.getWorkspaceService();
    }

    @Test
    void didChangeConfiguration_withGherkinAnalyzerKey_reconfigures() {
        JsonObject gherkinSettings = new JsonObject();
        JsonObject rules = new JsonObject();
        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", false);
        rules.add("feature-name-required", ruleObj);
        gherkinSettings.add("rules", rules);

        JsonObject root = new JsonObject();
        root.add("gherkinAnalyzer", gherkinSettings);

        DidChangeConfigurationParams params = new DidChangeConfigurationParams(root);

        workspaceService.didChangeConfiguration(params);

        assertThat(server.getAnalysisEngine()).isNotNull();
    }

    @Test
    void didChangeConfiguration_withFlatSettings_reconfigures() {
        JsonObject settings = new JsonObject();
        JsonObject rules = new JsonObject();
        JsonObject ruleObj = new JsonObject();
        ruleObj.addProperty("enabled", true);
        rules.add("feature-name-required", ruleObj);
        settings.add("rules", rules);

        DidChangeConfigurationParams params = new DidChangeConfigurationParams(settings);

        workspaceService.didChangeConfiguration(params);

        assertThat(server.getAnalysisEngine()).isNotNull();
    }

    @Test
    void didChangeConfiguration_withEmptySettings_doesNotThrow() {
        DidChangeConfigurationParams params = new DidChangeConfigurationParams(new JsonObject());

        assertThatCode(() -> workspaceService.didChangeConfiguration(params))
                .doesNotThrowAnyException();
    }

    @Test
    void didChangeWatchedFiles_isNoOp() {
        DidChangeWatchedFilesParams params = new DidChangeWatchedFilesParams(Collections.emptyList());

        assertThatCode(() -> workspaceService.didChangeWatchedFiles(params))
                .doesNotThrowAnyException();
    }
}
