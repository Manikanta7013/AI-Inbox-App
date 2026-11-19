import test from 'node:test';
import assert from 'node:assert/strict';
import { cosine, embed } from '../server/embeddings.js';

test('embeddings are normalized vectors', () => {
  const vector = embed('knowledge inbox');
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  assert.equal(vector.length, 256);
  assert.ok(Math.abs(norm - 1) < 0.0001);
});

test('cosine gives identical text a higher score than unrelated text', () => {
  const same = cosine(embed('artificial intelligence'), embed('artificial intelligence'));
  const unrelated = cosine(embed('artificial intelligence'), embed('cooking recipes'));

  assert.ok(same > unrelated);
});
