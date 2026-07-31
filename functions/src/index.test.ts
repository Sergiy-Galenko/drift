import assert from 'node:assert/strict';
import test from 'node:test';

import { pushContent, resolvePollResult } from './index.js';

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
