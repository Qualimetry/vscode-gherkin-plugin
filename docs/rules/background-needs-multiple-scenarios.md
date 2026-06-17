# Background Needs Multiple Scenarios

`background-needs-multiple-scenarios` &middot; Background &middot; Code Smell &middot; severity MINOR &middot; optional

A `Background` section provides common setup steps that run before each scenario in its scope (Feature or Rule). When there is only one scenario in that scope, the `Background` adds indirection without benefit - the steps should be inlined directly into the single scenario for clarity and maintainability.

This rule checks both Feature-level and Rule-level Backgrounds independently. A Feature-level Background is only flagged when there are no `Rule` blocks (because the Background may serve scenarios inside Rules). A Rule-level Background is flagged when the Rule contains only one scenario.

This rule does not fire when there are zero scenarios in the scope - that condition is covered by the `scenario-required` and `rule-scenario-required` rules.

## Noncompliant code example

```gherkin
Feature: Order processing

  Background:  <!-- Noncompliant - only one scenario in Feature -->
    Given a customer with an active account

  Scenario: Place an order
    When the customer adds an item to the cart
    Then the order is created
```

## Compliant solution

```gherkin
Feature: Order processing

  Scenario: Place an order
    Given a customer with an active account
    When the customer adds an item to the cart
    Then the order is created
```

## Compliant solution

```gherkin
Feature: Order processing

  Background:
    Given a customer with an active account

  Scenario: Place an order
    When the customer adds an item to the cart
    Then the order is created

  Scenario: Cancel an order
    Given an existing order
    When the customer cancels the order
    Then the order status is cancelled
```

## See also

- `scenario-required` - ensures Features have at least one scenario.
- `rule-scenario-required` - ensures Rules have at least one scenario.
