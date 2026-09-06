# Outline Single Example Row

`outline-single-example-row` &middot; Outline &middot; Code Smell &middot; severity MINOR &middot; optional

A `Scenario Outline` where every `Examples` section has only one data row is functionally identical to a plain `Scenario` with hardcoded values. The parameterization syntax adds structural complexity without providing any variation benefit. Consider converting such outlines to plain `Scenario` blocks.

This is different from the `examples-minimum-rows` rule, which catches `Examples` sections with zero data rows. This rule targets outlines that technically work but gain nothing from parameterization.

## Noncompliant code example

```gherkin
Scenario Outline: User logs in  <!-- Noncompliant -->
  Given the user navigates to the login page
  When the user enters "<username>" and "<password>"
  Then the user should see the dashboard

  Examples:
    | username | password |
    | admin    | secret   |
```

## Compliant solution

```gherkin
Scenario: User logs in
  Given the user navigates to the login page
  When the user enters "admin" and "secret"
  Then the user should see the dashboard
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `maxDataRows` | Maximum data rows per Examples section that triggers the issue (all Examples must be at or below this threshold). | `1` |

## See also

- `examples-minimum-rows` - catches Examples sections with zero data rows.
- `use-scenario-outline-for-examples` - suggests converting duplicate Scenarios into Outlines.
