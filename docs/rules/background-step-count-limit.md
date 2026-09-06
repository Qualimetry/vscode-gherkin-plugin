# Background Step Count Limit

`background-step-count-limit` &middot; Background &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Background sections should not exceed a configurable number of steps (default: 5). Every scenario in scope implicitly begins with the Background steps, so a long Background makes scenarios harder to understand, increases the cognitive load on readers and reviewers, and often indicates that setup logic should be consolidated or extracted into helper steps.

## Noncompliant code example

With the default limit of 5 steps:

```gherkin
Feature: Complex setup

  Background:                                <!-- Noncompliant -->
    Given a registered user
    And the user is logged in
    And the user has a verified email
    And the user has a premium subscription
    And the user has enabled two-factor authentication
    And the user has accepted the latest terms
    And the user is on the home page

  Scenario: View settings
    When the user navigates to settings
    Then the settings page is displayed
```

## Compliant solution

Reduce the Background to essential shared setup:

```gherkin
Feature: Complex setup

  Background:
    Given a registered user with full profile
    And the user is logged in

  Scenario: View settings
    When the user navigates to settings
    Then the settings page is displayed
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `maxSteps` | int | 5 |

## See also

- `step-count-limit` - limits the number of steps in a single scenario.
- `background-given-only` - restricts Background to Given steps.
- `background-needs-multiple-scenarios` - a Background is only worthwhile with several scenarios.
