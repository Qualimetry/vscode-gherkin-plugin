# No Star Step Prefix

`no-star-step-prefix` &middot; No &middot; Code Smell &middot; severity MINOR &middot; optional

Steps should not use the `*` (asterisk) keyword prefix. While the asterisk is valid Gherkin syntax and acts as a wildcard step keyword, it obscures the intent of the step. Using explicit keywords like `Given`, `When`, `Then`, `And`, or `But` makes each step's purpose immediately clear to readers.

**Note:** The `*` prefix is explicitly endorsed by the Gherkin specification as valid syntax for bullet-point-style steps. This rule is an *opinionated style preference*, not a correctness check. Teams that use `*` steps intentionally (e.g., for free-form step lists) can safely deactivate this rule. This rule is not active in the default quality profile.

## Noncompliant code example

```gherkin
Feature: Order management

  Scenario: Place an order
    Given the customer has an active account
    * the customer has items in the cart              <!-- Noncompliant -->
    When the customer clicks checkout
    * the customer confirms the order                 <!-- Noncompliant -->
    Then the order is placed successfully
```

## Compliant solution

```gherkin
Feature: Order management

  Scenario: Place an order
    Given the customer has an active account
    And the customer has items in the cart
    When the customer clicks checkout
    And the customer confirms the order
    Then the order is placed successfully
```
