# No Conflicting Tags

`no-conflicting-tags` &middot; No &middot; Code Smell &middot; severity MAJOR &middot; optional

Tags representing mutually exclusive states must not appear together on the same element. For example, `@wip` and `@release-ready`, or `@manual` and `@automated`, are contradictory classifications that indicate an inconsistency in the test metadata.

## Noncompliant code example

With `conflictPairs` set to `wip+release-ready`:

```gherkin
Feature: Feature development

  @wip @release-ready                       <!-- Noncompliant -->
  Scenario: Work in progress feature
    Given a new feature is being developed
    When the feature is partially implemented
    Then the tests should indicate incomplete work
```

## Compliant solution

Remove the contradictory tag:

```gherkin
Feature: Feature development

  @wip
  Scenario: Work in progress feature
    Given a new feature is being developed
    When the feature is partially implemented
    Then the tests should indicate incomplete work
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `conflictPairs` | String | *(empty)* |
