# No Duplicate Tags

`no-duplicate-tags` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

The same tag should not appear more than once on a single element. Duplicate tags on the same `Feature`, `Rule`, `Scenario`, or `Examples` section are always redundant and indicate a copy-paste error or oversight.

This check is different from `no-redundant-tags`, which detects tags that duplicate inherited tags from a parent element. This rule catches exact duplicate tags within the same element's own tag list.

## Noncompliant code example

```gherkin
@smoke @regression @smoke                        <!-- Noncompliant: @smoke duplicated on Feature -->
Feature: User login

  @critical @critical                             <!-- Noncompliant: @critical duplicated on Scenario -->
  Scenario: Successful login
    Given a valid user
    When they enter credentials
    Then they are logged in

  Scenario Outline: Login with various roles
    Given a user with role "<role>"
    When they log in
    Then they see "<page>"

    @fast @fast                                   <!-- Noncompliant: @fast duplicated on Examples -->
    Examples: Roles
      | role  | page      |
      | admin | dashboard |
```

## Compliant solution

```gherkin
@smoke @regression
Feature: User login

  @critical
  Scenario: Successful login
    Given a valid user
    When they enter credentials
    Then they are logged in

  Scenario Outline: Login with various roles
    Given a user with role "<role>"
    When they log in
    Then they see "<page>"

    @fast
    Examples: Roles
      | role  | page      |
      | admin | dashboard |
```

## See also

- `no-redundant-tags` - Flags scenario tags that duplicate Feature-level tags.
- `no-redundant-rule-tags` - Flags scenario tags that duplicate Rule-level tags.
- `tag-name-pattern` - Enforces tag naming conventions.
