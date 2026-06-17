# Examples Name When Multiple

`examples-name-when-multiple` &middot; Examples &middot; Code Smell &middot; severity MINOR &middot; optional

When a `Scenario Outline` has multiple `Examples` sections, each section should have a descriptive name. Unnamed `Examples` tables become indistinguishable in test reports, making failures harder to diagnose.

This rule only triggers when there are two or more `Examples` sections within a single `Scenario Outline`. A single `Examples` section does not need a name because there is no ambiguity.

## Noncompliant code example

```gherkin
Feature: User login

  Scenario Outline: Login with credentials
    Given a user with username "<username>"
    When they enter password "<password>"
    Then they should see "<result>"

    Examples:                                    <!-- Noncompliant -->
      | username | password  | result  |
      | admin    | secret123 | Welcome |
      | user1    | pass456   | Welcome |

    Examples:                                    <!-- Noncompliant -->
      | username | password | result         |
      | admin    | wrong    | Invalid        |
      | unknown  | any      | User not found |
```

## Compliant solution

```gherkin
Feature: User login

  Scenario Outline: Login with credentials
    Given a user with username "<username>"
    When they enter password "<password>"
    Then they should see "<result>"

    Examples: Valid credentials
      | username | password  | result  |
      | admin    | secret123 | Welcome |
      | user1    | pass456   | Welcome |

    Examples: Invalid credentials
      | username | password | result         |
      | admin    | wrong    | Invalid        |
      | unknown  | any      | User not found |
```

## See also

- `examples-minimum-rows` - Ensures Examples tables have sufficient data rows.
- `examples-column-coverage` - Ensures all Examples columns are used in step placeholders.
