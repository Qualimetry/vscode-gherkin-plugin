# Spelling Accuracy

`spelling-accuracy` &middot; Spelling &middot; Code Smell &middot; severity INFO &middot; optional

Feature files should be free of spelling mistakes. Misspelled words in feature and scenario names, step text, and descriptions reduce readability and can make it harder to search for or understand test intent.

This rule uses LanguageTool (English, en-US) to check spelling only. Grammar and style rules are disabled. Add product names, technical terms, and domain vocabulary to the **wordsToIgnore** parameter (comma-separated) to avoid false positives.

## Noncompliant code example

```gherkin
Feature: User autentication                              <!-- typo: "autentication" -->

  Scenario: Login with valid credntials                  <!-- typo: "credntials" -->
    Given the user has a registred account               <!-- typo: "registred" -->
    When the user logs in with valid credentials
    Then the user is authentcated                         <!-- typo: "authentcated" -->
```

## Compliant solution

```gherkin
Feature: User authentication

  Scenario: Login with valid credentials
    Given the user has a registered account
    When the user logs in with valid credentials
    Then the user is authenticated
```

## See also

- `business-language-only` - keeps step text in business rather than technical language.
- `consistent-feature-language` - requires one spoken language per feature.
