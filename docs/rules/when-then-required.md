# When and Then Required

`when-then-required` &middot; When &middot; Code Smell &middot; severity CRITICAL &middot; enabled in the recommended profile

Every `Scenario` should contain at least one `When` step and one `Then` step. The `When` step describes the action being tested, and the `Then` step describes the expected outcome. Without both, the scenario is incomplete and does not provide meaningful test coverage.

`And` and `But` steps count as the same kind of step as the last `Given`, `When`, or `Then` before them. Only the scenario's own steps are considered: `Background` steps do not count toward the When/Then requirement, as Backgrounds should contain only `Given` steps (see `background-given-only`).

## Noncompliant code example

```gherkin
Feature: Account management

  Scenario: View account details               <!-- Noncompliant: no When -->
    Given the customer is logged in
    Then the account details are displayed

  Scenario: Update account information          <!-- Noncompliant: no Then -->
    Given the customer is logged in
    When the customer updates their email address
```

## Compliant solution

Add the missing steps to complete the scenario:

```gherkin
Feature: Account management

  Scenario: View account details
    Given the customer is logged in
    When the customer navigates to account settings
    Then the account details are displayed

  Scenario: Update account information
    Given the customer is logged in
    When the customer updates their email address
    Then the email address is changed successfully
```

## See also

- `step-required` - Scenarios must contain at least one step
- `step-order-given-when-then` - Steps must follow Given/When/Then order
