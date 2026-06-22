# Prefer And/But Keywords

`prefer-and-but-keywords` &middot; Prefer &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

When multiple consecutive steps share the same semantic type (context, action, or outcome), subsequent steps should use `And` or `But` instead of repeating the primary keyword (`Given`, `When`, or `Then`). Repeating the same keyword obscures the logical structure and makes the scenario harder to read.

## Noncompliant code example

```gherkin
Feature: Shopping cart

  Scenario: Add items to cart
    Given the customer has an active session
    Given the customer has an empty cart              <!-- Noncompliant -->
    When the customer adds "Widget" to the cart
    When the customer adds "Gadget" to the cart       <!-- Noncompliant -->
    Then the cart contains 2 items
    Then the cart total reflects both items            <!-- Noncompliant -->
```

## Compliant solution

```gherkin
Feature: Shopping cart

  Scenario: Add items to cart
    Given the customer has an active session
    And the customer has an empty cart
    When the customer adds "Widget" to the cart
    And the customer adds "Gadget" to the cart
    Then the cart contains 2 items
    And the cart total reflects both items
```
