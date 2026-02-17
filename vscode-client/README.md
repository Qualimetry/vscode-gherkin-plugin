# Qualimetry Gherkin Analyzer

**Author**: The [Qualimetry](https://qualimetry.com) team at SHAZAM Analytics Ltd

Real-time static analysis for Cucumber Gherkin `.feature` files, powered by the same engine as the [Qualimetry Gherkin Analyzer for SonarQube](https://github.com/Qualimetry/sonarqube-gherkin-plugin). Get feedback as you type — structural issues, design anti-patterns, style problems, and correctness errors — so you can fix them before committing. Rule keys and severities match the SonarQube plugin for a consistent experience from editor to pipeline.

## Requirements

**Java 17+** is required. The extension looks for Java on your system automatically (`JAVA_HOME` or `PATH`). Most users do not need to configure anything.

## Do I need to change settings?

No. The extension works out of the box. Only change settings if:

- The extension cannot find Java (e.g. you have multiple JDKs) — set `gherkinAnalyzer.java.home` to your Java 17+ path.
- You want to enable/disable rules, change severity, or tune rule options (e.g. indentation size) — use `gherkinAnalyzer.rules`.

## Configuration (optional)

All settings are under the `gherkinAnalyzer` namespace:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gherkinAnalyzer.enabled` | boolean | `true` | Turn the analyzer on or off. |
| `gherkinAnalyzer.java.home` | string | `""` | Path to Java 17+. Leave empty to use `JAVA_HOME` / `PATH`. |
| `gherkinAnalyzer.rules` | object | `{}` | Per-rule options: severity, enable/disable, and rule-specific properties. |

Example (only if you need to override defaults):

```json
{
  "gherkinAnalyzer.java.home": "C:\\path\\to\\java17",
  "gherkinAnalyzer.rules": {
    "consistent-indentation": { "indentSize": 4 },
    "feature-description-recommended": { "enabled": false }
  }
}
```

## Rules

A default set of rules is active for structure, design, style, tags, step patterns, comments, and more. You can enable additional rules or adjust severity in settings. The extension also runs cross-file checks (e.g. unique Feature/Scenario names, consistent language) across `.feature` files in the workspace.

## Features

- **Real-time diagnostics** — Squiggles and Problems panel as you type.
- **Configurable rules** — Override severity or disable rules; set properties (e.g. max scenario count, indentation).
- **Syntax highlighting** — Gherkin keywords, tags, and strings.

## Companion: SonarQube Plugin

The [Qualimetry Gherkin Analyzer for SonarQube](https://github.com/Qualimetry/sonarqube-gherkin-plugin) runs the same rules in CI/CD. Use both for consistent quality from editor to pipeline.

## License

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0). Copyright 2026 SHAZAM Analytics Ltd.
