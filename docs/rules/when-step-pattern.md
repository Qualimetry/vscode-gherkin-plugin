# When Step Pattern

`when-step-pattern` &middot; When &middot; Code Smell &middot; severity MINOR &middot; optional

`When` steps should match the configured regular-expression pattern. This rule lets teams enforce naming conventions on action steps - for example, requiring them to start with a noun phrase such as &ldquo;the&rdquo; or &ldquo;a&rdquo;. `And`/`But` steps continuing a `When` are checked as well. If the configured pattern is not a valid regular expression, a file-level issue is raised instead of failing the analysis.

## Noncompliant code example

With the pattern `^the .*`:

```gherkin
Feature: Account management

  Scenario: Deactivate an account
    Given the user has an active account
    When account is deactivated                       <!-- Noncompliant -->
    Then the account status is inactive
```

## Compliant solution

```gherkin
Feature: Account management

  Scenario: Deactivate an account
    Given the user has an active account
    When the account is deactivated
    Then the account status is inactive
```

## See also

- `given-step-pattern` - applies the same constraint to precondition steps.
- `then-step-pattern` - applies the same constraint to outcome steps.
- `single-when-per-scenario` - limits a scenario to one action.
