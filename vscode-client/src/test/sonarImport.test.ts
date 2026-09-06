import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveProfileKey, type QualityProfile } from '../sonarImport';

/**
 * The IntelliJ client resolves a profile with the same ladder (exact key or name, then
 * substring, then a hard failure). Both clients must agree or the two IDEs silently analyse
 * against different rule sets.
 */
const PROFILES: QualityProfile[] = [
    { key: 'gh-001', name: 'Qualimetry Gherkin', language: 'gherkin', isDefault: true },
    { key: 'gh-002', name: 'Team Overrides', language: 'gherkin' },
];

test('an exact key wins', () => {
    assert.equal(resolveProfileKey(PROFILES, 'gh-002'), 'gh-002');
});

test('an exact name wins and is case insensitive', () => {
    assert.equal(resolveProfileKey(PROFILES, 'Qualimetry Gherkin'), 'gh-001');
    assert.equal(resolveProfileKey(PROFILES, 'qualimetry gherkin'), 'gh-001');
});

test('an exact match is preferred over a substring match', () => {
    const profiles: QualityProfile[] = [
        { key: 'a', name: 'Qualimetry Gherkin Extended', language: 'gherkin' },
        { key: 'b', name: 'Qualimetry Gherkin', language: 'gherkin' },
    ];
    assert.equal(resolveProfileKey(profiles, 'Qualimetry Gherkin'), 'b');
});

test('a substring is accepted when nothing matches exactly', () => {
    assert.equal(resolveProfileKey(PROFILES, 'Overrides'), 'gh-002');
});

test('an unknown name resolves to nothing rather than an arbitrary profile', () => {
    assert.equal(resolveProfileKey(PROFILES, 'Does Not Exist'), undefined);
});
