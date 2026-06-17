# Feature Rule Count Limit

`feature-rule-count-limit` &middot; Feature &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Features should not exceed a configurable number of `Rule` blocks. Excessive `Rule` blocks in a single Feature suggest it covers too many business domains and should be split into separate feature files. The default limit is **8** `Rule` blocks per Feature.

## Noncompliant code example

```gherkin
Feature: E-commerce platform               <!-- Noncompliant -->

  Rule: User registration
    Scenario: Register new user
      Given ...

  Rule: Product catalog
    Scenario: Browse products
      Given ...

  # ... 7 more Rule blocks ...

  Rule: Analytics dashboard
    Scenario: View analytics
      Given ...
```

## Compliant solution

```gherkin
# user-management.feature
Feature: User Management

  Rule: User registration
    Scenario: Register new user
      Given ...

  Rule: User authentication
    Scenario: Log in
      Given ...

# product-catalog.feature
Feature: Product Catalog

  Rule: Product browsing
    Scenario: Browse products
      Given ...
```

## See also

- `scenario-count-limit` - limits scenarios per Feature
- `rule-scenario-count-limit` - limits scenarios per Rule block
