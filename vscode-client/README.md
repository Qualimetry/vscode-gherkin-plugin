# Qualimetry Gherkin Analyzer

**Author**: The [Qualimetry](https://qualimetry.com) team at SHAZAM Analytics Ltd

Real-time static analysis for Cucumber Gherkin `.feature` files, powered by the same engine as the [Qualimetry Gherkin Analyzer for SonarQube](https://github.com/Qualimetry/sonarqube-gherkin-plugin). Get feedback as you type - structural issues, design anti-patterns, style problems, and correctness errors - so you can fix them before committing. Rule keys and severities match the SonarQube plugin for a consistent experience from editor to pipeline.

## Requirements

**Java 17+** is required. The extension looks for Java on your system automatically (`JAVA_HOME` or `PATH`). Most users do not need to configure anything.

## Do I need to change settings?

No. The extension works out of the box. Only change settings if:

- The extension cannot find Java (e.g. you have multiple JDKs) - set `gherkinAnalyzer.java.home` to your Java 17+ path.
- You want to enable/disable rules, change severity, or tune rule options (e.g. indentation size) - use `gherkinAnalyzer.rules`.

## Configuration (optional)

All settings are under the `gherkinAnalyzer` namespace:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gherkinAnalyzer.enabled` | boolean | `true` | Turn the analyzer on or off. |
| `gherkinAnalyzer.java.home` | string | `""` | Path to Java 17+. Leave empty to use `JAVA_HOME` / `PATH`. |
| `gherkinAnalyzer.rules` | object | *(full default)* | Per-rule options: severity, enable/disable, and rule-specific properties. The extension ships with a **full default** (every rule with `enabled`, `severity`, and any parameters) so you only need to edit what you want to change. |

### How to alter rules

You only need to add **overrides** in settings. The extension uses a built-in default for every rule; anything you don't list keeps that default.

- **Normal case** - In `settings.json`, set `gherkinAnalyzer.rules` to `{}` or omit it to use the full default. To change only a few rules, add just those keys; all other rules keep the default (enabled state, severity, and parameters). You do **not** need to list all rules.
- **Show or edit the full default** - The full default is in `defaultRules.json` in the extension folder (e.g. `.vscode/extensions/qualimetry.qualimetry-vscode-gherkin-plugin-*`), or in the Settings UI when you add the key. Paste it into settings only if you want to customize many rules at once.
- **After an upgrade** - If a rule was removed or renamed, any old entry for it in your settings is ignored. You can delete obsolete keys to tidy up, but leaving them does no harm.

Each rule entry can include:

- `enabled` - `true` or `false`
- `severity` - `"blocker"`, `"critical"`, `"major"`, `"minor"`, or `"info"` (Sonar-style)
- Rule-specific properties (e.g. `maxLength`, `maxScenarios`, `pattern`) as documented per rule

Example (overriding a few rules only):

```json
{
  "gherkinAnalyzer.java.home": "C:\\path\\to\\java17",
  "gherkinAnalyzer.rules": {
    "consistent-indentation": { "enabled": true, "severity": "minor", "indentation": "4" },
    "feature-description-recommended": { "enabled": false }
  }
}
```

### Aligning with a SonarQube quality profile

Use the command **Gherkin: Import rules from SonarQube** (Command Palette or right-click). Enter your SonarQube server URL, the Gherkin quality profile name (or key), and a token if the server requires authentication. The extension fetches the profile's active rules and severities from the API and writes them to `gherkinAnalyzer.rules` in your workspace or user settings.

**Privacy and storage:** The server URL and profile name are saved as soon as you enter them (so they appear pre-filled next time). They are stored in the extension's global state (not in your settings files). Your **token is never stored**; it is used only in memory for that run. If the token input closes when you switch to another app to copy the token, run the command again - URL and profile will already be filled in and you only need to paste the token.

## Rules

A default set of rules is active for structure, design, style, tags, step patterns, comments, and more. You can enable additional rules or adjust severity in settings. The extension also runs cross-file checks (e.g. unique Feature/Scenario names, consistent language) across `.feature` files in the workspace.

## Features

- **Real-time diagnostics** - Squiggles and Problems panel as you type.
- **Configurable rules** - Override severity or disable rules; set properties (e.g. max scenario count, indentation).
- **Syntax highlighting** - Gherkin keywords, tags, and strings.

## Companion: SonarQube Plugin

The [Qualimetry Gherkin Analyzer for SonarQube](https://github.com/Qualimetry/sonarqube-gherkin-plugin) runs the same rules in CI/CD. Use both for consistent quality from editor to pipeline.

## License

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0). Copyright 2026 SHAZAM Analytics Ltd.
