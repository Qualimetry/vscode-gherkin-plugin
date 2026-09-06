# Rule Description Recommended

`rule-description-recommended` &middot; Rule &middot; Code Smell &middot; severity INFO &middot; optional

`Rule` blocks should include a description explaining the business rule they represent. The `Rule` keyword was introduced in Gherkin 6 specifically to group scenarios under business rules. A description below the Rule name provides valuable context about acceptance criteria and business intent, helping stakeholders understand why the rule exists.

## Noncompliant code example

```gherkin
Feature: Loyalty Program

  Rule: Points accumulation                       <!-- Noncompliant -->
    Scenario: Earn points on purchase
      Given a loyalty member
      When they make a purchase of $50
      Then they earn 50 points
```

## Compliant solution

Add a description that explains the business rule:

```gherkin
Feature: Loyalty Program

  Rule: Points accumulation
    Customers earn 1 point per dollar spent on qualifying purchases.
    Points are credited within 24 hours of the transaction.

    Scenario: Earn points on purchase
      Given a loyalty member
      When they make a purchase of $50
      Then they earn 50 points
```

## See also

- `rule-name-required` - Rule blocks must have a name
- `feature-description-recommended` - Similar check for Feature descriptions
