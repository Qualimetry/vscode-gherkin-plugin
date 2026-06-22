# No Tab Characters

`no-tab-characters` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Gherkin files should not contain tab characters for indentation or anywhere else in the file. Tabs display differently depending on the editor, terminal, and viewer settings, leading to inconsistent alignment across team members' environments. Using spaces instead of tabs guarantees that files look the same everywhere.

## Noncompliant code example

Lines indented with tab characters:

```gherkin
Feature: Invoice generation

&#9;Scenario: Generate monthly invoice               <!-- Noncompliant -->
&#9;&#9;Given the billing cycle has ended             <!-- Noncompliant -->
&#9;&#9;When the system generates the invoice
&#9;&#9;Then the invoice is sent to the customer
```

## Compliant solution

Use spaces for all indentation:

```gherkin
Feature: Invoice generation

  Scenario: Generate monthly invoice
    Given the billing cycle has ended
    When the system generates the invoice
    Then the invoice is sent to the customer
```
