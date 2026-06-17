# Use Scenario Outline for Examples

`use-scenario-outline-for-examples` &middot; Use &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Examples tables belong with `Scenario Outline`, not with plain `Scenario`. Per the Gherkin specification, only Scenario Outline is designed to run the same steps multiple times with data from an Examples table. Using Examples under a regular Scenario is invalid or unsupported usage: many parsers accept it without error, but the Examples may be ignored at runtime or lead to unexpected test behaviour. Use `Scenario Outline` with `<placeholder>` parameters in the steps when you need parameterised data.

## Noncompliant code example

```gherkin
Feature: Product pricing

  Scenario: Calculate product price with discount    <!-- Noncompliant -->
    Given the product "Widget" has a base price of $100
    When a discount of 10% is applied
    Then the final price is $90

    Examples:
      | Product  | Base Price | Discount | Final Price |
      | Widget   | 100        | 10       | 90          |
      | Gadget   | 200        | 15       | 170         |
      | Tool     | 50         | 5        | 47.50       |
```

## Compliant solution

Use Scenario Outline instead of Scenario when using Examples:

```gherkin
Feature: Product pricing

  Scenario Outline: Calculate product price with discount
    Given the product "<Product>" has a base price of $<Base Price>
    When a discount of <Discount>% is applied
    Then the final price is $<Final Price>

    Examples:
      | Product | Base Price | Discount | Final Price |
      | Widget  | 100        | 10       | 90          |
      | Gadget  | 200        | 15       | 170         |
      | Tool    | 50         | 5        | 47.50       |
```

## See also

- `examples-minimum-rows` - Examples tables should have a minimum number of rows
- `examples-column-coverage` - Examples tables should cover all placeholders
