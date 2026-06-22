# Rule Name Required

`rule-name-required` &middot; Rule &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Every `Rule` block must have a non-empty name. The `Rule` keyword (introduced in Gherkin 6) groups scenarios under a business rule within a Feature. A Rule without a name fails to document which business rule is being validated, making test reports and documentation unreadable.

## Noncompliant code example

```gherkin
Feature: Online Shopping

  Rule:                                           <!-- Noncompliant -->
    Scenario: Add item to cart
      Given the customer is browsing products
      When the customer adds "Laptop" to the cart
      Then the cart should contain 1 item
```

## Compliant solution

Provide a meaningful name that describes the business rule:

```gherkin
Feature: Online Shopping

  Rule: Cart management
    Scenario: Add item to cart
      Given the customer is browsing products
      When the customer adds "Laptop" to the cart
      Then the cart should contain 1 item
```

## See also

- `rule-description-recommended` - Rules should also include a description
- `unique-rule-name` - Rule names must be unique within a Feature
- `feature-name-required` - Similar check for Feature names
