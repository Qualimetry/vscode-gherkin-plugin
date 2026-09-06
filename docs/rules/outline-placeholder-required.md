# Outline Placeholder Required

`outline-placeholder-required` &middot; Outline &middot; Bug &middot; severity MAJOR &middot; optional

`Scenario Outline` (or `Scenario Template`) is designed to parameterize test execution by substituting `<placeholder>` variables from the `Examples` table into step text. A Scenario Outline that never references any placeholder variable runs the same identical steps for every data row, which is almost certainly a mistake - either placeholders were forgotten or a plain `Scenario` should be used instead.

This rule checks step text, the scenario name, and the scenario description for at least one `<variable>` reference. If none are found, the rule reports an issue.

## Noncompliant code example

```gherkin
Feature: User login

  Scenario Outline: Successful login  <!-- Noncompliant - no placeholders used -->
    Given a registered user
    When the user logs in with valid credentials
    Then the user sees the dashboard

    Examples:
      | username | password |
      | alice    | secret1  |
      | bob      | secret2  |
```

## Compliant solution

```gherkin
Feature: User login

  Scenario Outline: Successful login for <username>
    Given a registered user named <username>
    When the user logs in with password <password>
    Then the user sees the dashboard

    Examples:
      | username | password |
      | alice    | secret1  |
      | bob      | secret2  |
```

## See also

- `scenario-outline-requires-examples` - ensures Scenario Outlines have an Examples section.
- `no-unused-variables` - ensures Examples columns are referenced in steps.
