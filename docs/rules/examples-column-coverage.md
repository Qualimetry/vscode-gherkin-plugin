# Examples Column Coverage

`examples-column-coverage` &middot; Examples &middot; Bug &middot; severity CRITICAL &middot; enabled in the recommended profile

`Examples` tables must include columns for all variables referenced in the `Scenario Outline` steps. Variables are collected from step sentence text, doc string content, and data table cells. When a step references a placeholder like `<username>` but the Examples table does not define a corresponding column, the placeholder will not be substituted during test execution, leading to incorrect or misleading test results.

## Noncompliant code example

```gherkin
Feature: User authentication

  Scenario Outline: Login with different credentials
    Given the user <username> exists in the system
    When the user logs in with password <password>
    Then the login attempt should be <result>

    Examples:                                   <!-- Noncompliant: missing "result" column -->
      | username    | password    |
      | alice       | Secret123   |
      | bob         | Pass456     |
```

## Compliant solution

Add the missing column to the Examples table:

```gherkin
Feature: User authentication

  Scenario Outline: Login with different credentials
    Given the user <username> exists in the system
    When the user logs in with password <password>
    Then the login attempt should be <result>

    Examples:
      | username    | password    | result     |
      | alice       | Secret123   | successful |
      | bob         | Pass456     | successful |
```

## See also

- `examples-minimum-rows` - Examples tables must have at least one data row
- `no-unused-variables` - Examples columns must be referenced in steps
