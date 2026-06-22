# No Duplicate Steps

`no-duplicate-steps` &middot; No &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Steps within a scenario or background must not be duplicated. Duplicate steps add no value and make scenarios harder to read and maintain. If the same step appears multiple times consecutively, it should be removed. If steps are repeated with different contexts, they may need to be consolidated or the scenario may need to be restructured. Steps with the same sentence but different attached data tables or doc strings are not considered duplicates.

## Noncompliant code example

```gherkin
Feature: Shopping cart management

  Scenario: Add multiple items
    Given the customer is logged in
    When the customer adds "Laptop" to the cart
    When the customer adds "Laptop" to the cart    <!-- Noncompliant: duplicate -->
    Then the cart contains 2 items

  Background:                                     <!-- Noncompliant: duplicate in Background -->
    Given the customer is logged in
    Given the customer is logged in
    And the product catalog is available
```

## Compliant solution

Remove duplicate steps or consolidate them appropriately:

```gherkin
Feature: Shopping cart management

  Background:
    Given the customer is logged in
    And the product catalog is available

  Scenario: Add multiple items
    When the customer adds "Laptop" to the cart
    And the customer adds another "Laptop" to the cart
    Then the cart contains 2 items
```

## See also

- `shared-given-to-background` - Common Given steps should be moved to Background
- `step-count-limit` - Scenarios should not exceed a maximum number of steps
