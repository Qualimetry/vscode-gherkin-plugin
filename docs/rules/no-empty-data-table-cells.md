# No Empty Data Table Cells

`no-empty-data-table-cells` &middot; No &middot; Bug &middot; severity MAJOR &middot; optional

Each cell in a step-attached data table should contain a value. Empty cells usually indicate incomplete test data and can result in steps silently consuming blank values instead of meaningful data, which may cause misleading test results. This rule is the data-table counterpart of `no-empty-examples-cells`, which covers Examples tables.

## Noncompliant code example

```gherkin
Feature: User registration

  Scenario: Register users
    Given the following users exist:           <!-- Noncompliant -->
      | name  | email             |
      | alice |                   |
      | bob   | bob@example.test  |
```

## Compliant solution

Populate all cells with meaningful values:

```gherkin
Feature: User registration

  Scenario: Register users
    Given the following users exist:
      | name  | email              |
      | alice | alice@example.test |
      | bob   | bob@example.test   |
```

## See also

- `no-empty-examples-cells` - the equivalent rule for Examples tables.
