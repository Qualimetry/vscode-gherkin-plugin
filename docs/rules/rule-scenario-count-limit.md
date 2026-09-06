# Rule Scenario Count Limit

`rule-scenario-count-limit` &middot; Rule &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

`Rule` blocks should not exceed a configurable number of scenarios. Too many scenarios under a single `Rule` suggest the business rule is too broad and should be decomposed into smaller, more focused rules. The default limit is **10** scenarios per `Rule` block.

## Noncompliant code example

```gherkin
Feature: Payment processing

  Rule: Credit card payments
    # This Rule has too many scenarios (11 > 10)

    Scenario: Scenario 1           <!-- Noncompliant -->
      Given ...
    Scenario: Scenario 2
      Given ...
    # ... 9 more scenarios ...
    Scenario: Scenario 11
      Given ...
```

## Compliant solution

```gherkin
Feature: Payment processing

  Rule: Visa payments
    Scenario: Process Visa payment
      Given ...
    Scenario: Decline expired Visa
      Given ...

  Rule: Mastercard payments
    Scenario: Process Mastercard payment
      Given ...
    Scenario: Decline expired Mastercard
      Given ...
```

## See also

- `scenario-count-limit` - limits scenarios per Feature
- `rule-scenario-required` - ensures Rules have at least one scenario
