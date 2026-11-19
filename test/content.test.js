import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkText, htmlToText } from '../server/content.js';

test('chunkText creates bounded chunks with overlap', () => {
  const text = 'A'.repeat(900) + '.' + 'B'.repeat(500);
  const chunks = chunkText(text, 900, 150);

  assert.ok(chunks.length >= 2);
  assert.ok(chunks.every((chunk) => chunk.length > 0));
});

test('chunkText returns no chunks for whitespace', () => {
  assert.deepEqual(chunkText('   \n '), []);
});

test('htmlToText removes scripts, styles, and tags', () => {
  const html = '<html><style>.x{}</style><script>alert(1)</script><h1>Hello</h1><p>World &amp; friends</p></html>';
  const text = htmlToText(html);

  assert.match(text, /Hello/);
  assert.match(text, /World & friends/);
  assert.doesNotMatch(text, /alert|\.x/);
});
