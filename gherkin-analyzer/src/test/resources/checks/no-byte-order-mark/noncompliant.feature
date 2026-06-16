# Noncompliant@L1 {{Remove the UTF-8 Byte Order Mark (BOM) from the beginning of this file.}}
Feature: File saved with a byte order mark

  Scenario: Receive new stock
    Given a shipment of 100 units arrives
    When the warehouse clerk scans the items
    Then the inventory count increases by 100
