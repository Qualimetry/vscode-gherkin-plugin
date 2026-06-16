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

import org.eclipse.lsp4j.DidChangeTextDocumentParams;
import org.eclipse.lsp4j.DidCloseTextDocumentParams;
import org.eclipse.lsp4j.DidOpenTextDocumentParams;
import org.eclipse.lsp4j.DidSaveTextDocumentParams;
import org.eclipse.lsp4j.PublishDiagnosticsParams;
import org.eclipse.lsp4j.TextDocumentContentChangeEvent;
import org.eclipse.lsp4j.TextDocumentIdentifier;
import org.eclipse.lsp4j.TextDocumentItem;
import org.eclipse.lsp4j.VersionedTextDocumentIdentifier;
import org.eclipse.lsp4j.services.LanguageClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class GherkinTextDocumentServiceTest {

    private static final String FEATURE_URI = "file:///test.feature";
    private static final String VALID_FEATURE =
            "Feature: Login\n  Scenario: Success\n    Given the user is on the login page\n";

    private GherkinTextDocumentService service;
    private LanguageClient client;

    @BeforeEach
    void setUp() {
        service = new GherkinTextDocumentService();
        client = mock(LanguageClient.class);
        service.setClient(client);
        service.setEngine(new AnalysisEngine(new RuleConfiguration(null)));
    }

    @Test
    void didOpen_triggersAnalysisAndPublishesDiagnostics() {
        DidOpenTextDocumentParams params = openParams(FEATURE_URI, VALID_FEATURE);

        service.didOpen(params);

        ArgumentCaptor<PublishDiagnosticsParams> captor =
                ArgumentCaptor.forClass(PublishDiagnosticsParams.class);
        verify(client, atLeastOnce()).publishDiagnostics(captor.capture());

        List<PublishDiagnosticsParams> published = captor.getAllValues();
        assertThat(published).anyMatch(p -> FEATURE_URI.equals(p.getUri()));
    }

    @Test
    void didChange_triggersAnalysisAndPublishesDiagnostics() {
        service.didOpen(openParams(FEATURE_URI, VALID_FEATURE));

        DidChangeTextDocumentParams changeParams = changeParams(FEATURE_URI,
                "Feature: Updated\n  Scenario: Changed\n    Given something\n");

        service.didChange(changeParams);

        ArgumentCaptor<PublishDiagnosticsParams> captor =
                ArgumentCaptor.forClass(PublishDiagnosticsParams.class);
        verify(client, atLeastOnce()).publishDiagnostics(captor.capture());

        assertThat(captor.getAllValues()).anyMatch(p -> FEATURE_URI.equals(p.getUri()));
    }

    @Test
    void didClose_publishesEmptyDiagnostics() {
        service.didOpen(openParams(FEATURE_URI, VALID_FEATURE));

        DidCloseTextDocumentParams closeParams = new DidCloseTextDocumentParams();
        closeParams.setTextDocument(new TextDocumentIdentifier(FEATURE_URI));

        service.didClose(closeParams);

        ArgumentCaptor<PublishDiagnosticsParams> captor =
                ArgumentCaptor.forClass(PublishDiagnosticsParams.class);
        verify(client, atLeastOnce()).publishDiagnostics(captor.capture());

        PublishDiagnosticsParams lastForUri = captor.getAllValues().stream()
                .filter(p -> FEATURE_URI.equals(p.getUri()))
                .reduce((first, second) -> second)
                .orElseThrow();
        assertThat(lastForUri.getDiagnostics()).isEmpty();
    }

    @Test
    void didSave_isNoOp() {
        DidSaveTextDocumentParams params = new DidSaveTextDocumentParams();
        params.setTextDocument(new TextDocumentIdentifier(FEATURE_URI));

        assertThatCode(() -> service.didSave(params)).doesNotThrowAnyException();
    }

    @Test
    void didOpen_withoutClient_doesNotThrow() {
        GherkinTextDocumentService noClientService = new GherkinTextDocumentService();
        noClientService.setEngine(new AnalysisEngine(new RuleConfiguration(null)));

        assertThatCode(() -> noClientService.didOpen(openParams(FEATURE_URI, VALID_FEATURE)))
                .doesNotThrowAnyException();
    }

    @Test
    void didOpen_withoutEngine_doesNotThrow() {
        GherkinTextDocumentService noEngineService = new GherkinTextDocumentService();
        noEngineService.setClient(client);

        assertThatCode(() -> noEngineService.didOpen(openParams(FEATURE_URI, VALID_FEATURE)))
                .doesNotThrowAnyException();
    }

    @Test
    void reanalyzeAll_republishesDiagnosticsForOpenFiles() {
        service.didOpen(openParams(FEATURE_URI, VALID_FEATURE));

        String secondUri = "file:///second.feature";
        service.didOpen(openParams(secondUri, VALID_FEATURE));

        service.reanalyzeAll();

        ArgumentCaptor<PublishDiagnosticsParams> captor =
                ArgumentCaptor.forClass(PublishDiagnosticsParams.class);
        verify(client, atLeastOnce()).publishDiagnostics(captor.capture());

        List<String> publishedUris = captor.getAllValues().stream()
                .map(PublishDiagnosticsParams::getUri)
                .toList();
        assertThat(publishedUris).contains(FEATURE_URI, secondUri);
    }

    private static DidOpenTextDocumentParams openParams(String uri, String text) {
        DidOpenTextDocumentParams params = new DidOpenTextDocumentParams();
        params.setTextDocument(new TextDocumentItem(uri, "gherkin", 1, text));
        return params;
    }

    private static DidChangeTextDocumentParams changeParams(String uri, String newText) {
        DidChangeTextDocumentParams params = new DidChangeTextDocumentParams();
        params.setTextDocument(new VersionedTextDocumentIdentifier(uri, 2));
        TextDocumentContentChangeEvent change = new TextDocumentContentChangeEvent(newText);
        params.setContentChanges(List.of(change));
        return params;
    }
}
