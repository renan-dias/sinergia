import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';

const router = express.Router();

// --- RESET DATABASE (CLEAN STATE) ---
router.post('/reset-db', async (req, res) => {
  try {
    const tables = [
      'eventos_calendario',
      'ponto_biometrico',
      'relatorios_pedagogicos',
      'desempenho',
      'alunos',
      'professor_disciplina_turma',
      'professores',
      'turmas',
      'disciplinas',
      'bncc_competencias',
      'cursos',
      'escolas'
    ];

    for (const table of tables) {
      await runQuery(`DELETE FROM ${table};`);
      await runQuery(`DELETE FROM sqlite_sequence WHERE name='${table}';`).catch(() => {});
    }

    res.json({ success: true, message: 'Banco de dados limpo com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOAD DEMO DATA ---
router.post('/load-demo', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Dados de demonstração carregados com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETUP CUSTOM SCHOOL WIZARD BATCH ---
router.post('/setup-school', async (req, res) => {
  try {
    const { escola, cursos, disciplinas, professores, turmas } = req.body;

    if (!escola?.nome) {
      return res.status(400).json({ error: 'Nome da escola é obrigatório.' });
    }

    // 1. Create School
    const escolaRes = await runQuery(
      `INSERT INTO escolas (nome, codigo_inep, cidade, uf) VALUES (?, ?, ?, ?)`,
      [escola.nome, escola.codigo_inep || '', escola.cidade || '', escola.uf || '']
    );
    const escolaId = escolaRes.id;

    // 2. Create Courses
    const cursoMap = {};
    if (Array.isArray(cursos)) {
      for (const c of cursos) {
        if (c.nome) {
          const cRes = await runQuery(
            `INSERT INTO cursos (escola_id, nome, eixo_tecnologico, descricao) VALUES (?, ?, ?, ?)`,
            [escolaId, c.nome, c.eixo_tecnologico || 'Informação e Comunicação', c.descricao || '']
          );
          cursoMap[c.nome] = cRes.id;
        }
      }
    }

    // 3. Create Subjects
    if (Array.isArray(disciplinas)) {
      for (const d of disciplinas) {
        const targetCursoId = cursoMap[d.curso_nome] || Object.values(cursoMap)[0] || 1;
        await runQuery(
          `INSERT INTO disciplinas (curso_id, nome, tipo, carga_horaria) VALUES (?, ?, ?, ?)`,
          [targetCursoId, d.nome, d.tipo || 'TECNICO', d.carga_horaria || 80]
        );
      }
    }

    // 4. Create Teachers
    if (Array.isArray(professores)) {
      for (const p of professores) {
        if (p.nome) {
          await runQuery(
            `INSERT INTO professores (nome, email, cargo, especialidade) VALUES (?, ?, ?, ?)`,
            [p.nome, p.email || `${p.nome.toLowerCase().replace(/\s+/g, '.')}@escola.edu.br`, p.cargo || 'Docente EBTT', p.especialidade || '']
          );
        }
      }
    }

    // 5. Create Classes
    if (Array.isArray(turmas)) {
      for (const t of turmas) {
        const targetCursoId = cursoMap[t.curso_nome] || Object.values(cursoMap)[0] || 1;
        await runQuery(
          `INSERT INTO turmas (curso_id, nome, ano_letivo, periodo) VALUES (?, ?, ?, ?)`,
          [targetCursoId, t.nome, t.ano_letivo || 2026, t.periodo || '1º Semestre']
        );
      }
    }

    res.json({ success: true, escola_id: escolaId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ESCOLAS ---
router.get('/escolas', async (req, res) => {
  try {
    const escolas = await allQuery(`SELECT * FROM escolas ORDER BY nome ASC`);
    res.json(escolas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/escolas', async (req, res) => {
  try {
    const { nome, codigo_inep, cidade, uf } = req.body;
    const result = await runQuery(
      `INSERT INTO escolas (nome, codigo_inep, cidade, uf) VALUES (?, ?, ?, ?)`,
      [nome, codigo_inep, cidade, uf]
    );
    const created = await getQuery(`SELECT * FROM escolas WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BNCC COMPETÊNCIAS ---
router.get('/bncc', async (req, res) => {
  try {
    const bncc = await allQuery(`SELECT * FROM bncc_competencias ORDER BY codigo ASC`);
    res.json(bncc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CURSOS TÉCNICOS ---
router.get('/cursos', async (req, res) => {
  try {
    const sql = `
      SELECT c.*, e.nome as escola_nome, 
             COUNT(DISTINCT d.id) as total_disciplinas,
             COUNT(DISTINCT t.id) as total_turmas
      FROM cursos c
      JOIN escolas e ON c.escola_id = e.id
      LEFT JOIN disciplinas d ON d.curso_id = c.id
      LEFT JOIN turmas t ON t.curso_id = c.id
      GROUP BY c.id
      ORDER BY c.nome ASC
    `;
    const cursos = await allQuery(sql);
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cursos', async (req, res) => {
  try {
    const { escola_id, nome, eixo_tecnologico, descricao } = req.body;
    const result = await runQuery(
      `INSERT INTO cursos (escola_id, nome, eixo_tecnologico, descricao) VALUES (?, ?, ?, ?)`,
      [escola_id || 1, nome, eixo_tecnologico, descricao]
    );
    const created = await getQuery(`SELECT * FROM cursos WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DISCIPLINAS (Com relação BNCC & FGB vs Técnico) ---
router.get('/disciplinas', async (req, res) => {
  try {
    const { curso_id } = req.query;
    let sql = `
      SELECT d.*, c.nome as curso_nome, b.codigo as bncc_codigo, b.area as bncc_area, b.descricao as bncc_descricao
      FROM disciplinas d
      JOIN cursos c ON d.curso_id = c.id
      LEFT JOIN bncc_competencias b ON d.bncc_competencia_id = b.id
    `;
    const params = [];
    if (curso_id) {
      sql += ` WHERE d.curso_id = ?`;
      params.push(curso_id);
    }
    sql += ` ORDER BY d.tipo DESC, d.nome ASC`;
    const disciplinas = await allQuery(sql, params);
    res.json(disciplinas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/disciplinas', async (req, res) => {
  try {
    const { curso_id, nome, tipo, carga_horaria, bncc_competencia_id } = req.body;
    const result = await runQuery(
      `INSERT INTO disciplinas (curso_id, nome, tipo, carga_horaria, bncc_competencia_id) VALUES (?, ?, ?, ?, ?)`,
      [curso_id, nome, tipo, carga_horaria, bncc_competencia_id || null]
    );
    const created = await getQuery(`SELECT * FROM disciplinas WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TURMAS ---
router.get('/turmas', async (req, res) => {
  try {
    const sql = `
      SELECT t.*, c.nome as curso_nome, c.eixo_tecnologico,
             COUNT(DISTINCT a.id) as total_alunos
      FROM turmas t
      JOIN cursos c ON t.curso_id = c.id
      LEFT JOIN alunos a ON a.turma_id = t.id
      GROUP BY t.id
      ORDER BY t.nome ASC
    `;
    const turmas = await allQuery(sql);
    res.json(turmas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/turmas', async (req, res) => {
  try {
    const { curso_id, nome, ano_letivo, periodo } = req.body;
    const result = await runQuery(
      `INSERT INTO turmas (curso_id, nome, ano_letivo, periodo) VALUES (?, ?, ?, ?)`,
      [curso_id, nome, ano_letivo || 2026, periodo || '1º Semestre']
    );
    const created = await getQuery(`SELECT * FROM turmas WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROFESSORES ---
router.get('/professores', async (req, res) => {
  try {
    const professores = await allQuery(`SELECT * FROM professores ORDER BY nome ASC`);
    res.json(professores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
