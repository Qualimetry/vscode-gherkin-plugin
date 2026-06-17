# No Unused Variables

`no-unused-variables` &middot; No &middot; Bug &middot; severity MAJOR &middot; enabled in the recommended profile

All columns in an `Examples` table should be referenced as `<variable>` placeholders in at least one step of the owning `Scenario Outline`. References are collected from step sentence text, doc string content, and data table cells, and a column used anywhere in the outline counts as used for every Examples section. Unreferenced columns represent dead test data that add noise and can confuse readers about which values actually drive the test.

## Noncompliant code example

```gherkin
Feature: User registration

  Scenario Outline: Register a new user
    Given the registration form is displayed
    When the user registers as a <role>
    Then the account is created

    Examples:                                <!-- Noncompliant: "unused" column not referenced -->
      | role    | unused   |
      | admin   | foo      |
      | editor  | bar      |
```

## Compliant solution

Remove unreferenced columns from the Examples table:

```gherkin
Feature: User registration

  Scenario Outline: Register a new user
    Given the registration form is displayed
    When the user registers as a <role>
    Then the account is created

    Examples:
      | role    |
      | admin   |
      | editor  |
```

## See also

- `examples-column-coverage` - Steps must not reference variables missing from the Examples table
