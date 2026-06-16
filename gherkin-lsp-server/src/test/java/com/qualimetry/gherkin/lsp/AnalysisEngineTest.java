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
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AnalysisEngineTest {

    private AnalysisEngine engine;

    @BeforeEach
    void setUp() {
        engine = new AnalysisEngine(new RuleConfiguration(null));
    }

    @Test
    void compliantFile_producesNoDiagnosticsAboveHint() throws IOException {
        String content = loadResource("compliant.feature");

        List<Diagnostic> diagnostics = engine.analyzeFile("file:///compliant.feature", content);

        List<Diagnostic> aboveHint = diagnostics.stream()
                .filter(d -> d.getSeverity() != DiagnosticSeverity.Hint)
                .toList();
        assertThat(aboveHint).isEmpty();
    }

    @Test
    void noncompliantFile_producesExpectedDiagnostics() throws IOException {
        String content = loadResource("noncompliant.feature");

        List<Diagnostic> diagnostics = engine.analyzeFile("file:///noncompliant.feature", content);

        List<Diagnostic> errors = diagnostics.stream()
                .filter(d -> d.getSeverity() == DiagnosticSeverity.Error)
                .toList();
        assertThat(errors).isNotEmpty();
        assertThat(errors).anyMatch(d ->
                "feature-name-required".equals(d.getCode().getLeft())
                        || "scenario-name-required".equals(d.getCode().getLeft()));
    }

    @Test
    void fileOnDiskWithBom_raisesNoByteOrderMarkDiagnostic(@TempDir Path tempDir) throws IOException {
        String content = loadResource("compliant.feature");
        Path file = tempDir.resolve("bom.feature");
        byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] body = content.getBytes(StandardCharsets.UTF_8);
        byte[] bytes = new byte[bom.length + body.length];
        System.arraycopy(bom, 0, bytes, 0, bom.length);
        System.arraycopy(body, 0, bytes, bom.length, body.length);
        Files.write(file, bytes);

        // Editors strip the BOM from the buffer; the engine restores it from disk.
        List<Diagnostic> diagnostics = engine.analyzeFile(file.toUri().toString(), content);

        assertThat(diagnostics).anyMatch(d -> "no-byte-order-mark".equals(d.getCode().getLeft()));
    }

    @Test
    void untitledDocument_skipsBomDetection() throws IOException {
        String content = loadResource("compliant.feature");

        List<Diagnostic> diagnostics = engine.analyzeFile("untitled:Untitled-1", content);

        assertThat(diagnostics).noneMatch(d -> "no-byte-order-mark".equals(d.getCode().getLeft()));
    }

    @Test
    void fileOnDiskWithoutBom_raisesNoBomDiagnostic(@TempDir Path tempDir) throws IOException {
        String content = loadResource("compliant.feature");
        Path file = tempDir.resolve("nobom.feature");
        Files.write(file, content.getBytes(StandardCharsets.UTF_8));

        List<Diagnostic> diagnostics = engine.analyzeFile(file.toUri().toString(), content);

        assertThat(diagnostics).noneMatch(d -> "no-byte-order-mark".equals(d.getCode().getLeft()));
    }

    @Test
    void syntacticallyInvalidFile_producesParseErrorDiagnostic() {
        String content = "Feature: First feature\n\n  Scenario: First scenario\n    Given a step\n\n"
                + "Feature: Duplicate feature keyword\n\n  Scenario: Second scenario\n    Given another step\n";
        String uri = "file:///broken.feature";

        List<Diagnostic> diagnostics = engine.analyzeFile(uri, content);

        assertThat(diagnostics).hasSize(1);
        Diagnostic diagnostic = diagnostics.get(0);
        assertThat(diagnostic.getCode().getLeft()).isEqualTo("parse-error");
        assertThat(diagnostic.getSeverity()).isEqualTo(DiagnosticSeverity.Error);
        assertThat(engine.hasFile(uri)).isFalse();
    }

    @Test
    void removeFile_clearsStoredFeature() throws IOException {
        String content = loadResource("compliant.feature");
        String uri = "file:///compliant.feature";
        engine.analyzeFile(uri, content);

        assertThat(engine.hasFile(uri)).isTrue();

        engine.removeFile(uri);

        assertThat(engine.hasFile(uri)).isFalse();
    }

    private static String loadResource(String name) throws IOException {
        try (InputStream is = AnalysisEngineTest.class.getClassLoader()
                .getResourceAsStream(name)) {
            if (is == null) {
                throw new IOException("Resource not found: " + name);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
