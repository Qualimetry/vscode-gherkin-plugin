# Step Count Limit

`step-count-limit` &middot; Step &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Scenarios should not exceed a configurable number of steps. A scenario with too many steps is usually testing multiple behaviours at once and is difficult to read, maintain, and debug when it fails. Long scenarios should be split into multiple focused scenarios, each testing a single business outcome.

## Noncompliant code example

With the default limit of 12 steps:

```gherkin
Feature: Loan application

  Scenario: Complete loan application process    <!-- Noncompliant -->
    Given the applicant has a verified identity
    And the applicant has a credit score above 700
    And the applicant has a stable income
    When the applicant selects a loan amount of $50000
    And the applicant chooses a 5-year term
    And the applicant provides employment details
    And the applicant provides residential address
    And the applicant uploads supporting documents
    And the applicant reviews the loan summary
    And the applicant accepts the terms and conditions
    Then the application is submitted for review
    And the applicant receives a confirmation number
    And the applicant receives an email notification
```

## Compliant solution

Split into focused scenarios:

```gherkin
Feature: Loan application

  Scenario: Submit loan application
    Given the applicant has a verified identity
    And the applicant has a credit score above 700
    When the applicant submits a loan application for $50000 over 5 years
    Then the application is submitted for review
    And the applicant receives a confirmation number
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `maxSteps` | int | 12 |

## See also

- `background-step-count-limit` - applies the same limit to Background.
- `scenario-count-limit` - limits the number of scenarios in a feature.
- `single-when-per-scenario` - a scenario testing one action needs fewer steps.
