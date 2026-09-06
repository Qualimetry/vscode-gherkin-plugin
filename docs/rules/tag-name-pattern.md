# Tag Name Pattern

`tag-name-pattern` &middot; Tag &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Tag names should follow a consistent naming convention. By default, tag names must start with a lowercase letter and contain only lowercase letters, digits, and hyphens. A consistent naming convention makes tags easier to read, avoids confusion, and improves maintainability across large test suites.

## Noncompliant code example

Tag names that violate the default pattern:

```gherkin
@SmokeTest              <!-- Noncompliant; starts with uppercase -->
@regression_test        <!-- Noncompliant; contains underscore -->
@123-priority           <!-- Noncompliant; starts with digit -->
```

## Compliant solution

```gherkin
@smoke
@regression
@priority-high
@payment-processing
@api-test
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `pattern` | String (regex) | `^[a-z][-a-z0-9]*$` |

## See also

- `tag-permitted-values` - restricts tags to a permitted set.
- `no-restricted-tags` - forbids specific tags outright.
- `required-tags` - requires a tag from a configured set.
