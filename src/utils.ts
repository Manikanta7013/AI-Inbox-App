import type { IngestResponse, ItemsResponse, QueryAnswer } from './types';

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}

async function getApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const data: { error?: { message?: string } | string } = await response.json();
    const message = typeof data.error === 'string' ? data.error : data.error?.message;
    return new Error(message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function loadItems(): Promise<ItemsResponse> {
  const response = await fetch('/api/items');
  if (!response.ok) throw await getApiError(response, 'Could not load saved items');
  return response.json();
}

export async function ingestItem(
  tab: 'text' | 'url',
  title: string,
  text: string,
  url: string,
): Promise<IngestResponse> {
  const body = tab === 'text' ? { type: 'text', title, text } : { type: 'url', title, url };
  const response = await fetch('/api/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await getApiError(response, 'Could not ingest content');
  return response.json();
}

export async function askQuestion(question: string): Promise<QueryAnswer> {
  const response = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!response.ok) throw await getApiError(response, 'Could not answer question');
  return response.json();
}
