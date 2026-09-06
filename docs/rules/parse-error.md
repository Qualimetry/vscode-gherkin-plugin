# Parse Error

`parse-error` &middot; Parse &middot; Bug &middot; severity CRITICAL &middot; enabled in the recommended profile

Feature files must be valid Gherkin that the parser can process without errors. When a file cannot be parsed, an issue is raised at the location of the parse error. This typically indicates a syntax mistake such as a missing keyword, misplaced table, or unrecognised structure.

## Noncompliant code example

```gherkin
Feature: User login

  Scenario: Login with valid credentials
    the user has a valid account                         <!-- Noncompliant: missing step keyword -->
    When the user logs in
    Then the user sees the dashboard
```

## Compliant solution

```gherkin
Feature: User login

  Scenario: Login with valid credentials
    Given the user has a valid account
    When the user logs in
    Then the user sees the dashboard
```

## See also

- `feature-file-required` - requires the file to contain a Feature.
