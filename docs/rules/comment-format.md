# Comment Format

`comment-format` &middot; Comment &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Comments in Gherkin files should have a space after the `#` symbol. This improves readability and follows the widely adopted convention in most programming languages and configuration files. An empty comment consisting of just `#` is also acceptable.

## Noncompliant code example

```gherkin
Feature: Delivery scheduling

  #This comment does not have a space after #       <!-- Noncompliant -->
  Scenario: Schedule a delivery
    Given the customer has placed an order
    #Another badly formatted comment                <!-- Noncompliant -->
    When the customer selects next-day delivery
    Then the delivery is scheduled for tomorrow
```

## Compliant solution

```gherkin
Feature: Delivery scheduling

  # This comment has a space after #
  Scenario: Schedule a delivery
    Given the customer has placed an order
    # A properly formatted comment
    When the customer selects next-day delivery
    Then the delivery is scheduled for tomorrow
```
