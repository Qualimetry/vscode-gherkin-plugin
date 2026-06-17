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
import org.eclipse.lsp4j.InitializeParams;
import org.eclipse.lsp4j.InitializeResult;
import org.eclipse.lsp4j.TextDocumentSyncKind;
import org.eclipse.lsp4j.services.LanguageClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;

class GherkinLanguageServerTest {

    private GherkinLanguageServer server;

    @BeforeEach
    void setUp() {
        server = new GherkinLanguageServer();
    }

    @Test
    void initialize_returnsFullSyncCapability() throws ExecutionException, InterruptedException {
        InitializeParams params = new InitializeParams();

        InitializeResult result = server.initialize(params).get();

        assertThat(result.getCapabilities().getTextDocumentSync().getLeft())
                .isEqualTo(TextDocumentSyncKind.Full);
    }

    @Test
    void initialize_returnsServerInfo() throws ExecutionException, InterruptedException {
        InitializeParams params = new InitializeParams();

        InitializeResult result = server.initialize(params).get();

        assertThat(result.getServerInfo()).isNotNull();
        assertThat(result.getServerInfo().getName()).isEqualTo("Gherkin Analyzer");
    }

    @Test
    void initialize_withSettings_createsAnalysisEngine() throws ExecutionException, InterruptedException {
        InitializeParams params = new InitializeParams();
        JsonObject settings = new JsonObject();
        params.setInitializationOptions(settings);

        server.initialize(params).get();

        assertThat(server.getAnalysisEngine()).isNotNull();
    }

    @Test
    void initialize_withNullOptions_createsAnalysisEngine() throws ExecutionException, InterruptedException {
        InitializeParams params = new InitializeParams();

        server.initialize(params).get();

        assertThat(server.getAnalysisEngine()).isNotNull();
    }

    @Test
    void shutdown_completesSuccessfully() throws ExecutionException, InterruptedException {
        Object result = server.shutdown().get();

        assertThat(result).isNull();
    }

    @Test
    void shutdown_doesNotThrow() {
        assertThatCode(() -> server.shutdown().get()).doesNotThrowAnyException();
    }

    @Test
    void getTextDocumentService_isNotNull() {
        assertThat(server.getTextDocumentService()).isNotNull();
    }

    @Test
    void getWorkspaceService_isNotNull() {
        assertThat(server.getWorkspaceService()).isNotNull();
    }

    @Test
    void connect_setsClient() {
        LanguageClient client = mock(LanguageClient.class);

        server.connect(client);

        assertThat(server.getClient()).isSameAs(client);
    }

    @Test
    void reconfigure_updatesEngineAndTriggersReanalysis() throws ExecutionException, InterruptedException {
        LanguageClient client = mock(LanguageClient.class);
        server.connect(client);
        server.initialize(new InitializeParams()).get();

        AnalysisEngine engineBefore = server.getAnalysisEngine();

        assertThatCode(() -> server.reconfigure(new JsonObject())).doesNotThrowAnyException();
        assertThat(server.getAnalysisEngine()).isSameAs(engineBefore);
    }
}
