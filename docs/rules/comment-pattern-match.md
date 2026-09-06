# Comment Pattern Match

`comment-pattern-match` &middot; Comment &middot; Code Smell &middot; severity MAJOR &middot; optional

Comments matching a configurable regular-expression pattern are flagged. This is a template rule: by default no pattern is configured and the rule does nothing. Once a pattern is provided, any comment whose text matches the pattern is reported. Use this rule to ban specific comment styles or markers that are not covered by the built-in TODO/FIXME checks.

## Noncompliant code example

With the pattern `(?i)hack`:

```gherkin
Feature: Payment processing

  Scenario: Process a refund
    Given the customer has a completed order
    # HACK: workaround for the payment gateway          <!-- Noncompliant -->
    When the customer requests a refund
    Then the refund is processed
```

## Compliant solution

Remove or rephrase the offending comment:

```gherkin
Feature: Payment processing

  Scenario: Process a refund
    Given the customer has a completed order
    When the customer requests a refund
    Then the refund is processed
```

## See also

- `comment-format` - requires a space after the comment marker.
- `todo-comment` - flags TODO markers left in the file.
- `fixme-comment` - flags FIXME markers left in the file.
