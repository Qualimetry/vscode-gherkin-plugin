# Step Sentence Max Length

`step-sentence-max-length` &middot; Step &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Step sentences should not exceed a configurable maximum length. Extremely long step sentences reduce readability and often indicate that the step is trying to express too much in a single statement. Breaking long steps into shorter, more focused steps improves clarity and makes the feature file easier to maintain.

## Noncompliant code example

With the default limit of 100 characters:

```gherkin
Feature: Subscription management

  Scenario: Customer upgrades with add-ons
    Given the customer has an active basic subscription
    When the customer navigates to the special promotions page and adds the premium yearly
         subscription plan with all optional add-ons and extended warranty coverage to their
         shopping cart                                <!-- Noncompliant; step text exceeds 100 chars -->
    Then the upgrade is applied
```

## Compliant solution

```gherkin
Feature: Subscription management

  Scenario: Customer upgrades with add-ons
    Given the customer has an active basic subscription
    When the customer selects the premium yearly plan
    And the customer adds all optional add-ons
    Then the upgrade is applied
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `maxLength` | int | 100 |
