# Background Given Only

`background-given-only` &middot; Background &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Background sections must only contain `Given` steps. The Background is designed to establish shared preconditions that apply to all scenarios in a feature. Using `When` or `Then` steps in Background violates the Given-When-Then pattern and makes scenarios harder to understand, as Background should only set up the initial state, not perform actions or verify outcomes. `And`/`But` steps inherit the type of the preceding keyword, so conjunctions continuing a `When` or `Then` are flagged too.

## Noncompliant code example

```gherkin
Feature: Customer account management

  Background:                                    <!-- Noncompliant -->
    Given the customer has an active account
    When the customer logs into the system
    Then the customer dashboard is displayed

  Scenario: View account balance
    Given the account balance is $1000
    When the customer requests the balance
    Then the balance of $1000 is displayed
```

## Compliant solution

Move `When` and `Then` steps out of Background:

```gherkin
Feature: Customer account management

  Background:
    Given the customer has an active account
    And the customer is logged into the system

  Scenario: View account balance
    Given the account balance is $1000
    When the customer requests the balance
    Then the balance of $1000 is displayed
```

## See also

- `shared-given-to-background` - Common Given steps should be moved to Background
- `step-order-given-when-then` - Steps must follow Given/When/Then order
