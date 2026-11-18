import crypto from 'node:crypto';

export function embed(text) {
  const dimensions = 256;
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const terms = normalized.split(/\s+/).filter(Boolean);
  for (const term of terms) {
    for (let n = 1; n <= Math.min(3, term.length); n++) {
      for (let i = 0; i <= term.length - n; i++) {
        const gram = term.slice(i, i + n);
        const hash = crypto.createHash('sha256').update(gram).digest();
        const index = hash.readUInt16LE(0) % dimensions;
        vector[index] += 1;
      }
    }
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm ? vector.map((value) => value / norm) : vector;
}

export function cosine(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
