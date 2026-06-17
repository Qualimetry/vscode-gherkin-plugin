# Max Line Length

`max-line-length` &middot; Max &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Checks that no line in a feature file exceeds a configurable maximum length. Long lines are hard to read, force horizontal scrolling in editors, and make side-by-side diffs in code review tools difficult to follow. Every raw line of the file is checked, including steps, data tables, comments, and doc strings.

The default limit is 120 characters. Teams can adjust this threshold based on their project conventions.

## Noncompliant code example

With `maxLength` set to `120`:

```gherkin
Feature: Order processing

  Scenario: Submit an order
    Given the user has an order
    When the user submits the order with customer reference "ACME-2026-0001", priority "express", and delivery note "rear dock"  <!-- Noncompliant - line exceeds 120 characters -->
    Then the order is accepted
```

## Compliant solution

Split long content across steps or a data table:

```gherkin
Feature: Order processing

  Scenario: Submit an order
    Given the user has an order
    When the user submits the order with:
      | customer reference | ACME-2026-0001 |
      | priority           | express        |
      | delivery note      | rear dock      |
    Then the order is accepted
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `maxLength` | Maximum number of characters allowed in a line. | `120` |

## See also

- `step-sentence-max-length` - limits the length of the step sentence text.
- `feature-file-max-lines` - limits the number of lines per feature file.
