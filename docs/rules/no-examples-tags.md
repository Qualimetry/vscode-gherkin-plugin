# No Examples Tags

`no-examples-tags` &middot; No &middot; Code Smell &middot; severity MINOR &middot; optional

Tags should not be placed on Examples sections. Tags should be placed on Scenario Outlines instead. Tags on Examples sections are not meaningful and should be moved up to the Scenario Outline level.

## Noncompliant code example

Tags placed on Examples sections:

```gherkin
Feature: User login

  Scenario Outline: User logs in with different credentials
    Given the user navigates to login
    When the user enters "<username>" and "<password>"
    Then the user is authenticated

    @smoke              <!-- Noncompliant; tag on Examples -->
    Examples: Valid users
      | username | password |
      | alice    | secret   |
      | bob      | secret   |
```

## Compliant solution

Move tags to the Scenario Outline level:

```gherkin
Feature: User login

  @smoke
  Scenario Outline: User logs in with different credentials
    Given the user navigates to login
    When the user enters "<username>" and "<password>"
    Then the user is authenticated

    Examples: Valid users
      | username | password |
      | alice    | secret   |
      | bob      | secret   |
```

## See also

- `tag-placement` - defines where tags belong.
- `rule-tag-placement` - defines where tags belong on Rule blocks.
