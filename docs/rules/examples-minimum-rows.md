# Examples Minimum Rows

`examples-minimum-rows` &middot; Examples &middot; Bug &middot; severity CRITICAL &middot; enabled in the recommended profile

`Examples` tables in a `Scenario Outline` must contain a minimum number of data rows beyond the header row (`minimumDataRows` parameter, default 2). The header row defines the column names; data rows provide the actual values that are substituted into the outline steps. A table with no data rows renders the Scenario Outline useless, and a single data row barely justifies the outline construct.

## Noncompliant code example

```gherkin
Feature: Currency conversion

  Scenario Outline: Convert between currencies
    Given the exchange rate from <source> to <target> is <rate>
    When the customer converts <amount> <source>
    Then the result should be <expected> <target>

    Examples:                                   <!-- Noncompliant: only 1 data row -->
      | source | target | rate | amount | expected |
      | USD    | EUR    | 0.85 | 100    | 85       |
```

## Compliant solution

Provide at least the required number of data rows:

```gherkin
Feature: Currency conversion

  Scenario Outline: Convert between currencies
    Given the exchange rate from <source> to <target> is <rate>
    When the customer converts <amount> <source>
    Then the result should be <expected> <target>

    Examples:
      | source | target | rate  | amount | expected |
      | USD    | EUR    | 0.85  | 100    | 85       |
      | GBP    | USD    | 1.27  | 50     | 63.50    |
```

## See also

- `examples-column-coverage` - Examples tables must include columns for all referenced variables
- `use-scenario-outline-for-examples` - Examples require Scenario Outline
