# Unique Feature Name

`unique-feature-name` &middot; Unique &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

`Feature` names must be unique across all `.feature` files in the project. Duplicate Feature names create ambiguity in test reports and make it impossible to distinguish which file a particular test result originates from. Each Feature should have a distinct, descriptive name that clearly identifies its business domain.

## Noncompliant code example

In `login.feature`:

```gherkin
Feature: User authentication
  Scenario: Login with valid credentials
    ...
```

## Compliant solution

Give each Feature a unique name:

```gherkin
Feature: Password-based authentication
  ...

Feature: Single sign-on authentication
  ...
```

## See also

- `feature-name-required` - Features must have a non-empty name
- `unique-scenario-name` - Scenario names must also be unique
