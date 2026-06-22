# Rule Scenario Required

`rule-scenario-required` &middot; Rule &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Every `Rule` block must contain at least one `Scenario` or `Example`. A `Rule` block without any scenarios serves no purpose - it declares a business rule but provides no test coverage to validate it. This is almost always an incomplete implementation or a placeholder that was never filled in.

## Noncompliant code example

```gherkin
Feature: Payment Processing

  Rule: Refund policy                             <!-- Noncompliant -->
    Background:
      Given the store has a 30-day refund policy
```

## Compliant solution

Add at least one Scenario to the Rule block:

```gherkin
Feature: Payment Processing

  Rule: Refund policy
    Background:
      Given the store has a 30-day refund policy

    Scenario: Refund within 30 days
      When a customer requests a refund within 30 days
      Then the refund is approved

    Scenario: Refund after 30 days
      When a customer requests a refund after 30 days
      Then the refund is denied
```

## See also

- `scenario-required` - Similar check at the Feature level
- `rule-name-required` - Rule blocks must have a name
