import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { ensureSchema } from './db/database.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Garante o schema antes de qualquer rota tocar o banco (importante em
// serverless, onde não existe um "boot" único como no listen local).
app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error('❌ Falha ao inicializar o schema do banco:', err);
    res.status(500).json({ error: 'Banco de dados indisponível', detail: err.message });
  }
});

// API REST v1 Namespace (Eixo 3 TCC)
// Montado nos dois prefixos porque na Vercel o rewrite /api/v1/* -> /api pode
// entregar a rota à função já sem o segmento /api.
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado', path: req.originalUrl });
});

export default app;
