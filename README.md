# Gherkin Analyzer for VS Code

[![CI](https://github.com/Qualimetry/vscode-gherkin-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/Qualimetry/vscode-gherkin-plugin/actions/workflows/ci.yml)

**Author**: The [Qualimetry](https://qualimetry.com) team at SHAZAM Analytics Ltd

A VS Code extension that provides real-time static analysis for Cucumber Gherkin `.feature` files, powered by the same analysis engine as the [Qualimetry Gherkin Analyzer for SonarQube](https://github.com/Qualimetry/sonarqube-gherkin-plugin). It brings the same rules directly into the editor so developers can identify and fix quality issues *before* committing - catching structural problems, design anti-patterns, style inconsistencies, and correctness errors at the earliest point in the workflow.

Where the SonarQube plugin enforces standards as part of the CI/CD quality gate, this extension provides the same feedback loop in real time as you write your feature files. The rules, their keys, and their default severity all match the SonarQube plugin, so teams using both tools get a consistent experience from editor to pipeline.

## Installation

### From GitHub Releases

Download the latest `.vsix` from [GitHub Releases](https://github.com/Qualimetry/vscode-gherkin-plugin/releases), then install via **Extensions: Install from VSIX...** (Command Palette).

### Manual Install (VSIX)

1. Download or build the `.vsix` file (see [Building from Source](#building-from-source)).
2. In VS Code, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run **Extensions: Install from VSIX...**
3. Select the `.vsix` file and reload when prompted.

## Requirements

- **Java 17+** - The analyzer runs on a Java-based language server. Java is auto-detected from `JAVA_HOME` or `PATH`. If Java is not found automatically, set the path in your VS Code settings:

  ```json
  {
    "gherkinAnalyzer.java.home": "C:\\path\\to\\java17"
  }
  ```

## Configuration

All settings are under the `gherkinAnalyzer` namespace:

| Setting | Type | Default | Description |
|---|---|---|---|
| `gherkinAnalyzer.enabled` | boolean | `true` | Enable/disable the analyzer. |
| `gherkinAnalyzer.java.home` | string | `""` | Path to a Java 17+ installation. When empty, the extension searches `JAVA_HOME` and `PATH`. |
| `gherkinAnalyzer.rules` | object | *(full default)* | Per-rule configuration. List rules to override or replace the default set (see below). |
| `gherkinAnalyzer.rulesReplaceDefaults` | boolean | `false` | When `true`, only the rules listed in `gherkinAnalyzer.rules` run (e.g. after Import from SonarQube). When `false`, listed rules are overrides and unlisted rules use the extension default profile. |

### How to customize rules

You can either **override** a few rules on top of the default profile, or **replace** the active set entirely (e.g. after importing from SonarQube).

- **Override mode** (default) – Set `gherkinAnalyzer.rulesReplaceDefaults` to `false` or omit it. Add only the rule IDs you want to change (e.g. severity or `enabled`); all other rules use the extension default. You do **not** need to list all rules.
- **Replace mode** – Set `gherkinAnalyzer.rulesReplaceDefaults` to `true`. Only the rules listed in `gherkinAnalyzer.rules` run. Use this when you have imported a profile from SonarQube or maintain your own full list.
- **Full default** – Omit `gherkinAnalyzer.rules` or set it to `{}` with `rulesReplaceDefaults` false to use the built-in default profile (53 rules active).
- **After an upgrade** – Entries for removed or renamed rules are ignored; you can delete them to tidy up.

Each rule can have `enabled`, `severity` (`blocker` \| `critical` \| `major` \| `minor` \| `info`), and rule-specific properties (e.g. `maxLength`, `maxScenarios`).

### Example `settings.json`

```json
{
  "gherkinAnalyzer.enabled": true,
  "gherkinAnalyzer.java.home": "",
  "gherkinAnalyzer.rulesReplaceDefaults": false,
  "gherkinAnalyzer.rules": {
    "consistent-indentation": {
      "enabled": true,
      "severity": "minor",
      "indentation": "4"
    },
    "feature-description-recommended": {
      "enabled": false
    }
  }
}
```

### Aligning with a SonarQube quality profile

Use the command **Gherkin: Import rules from SonarQube** (Command Palette). Enter your SonarQube server URL, the Gherkin quality profile name or key, and a token if required. The extension fetches the profile's active rules and severities and writes them to `gherkinAnalyzer.rules` and sets `gherkinAnalyzer.rulesReplaceDefaults` to `true`, so only those rules run (matching your SonarQube profile).

The last-used URL and profile are remembered (in the extension's global state, not in settings). Your token is never stored; it is used only for that run. To switch back to the extension default and only override a few rules, set `gherkinAnalyzer.rulesReplaceDefaults` to `false`.

## Rules

The extension includes a comprehensive set of rules organized by diagnostic severity (Error, Warning, Information, Hint). A curated default profile is active out of the box, with the remaining rules available as opt-in - activate them per workspace or globally via settings.

Rules cover categories including structure, design, style and convention, tags, variables and data, step patterns, comments, parser errors, rule-block quality, structural integrity, and configurable thresholds.

### Cross-File Analysis

The extension performs cross-file analysis within each open workspace folder, enabling rules that check for unique Feature names, unique Scenario names, and consistent Gherkin language across all `.feature` files.

## Features

- **Real-time diagnostics** - Issues appear as you type, with squiggly underlines and Problems panel entries.
- **Configurable severity** - Override the default severity of any rule.
- **Per-rule properties** - Tune thresholds (e.g. max scenario count, indentation size) per rule.
- **TextMate syntax highlighting** - Gherkin keywords, tags, variables, and strings are highlighted out of the box.

## Companion: SonarQube Plugin

This extension shares its analysis engine with the **[Qualimetry Gherkin Analyzer for SonarQube](https://github.com/Qualimetry/sonarqube-gherkin-plugin)** - a SonarQube plugin that runs the same rules as part of your CI/CD quality gate. Together they provide a consistent quality standard from the developer's editor through to the build pipeline:

| Tool | When it runs | Purpose |
|---|---|---|
| **This VS Code extension** | As you type | Catch issues before you commit |
| **SonarQube plugin** | On CI/CD build | Enforce quality gate across the team |

Both tools use the same rule keys, severity mappings, and configurable properties, so findings are directly comparable.

## Building from Source

### Prerequisites

- JDK 17+ and Maven 3.6.1+
- Node.js and npm

### Build Steps

1. **Build the Java modules** (shared analyzer + LSP server):

   ```bash
   mvn clean package
   ```

2. **Build the VS Code client**:

   ```bash
   cd vscode-client
   npm install
   npm run compile
   ```

3. **Package as VSIX**:

   ```bash
   cd vscode-client
   npx vsce package
   ```

   This produces a `.vsix` file in the `vscode-client/` directory.

## Contributing

Issues and feature requests are welcome. This project does not accept pull requests, commits, or other code contributions from third parties; the repository is maintained by the Qualimetry team only.

## License

This extension is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

Copyright 2026 SHAZAM Analytics Ltd
