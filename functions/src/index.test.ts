import assert from 'node:assert/strict';
import test from 'node:test';

import { pushContent } from './index.js';

test('builds only supported push payloads', () => {
  assert.match(pushContent('proof_reminder', { result: 'yes' })?.body ?? '', /YES/);
  assert.equal(pushContent('author_failed', {}), null);
});
