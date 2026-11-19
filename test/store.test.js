import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from '../server/store.js';

test('store creates an item and does not expose raw content in list', () => {
  const store = new MemoryStore();
  const item = store.add({
    title: 'Test source',
    rawContent: 'Knowledge base content.',
    sourceType: 'text',
  });

  const listed = store.list()[0];
  assert.equal(listed.id, item.id);
  assert.equal(listed.preview, 'Knowledge base content.');
  assert.equal('rawContent' in listed, false);
});
