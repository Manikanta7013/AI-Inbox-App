# AI Knowledge Inbox

A minimal full-stack RAG app for saving text notes or web URLs and asking questions over the saved content.

## Run

```powershell
npm install
npm run build
npm start
```

Open http://127.0.0.1:3001.

For development with hot reload:

```powershell
npm run dev
```

Set `OPENAI_API_KEY` to enable LLM-generated answers. Set `OPENAI_MODEL` to override the default `gpt-4o-mini`. Without a key, the app uses a local extractive fallback.

## API

- `POST /api/ingest` — `{ "type": "text", "title": "Optional", "text": "..." }` or `{ "type": "url", "title": "Optional", "url": "https://..." }`
- `GET /api/items` — list saved items
- `POST /api/query` — `{ "question": "..." }`

## Implementation notes

- **Chunking:** 900-character chunks with 150-character overlap and sentence-boundary preference. This preserves context while keeping each retrieval unit manageable.
- **Embeddings:** deterministic hashed character/n-gram vectors, so the app works without API credentials. OpenAI embeddings can replace this layer with a durable design.
- **Vector store:** in-memory cosine-similarity store. It is simple and suitable for a single session/demo; no external database setup is required.
- **Scale limits:** data is lost on restart and grows linearly in RAM; searches are brute-force O(n). For scale, use SQLite/Postgres plus pgvector or a dedicated vector database, async ingestion, pagination, and tenant isolation.
- **Production changes:** persistent storage, ingestion queues, signed URL-fetch policies and SSRF protection, API rate limits, retries, observability, authentication, and cache results.
