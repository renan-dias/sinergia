import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../sinergia.db');

// Enable verbose logging for development if needed
const sqlite = sqlite3.verbose();

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('⚡ Conectado ao banco de dados SQLite SinergIA:', dbPath);
  }
});

// Utility functions to wrap sqlite3 with Promises for async/await usage
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize Database Schemas
export const initSchema = async () => {
  const schemaSQL = `
    PRAGMA foreign_keys = ON;

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

  return new Promise((resolve, reject) => {
    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error('❌ Erro ao criar schema do banco:', err.message);
        reject(err);
      } else {
        console.log('✅ Schema do SQLite SinergIA verificado/inicializado com sucesso.');
        resolve(true);
      }
    });
  });
};
