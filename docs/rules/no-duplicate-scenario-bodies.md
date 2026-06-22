# No Duplicate Scenario Bodies

`no-duplicate-scenario-bodies` &middot; No &middot; Code Smell &middot; severity MAJOR &middot; optional

Scenarios within the same Feature or Rule block should not have identical step sequences. Duplicate scenario bodies increase maintenance cost, inflate test counts without adding coverage, and often indicate missed opportunities for Scenario Outline parameterisation or shared Background extraction.

## Noncompliant code example

```gherkin
Feature: User management

  Scenario: Create a new user
    Given an admin is logged in
    When the admin creates a new user
    Then the user is added to the system

  Scenario: Duplicate user creation          <!-- Noncompliant -->
    Given an admin is logged in
    When the admin creates a new user
    Then the user is added to the system
```

## Compliant solution

Remove the duplicate or extract differences into a Scenario Outline:

```gherkin
Feature: User management

  Scenario: Create a new user
    Given an admin is logged in
    When the admin creates a new user
    Then the user is added to the system

  Scenario: Deactivate a user
    Given an admin is logged in
    When the admin deactivates a user
    Then the user can no longer log in
```
