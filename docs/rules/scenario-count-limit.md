# Scenario Count Limit

`scenario-count-limit` &middot; Scenario &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Features should not exceed a configurable number of scenarios. A feature file with too many scenarios becomes difficult to navigate, understand, and maintain. Large features often indicate that the file covers multiple business capabilities that should be split into separate, more focused feature files. Scenarios nested inside `Rule:` blocks count toward the feature total.

## Noncompliant code example

With the default limit of 12 scenarios:

```gherkin
Feature: Complete e-commerce workflow            <!-- Noncompliant -->

  Scenario: Browse product catalog
    ...
  Scenario: Search for a product
    ...
  Scenario: View product details
    ...
  Scenario: Add product to cart
    ...
  Scenario: Update cart quantity
    ...
  Scenario: Remove product from cart
    ...
  Scenario: Apply discount code
    ...
  Scenario: Calculate shipping cost
    ...
  Scenario: Select payment method
    ...
  Scenario: Process credit card payment
    ...
  Scenario: Process bank transfer
    ...
  Scenario: Confirm order
    ...
  Scenario: Cancel order
    ...
```

## Compliant solution

Split the feature into smaller, domain-specific features:

```gherkin
Feature: Product browsing
  Scenario: Browse product catalog
    ...
  Scenario: Search for a product
    ...
  Scenario: View product details
    ...
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `maxScenarios` | int | 12 |

## See also

- `feature-file-max-lines` - limits overall file size.
- `rule-scenario-count-limit` - applies the same limit inside a Rule block.
- `step-count-limit` - limits the number of steps in a single scenario.
