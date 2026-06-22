# No Empty Doc Strings

`no-empty-doc-strings` &middot; No &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Doc strings (triple-quoted blocks delimited by `"""` or `````) must not be empty. An empty doc string serves no purpose - it was either left as a placeholder that was never filled in, or its content was deleted without removing the delimiters. This is always a mistake.

## Noncompliant code example

```gherkin
Feature: API testing

  Scenario: Submit an empty payload
    Given the API endpoint is available
    When the user submits the following payload:  <!-- Noncompliant -->
      """
      """
    Then the response status is 400
```

## Compliant solution

Either fill in the doc string with content:

```gherkin
Feature: API testing

  Scenario: Submit a JSON payload
    Given the API endpoint is available
    When the user submits the following payload:
      """json
      {
        "name": "Alice",
        "email": "alice@example.com"
      }
      """
    Then the response status is 200
```
