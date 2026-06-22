# Unique Examples Headers

`unique-examples-headers` &middot; Unique &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Column names in an Examples table must be unique. Duplicate column headers create ambiguous variable substitution - the test framework cannot determine which column to use when a step references a placeholder that matches multiple headers. This is always a defect that will cause incorrect or unpredictable test behaviour.

## Noncompliant code example

```gherkin
Feature: User registration

  Scenario Outline: Register a new user
    Given the user enters "<username>" in the name field
    And the user enters "<username>" in the confirmation field
    Then the registration should succeed

    Examples:                                <!-- Noncompliant -->
      | username | email             | username |
      | alice    | alice@example.com | alice    |
      | bob      | bob@example.com   | bob      |
```

## Compliant solution

Give each column a unique, descriptive name:

```gherkin
Feature: User registration

  Scenario Outline: Register a new user
    Given the user enters "<username>" in the name field
    And the user enters "<confirmation>" in the confirmation field
    Then the registration should succeed

    Examples:
      | username | email             | confirmation |
      | alice    | alice@example.com | alice        |
      | bob      | bob@example.com   | bob          |
```
