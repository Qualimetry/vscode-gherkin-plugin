# Blank Line Before Scenario

`blank-line-before-scenario` &middot; Blank &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

A blank line should precede each `Scenario`, `Scenario Outline`, `Scenario Template`, or `Example` keyword for readability. This visual separation makes it easier to scan a feature file and identify where each test scenario begins.

This rule mirrors the `examples-separator-line` rule, which enforces the same pattern for `Examples` sections. When a scenario has tags or comment lines directly above it, those lines belong to the scenario block: the blank line must appear before the whole tag/comment block. A comment directly above a scenario is compliant as long as a blank line precedes the comment.

## Noncompliant code example

```gherkin
Feature: Order processing
  Scenario: Place an order  <!-- Noncompliant - no blank line before Scenario -->
    Given a customer with an account
    When the customer adds an item to the cart
    Then the order is created
  Scenario: Cancel an order  <!-- Noncompliant - no blank line before Scenario -->
    Given an existing order
    When the customer cancels the order
    Then the order status is cancelled
```

## Compliant solution

```gherkin
Feature: Order processing

  Scenario: Place an order
    Given a customer with an account
    When the customer adds an item to the cart
    Then the order is created

  Scenario: Cancel an order
    Given an existing order
    When the customer cancels the order
    Then the order status is cancelled
```

## See also

- `examples-separator-line` - enforces blank lines before Examples sections.
- `consistent-indentation` - enforces consistent indentation throughout the file.
