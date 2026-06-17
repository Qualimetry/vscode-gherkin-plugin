# Consistent Feature Language

`consistent-feature-language` &middot; Consistent &middot; Code Smell &middot; severity MAJOR &middot; optional

All `Feature` files in a project should use the same Gherkin language. Mixing languages (e.g., some features in English and others in French) reduces readability and consistency across the test suite. The expected language is taken from the file whose path sorts first alphabetically among the analyzed files, so the same file is flagged on every analysis run regardless of the order in which files are processed.

## Noncompliant code example

In `login.feature` (English):

```gherkin
Feature: User login
  Scenario: Login with valid credentials
    Given the user is on the login page
    When the user enters valid credentials
    Then the user is redirected to the dashboard
```

## Compliant solution

Use the same language for all features:

```gherkin
Feature: Order management
  Scenario: Place an order
    Given the customer is logged in
    When the customer places an order
    Then the order is confirmed
```

## See also

- `feature-name-required` - Features must have a non-empty name
