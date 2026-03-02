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

import org.eclipse.lsp4j.launch.LSPLauncher;

import java.util.concurrent.Future;

/**
 * Entry point for the Gherkin LSP server.
 * <p>
 * Creates a {@link GherkinLanguageServer} and connects it via stdio using the
 * LSP4J launcher infrastructure.
 */
public final class Main {

    private Main() {
        // entry point only
    }

    public static void main(String[] args) throws Exception {
        GherkinLanguageServer server = new GherkinLanguageServer();
        var launcher = LSPLauncher.createServerLauncher(server, System.in, System.out);
        server.connect(launcher.getRemoteProxy());
        Future<Void> listening = launcher.startListening();
        listening.get();
    }
}
