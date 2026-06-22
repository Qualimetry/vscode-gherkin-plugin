# Step Required

`step-required` &middot; Step &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Every `Scenario`, `Scenario Outline`, and `Background` must contain at least one step. A scenario without steps provides no test behaviour and a background without steps provides no shared setup. These are indicators of incomplete specifications that should be finished or removed.

## Noncompliant code example

```gherkin
Feature: Customer loyalty program

  Scenario: Customer earns loyalty points       <!-- Noncompliant -->

  Scenario: Customer redeems loyalty points
    Given the customer has 500 loyalty points
    When the customer redeems 200 points at checkout
    Then the order total is reduced by $20
```

## Compliant solution

Add steps to the empty scenario:

```gherkin
Feature: Customer loyalty program

  Scenario: Customer earns loyalty points
    Given the customer is enrolled in the loyalty program
    When the customer completes a purchase of $100
    Then the customer earns 100 loyalty points

  Scenario: Customer redeems loyalty points
    Given the customer has 500 loyalty points
    When the customer redeems 200 points at checkout
    Then the order total is reduced by $20
```

## See also

- `scenario-required` - Features must contain at least one Scenario
