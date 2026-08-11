import app from './app.js';
import { ensureSchema, getQuery } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const PORT = process.env.PORT || 3001;

// Entrypoint de desenvolvimento local. Em produção (Vercel) quem sobe o app é
// api/index.js, que não semeia o banco — veja o README.
const startServer = async () => {
  try {
    await ensureSchema();

    // Auto-seed apenas quando o banco ainda está vazio, para não apagar dados
    // locais a cada restart do nodemon.
    const escola = await getQuery('SELECT id FROM escolas LIMIT 1');
    if (!escola) {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor SinergIA REST API v1 rodando na porta ${PORT}`);
      console.log(`📡 Endpoints disponíveis em: http://localhost:${PORT}/api/v1/info`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor backend:', err);
  }
};

startServer();
