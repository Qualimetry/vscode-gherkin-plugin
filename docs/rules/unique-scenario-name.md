# Unique Scenario Name

`unique-scenario-name` &middot; Unique &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Scenario names must be unique within and across all features. Duplicate scenario names make it difficult to identify which specific test failed in test reports and can lead to confusion when discussing test results with team members. Each scenario should have a distinct name that clearly describes the specific business behaviour being tested.

## Noncompliant code example

```gherkin
Feature: Order processing

  Scenario: Process order                      <!-- Noncompliant -->
    Given the customer has items in the cart
    When the customer completes checkout
    Then the order is created

  Scenario: Process order                      <!-- Noncompliant: duplicate name -->
    Given the customer has a saved order
    When the customer confirms the order
    Then the order is processed

Feature: Order cancellation

  Scenario: Process order                      <!-- Noncompliant: duplicate across features -->
    Given an order exists
    When the order is cancelled
    Then the order status is "Cancelled"
```

## Compliant solution

Use unique, descriptive scenario names:

```gherkin
Feature: Order processing

  Scenario: Create new order from cart
    Given the customer has items in the cart
    When the customer completes checkout
    Then the order is created

  Scenario: Confirm saved order
    Given the customer has a saved order
    When the customer confirms the order
    Then the order is processed

Feature: Order cancellation

  Scenario: Cancel existing order
    Given an order exists
    When the order is cancelled
    Then the order status is "Cancelled"
```

## See also

- `unique-feature-name` - Feature names must be unique across all files
- `scenario-name-required` - Scenarios must have a non-empty name
