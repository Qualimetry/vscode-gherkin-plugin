# Consistent Scenario Keyword

`consistent-scenario-keyword` &middot; Consistent &middot; Code Smell &middot; severity MINOR &middot; optional

All scenarios within a single `.feature` file should use the same keyword variant consistently. In Gherkin, `Scenario` and `Example` are synonyms for the same construct. Mixing both keywords in one file reduces readability and suggests inconsistent conventions.

This rule tracks only non-outline scenario keywords. `Scenario Outline` and `Scenario Template` keywords are excluded because they represent a distinct construct (parameterized scenarios). The rule correctly handles localized keywords for non-English Gherkin files.

When multiple keyword variants are found, the minority variant is flagged. For example, if three scenarios use `Scenario` and one uses `Example`, the single `Example` usage is reported.

Alternatively, a fixed keyword can be enforced via the `preferredKeyword` parameter (e.g. `Scenario`): every scenario using a different keyword from the same family is then flagged, regardless of majority. `preferredOutlineKeyword` does the same for outline keywords (e.g. enforcing `Scenario Outline` over `Scenario Template`). When both parameters are empty (the default), majority mode applies and outline keywords are not checked.

## Noncompliant code example

```gherkin
Feature: User management

  Scenario: Create a new user                    <!-- OK (majority) -->
    Given an admin user
    When they create a new account
    Then the account is active

  Scenario: Delete a user                        <!-- OK (majority) -->
    Given an admin user
    When they delete an account
    Then the account is removed

  Example: Update a user                         <!-- Noncompliant -->
    Given an admin user
    When they update an account
    Then the changes are saved
```

## Compliant solution

```gherkin
Feature: User management

  Scenario: Create a new user
    Given an admin user
    When they create a new account
    Then the account is active

  Scenario: Delete a user
    Given an admin user
    When they delete an account
    Then the account is removed

  Scenario: Update a user
    Given an admin user
    When they update an account
    Then the changes are saved
```

## See also

- `consistent-feature-language` - Ensures all feature files use the same Gherkin language.
- `use-scenario-outline-for-examples` - Ensures the correct keyword is used with Examples tables.
