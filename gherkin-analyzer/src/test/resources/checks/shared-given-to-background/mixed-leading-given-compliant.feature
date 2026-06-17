Feature: Add numbers with a differing leading Given

  Scenario: Repeats the common given in a plain scenario
    Given the first number is '60'
    And the second number is '70'
    When the two numbers are added
    Then the result should be '120'

  Scenario Outline: Repeats the common given in a scenario outline
    Given the first number is '<First>'
    And the second number is '70'
    When the two numbers are added
    Then the result should be '<Result>'

    Examples:
      | First | Result |
      | 50    | 120    |
      | 30    | 100    |
