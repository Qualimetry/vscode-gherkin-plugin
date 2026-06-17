# Then Step Pattern

`then-step-pattern` &middot; Then &middot; Code Smell &middot; severity MINOR &middot; optional

`Then` steps should match the configured regular-expression pattern. This rule lets teams enforce naming conventions on outcome steps - for example, requiring them to start with a noun phrase such as &ldquo;the&rdquo; or &ldquo;a&rdquo;. `And`/`But` steps continuing a `Then` are checked as well. If the configured pattern is not a valid regular expression, a file-level issue is raised instead of failing the analysis.

## Noncompliant code example

With the pattern `^the .*`:

```gherkin
Feature: Account management

  Scenario: Deactivate an account
    Given the user has an active account
    When the account is deactivated
    Then account status is inactive                   <!-- Noncompliant -->
```

## Compliant solution

```gherkin
Feature: Account management

  Scenario: Deactivate an account
    Given the user has an active account
    When the account is deactivated
    Then the account status is inactive
```
