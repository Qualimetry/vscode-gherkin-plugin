# Rule Tag Placement

`rule-tag-placement` &middot; Rule &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Tags common to all scenarios within a `Rule` block should be moved to the `Rule` level instead of being repeated on each scenario. This reduces duplication and makes it clear that the tag applies to all scenarios within the Rule.

## Noncompliant code example

```gherkin
Feature: Payment processing

  Rule: Credit card payments

    @api-test           <!-- Noncompliant: repeated on every scenario; move to Rule level -->
    Scenario: Process Visa payment
      Given the customer has a Visa card
      When the customer pays with Visa
      Then the payment is processed

    @api-test
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

- `tag-placement` - suggests moving common tags to Feature or Rule level
- `no-redundant-rule-tags` - flags scenario tags duplicating Rule-level tags
