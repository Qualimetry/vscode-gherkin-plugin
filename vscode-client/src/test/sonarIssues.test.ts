import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    selectAcceptTransition,
    selectFalsePositiveTransition,
    supportsAcceptTransition,
    TRANSITION_ACCEPT,
    TRANSITION_FALSE_POSITIVE,
    TRANSITION_WONT_FIX,
} from '../sonarIssues';

test('the transitions the server offers decide the verb', () => {
    assert.equal(selectAcceptTransition([TRANSITION_ACCEPT, 'confirm'], '9.9'), TRANSITION_ACCEPT);
    assert.equal(selectAcceptTransition([TRANSITION_WONT_FIX, 'confirm'], '25.1'), TRANSITION_WONT_FIX);
});

test('an empty transition list means this user may not act on the issue', () => {
    assert.equal(selectAcceptTransition(['confirm'], '25.1'), undefined);
    assert.equal(selectFalsePositiveTransition(['confirm']), undefined);
});

test('falls back to the server version only when no transitions were supplied', () => {
    assert.equal(selectAcceptTransition([], '10.4'), TRANSITION_ACCEPT);
    assert.equal(selectAcceptTransition([], '10.3'), TRANSITION_WONT_FIX);
    assert.equal(selectFalsePositiveTransition([]), TRANSITION_FALSE_POSITIVE);
});

test('accept replaced wontfix in 10.4', () => {
    assert.equal(supportsAcceptTransition('10.4'), true);
    assert.equal(supportsAcceptTransition('10.4.1.88267'), true);
    assert.equal(supportsAcceptTransition('10.5'), true);
    assert.equal(supportsAcceptTransition('25.5.0.107428'), true);
    assert.equal(supportsAcceptTransition('10.3'), false);
    assert.equal(supportsAcceptTransition('9.9.1'), false);
});

test('an unknown version is treated as legacy so we never target a missing transition', () => {
    assert.equal(supportsAcceptTransition(undefined), false);
    assert.equal(supportsAcceptTransition(''), false);
    assert.equal(supportsAcceptTransition('not-a-version'), false);
});
