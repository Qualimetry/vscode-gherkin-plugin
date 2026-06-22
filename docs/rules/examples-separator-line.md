# Examples Separator Line

`examples-separator-line` &middot; Examples &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

An `Examples` section in a `Scenario Outline` should be preceded by a blank line. This visual separator makes the feature file easier to read by clearly distinguishing the step definitions from the data table that drives them. Without the blank line, the `Examples` section blends into the steps, making the structure harder to scan.

## Noncompliant code example

```gherkin
Feature: Currency conversion

  Scenario Outline: Convert between currencies
    Given the exchange rate from <from> to <to> is <rate>
    When the customer converts <amount> <from>
    Then the result is <expected> <to>
    Examples:                                        <!-- Noncompliant; no blank line before Examples -->
      | from | to  | rate | amount | expected |
      | USD  | EUR | 0.85 | 100    | 85       |
      | GBP  | USD | 1.27 | 200    | 254      |
```

## Compliant solution

```gherkin
Feature: Currency conversion

  Scenario Outline: Convert between currencies
    Given the exchange rate from <from> to <to> is <rate>
    When the customer converts <amount> <from>
    Then the result is <expected> <to>

    Examples:
      | from | to  | rate | amount | expected |
      | USD  | EUR | 0.85 | 100    | 85       |
      | GBP  | USD | 1.27 | 200    | 254      |
```
