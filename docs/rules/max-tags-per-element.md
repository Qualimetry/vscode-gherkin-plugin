# Max Tags Per Element

`max-tags-per-element` &middot; Max &middot; Code Smell &middot; severity MINOR &middot; optional

Checks that `Feature`, `Rule`, `Scenario`, and `Examples` elements do not exceed a configurable maximum number of tags. Excessive tags on a single element suggest poor test organization or over-classification and make test reports harder to filter effectively.

The default limit is 8 tags per element. Teams can adjust this threshold based on their tagging conventions.

## Noncompliant code example

With `maxTags` set to `5`:

```gherkin
Feature: User authentication

@smoke @regression @integration @ui @api @nightly  <!-- Noncompliant -->
Scenario: User logs in
  Given a registered user
  When the user logs in
  Then the dashboard is displayed
```

## Compliant solution

```gherkin
Feature: User authentication

@smoke @regression @ui
Scenario: User logs in
  Given a registered user
  When the user logs in
  Then the dashboard is displayed
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `maxTags` | Maximum number of tags allowed per element (Feature, Rule, Scenario, or Examples). | `8` |

## See also

- `no-duplicate-tags` - removes duplicate tags that inflate tag counts.
- `no-redundant-tags` - removes tags that are redundant due to inheritance.
- `tag-name-pattern` - enforces consistent tag naming conventions.
