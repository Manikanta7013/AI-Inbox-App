import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorHandler } from './http.js';
import { log, requestLoggingMiddleware } from './logger.js';
import { apiRouter } from './routes.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(requestLoggingMiddleware);
app.use('/api', apiRouter);

app.use(express.static(path.join(dirname, '../dist')));
app.get('*splat', (_request, response) => {
  response.sendFile(path.join(dirname, '../dist/index.html'));
});

app.use(errorHandler);

app.listen(port, () => {
  log('info', 'server_started', { port });
});
