// Entrypoint da Serverless Function da Vercel.
// Todo o tráfego /api/v1/* é reescrito para cá pelo vercel.json e tratado
// pelo mesmo app Express usado em desenvolvimento.
//
// Importante: aqui NÃO rodamos o seed. seedDatabase() apaga todas as tabelas
// antes de repovoar, e um cold start não pode zerar o banco de produção.
// Para carregar os dados de demonstração use a tela de setup (POST /load-demo).
import app from '../server/app.js';

export default app;
