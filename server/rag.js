import OpenAI from 'openai';
import { cosine, embed } from './embeddings.js';
import { store } from './store.js';

function extractAnswer(question, matches) {
  const sentences = matches.flatMap((match) => match.text.match(/[^.!?]+[.!?]?/g) || [match.text]).map((s) => s.trim()).filter(Boolean);
  const terms = question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((term) => term.length > 2);
  const ranked = sentences.map((sentence) => ({ sentence, score: terms.reduce((sum, term) => sum + (sentence.toLowerCase().includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.sentence || matches[0]?.text || 'I could not find relevant information in the saved content.';
}

export async function answerQuestion(question, topK = 4) {
  const queryEmbedding = embed(question);
  const ranked = store.chunks.map((chunk) => ({ ...chunk, score: cosine(queryEmbedding, chunk.embedding) })).sort((a, b) => b.score - a.score).slice(0, topK);
  const matches = ranked.map((chunk) => {
    const item = store.findChunkItem(chunk);
    return { chunkId: chunk.id, itemId: chunk.itemId, title: item?.title || 'Untitled', sourceType: item?.sourceType, sourceUrl: item?.sourceUrl, text: chunk.text, score: Number(chunk.score.toFixed(4)) };
  });
  if (!matches.length) return { answer: 'No saved content is available yet.', sources: [] };

  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const context = matches.map((match, index) => `[${index + 1}] ${match.title}: ${match.text}`).join('\n\n');
      const response = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.2, messages: [{ role: 'system', content: 'Answer only from the supplied context. Cite claims using [n] notation. If context is insufficient, say so.' }, { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }] });
      return { answer: response.choices[0]?.message?.content || extractAnswer(question, matches), sources: matches };
    } catch (error) {
      console.error(JSON.stringify({ level: 'error', event: 'llm_error', message: error.message }));
    }
  }
  return { answer: extractAnswer(question, matches), sources: matches };
}
