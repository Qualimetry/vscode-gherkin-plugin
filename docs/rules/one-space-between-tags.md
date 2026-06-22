# One Space Between Tags

`one-space-between-tags` &middot; One &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Tag lines should have exactly one space between consecutive `@`-prefixed tokens. Multiple spaces or tabs between tags make the tag line harder to read and create inconsistent formatting across the feature file.

## Noncompliant code example

```gherkin
Feature: Search functionality

  @smoke  @regression <!-- Noncompliant: two spaces between tags -->
  Scenario: Basic search
    Given the search page is loaded
    When the user searches for "test"
    Then results are displayed

  @smoke    @integration    @api <!-- Noncompliant: multiple spaces -->
  Scenario: Advanced search
    Given the search page is loaded
    When the user applies filters
    Then filtered results are displayed
```

## Compliant solution

```gherkin
Feature: Search functionality

  @smoke @regression
  Scenario: Basic search
    Given the search page is loaded
    When the user searches for "test"
    Then results are displayed

  @smoke @integration @api
  Scenario: Advanced search
    Given the search page is loaded
    When the user applies filters
    Then filtered results are displayed
```

## See also

- `no-trailing-whitespace` - removes trailing whitespace from all lines.
- `tag-name-pattern` - validates tag naming conventions.
