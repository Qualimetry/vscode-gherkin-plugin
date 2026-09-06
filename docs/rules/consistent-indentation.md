# Consistent Indentation

`consistent-indentation` &middot; Consistent &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Gherkin files should use consistent indentation based on the nesting level of each structural element. Consistent indentation improves readability and makes the feature file easier to maintain across teams. Without a uniform indentation style, files become harder to scan visually and merge conflicts are more likely.

This rule is language-agnostic and correctly handles non-English Gherkin files as well as `Rule` block nesting (Gherkin 6+). Tags are checked at the same level as the element they annotate.

## Noncompliant code example

With the default indentation of 2 spaces per level:

```gherkin
Feature: Account registration

Scenario: New customer registers an account          <!-- Noncompliant; expected 2 spaces -->
      Given the customer navigates to the registration page  <!-- Noncompliant; expected 4 spaces -->
      When the customer submits valid details
      Then an account is created
```

## Compliant solution

```gherkin
@smoke
Feature: Account registration

  Scenario: New customer registers an account
    Given the customer navigates to the registration page
    When the customer submits valid details
    Then an account is created

  Rule: Business customers

    Scenario: Business customer registers
      Given the business customer navigates to registration
      When the customer submits company details
      Then a business account is created
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `indentation` | int | 2 |

## See also

- `no-tab-characters` - tabs render at different widths and break alignment.
- `no-trailing-whitespace` - removes invisible characters at the end of a line.
