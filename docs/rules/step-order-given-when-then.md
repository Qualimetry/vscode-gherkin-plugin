# Step Order Given-When-Then

`step-order-given-when-then` &middot; Step &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Steps within a scenario must follow the Given-When-Then order. This pattern ensures scenarios are structured logically: `Given` establishes preconditions, `When` describes the action being tested, and `Then` verifies the expected outcome. Violating this order makes scenarios harder to read and understand, as it breaks the narrative flow of the test.

## Noncompliant code example

```gherkin
Feature: Payment processing

  Scenario: Process credit card payment
    Given the customer has items in the cart
    When the customer proceeds to checkout
    Then the payment form is displayed
    Given the customer enters valid card details    <!-- Noncompliant -->
    When the customer submits the payment
    Then the payment is processed successfully
    When the order confirmation is generated         <!-- Noncompliant -->
    Then the customer receives an email receipt
```

## Compliant solution

Reorganize steps to follow Given-When-Then order:

```gherkin
Feature: Payment processing

  Scenario: Process credit card payment
    Given the customer has items in the cart
    And the customer proceeds to checkout
    And the payment form is displayed
    And the customer enters valid card details
    When the customer submits the payment
    Then the payment is processed successfully
    And the order confirmation is generated
    And the customer receives an email receipt
```

## See also

- `when-then-required` - Scenarios should have at least one When and one Then step
- `single-when-per-scenario` - Each scenario should contain exactly one When step
