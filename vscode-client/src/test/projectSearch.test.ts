import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSearchScheduler, truncationNotice } from '../projectSearch';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('rapid keystrokes collapse into a single request for the final query', async () => {
    const queries: string[] = [];
    const results: string[] = [];
    const scheduler = createSearchScheduler<string>(
        async (query) => {
            queries.push(query);
            return query.toUpperCase();
        },
        (_query, result) => results.push(result),
        () => assert.fail('should not error'),
        10
    );

    scheduler.schedule('c');
    scheduler.schedule('ch');
    scheduler.schedule('che');
    await wait(60);

    assert.deepEqual(queries, ['che']);
    assert.deepEqual(results, ['CHE']);
    scheduler.dispose();
});

test('a superseded request is abandoned rather than delivered late', async () => {
    const results: string[] = [];
    const scheduler = createSearchScheduler<string>(
        async (query, signal) => {
            await wait(query === 'slow' ? 40 : 0);
            if (signal.aborted) {
                throw new Error('aborted');
            }
            return query;
        },
        (_query, result) => results.push(result),
        () => undefined,
        5
    );

    scheduler.schedule('slow');
    await wait(15);
    scheduler.schedule('fast');
    await wait(80);

    assert.deepEqual(results, ['fast']);
    scheduler.dispose();
});

test('disposing stops a pending query from being delivered', async () => {
    const results: string[] = [];
    const scheduler = createSearchScheduler<string>(
        async (query) => query,
        (_query, result) => results.push(result),
        () => undefined,
        10
    );

    scheduler.schedule('anything');
    scheduler.dispose();
    await wait(40);

    assert.deepEqual(results, []);
});

test('search failures are reported without stopping later searches', async () => {
    const errors: string[] = [];
    const results: string[] = [];
    const scheduler = createSearchScheduler<string>(
        async (query) => {
            if (query === 'bad') {
                throw new Error('boom');
            }
            return query;
        },
        (_query, result) => results.push(result),
        (query) => errors.push(query),
        5
    );

    scheduler.schedule('bad');
    await wait(30);
    scheduler.schedule('good');
    await wait(30);

    assert.deepEqual(errors, ['bad']);
    assert.deepEqual(results, ['good']);
    scheduler.dispose();
});

test('a result set larger than the page reports what was withheld', () => {
    assert.equal(
        truncationNotice({ projects: new Array(50).fill({ key: 'k', name: 'n' }), total: 1284, truncated: true }),
        'Showing 50 of 1284 projects - keep typing to narrow.'
    );
    assert.equal(
        truncationNotice({ projects: [{ key: 'k', name: 'n' }], total: 1, truncated: false }),
        undefined
    );
});
