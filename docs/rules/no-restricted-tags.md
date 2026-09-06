# No Restricted Tags

`no-restricted-tags` &middot; No &middot; Code Smell &middot; severity MAJOR &middot; optional

Certain tags are intended for local development only and should not be committed to the repository. Tags like `@wip`, `@debug`, `@ignore`, and `@manual` are common examples that indicate work-in-progress or temporary states. This rule flags any tag whose name (without the leading `@`) appears in a configurable restricted list.

## Noncompliant code example

```gherkin
Feature: Payment processing

  @wip <!-- Noncompliant -->
  Scenario: Process credit card payment
    Given a valid credit card
    When the payment is submitted
    Then the payment is approved

  @debug @smoke <!-- Noncompliant on @debug only -->
  Scenario: Process refund
    Given a completed payment
    When a refund is requested
    Then the refund is processed
```

## Compliant solution

```gherkin
Feature: Payment processing

  @smoke
  Scenario: Process credit card payment
    Given a valid credit card
    When the payment is submitted
    Then the payment is approved

  @smoke
  Scenario: Process refund
    Given a completed payment
    When a refund is requested
    Then the refund is processed
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `restrictedTags` | Comma-separated list of restricted tag names (without leading `@`). | `wip,debug,ignore,manual` |

## See also

- `required-tags` - requires at least one tag matching a pattern.
- `tag-name-pattern` - validates tag naming conventions.
