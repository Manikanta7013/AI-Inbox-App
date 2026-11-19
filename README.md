# AI Knowledge Inbox

A full-stack app for saving text notes or web pages and asking questions about the saved content.

- **GitHub:** https://github.com/Manikanta7013/AI-Inbox-App
- **Live demo:** https://ai-inbox-app.onrender.com

## Run locally

Prerequisite: Node.js 20.19+ (or 22.12+) and npm.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The development server starts the React frontend and Express API together.

To run the production build locally:

```powershell
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3001.

## Verify

```powershell
npm test
npm run typecheck
npm run build
```

## Design decisions and tradeoffs

- **Frontend and API:** React with TypeScript for the UI, and Express on Node.js for the API. Vite serves the frontend during development and builds static assets for the Express server in production.
- **Chunking:** Text is split into 900-character chunks with 150-character overlap. Sentence-boundary preference improves readability; overlap reduces context loss between chunks.
- **Retrieval:** A lightweight in-memory store uses deterministic hashed n-gram vectors and cosine similarity. This avoids external infrastructure and credentials, but is less semantically capable than a dedicated embedding model and vector database.
- **Answers:** Set `OPENAI_API_KEY` to enable generated answers; without it, the app uses a local extractive fallback.
- **Limitations:** Data is in memory and is lost when the server restarts. Searches are brute-force, and the app has no authentication or tenant isolation, so it is a prototype rather than a durable multi-user service. The hosted free demo may sleep after inactivity.

## API

- `GET /api/health` — service health and item count
- `GET /api/items` — list saved items
- `POST /api/ingest` — ingest `{ "type": "text", "title": "Optional", "text": "..." }` or `{ "type": "url", "title": "Optional", "url": "https://..." }`
- `POST /api/query` — ask `{ "question": "..." }`
