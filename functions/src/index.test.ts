import assert from 'node:assert/strict';
import test from 'node:test';

import { pushContent, rankingPoints, resolvePollResult } from './index.js';

test('builds only supported push payloads', () => {
  assert.match(pushContent('proof_reminder', { result: 'yes' })?.body ?? '', /YES/);
  assert.equal(pushContent('author_failed', {}), null);
});

test('uses ranking scores to resolve a custom poll', () => {
  assert.equal(resolvePollResult({
    pollType: 'ranking',
    pollOptions: [{ id: 'option1', label: 'First' }, { id: 'option2', label: 'Second' }],
    optionTallies: { option1: 4, option2: 5 },
  }), 'option2');
});

test('assigns descending points to every ranked option', () => {
  assert.deepEqual(
    rankingPoints([{ id: 'option1', label: 'First' }, { id: 'option2', label: 'Second' }, { id: 'option3', label: 'Third' }], ['option3', 'option1', 'option2']),
    { option3: 3, option1: 2, option2: 1 },
  );
});

test('resolves a binary vote without relying on client state', () => {
  assert.equal(resolvePollResult({ pollType: 'binary', votesYes: 4, votesNo: 5 }), 'no');
});
