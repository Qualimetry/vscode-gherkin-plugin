# Feature Name Required

`feature-name-required` &middot; Feature &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Every `Feature` must have a non-empty name. The Feature name appears in test reports, dashboards, and CI/CD pipelines. An unnamed Feature makes it impossible to quickly identify which business capability is being tested when reviewing results or investigating failures.

## Noncompliant code example

```gherkin
Feature:                                        <!-- Noncompliant -->

  Scenario: Transfer funds between accounts
    Given the customer has a savings account with a balance of $5000
    When the customer transfers $500 to their checking account
    Then the savings account balance should be $4500
    And the checking account balance should increase by $500
```

## Compliant solution

Provide a meaningful name that describes the business capability:

```gherkin
Feature: Inter-account fund transfers

  Scenario: Transfer funds between accounts
    Given the customer has a savings account with a balance of $5000
    When the customer transfers $500 to their checking account
    Then the savings account balance should be $4500
    And the checking account balance should increase by $500
```

## See also

- `feature-description-recommended` - Features should also include a description
- `unique-feature-name` - Feature names must be unique across files
