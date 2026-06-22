# No Restricted Patterns

`no-restricted-patterns` &middot; No &middot; Code Smell &middot; severity MAJOR &middot; optional

Flags step text, scenario names, feature names, rule names, and descriptions that match a configurable regular expression. This is a template rule - when the pattern is empty (the default), the rule does nothing.

More general than `business-language-only`, this rule lets teams ban project-specific anti-patterns such as hardcoded URLs, environment names, SQL fragments, implementation details, or any other text that should not appear in Gherkin specifications.

## Noncompliant code example

With `pattern` set to `https?://|SELECT\s|INSERT\s`:

```gherkin
Feature: User data retrieval

  Scenario: Fetch user data  <!-- Noncompliant - step contains URL -->
    Given the API at "https://api.example.com/users"
    When the client sends a GET request
    Then the response status is 200
```

## Compliant solution

```gherkin
Feature: User data retrieval

  Scenario: Fetch user data
    Given the users API endpoint
    When the client sends a GET request
    Then the response status is 200
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `pattern` | Regular expression to match against step text, names, and descriptions. Uses `find()` semantics (partial match). Leave empty to disable the rule. | *(empty - rule inactive)* |

## See also

- `business-language-only` - built-in check for common implementation terms.
- `no-restricted-tags` - restricts specific tag names.
