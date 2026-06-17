# Examples Constant Column

`examples-constant-column` &middot; Examples &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

An Examples column whose value is identical in every data row adds no variation between examples. The constant value should be inlined into the step text and the column removed, leaving the table to show only what actually varies between scenarios. This keeps Examples tables focused and easier to review.

Tables with fewer than two data rows are skipped, and each Examples section of a Scenario Outline is judged independently - a value that is constant within one section is flagged even if other sections use different values.

## Noncompliant code example

```gherkin
Feature: Discount calculation

  Scenario Outline: Apply discount
    Given a customer of type "<type>"
    When an order of <amount> is placed
    Then the discount is <discount>

    Examples:                                <!-- Noncompliant - "type" is always "gold" -->
      | type | amount | discount |
      | gold | 100    | 10       |
      | gold | 200    | 20       |
```

## Compliant solution

Inline the constant value into the step and remove the column:

```gherkin
Feature: Discount calculation

  Scenario Outline: Apply discount
    Given a customer of type "gold"
    When an order of <amount> is placed
    Then the discount is <discount>

    Examples:
      | amount | discount |
      | 100    | 10       |
      | 200    | 20       |
```

## See also

- `no-unused-variables` - flags placeholders that no Examples column supplies.
- `examples-column-coverage` - flags Examples columns that no step placeholder consumes.
