# No Unknown Step Type

`no-unknown-step-type` &middot; No &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Steps should not have an `UNKNOWN` keyword type. This typically occurs when the `*` (asterisk) prefix is used instead of an explicit keyword like `Given`, `When`, `Then`, `And`, or `But`. The parser cannot determine the semantic role of such steps, making the scenario harder to understand and analyse.

## Noncompliant code example

```gherkin
Feature: Order management

  Scenario: Place an order
    Given the customer has an active account
    * the customer performs an action                    <!-- Noncompliant -->
    Then the order is placed successfully
```

## Compliant solution

```gherkin
Feature: Order management

  Scenario: Place an order
    Given the customer has an active account
    When the customer performs an action
    Then the order is placed successfully
```
