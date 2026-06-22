# Scenario Outline Requires Examples

`scenario-outline-requires-examples` &middot; Scenario &middot; Bug &middot; severity MAJOR &middot; enabled in the recommended profile

A `Scenario Outline` (or `Scenario Template`) is designed to be parameterized via an `Examples` table. Without at least one `Examples` section, the outline produces zero test iterations at runtime - the steps are never executed. This is always a defect: either the `Examples` table was accidentally omitted, or the scenario should be written as a plain `Scenario`.

This rule uses language-aware keyword matching to correctly detect Scenario Outline keywords in all supported Gherkin languages (e.g., German `Szenariogrundriss`, French `Plan du Scénario`).

## Noncompliant code example

```gherkin
Feature: User registration

  Scenario Outline: Register with valid data  <!-- Noncompliant - missing Examples -->
    Given the user fills in the registration form
    When the user submits the form
    Then the account is created
```

## Compliant solution

```gherkin
Feature: User registration

  Scenario Outline: Register with <role> role
    Given the user fills in the registration form as <role>
    When the user submits the form
    Then the account is created with role <role>

    Examples:
      | role    |
      | admin   |
      | editor  |
      | viewer  |
```

## See also

- `outline-placeholder-required` - ensures Scenario Outlines actually reference placeholders.
- `use-scenario-outline-for-examples` - ensures Examples appear only in Scenario Outlines.
