# Feature File Max Lines

`feature-file-max-lines` &middot; Feature &middot; Code Smell &middot; severity MINOR &middot; optional

Checks that feature files do not exceed a configurable line count. Feature files that grow too long become difficult to navigate, review, and maintain. This complements `scenario-count-limit` by also catching files that are long due to large data tables, doc strings, or verbose descriptions.

The default limit is 300 lines. Teams can adjust this threshold based on their project conventions.

## Noncompliant code example

With `maxLines` set to `300`:

```gherkin
Feature: Comprehensive order management  <!-- Noncompliant - file exceeds 300 lines -->

  Scenario: Place order
    Given the user has items in the cart
    When the user places the order
    Then the order is confirmed

  ... (many more scenarios, large data tables, doc strings)
  ... (total file length: 350 lines)
```

## Compliant solution

Split the feature file into smaller, focused files:

```gherkin
# order-placement.feature (120 lines)
Feature: Order placement
  ...

# order-cancellation.feature (95 lines)
Feature: Order cancellation
  ...

# order-tracking.feature (80 lines)
Feature: Order tracking
  ...
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `maxLines` | Maximum number of lines allowed in a single feature file. | `300` |

## See also

- `scenario-count-limit` - limits the number of scenarios per feature.
- `step-count-limit` - limits the number of steps per scenario.
