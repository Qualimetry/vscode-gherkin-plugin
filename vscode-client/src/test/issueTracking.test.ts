import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    bareRuleKey,
    computeLineHash,
    lineHashAt,
    matchAll,
    matchIssue,
    qualifyRuleKey,
    type LocalIssue,
} from '../issueTracking';
import type { ServerIssue } from '../sonarIssues';

const COMPONENT = 'my-project:features/login.feature';

function serverIssue(overrides: Partial<ServerIssue> & { key: string }): ServerIssue {
    return {
        rule: 'qualimetry-gherkin:unique-scenario-names',
        component: COMPONENT,
        message: 'Duplicate scenario name',
        status: 'OPEN',
        transitions: [],
        ...overrides,
    };
}

function localIssue(overrides: Partial<LocalIssue> = {}): LocalIssue {
    return {
        ruleKey: 'unique-scenario-names',
        component: COMPONENT,
        line: 10,
        message: 'Duplicate scenario name',
        ...overrides,
    };
}

test('qualifies a bare rule key and leaves an already-qualified one alone', () => {
    assert.equal(qualifyRuleKey('unique-scenario-names'), 'qualimetry-gherkin:unique-scenario-names');
    assert.equal(
        qualifyRuleKey('qualimetry-gherkin:unique-scenario-names'),
        'qualimetry-gherkin:unique-scenario-names'
    );
    assert.equal(bareRuleKey('qualimetry-gherkin:unique-scenario-names'), 'unique-scenario-names');
});

test('line hash ignores all whitespace so reindentation does not break identity', () => {
    assert.equal(computeLineHash('  Scenario: login  '), computeLineHash('Scenario:login'));
    assert.notEqual(computeLineHash('Scenario: login'), computeLineHash('Scenario: logout'));
});

test('lineHashAt is 1-based and returns nothing outside the file', () => {
    const lines = ['Feature: a', 'Scenario: b'];
    assert.equal(lineHashAt(lines, 1), computeLineHash('Feature: a'));
    assert.equal(lineHashAt(lines, 2), computeLineHash('Scenario: b'));
    assert.equal(lineHashAt(lines, 0), undefined);
    assert.equal(lineHashAt(lines, 3), undefined);
});

test('a sole candidate on the same rule and component matches', () => {
    const issues = [serverIssue({ key: 'AAA', line: 42 })];
    assert.equal(matchIssue(localIssue(), issues)?.key, 'AAA');
});

test('ignores issues from another rule or another file', () => {
    const issues = [
        serverIssue({ key: 'OTHER_RULE', rule: 'qualimetry-gherkin:feature-name-required' }),
        serverIssue({ key: 'OTHER_FILE', component: 'my-project:features/other.feature' }),
    ];
    assert.equal(matchIssue(localIssue(), issues), undefined);
});

test('hash and line together pick the right issue out of several on one rule', () => {
    const hash = computeLineHash('Scenario: login');
    const issues = [
        serverIssue({ key: 'SAME_LINE_OTHER_HASH', line: 10, hash: computeLineHash('Scenario: other') }),
        serverIssue({ key: 'WANTED', line: 10, hash }),
        serverIssue({ key: 'OTHER_LINE', line: 30, hash }),
    ];
    assert.equal(matchIssue(localIssue({ hash }), issues)?.key, 'WANTED');
});

test('hash still matches when the code moved to a different line', () => {
    const hash = computeLineHash('Scenario: login');
    const issues = [
        serverIssue({ key: 'MOVED', line: 4, hash }),
        serverIssue({ key: 'ELSEWHERE', line: 40, hash: computeLineHash('Scenario: other') }),
    ];
    assert.equal(matchIssue(localIssue({ line: 12, hash }), issues)?.key, 'MOVED');
});

test('falls back to line and message when no hash is available locally', () => {
    const issues = [
        serverIssue({ key: 'WANTED', line: 10, message: 'Duplicate scenario name' }),
        serverIssue({ key: 'OTHER', line: 11, message: 'Duplicate scenario name' }),
    ];
    assert.equal(matchIssue(localIssue(), issues)?.key, 'WANTED');
});

test('refuses to guess when two issues remain indistinguishable', () => {
    const issues = [
        serverIssue({ key: 'FIRST', line: 10, message: 'Duplicate scenario name' }),
        serverIssue({ key: 'SECOND', line: 10, message: 'Duplicate scenario name' }),
    ];
    assert.equal(matchIssue(localIssue(), issues), undefined);
});

test('refuses to guess when two issues share the same hash on the same line', () => {
    const hash = computeLineHash('Scenario: login');
    const issues = [
        serverIssue({ key: 'FIRST', line: 10, hash }),
        serverIssue({ key: 'SECOND', line: 10, hash }),
    ];
    assert.equal(matchIssue(localIssue({ hash }), issues), undefined);
});

test('matchAll returns only the locals that resolved to a single server issue', () => {
    const issues = [
        serverIssue({ key: 'MATCHED', line: 10, message: 'Duplicate scenario name' }),
        serverIssue({ key: 'TIE_A', line: 20, message: 'Tied' }),
        serverIssue({ key: 'TIE_B', line: 20, message: 'Tied' }),
    ];
    const matches = matchAll(
        [localIssue(), localIssue({ line: 20, message: 'Tied' }), localIssue({ line: 99, message: 'Absent' })],
        issues
    );
    assert.deepEqual(matches.map((m) => m.server.key), ['MATCHED']);
});
