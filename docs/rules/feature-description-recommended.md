# Feature Description Recommended

`feature-description-recommended` &middot; Feature &middot; Code Smell &middot; severity INFO &middot; optional

Features should include a description below the `Feature` name. The description provides context about the business domain, the user story, or the acceptance criteria being validated. Without a description, readers must infer the purpose of the feature solely from the scenario names, which may not convey enough information for stakeholders unfamiliar with the codebase.

## Noncompliant code example

```gherkin
Feature: Account registration                   <!-- Noncompliant -->

  Scenario: New customer registers with valid email
    Given the registration page is displayed
    When the customer enters a valid email address and password
    Then the account is created successfully
    And a confirmation email is sent
```

## Compliant solution

Add a description that explains the business context:

```gherkin
Feature: Account registration
  New customers must be able to create an account using a valid email
  address. The registration process includes email verification to
  prevent fraudulent accounts.

  Scenario: New customer registers with valid email
    Given the registration page is displayed
    When the customer enters a valid email address and password
    Then the account is created successfully
    And a confirmation email is sent
```

## See also

- `feature-name-required` - Features must have a non-empty name
