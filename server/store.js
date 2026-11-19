import crypto from 'node:crypto';
import { chunkText } from './content.js';
import { embed } from './embeddings.js';

export class MemoryStore {
  constructor() { this.items = []; this.chunks = []; }
  add({ title, rawContent, sourceType, sourceUrl = null }) {
    const item = { id: crypto.randomUUID(), title, rawContent, sourceType, sourceUrl, createdAt: new Date().toISOString() };
    this.items.unshift(item);
    for (const [index, text] of chunkText(rawContent).entries()) {
      this.chunks.push({ id: crypto.randomUUID(), itemId: item.id, text, chunkIndex: index, embedding: embed(text) });
    }
    return item;
  }
  list() { return this.items.map(({ rawContent, ...item }) => ({ ...item, preview: rawContent.slice(0, 180) })); }
  findChunkItem(chunk) { return this.items.find((item) => item.id === chunk.itemId); }
}

export const store = new MemoryStore();
