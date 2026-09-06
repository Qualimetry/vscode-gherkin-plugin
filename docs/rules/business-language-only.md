# Business Language Only

`business-language-only` &middot; Business &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Steps should use business language that describes what the system does from a user or business perspective, not technical implementation details. Avoid UI-specific terms like "click", "field", "dropdown", or "textbox" as these tie scenarios to specific user interface implementations. Ordinary words such as "page" or "button" are not flagged. Instead, focus on the business action or outcome, making scenarios more maintainable and allowing the underlying implementation to change without updating tests.

## Noncompliant code example

```gherkin
Feature: Account registration

  Scenario: Register new customer account
    Given the user is on the registration page
    When the user clicks the "Email" field
    And the user types "customer@example.com" into the email field
    And the user clicks the "Password" field
    And the user types "SecurePass123" into the password field
    And the user clicks the "Submit" button
    Then the user is redirected to the welcome page
    And a success message is displayed on the page
```

## Compliant solution

Use business language focused on actions and outcomes:

```gherkin
Feature: Account registration

  Scenario: Register new customer account
    Given the customer wants to create an account
    When the customer provides email "customer@example.com"
    And the customer sets password "SecurePass123"
    And the customer submits the registration
    Then the account is created successfully
    And the customer receives a welcome notification
```

## See also

- `step-order-given-when-then` - Steps must follow Given/When/Then order
- `step-count-limit` - Scenarios should not exceed a maximum number of steps
