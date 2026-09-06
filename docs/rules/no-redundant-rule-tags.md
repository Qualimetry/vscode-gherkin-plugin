# No Redundant Rule Tags

`no-redundant-rule-tags` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Scenario-level tags within a `Rule` block must not duplicate tags already set on the enclosing `Rule`. Tags defined on a `Rule` are inherited by all scenarios within that Rule, so repeating them at the scenario level is redundant and should be removed.

## Noncompliant code example

```gherkin
Feature: Payment processing

  @api-test
  Rule: Credit card payments

    @api-test                       <!-- Noncompliant -->
    Scenario: Process Visa payment
      Given the customer has a Visa card
      When the customer pays with Visa
      Then the payment is processed

    Scenario: Process Mastercard payment
      Given the customer has a Mastercard
      When the customer pays with Mastercard
      Then the payment is processed
```

## Compliant solution

```gherkin
Feature: Payment processing

  @api-test
  Rule: Credit card payments

    Scenario: Process Visa payment
      Given the customer has a Visa card
      When the customer pays with Visa
      Then the payment is processed

    Scenario: Process Mastercard payment
      Given the customer has a Mastercard
      When the customer pays with Mastercard
      Then the payment is processed
```

## See also

- `no-redundant-tags` - flags scenario tags duplicating Feature-level or Rule-level tags
- `rule-tag-placement` - suggests moving common scenario tags to the Rule level
