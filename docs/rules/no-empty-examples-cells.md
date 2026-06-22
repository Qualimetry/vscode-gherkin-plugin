# No Empty Examples Cells

`no-empty-examples-cells` &middot; No &middot; Bug &middot; severity MAJOR &middot; optional

Each data cell in an Examples table should contain a value. Empty cells usually indicate incomplete test data and can result in placeholder variables being substituted with empty strings. This may cause misleading test results where steps silently pass with blank values instead of testing meaningful data.

## Noncompliant code example

```gherkin
Feature: Product search

  Scenario Outline: Search for products
    Given the user is on the search page
    When the user searches for "<product>"
    Then "<count>" results are displayed

    Examples:                                <!-- Noncompliant -->
      | product  | count |
      | laptop   |       |
      | keyboard | 8     |
```

## Compliant solution

Populate all data cells with meaningful values:

```gherkin
Feature: Product search

  Scenario Outline: Search for products
    Given the user is on the search page
    When the user searches for "<product>"
    Then "<count>" results are displayed

    Examples:
      | product  | count |
      | laptop   | 15    |
      | keyboard | 8     |
```
