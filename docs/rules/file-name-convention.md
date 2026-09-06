# File Name Convention

`file-name-convention` &middot; File &middot; Code Smell &middot; severity MINOR &middot; enabled in the recommended profile

Feature file names should follow a consistent naming convention. By default, filenames must start with a lowercase letter, contain only letters, digits, and hyphens, and end with the `.feature` extension. A consistent naming convention makes it easier to locate files, avoids filesystem compatibility issues across platforms, and improves organisation in large projects.

## Noncompliant code example

Filenames that violate the default pattern:

```gherkin
BadName.feature                   <!-- Noncompliant; starts with uppercase -->
My Feature File.feature           <!-- Noncompliant; contains spaces -->
123-numbers-first.feature         <!-- Noncompliant; starts with digit -->
```

## Compliant solution

```gherkin
account-registration.feature
password-reset.feature
order-history.feature
```

## Configuration

| Parameter | Type | Default |
|---|---|---|
| `pattern` | String (regex) | `^[a-z][-A-Za-z0-9]*\.feature$` |

## See also

- `feature-name-matches-filename` - keeps the Feature name aligned with the file name.
