# Single When per Scenario

`single-when-per-scenario` &middot; Single &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Each scenario should contain exactly one `When` step. A scenario should test a single action or event, and multiple `When` steps indicate that the scenario is testing multiple behaviours. Scenarios with multiple `When` steps are harder to understand, maintain, and debug when they fail, as it becomes unclear which action caused the failure.

## Noncompliant code example

```gherkin
Feature: User profile management

  Scenario: Update profile and change password    <!-- Noncompliant -->
    Given the user is logged in
    And the user profile page is displayed
    When the user updates their email address
    And the user saves the changes
    When the user changes their password           <!-- Noncompliant -->
    And the user confirms the new password
    Then the profile is updated successfully
    And the password change is confirmed
```

## Compliant solution

Split into separate scenarios, each with one When step:

```gherkin
Feature: User profile management

  Scenario: Update profile email
    Given the user is logged in
    And the user profile page is displayed
    When the user updates their email address
    And the user saves the changes
    Then the profile is updated successfully

  Scenario: Change password
    Given the user is logged in
    And the user profile page is displayed
    When the user changes their password
    And the user confirms the new password
    Then the password change is confirmed
```

## See also

- `when-then-required` - Scenarios should have at least one When and one Then step
- `step-order-given-when-then` - Steps must follow Given/When/Then order
