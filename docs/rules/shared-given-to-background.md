# Shared Given to Background

`shared-given-to-background` &middot; Shared &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Given steps that are repeated across all scenarios in a container (Feature or Rule) should be moved to the Background section of that container. This reduces duplication, improves maintainability, and makes it clear which preconditions are shared. The analysis is scoped independently per container: Feature-level scenarios are checked against the Feature-level Background, and scenarios within a `Rule` block are checked against the Rule-level Background.

Only the common *leading* Given steps - those shared, in the same order, from the start of every scenario - are flagged, because only a contiguous leading block can be hoisted without changing execution order. As soon as the steps diverge at a position, no later step is reported even if it happens to match. When a Background already exists, leading Given steps that are not yet part of it are still flagged so they can be moved into it. Steps are compared including any attached data table or doc string, so identical text with different attached data is not considered common. In a `Scenario Outline`, a Given step containing a `<placeholder>` ends the leading block, since its effective value varies per Examples row and steps after it cannot be hoisted.

## Noncompliant code example

```gherkin
Feature: Online shopping cart

  Scenario: Add item to cart
    Given the customer is logged in
    And the product catalog is available
    When the customer adds "Laptop" to the cart
    Then the cart contains 1 item

  Scenario: Remove item from cart
    Given the customer is logged in
    And the product catalog is available
    When the customer removes "Laptop" from the cart
    Then the cart is empty

  Rule: Bulk orders                     <!-- Noncompliant within this Rule -->

    Scenario: Add bulk items
      Given the customer is a wholesale buyer
      When the customer adds 100 units
      Then the cart contains 100 items

    Scenario: Apply bulk discount
      Given the customer is a wholesale buyer
      When the system calculates the total
      Then a bulk discount is applied
```

## Compliant solution

Extract common Given steps to Background at each scope:

```gherkin
Feature: Online shopping cart

  Background:
    Given the customer is logged in
    And the product catalog is available

  Scenario: Add item to cart
    When the customer adds "Laptop" to the cart
    Then the cart contains 1 item

  Scenario: Remove item from cart
    When the customer removes "Laptop" from the cart
    Then the cart is empty

  Rule: Bulk orders

    Background:
      Given the customer is a wholesale buyer

    Scenario: Add bulk items
      When the customer adds 100 units
      Then the cart contains 100 items

    Scenario: Apply bulk discount
      When the system calculates the total
      Then a bulk discount is applied
```

## See also

- `background-given-only` - Background sections must only contain Given steps
- `no-duplicate-steps` - Steps within a scenario must not be duplicated
