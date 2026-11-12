import test from 'node:test';
import assert from 'node:assert/strict';
import { pageArgs } from '../src/utils/http.js';

test('pagination defaults and caps page size', () => {
  assert.deepEqual(pageArgs({}), { skip: 0, take: 20, page: 1, limit: 20 });
  assert.deepEqual(pageArgs({ page: '3', limit: '1000' }), { skip: 100, take: 50, page: 3, limit: 50 });
});
