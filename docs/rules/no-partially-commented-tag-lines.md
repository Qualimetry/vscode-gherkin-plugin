# No Partially Commented Tag Lines

`no-partially-commented-tag-lines` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Tag lines (lines beginning with `@`) should not contain the `#` character. In Gherkin, `#` starts a comment, but on a tag line the comment syntax is ambiguous - the parser may treat everything after `#` as part of the last tag rather than as a comment. This leads to confusing behavior where tags appear to be "commented out" but are actually mangled into the preceding tag.

If you need to disable a tag, move it to a dedicated comment line above the tag line, or remove it entirely.

## Noncompliant code example

```gherkin
Feature: User management

  @smoke @regression # temporarily disabled @slow <!-- Noncompliant -->
  Scenario: Create user
    Given an admin user
    When a new user is created
    Then the user appears in the list

  @api #@deprecated <!-- Noncompliant -->
  Scenario: Delete user
    Given an existing user
    When the user is deleted
    Then the user is removed
```

## Compliant solution

```gherkin
Feature: User management

  # @slow tag temporarily removed
  @smoke @regression
  Scenario: Create user
    Given an admin user
    When a new user is created
    Then the user appears in the list

  @api
  Scenario: Delete user
    Given an existing user
    When the user is deleted
    Then the user is removed
```

## See also

- `comment-format` - enforces consistent comment formatting.
- `no-restricted-tags` - flags tags from a restricted list.
