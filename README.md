# AI Knowledge Inbox

A minimal full-stack RAG app for saving text notes or web URLs and asking questions over the saved content.

The frontend is built with React and TypeScript. The Express API and RAG services remain Node.js JavaScript.

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

## Design and trade-offs

### Chunking rationale

Text is normalized and split into 900-character chunks with a 150-character overlap. The chunker prefers a nearby sentence boundary while the overlap reduces context loss across chunk boundaries. The trade-off is more chunks and slightly more storage/search work in exchange for better retrieval continuity.

### Vector store choice

The demo uses an in-memory store with deterministic hashed n-gram vectors and brute-force cosine similarity. This requires no credentials or infrastructure and makes the prototype portable. It is not production-grade semantic retrieval: it has no ANN index, persistence, tenant isolation, or re-ranking.

### What breaks at scale

- Process memory grows with items and vectors, and data is lost on restart.
- Every query performs O(n) similarity comparisons.
- URL ingestion and LLM calls block the request until completion.
- The store has no authentication, quotas, concurrency controls, or data isolation.
- Large documents create more chunks and increase query latency and LLM context usage.

### Production changes

Use Postgres with pgvector or a managed vector database, real embedding and reranking models, object storage for source bodies, queue-based ingestion, pagination, authentication, tenant isolation, rate limits, retries/timeouts, and distributed structured tracing.

## Debuggability

- API requests and failures emit JSON structured logs with timestamps, request IDs, routes, durations, status codes, and relevant events.
- API errors return a consistent `{ error: { code, message } }` shape and a matching HTTP status.
- `GET /api/health` provides a lightweight service health and item-count signal.

## Code quality

- React state/composition is in `App.tsx`; UI sections are in focused components under `src/components`.
- API types and network functions are separated into `types.ts` and `utils.ts`.
- Express composition, routes, HTTP errors, logging, storage, chunking, embeddings, and RAG retrieval are separate modules.

## Implementation notes

- **Chunking:** 900-character chunks with 150-character overlap and sentence-boundary preference. This preserves context while keeping each retrieval unit manageable.
- **Embeddings:** deterministic hashed character/n-gram vectors, so the app works without API credentials. OpenAI embeddings can replace this layer with a durable design.
- **Vector store:** in-memory cosine-similarity store. It is simple and suitable for a single session/demo; no external database setup is required.
- **Scale limits:** data is lost on restart and grows linearly in RAM; searches are brute-force O(n). For scale, use SQLite/Postgres plus pgvector or a dedicated vector database, async ingestion, pagination, and tenant isolation.
- **Production changes:** persistent storage, ingestion queues, signed URL-fetch policies and SSRF protection, API rate limits, retries, observability, authentication, and cache results.
