# No Commented Out Steps

`no-commented-out-steps` &middot; No &middot; Code Smell &middot; severity MINOR &middot; optional

Comments that contain Gherkin step keywords (`Given`, `When`, `Then`, `And`, `But`, `*`) indicate dead or abandoned behaviour definitions. Step keywords are resolved from the file's Gherkin dialect (the `# language:` declaration, defaulting to English), so commented-out steps are detected in any supported language. Commented-out steps should be removed or restored as active steps to keep feature files clean, accurate, and free of misleading content.

## Noncompliant code example

```gherkin
Feature: Order processing

  Scenario: Process a new order
    Given a customer has items in the cart
    When the customer submits the order
    Then the order is created

  # Given the user is logged in             <!-- Noncompliant -->
  # When the user clicks the button          <!-- Noncompliant -->
  # Then the page refreshes                  <!-- Noncompliant -->
```

## Compliant solution

Remove the commented-out steps entirely, or restore them if needed:

```gherkin
Feature: Order processing

  Scenario: Process a new order
    Given a customer has items in the cart
    When the customer submits the order
    Then the order is created
```

## See also

- `comment-format` - requires a space after the comment marker.
- `no-partially-commented-tag-lines` - flags tag lines that are only partly commented out.
