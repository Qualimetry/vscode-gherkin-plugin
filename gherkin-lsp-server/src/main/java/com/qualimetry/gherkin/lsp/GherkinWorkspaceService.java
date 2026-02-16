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
import org.eclipse.lsp4j.services.WorkspaceService;

/**
 * Handles workspace-level events such as configuration changes.
 */
public class GherkinWorkspaceService implements WorkspaceService {

    private final GherkinLanguageServer server;

    /**
     * Creates a workspace service linked to the given server.
     *
     * @param server the parent language server
     */
    public GherkinWorkspaceService(GherkinLanguageServer server) {
        this.server = server;
    }

    @Override
    public void didChangeConfiguration(DidChangeConfigurationParams params) {
        JsonObject settings = null;
        if (params.getSettings() != null) {
            JsonObject root = (JsonObject) params.getSettings();
            if (root.has("gherkinAnalyzer") && root.get("gherkinAnalyzer").isJsonObject()) {
                settings = root.getAsJsonObject("gherkinAnalyzer");
            } else {
                settings = root;
            }
        }
        server.reconfigure(settings);
    }

    @Override
    public void didChangeWatchedFiles(DidChangeWatchedFilesParams params) {
        // no-op
    }
}
