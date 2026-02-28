# Changelog

All notable changes to the Gherkin Analyzer for VS Code are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2026-02-28

### Changed

- Improved: Import confirmation message shows the exact file path where rules were saved.

## [1.3.1] - 2026-02-22

### Changed

- Minor text and documentation updates.

## [1.3.0] - 2026-02-19

### Added

- **Import rules from SonarQube** – Command to pull your Gherkin quality profile (rules and severities) into workspace or user settings. URL and profile are remembered; token is never stored.
- **Rule customization mode** – Setting `gherkinAnalyzer.rulesReplaceDefaults`: when `true` (e.g. after import), only listed rules run; when `false`, listed rules are overrides and unlisted rules use the default profile.
- **Precise diagnostics** – Rules such as business-language-only now underline only the offending word (e.g. "click", "submit"), not the whole line or a single character.

### Changed

- Import progress dialog dismisses when import finishes; success message shows rule count.
- Version alignment with SonarQube plugin.

## [1.2.2] - 2026-02-17

### Changed

- README in package tailored for Marketplace users (configuration clearly optional).

## [1.2.1] - 2026-02-16

### Changed

- Release versioning aligned with GitHub releases.
- Display name "Qualimetry Gherkin Analyzer"; package id `qualimetry-vscode-gherkin-plugin`; VSIX filename `qualimetry-vscode-gherkin-plugin-<version>.vsix`.

## [1.2.0] - 2026-02-16

### Added

- Initial release of the Gherkin Analyzer extension for VS Code.
- Real-time diagnostics for `.feature` files via Language Server Protocol.
- **82 analysis rules** (all except spelling-accuracy) with configurable severity.
- Default quality profile with 53 rules active out of the box.
- Per-rule configuration via VS Code settings.
- Cross-file analysis for unique names and consistent language.
- TextMate syntax highlighting for Gherkin.
- Same 9 new analysis rules as SonarQube plugin (rules 75–83), for a total of 82 rules in the extension.

### Changed

- Quality profile aligned with SonarQube: 53 rules active.
