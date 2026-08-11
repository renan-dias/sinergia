import { createClient } from '@libsql/client';

// Em produção (Vercel) usamos o Turso via TURSO_DATABASE_URL (libsql://...).
// Em desenvolvimento, sem nenhuma variável definida, caímos no arquivo local
// sinergia.db — resolvido a partir do diretório onde o processo foi iniciado
// (a raiz do projeto, que é de onde os scripts do package.json rodam).
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || 'file:sinergia.db';
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

export const db = createClient({
  url: databaseUrl,
  authToken,
  // Devolve INTEGER do SQLite como Number, evitando BigInt no JSON.stringify das rotas
  intMode: 'number'
});

// libSQL devolve objetos Row com propriedades não-enumeráveis por índice.
// Normalizamos para objetos simples antes de entregar às rotas.
const toPlainObject = (row) => (row ? { ...row } : row);

// Utility functions to wrap libSQL with Promises for async/await usage
export const runQuery = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return {
    id: result.lastInsertRowid != null ? Number(result.lastInsertRowid) : undefined,
    changes: result.rowsAffected
  };
};

export const getQuery = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return toPlainObject(result.rows[0]);
};

export const allQuery = async (sql, params = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows.map(toPlainObject);
};

// Initialize Database Schemas
export const initSchema = async () => {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS escolas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      codigo_inep TEXT,
      cidade TEXT NOT NULL,
      uf TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      escola_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      eixo_tecnologico TEXT NOT NULL,
      descricao TEXT,
      FOREIGN KEY (escola_id) REFERENCES escolas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bncc_competencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL,
      area TEXT NOT NULL,
      descricao TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disciplinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      curso_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('FGB', 'TECNICO')) NOT NULL,
      carga_horaria INTEGER NOT NULL,
      bncc_competencia_id INTEGER,
      FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE,
      FOREIGN KEY (bncc_competencia_id) REFERENCES bncc_competencias (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS turmas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      curso_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      ano_letivo INTEGER NOT NULL,
      periodo TEXT NOT NULL,
      FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS professores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      cargo TEXT NOT NULL,
      especialidade TEXT
    );

    CREATE TABLE IF NOT EXISTS professor_disciplina_turma (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      professor_id INTEGER NOT NULL,
      disciplina_id INTEGER NOT NULL,
      turma_id INTEGER NOT NULL,
      FOREIGN KEY (professor_id) REFERENCES professores (id) ON DELETE CASCADE,
      FOREIGN KEY (disciplina_id) REFERENCES disciplinas (id) ON DELETE CASCADE,
      FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma_id INTEGER NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      status TEXT CHECK(status IN ('ativo', 'em_risco', 'evadido')) DEFAULT 'ativo',
      FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS desempenho (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      disciplina_id INTEGER NOT NULL,
      trimestre INTEGER NOT NULL,
      nota REAL NOT NULL,
      faltas INTEGER DEFAULT 0,
      observacao_comportamental TEXT,
      status TEXT CHECK(status IN ('regular', 'em_recuperacao', 'em_observacao')) DEFAULT 'regular',
      FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE,
      FOREIGN KEY (disciplina_id) REFERENCES disciplinas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS relatorios_pedagogicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma_id INTEGER NOT NULL,
      trimestre INTEGER NOT NULL,
      sintese_geral TEXT NOT NULL,
      padroes_coletivos TEXT NOT NULL,
      alunos_atencao_json TEXT NOT NULL,
      sugestoes_encaminhamento TEXT NOT NULL,
      status TEXT CHECK(status IN ('rascunho_ia', 'validado_humano')) DEFAULT 'rascunho_ia',
      revisado_por TEXT,
      modelo_llm TEXT,
      tokens_utilizados INTEGER DEFAULT 0,
      data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_validacao DATETIME,
      FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ponto_biometrico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      data DATE NOT NULL,
      horario_entrada TIME NOT NULL,
      horario_saida TIME,
      local_leitor TEXT DEFAULT 'Portaria Principal ESP32',
      FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS eventos_calendario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('prova', 'atividade', 'projeto', 'evento_escolar')) NOT NULL,
      data DATE NOT NULL,
      descricao TEXT,
      FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
    );
  `;

  try {
    // PRAGMA é por conexão e o Turso remoto pode recusá-la — não é fatal.
    await db.execute('PRAGMA foreign_keys = ON;');
  } catch {
    // segue o jogo: o Turso já aplica integridade referencial por padrão
  }

  await db.executeMultiple(schemaSQL);
  console.log('✅ Schema do SQLite SinergIA verificado/inicializado com sucesso.');
  return true;
};

// Garante que o schema exista uma única vez por processo. Em serverless cada
// cold start roda isto uma vez; requisições subsequentes reaproveitam a Promise.
let schemaPromise = null;
export const ensureSchema = () => {
  if (!schemaPromise) {
    schemaPromise = initSchema().catch((err) => {
      schemaPromise = null; // permite nova tentativa na próxima requisição
      throw err;
    });
  }
  return schemaPromise;
};
