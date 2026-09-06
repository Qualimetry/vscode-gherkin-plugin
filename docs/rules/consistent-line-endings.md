# Consistent Line Endings

`consistent-line-endings` &middot; Consistent &middot; Code Smell &middot; severity MINOR &middot; optional

All lines in a Gherkin file should use the same line ending style. Mixing different line endings (`LF`, `CRLF`, or `CR`) within a single file can cause issues in version control, produce noisy diffs, and lead to unexpected behaviour in parsers and tools that assume a uniform line ending format.

## Noncompliant code example

File mixes `LF` and `CRLF` endings:

```gherkin
Feature: Subscription management(LF)
(LF)
  Scenario: Customer upgrades subscription(CRLF)     <!-- Noncompliant -->
    Given the customer has a basic plan(LF)
    When the customer selects the premium plan(CRLF)  <!-- Noncompliant -->
    Then the subscription is upgraded(LF)
```

## Compliant solution

All lines use the same line ending style (`LF` by default):

```gherkin
Feature: Subscription management(LF)
(LF)
  Scenario: Customer upgrades subscription(LF)
    Given the customer has a basic plan(LF)
    When the customer selects the premium plan(LF)
    Then the subscription is upgraded(LF)
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `lineEnding` | String | LF |

## See also

- `newline-at-end-of-file` - requires a trailing newline.
- `no-byte-order-mark` - rejects a leading UTF-8 byte order mark.
