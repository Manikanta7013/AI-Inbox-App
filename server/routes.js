import { Router } from 'express';
import { htmlToText } from './content.js';
import { ApiError, asyncRoute, notFoundHandler } from './http.js';
import { log } from './logger.js';
import { answerQuestion } from './rag.js';
import { store } from './store.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', itemCount: store.list().length });
});

apiRouter.post('/ingest', asyncRoute(async (request, response) => {
  const { type, text, url, title } = request.body || {};

  if (!['text', 'url'].includes(type)) {
    throw new ApiError(400, 'INVALID_SOURCE_TYPE', 'type must be "text" or "url"');
  }

  let rawContent;
  let sourceUrl = null;
  let sourceTitle = typeof title === 'string' ? title.trim() : '';

  if (type === 'text') {
    rawContent = typeof text === 'string' ? text.trim() : '';
    if (!rawContent) throw new ApiError(400, 'TEXT_REQUIRED', 'text is required');
    if (rawContent.length > 500_000) throw new ApiError(413, 'TEXT_TOO_LARGE', 'text must be 500,000 characters or fewer');
    sourceTitle ||= 'Untitled note';
  } else {
    if (typeof url !== 'string') throw new ApiError(400, 'URL_REQUIRED', 'url is required');

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new ApiError(400, 'INVALID_URL', 'url must be a valid absolute URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ApiError(400, 'UNSUPPORTED_URL_PROTOCOL', 'only HTTP(S) URLs are allowed');
    }

    let fetched;
    try {
      fetched = await fetch(parsed, {
        redirect: 'follow',
        signal: AbortSignal.timeout(10_000),
        headers: { 'User-Agent': 'AI-Knowledge-Inbox/1.0' },
      });
    } catch (error) {
      log('error', 'source_fetch_failed', { requestId: request.requestId, url: parsed.toString(), message: error.message });
      throw new ApiError(504, 'SOURCE_FETCH_TIMEOUT', 'the source URL could not be reached');
    }

    if (!fetched.ok) {
      throw new ApiError(502, 'SOURCE_HTTP_ERROR', `source returned HTTP ${fetched.status}`);
    }

    const contentType = fetched.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new ApiError(415, 'UNSUPPORTED_SOURCE_CONTENT', 'URL must return HTML or plain text');
    }

    const body = await fetched.text();
    rawContent = htmlToText(body);
    if (!rawContent) throw new ApiError(422, 'NO_READABLE_CONTENT', 'no readable content found at URL');

    sourceUrl = parsed.toString();
    const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
    sourceTitle ||= titleMatch?.[1]?.trim() || parsed.hostname;
  }

  const item = store.add({
    title: sourceTitle.slice(0, 120),
    rawContent,
    sourceType: type,
    sourceUrl,
  });

  log('info', 'item_ingested', {
    requestId: request.requestId,
    itemId: item.id,
    sourceType: type,
    characters: rawContent.length,
  });

  response.status(201).json({ item: store.list().find((entry) => entry.id === item.id) });
}));

apiRouter.get('/items', (_request, response) => {
  response.json({ items: store.list() });
});

apiRouter.post('/query', asyncRoute(async (request, response) => {
  const question = typeof request.body?.question === 'string' ? request.body.question.trim() : '';

  if (!question) throw new ApiError(400, 'QUESTION_REQUIRED', 'question is required');
  if (question.length > 1_000) throw new ApiError(400, 'QUESTION_TOO_LONG', 'question must be 1000 characters or fewer');

  const result = await answerQuestion(question);
  log('info', 'query_answered', {
    requestId: request.requestId,
    questionLength: question.length,
    sourceCount: result.sources.length,
  });

  response.json(result);
}));

apiRouter.use(notFoundHandler);
