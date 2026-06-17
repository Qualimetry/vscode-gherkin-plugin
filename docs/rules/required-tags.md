# Required Tags

`required-tags` &middot; Required &middot; Code Smell &middot; severity MAJOR &middot; optional

Every `Scenario` and `Scenario Outline` should have at least one tag matching a configurable regular expression pattern. This rule is useful for teams that require categorization tags (e.g., `@smoke`, `@regression`) on every scenario to ensure proper test suite organization and selective execution.

**Note:** Tags inherited from the enclosing Feature and Rule are considered when matching the pattern. A scenario without a matching tag of its own is compliant when its Feature or Rule carries a matching tag.

## Noncompliant code example

```gherkin
Feature: User login

  <!-- Noncompliant: scenario has no tags matching "smoke|regression" -->
  Scenario: Successful login
    Given a registered user
    When the user logs in with valid credentials
    Then the user sees the dashboard
```

## Compliant solution

```gherkin
Feature: User login

  @smoke
  Scenario: Successful login
    Given a registered user
    When the user logs in with valid credentials
    Then the user sees the dashboard
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `pattern` | Regular expression that at least one tag must match (without the leading `@`). The default `.*` matches everything, so the rule is effectively inactive unless configured with a meaningful pattern. | `.*` |

## See also

- `tag-name-pattern` - validates individual tag naming conventions.
- `no-restricted-tags` - flags tags from a restricted list.
