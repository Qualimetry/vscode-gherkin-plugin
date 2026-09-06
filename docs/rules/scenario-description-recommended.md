# Scenario Description Recommended

`scenario-description-recommended` &middot; Scenario &middot; Code Smell &middot; severity INFO &middot; optional

Scenarios should include a description explaining their purpose, acceptance criteria, or business context. A description below the Scenario name provides valuable context about why this test exists and what business outcome it verifies. Without it, readers must infer the purpose from the step sequence alone, which is more difficult and error-prone.

## Noncompliant code example

```gherkin
Feature: User authentication

  Scenario: Successful login                 <!-- Noncompliant -->
    Given the user is on the login page
    When the user enters valid credentials
    Then the user is redirected to the dashboard

  Scenario Outline: Login with different roles  <!-- Noncompliant -->
    Given the user is on the login page
    When the user logs in as "<role>"
    Then the user sees the "<dashboard>" dashboard

    Examples:
      | role  | dashboard |
      | admin | admin     |
      | user  | user      |
```

## Compliant solution

Add a description below the Scenario name:

```gherkin
Feature: User authentication

  Scenario: Successful login
    Verifies that a user with valid credentials can successfully
    log in to the system and is redirected to the dashboard.

    Given the user is on the login page
    When the user enters valid credentials
    Then the user is redirected to the dashboard

  Scenario Outline: Login with different roles
    Tests login behaviour across different user roles to ensure
    proper access control and dashboard routing.

    Given the user is on the login page
    When the user logs in as "<role>"
    Then the user sees the "<dashboard>" dashboard

    Examples:
      | role  | dashboard |
      | admin | admin     |
      | user  | user      |
```

## See also

- `feature-description-recommended` - applies the same guidance to Features.
- `rule-description-recommended` - applies the same guidance to Rule blocks.
