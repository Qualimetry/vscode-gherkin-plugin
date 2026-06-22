# No Byte Order Mark

`no-byte-order-mark` &middot; No &middot; Code Smell &middot; severity MAJOR &middot; enabled in the recommended profile

Gherkin files encoded in UTF-8 should not begin with a Byte Order Mark (BOM). The UTF-8 BOM is the three-byte sequence `EF BB BF` (Unicode character `U+FEFF`) placed at the start of a file. While some Windows editors insert this marker automatically, it is unnecessary for UTF-8 and can cause problems with parsers, build tools, and version control systems that do not expect it.

## Noncompliant code example

File begins with a BOM (shown as `[BOM]`):

```gherkin
[BOM]Feature: Warehouse inventory                    <!-- Noncompliant -->

  Scenario: Receive new stock
    Given a shipment of 100 units arrives
    When the warehouse clerk scans the items
    Then the inventory count increases by 100
```

## Compliant solution

File starts directly with the Feature keyword, no BOM present:

```gherkin
Feature: Warehouse inventory

  Scenario: Receive new stock
    Given a shipment of 100 units arrives
    When the warehouse clerk scans the items
    Then the inventory count increases by 100
```
