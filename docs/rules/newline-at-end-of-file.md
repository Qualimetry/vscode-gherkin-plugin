# Newline at End of File

`newline-at-end-of-file` &middot; Newline &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Files should end with a trailing newline character. The POSIX standard defines a line as a sequence of characters ending with a newline. Files that do not end with a newline may cause issues with certain tools that expect the standard line format, including some diff utilities, shell commands, and concatenation operations.

## Noncompliant code example

File does not end with a newline (shown with `EOF`):

```gherkin
Feature: Shipment tracking

  Scenario: Customer tracks a shipment
    Given the customer has placed an order
    When the customer views the tracking page
    Then the current shipment status is displayedEOF   <!-- Noncompliant -->
```

## Compliant solution

File ends with a newline after the last line:

```gherkin
Feature: Shipment tracking

  Scenario: Customer tracks a shipment
    Given the customer has placed an order
    When the customer views the tracking page
    Then the current shipment status is displayed
```

## See also

- `consistent-line-endings` - requires one line ending style throughout the file.
- `no-trailing-whitespace` - removes invisible characters at the end of a line.
