# Feature Name Matches Filename

`feature-name-matches-filename` &middot; Feature &middot; Code Smell &middot; severity MINOR &middot; optional

Feature names should broadly correspond to their file names to aid discoverability and navigation in large test suites. A file named `payment-refund.feature` should contain a Feature with a name related to payment refunds, not an unrelated topic like "Order cancellation policy".

## Noncompliant code example

File: `payment-refund.feature`

```gherkin
Feature: Order cancellation policy           <!-- Noncompliant -->

  Scenario: Cancel a pending order
    Given a pending order exists
    When the customer requests cancellation
    Then the order is cancelled
```

## Compliant solution

File: `payment-refund.feature`

```gherkin
Feature: Payment refund processing

  Scenario: Refund a completed payment
    Given a payment has been completed
    When a refund is requested
    Then the refund is processed
```
