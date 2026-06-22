# No Trailing Whitespace

`no-trailing-whitespace` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Lines in Gherkin files should not end with trailing whitespace. Trailing spaces and tabs are invisible to most readers but can create noise in version control diffs, cause unexpected merge conflicts, and make files larger than necessary. Many editors can be configured to strip trailing whitespace automatically on save.

## Noncompliant code example

Lines ending with trailing spaces (shown with `·`):

```gherkin
Feature: Payment processing··                        <!-- Noncompliant -->

  Scenario: Process credit card payment···            <!-- Noncompliant -->
    Given the customer has items in the cart
    When the customer pays with a credit card··       <!-- Noncompliant -->
    Then the payment is processed
```

## Compliant solution

```gherkin
Feature: Payment processing

  Scenario: Process credit card payment
    Given the customer has items in the cart
    When the customer pays with a credit card
    Then the payment is processed
```
