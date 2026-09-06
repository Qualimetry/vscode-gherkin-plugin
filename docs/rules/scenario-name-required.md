# Scenario Name Required

`scenario-name-required` &middot; Scenario &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Every `Scenario` and `Scenario Outline` must have a non-empty name. Scenario names appear in test reports and are the primary way team members identify which business behaviour is being tested. An unnamed scenario makes test results confusing and hinders debugging when a test fails.

## Noncompliant code example

```gherkin
Feature: Inventory management

  Scenario:                                     <!-- Noncompliant -->
    Given the warehouse has 50 units of product "Widget A"
    When 10 units are shipped to the retail store
    Then the warehouse should have 40 units remaining
```

## Compliant solution

Provide a descriptive name that explains the business behaviour:

```gherkin
Feature: Inventory management

  Scenario: Shipping reduces warehouse stock
    Given the warehouse has 50 units of product "Widget A"
    When 10 units are shipped to the retail store
    Then the warehouse should have 40 units remaining
```

## See also

- `feature-name-required` - Features must also have a non-empty name
- `unique-scenario-name` - Scenario names must be unique
