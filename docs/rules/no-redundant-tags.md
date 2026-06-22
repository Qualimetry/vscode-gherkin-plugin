# No Redundant Tags

`no-redundant-tags` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Scenario-level tags should not duplicate tags already set at the Feature level. Tags defined at the Feature level automatically apply to all scenarios within that feature. Repeating them at the scenario level is redundant and should be removed to reduce duplication and improve maintainability.

## Noncompliant code example

Scenario tags that duplicate feature-level tags:

```gherkin
@smoke @regression
Feature: User authentication

  @smoke              <!-- Noncompliant; duplicates Feature-level tag -->
  Scenario: User logs in
    Given the user navigates to login
    When the user enters credentials
    Then the user is authenticated

  @regression         <!-- Noncompliant; duplicates Feature-level tag -->
  Scenario: User logs out
    Given the user is authenticated
    When the user clicks logout
    Then the user is logged out
```

## Compliant solution

Remove redundant scenario-level tags:

```gherkin
@smoke @regression
Feature: User authentication

  Scenario: User logs in
    Given the user navigates to login
    When the user enters credentials
    Then the user is authenticated

  Scenario: User logs out
    Given the user is authenticated
    When the user clicks logout
    Then the user is logged out
```

## See also

- `no-redundant-rule-tags` - flags scenario tags duplicating Rule-level tags
