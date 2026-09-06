# No Multiple Empty Lines

`no-multiple-empty-lines` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Feature files should not contain multiple consecutive blank lines. A single blank line is sufficient to separate structural elements (e.g., between scenarios or between a background and a scenario). Two or more consecutive blank lines add unnecessary visual noise and can indicate sloppy formatting.

## Noncompliant code example

```gherkin
Feature: Order management

  Scenario: Create order
    Given a customer account
    When the customer places an order
    Then the order is created

  <!-- Noncompliant: second consecutive blank line -->
  Scenario: Cancel order
    Given an existing order
    When the customer cancels the order
    Then the order is cancelled
```

## Compliant solution

```gherkin
Feature: Order management

  Scenario: Create order
    Given a customer account
    When the customer places an order
    Then the order is created

  Scenario: Cancel order
    Given an existing order
    When the customer cancels the order
    Then the order is cancelled
```

## See also

- `blank-line-before-scenario` - ensures a blank line precedes each scenario.
