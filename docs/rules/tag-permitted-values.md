# Tag Permitted Values

`tag-permitted-values` &middot; Tag &middot; Code Smell &middot; severity MINOR &middot; optional

Tag names should match a permitted pattern or set of values. By default, any tag name is allowed (pattern `.*`). Configure the pattern to restrict tags to specific values or naming conventions, ensuring consistency and preventing typos or unauthorized tags.

## Noncompliant code example

Tag names that do not match a configured pattern (e.g., `smoke|regression|api`):

```gherkin
@smoke
@regression
@unauthorized-tag     <!-- Noncompliant; not in permitted list -->
@api
@typo-tag             <!-- Noncompliant; not in permitted list -->
```

## Compliant solution

Tag names that match the permitted pattern:

```gherkin
@smoke
@regression
@api
@integration
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `pattern` | String (regex) | `.*` |
