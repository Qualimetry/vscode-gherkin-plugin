# Unique Rule Name

`unique-rule-name` &middot; Unique &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

`Rule` names within a single `Feature` must be unique. Duplicate Rule names indicate copy-paste errors or poor feature decomposition. When multiple Rules share the same name, test reports become ambiguous and it is impossible to determine which business rule a test result belongs to.

## Noncompliant code example

```gherkin
Feature: Order Management

  Rule: Order validation
    Scenario: Validate order total
      Given an order with 3 items
      When the order total is calculated
      Then the total should be correct

  Rule: Order validation                          <!-- Noncompliant -->
    Scenario: Validate shipping address
      Given an order with a shipping address
      When the address is validated
      Then the address should be accepted
```

## Compliant solution

Give each Rule a unique, descriptive name:

```gherkin
Feature: Order Management

  Rule: Order total validation
    Scenario: Validate order total
      Given an order with 3 items
      When the order total is calculated
      Then the total should be correct

  Rule: Shipping address validation
    Scenario: Validate shipping address
      Given an order with a shipping address
      When the address is validated
      Then the address should be accepted
```

## See also

- `rule-name-required` - Rule blocks must have a name
- `unique-feature-name` - Similar check for Feature names across files
- `unique-scenario-name` - Similar check for Scenario names
