# TODO Comment

`todo-comment` &middot; Todo &middot; Code Smell &middot; severity INFO &middot; enabled in the recommended profile

Comments containing `TODO` markers should be resolved and removed. TODO comments indicate unfinished work or pending decisions that are better tracked in an issue tracker. Leaving them in feature files risks them being overlooked as the test suite grows.

Matching is case-insensitive and recognises the marker as a whole word with an optional single space, hyphen or underscore separator: `TODO`, `to-do`, `to_do` and `to do` are all flagged. Words that merely contain the letters (e.g. *todos*, *things to document*) are not.

## Noncompliant code example

```gherkin
Feature: Payment processing

  Scenario: Process a credit card payment
    Given the customer has items in the cart
    # TODO: implement this step                        <!-- Noncompliant -->
    When the customer pays by credit card
    Then the payment is processed
```

## Compliant solution

Remove or resolve the TODO comment:

```gherkin
Feature: Payment processing

  Scenario: Process a credit card payment
    Given the customer has items in the cart
    When the customer pays by credit card
    Then the payment is processed
```

## See also

- `fixme-comment` - flags FIXME markers left in the file.
- `comment-pattern-match` - flags comments matching any configured pattern.
