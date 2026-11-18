import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToText } from './content.js';
import { store } from './store.js';
import { answerQuestion } from './rag.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json({ limit: '2mb' }));

function log(level, event, details = {}) { console.log(JSON.stringify({ level, event, timestamp: new Date().toISOString(), ...details })); }

app.post('/api/ingest', async (req, res) => {
  try {
    const { type, text, url, title } = req.body || {};
    if (!['text', 'url'].includes(type)) return res.status(400).json({ error: 'type must be "text" or "url"' });
    let rawContent; let sourceUrl = null; let sourceTitle = title?.trim();
    if (type === 'text') {
      rawContent = text?.trim();
      if (!rawContent) return res.status(400).json({ error: 'text is required' });
      sourceTitle ||= 'Untitled note';
    } else {
      let parsed;
      try { parsed = new URL(url); } catch { return res.status(400).json({ error: 'url must be a valid absolute URL' }); }
      if (!['http:', 'https:'].includes(parsed.protocol)) return res.status(400).json({ error: 'only HTTP(S) URLs are allowed' });
      const response = await fetch(parsed, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'AI-Knowledge-Inbox/1.0' } });
      if (!response.ok) return res.status(502).json({ error: `source returned HTTP ${response.status}` });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) return res.status(415).json({ error: 'URL must return HTML or plain text' });
      const body = await response.text(); rawContent = htmlToText(body);
      if (!rawContent) return res.status(422).json({ error: 'no readable content found at URL' });
      sourceUrl = parsed.toString();
      const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
      sourceTitle ||= titleMatch?.[1]?.trim() || parsed.hostname;
    }
    const item = store.add({ title: sourceTitle.slice(0, 120), rawContent, sourceType: type, sourceUrl });
    log('info', 'item_ingested', { itemId: item.id, sourceType: type, characters: rawContent.length });
    res.status(201).json({ item: store.list().find((entry) => entry.id === item.id) });
  } catch (error) { log('error', 'ingest_error', { message: error.message }); res.status(502).json({ error: 'failed to ingest content' }); }
});

app.get('/api/items', (_req, res) => res.json({ items: store.list() }));
app.post('/api/query', async (req, res) => {
  const question = req.body?.question?.trim();
  if (!question) return res.status(400).json({ error: 'question is required' });
  if (question.length > 1000) return res.status(400).json({ error: 'question must be 1000 characters or fewer' });
  try { const result = await answerQuestion(question); log('info', 'query_answered', { questionLength: question.length, sourceCount: result.sources.length }); res.json(result); }
  catch (error) { log('error', 'query_error', { message: error.message }); res.status(500).json({ error: 'failed to answer question' }); }
});

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*splat', (_req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
app.listen(port, () => log('info', 'server_started', { port }));
