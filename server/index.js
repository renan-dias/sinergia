import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { initSchema } from './db/database.js';
import { seedDatabase } from './db/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API REST v1 Namespace (Eixo 3 TCC)
app.use('/api/v1', apiRouter);

// Initialize DB and start server
const startServer = async () => {
  try {
    await initSchema();
    // Auto-seed if database is freshly created or empty
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor SinergIA REST API v1 rodando na porta ${PORT}`);
      console.log(`📡 Endpoints disponíveis em: http://localhost:${PORT}/api/v1/info`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor backend:', err);
  }
};

startServer();
