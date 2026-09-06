# Feature File Required

`feature-file-required` &middot; Feature &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Every `.feature` file must contain a `Feature` definition. The `Feature` keyword is the top-level container in a Gherkin document and provides the context for all scenarios within the file. A file without this keyword serves no purpose in a Cucumber test suite and should either have a Feature added or be removed entirely.

## Noncompliant code example

```gherkin
# This file has no Feature keyword
Scenario: Customer places an order
  Given the customer has items in their shopping cart
  When the customer proceeds to checkout
  Then the order confirmation page is displayed
```

## Compliant solution

Add a `Feature` definition at the top of the file:

```gherkin
Feature: Order placement
  Customers should be able to place orders through the checkout process.

  Scenario: Customer places an order
    Given the customer has items in their shopping cart
    When the customer proceeds to checkout
    Then the order confirmation page is displayed
```

## See also

- `feature-name-required` - Features must also have a non-empty name
- `scenario-required` - Features must contain at least one Scenario
