# Tag Placement

`tag-placement` &middot; Tag &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Tags that are common to all scenarios within a Feature should be placed at the Feature level instead of being repeated on each scenario. This reduces duplication, improves maintainability, and makes it clear which tags apply to the entire Feature scope.

## Noncompliant code example

Tags repeated on every scenario that should be at the Feature level:

```gherkin
Feature: Payment processing

  @smoke @regression     <!-- Noncompliant: repeated on every scenario; move to Feature level -->
  Scenario: Process credit card payment
    Given the customer has items in cart
    When the customer completes checkout
    Then payment is processed

  @smoke @regression
  Scenario: Process PayPal payment
    Given the customer has items in cart
    When the customer selects PayPal
    Then payment is processed
```

## Compliant solution

Common tags moved to the Feature level:

```gherkin
@smoke @regression
Feature: Payment processing

  Scenario: Process credit card payment
    Given the customer has items in cart
    When the customer completes checkout
    Then payment is processed

  Scenario: Process PayPal payment
    Given the customer has items in cart
    When the customer selects PayPal
    Then payment is processed
```

## See also

- `rule-tag-placement` - suggests moving common tags to the Rule level
