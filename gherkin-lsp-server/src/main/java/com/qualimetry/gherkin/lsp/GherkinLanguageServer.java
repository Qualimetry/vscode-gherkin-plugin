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
import org.eclipse.lsp4j.ServerCapabilities;
import org.eclipse.lsp4j.ServerInfo;
import org.eclipse.lsp4j.TextDocumentSyncKind;
import org.eclipse.lsp4j.services.LanguageClient;
import org.eclipse.lsp4j.services.LanguageServer;
import org.eclipse.lsp4j.services.TextDocumentService;
import org.eclipse.lsp4j.services.WorkspaceService;

import java.util.concurrent.CompletableFuture;

/**
 * LSP server implementation for Gherkin feature file analysis.
 * <p>
 * Coordinates the {@link GherkinTextDocumentService}, {@link GherkinWorkspaceService},
 * and {@link AnalysisEngine} to provide real-time diagnostics to the client.
 */
public class GherkinLanguageServer implements LanguageServer {

    private LanguageClient client;
    private final GherkinTextDocumentService textDocumentService;
    private final GherkinWorkspaceService workspaceService;
    private AnalysisEngine analysisEngine;
    private RuleConfiguration ruleConfiguration;

    public GherkinLanguageServer() {
        // Services must exist before LSP4J calls getTextDocumentService() / getWorkspaceService()
        // during launcher setup. The engine is wired in initialize().
        this.textDocumentService = new GherkinTextDocumentService();
        this.workspaceService = new GherkinWorkspaceService(this);
    }

    /**
     * Connects the server to the language client proxy.
     *
     * @param client the LSP client proxy
     */
    public void connect(LanguageClient client) {
        this.client = client;
        textDocumentService.setClient(client);
    }

    @Override
    public CompletableFuture<InitializeResult> initialize(InitializeParams params) {
        JsonObject settings = null;
        if (params.getInitializationOptions() != null) {
            settings = (JsonObject) params.getInitializationOptions();
        }

        ruleConfiguration = new RuleConfiguration(settings);
        analysisEngine = new AnalysisEngine(ruleConfiguration);
        textDocumentService.setEngine(analysisEngine);

        ServerCapabilities capabilities = new ServerCapabilities();
        capabilities.setTextDocumentSync(TextDocumentSyncKind.Full);

        ServerInfo serverInfo = new ServerInfo("Gherkin Analyzer", "1.2.2");

        InitializeResult result = new InitializeResult(capabilities, serverInfo);
        return CompletableFuture.completedFuture(result);
    }

    @Override
    public CompletableFuture<Object> shutdown() {
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public void exit() {
        System.exit(0);
    }

    @Override
    public TextDocumentService getTextDocumentService() {
        return textDocumentService;
    }

    @Override
    public WorkspaceService getWorkspaceService() {
        return workspaceService;
    }

    /**
     * Returns the analysis engine.
     *
     * @return the analysis engine
     */
    public AnalysisEngine getAnalysisEngine() {
        return analysisEngine;
    }

    /**
     * Returns the connected language client.
     *
     * @return the language client, or {@code null} if not yet connected
     */
    public LanguageClient getClient() {
        return client;
    }

    /**
     * Reconfigures the server with new settings.
     * <p>
     * Creates a new {@link RuleConfiguration}, updates the analysis engine,
     * and triggers re-analysis of all open files.
     *
     * @param settings the new settings as a JSON object, or {@code null} for defaults
     */
    public void reconfigure(JsonObject settings) {
        ruleConfiguration = new RuleConfiguration(settings);
        analysisEngine.updateConfiguration(ruleConfiguration);
        textDocumentService.reanalyzeAll();
    }
}
