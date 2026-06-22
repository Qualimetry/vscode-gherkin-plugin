# FIXME Comment

`fixme-comment` &middot; Fixme &middot; Code Smell &middot; severity INFO &middot; enabled in the recommended profile

Comments containing `FIXME` markers should be resolved and removed. FIXME comments indicate known defects or issues that are better tracked in an issue tracker. Leaving them in feature files risks them being overlooked as the test suite grows.

Matching is case-insensitive and recognises the marker as a whole word with an optional single space, hyphen or underscore separator: `FIXME`, `fix-me`, `fix_me` and `fix me` are all flagged. Words that merely contain the letters (e.g. *suffix mention*) are not.

## Noncompliant code example

```gherkin
Feature: Payment processing

  Scenario: Process a credit card payment
    Given the customer has items in the cart
    # FIXME: this step fails intermittently            <!-- Noncompliant -->
    When the customer pays by credit card
    Then the payment is processed
```

## Compliant solution

Address the issue and remove the FIXME comment:

```gherkin
Feature: Payment processing

  Scenario: Process a credit card payment
    Given the customer has items in the cart
    When the customer pays by credit card
    Then the payment is processed
```
