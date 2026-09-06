# Data Table Max Columns

`data-table-max-columns` &middot; Data &middot; Code Smell &middot; severity MINOR &middot; optional

Checks that data tables (in steps or `Examples` sections) do not exceed a configurable column count. Wide data tables are difficult to read in editors and code reviews, and usually indicate that the step is doing too much or that the test data model needs restructuring.

The default limit is 10 columns. Teams can adjust this threshold based on their project conventions and screen width preferences.

## Noncompliant code example

With `maxColumns` set to `5`:

```gherkin
Scenario: Create user with full profile  <!-- Noncompliant -->
  Given the following user data:
    | name  | email       | phone    | address  | city    | country |
    | Alice | a@test.com  | 555-0101 | 123 Main | Seattle | US      |
```

## Compliant solution

```gherkin
Scenario: Create user with full profile
  Given the following user data:
    | name  | email       | phone    |
    | Alice | a@test.com  | 555-0101 |
  And the user address is:
    | address  | city    | country |
    | 123 Main | Seattle | US      |
```

## Configuration

| Parameter | Description | Default |
|---|---|---|
| `maxColumns` | Maximum number of columns allowed in a data table (step or Examples). | `10` |

## See also

- `examples-column-coverage` - ensures Examples columns are used in step placeholders.
- `examples-minimum-rows` - ensures Examples sections have sufficient data rows.
