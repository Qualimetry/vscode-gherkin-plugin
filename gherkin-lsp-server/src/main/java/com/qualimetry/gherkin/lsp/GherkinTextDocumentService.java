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

import org.eclipse.lsp4j.Diagnostic;
import org.eclipse.lsp4j.DidChangeTextDocumentParams;
import org.eclipse.lsp4j.DidCloseTextDocumentParams;
import org.eclipse.lsp4j.DidOpenTextDocumentParams;
import org.eclipse.lsp4j.DidSaveTextDocumentParams;
import org.eclipse.lsp4j.PublishDiagnosticsParams;
import org.eclipse.lsp4j.services.LanguageClient;
import org.eclipse.lsp4j.services.TextDocumentService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles text document lifecycle events (open, change, close, save) and
 * triggers analysis to publish diagnostics to the client.
 */
public class GherkinTextDocumentService implements TextDocumentService {

    private volatile AnalysisEngine engine;
    private LanguageClient client;
    private final Map<String, String> openDocuments = new ConcurrentHashMap<>();

    /**
     * Creates a text document service. The analysis engine is wired later
     * via {@link #setEngine(AnalysisEngine)} once the server is initialized.
     */
    public GherkinTextDocumentService() {
    }

    /**
     * Sets the analysis engine. Called during server initialization.
     *
     * @param engine the analysis engine to use for file analysis
     */
    public void setEngine(AnalysisEngine engine) {
        this.engine = engine;
    }

    /**
     * Sets the language client used to publish diagnostics.
     *
     * @param client the language client proxy
     */
    public void setClient(LanguageClient client) {
        this.client = client;
    }

    @Override
    public void didOpen(DidOpenTextDocumentParams params) {
        String uri = params.getTextDocument().getUri();
        String text = params.getTextDocument().getText();
        openDocuments.put(uri, text);
        analyzeAndPublish(uri, text);
    }

    @Override
    public void didChange(DidChangeTextDocumentParams params) {
        String uri = params.getTextDocument().getUri();
        String text = params.getContentChanges().get(0).getText();
        openDocuments.put(uri, text);
        analyzeAndPublish(uri, text);
    }

    @Override
    public void didClose(DidCloseTextDocumentParams params) {
        String uri = params.getTextDocument().getUri();
        openDocuments.remove(uri);
        engine.removeFile(uri);
        if (client != null) {
            client.publishDiagnostics(
                    new PublishDiagnosticsParams(uri, Collections.emptyList()));
        }
    }

    @Override
    public void didSave(DidSaveTextDocumentParams params) {
        // no-op - analysis runs on open and change
    }

    /**
     * Re-analyzes all currently open documents and publishes updated diagnostics.
     * <p>
     * Called after a configuration change to reflect new rule settings.
     */
    public void reanalyzeAll() {
        for (Map.Entry<String, String> entry : openDocuments.entrySet()) {
            analyzeAndPublish(entry.getKey(), entry.getValue());
        }
    }

    private void analyzeAndPublish(String uri, String content) {
        if (client == null || engine == null) {
            return;
        }

        List<Diagnostic> diagnostics = engine.analyzeFile(uri, content);

        // Publish per-file diagnostics for the current file
        client.publishDiagnostics(new PublishDiagnosticsParams(uri, diagnostics));

        // Run cross-file analysis and merge results
        Map<String, List<Diagnostic>> crossFile = engine.getCrossFileDiagnostics();

        for (Map.Entry<String, List<Diagnostic>> entry : crossFile.entrySet()) {
            String crossUri = entry.getKey();
            if (!openDocuments.containsKey(crossUri)) {
                continue;
            }

            List<Diagnostic> merged;
            if (crossUri.equals(uri)) {
                // Merge cross-file diagnostics with the per-file ones for current file
                merged = new ArrayList<>(diagnostics);
                merged.addAll(entry.getValue());
            } else {
                // For other open files, re-run per-file analysis and merge
                String otherContent = openDocuments.get(crossUri);
                List<Diagnostic> perFile = engine.analyzeFile(crossUri, otherContent);
                merged = new ArrayList<>(perFile);
                merged.addAll(entry.getValue());
            }

            client.publishDiagnostics(new PublishDiagnosticsParams(crossUri, merged));
        }
    }
}
