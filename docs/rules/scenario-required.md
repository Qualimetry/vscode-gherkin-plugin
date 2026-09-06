# Scenario Required

`scenario-required` &middot; Scenario &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Every `Feature` must contain at least one `Scenario` or `Scenario Outline`. A Feature without any scenarios provides no test coverage and serves no purpose in a test suite. Scenarios may be defined directly under the Feature or within `Rule` sections.

## Noncompliant code example

```gherkin
Feature: Payment processing                     <!-- Noncompliant -->
  The payment system handles credit card and bank transfer payments.

  Background:
    Given the merchant account is active
```

## Compliant solution

Add at least one Scenario to the Feature:

```gherkin
Feature: Payment processing
  The payment system handles credit card and bank transfer payments.

  Background:
    Given the merchant account is active

  Scenario: Process a credit card payment
    When a customer submits a credit card payment of $100
    Then the payment is authorized
    And the merchant receives a confirmation
```

## See also

- `feature-file-required` - Files must contain a Feature definition
- `step-required` - Scenarios must contain at least one step
