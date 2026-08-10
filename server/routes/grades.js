import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const router = express.Router();

// Get Performance entries by turma, disciplina, or trimestre
router.get('/', async (req, res) => {
  try {
    const { turma_id, disciplina_id, trimestre } = req.query;
    let sql = `
      SELECT d.*, a.nome as aluno_nome, a.matricula as aluno_matricula, a.status as aluno_status_geral,
             disc.nome as disciplina_nome, disc.tipo as tipo_disciplina, disc.carga_horaria,
             t.nome as turma_nome
      FROM desempenho d
      JOIN alunos a ON d.aluno_id = a.id
      JOIN disciplinas disc ON d.disciplina_id = disc.id
      JOIN turmas t ON a.turma_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (turma_id) {
      sql += ` AND a.turma_id = ?`;
      params.push(turma_id);
    }
    if (disciplina_id) {
      sql += ` AND d.disciplina_id = ?`;
      params.push(disciplina_id);
    }
    if (trimestre) {
      sql += ` AND d.trimestre = ?`;
      params.push(trimestre);
    }

    sql += ` ORDER BY a.nome ASC`;
    const rows = await allQuery(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single Performance Record Creation or Update
router.post('/', async (req, res) => {
  try {
    const { aluno_id, disciplina_id, trimestre, nota, faltas, observacao_comportamental, status } = req.body;
    
    // Auto calculate status if not specified
    let statusCalculado = status;
    if (!statusCalculado) {
      if (nota < 6.0) statusCalculado = 'em_recuperacao';
      else if (faltas >= 8) statusCalculado = 'em_observacao';
      else statusCalculado = 'regular';
    }

    // Check if record exists
    const existing = await getQuery(
      `SELECT id FROM desempenho WHERE aluno_id = ? AND disciplina_id = ? AND trimestre = ?`,
      [aluno_id, disciplina_id, trimestre || 1]
    );

    if (existing) {
      await runQuery(
        `UPDATE desempenho SET nota = ?, faltas = ?, observacao_comportamental = ?, status = ? WHERE id = ?`,
        [nota, faltas || 0, observacao_comportamental || '', statusCalculado, existing.id]
      );
      const updated = await getQuery(`SELECT * FROM desempenho WHERE id = ?`, [existing.id]);
      return res.json(updated);
    } else {
      const result = await runQuery(
        `INSERT INTO desempenho (aluno_id, disciplina_id, trimestre, nota, faltas, observacao_comportamental, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [aluno_id, disciplina_id, trimestre || 1, nota, faltas || 0, observacao_comportamental || '', statusCalculado]
      );
      const created = await getQuery(`SELECT * FROM desempenho WHERE id = ?`, [result.id]);
      return res.status(201).json(created);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch Save (Spreadsheet Editable Grid Save)
router.post('/batch', async (req, res) => {
  try {
    const { items } = req.body; // Array of { aluno_id, disciplina_id, trimestre, nota, faltas, observacao_comportamental }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Array de itens é obrigatório' });
    }

    const saved = [];
    for (const item of items) {
      let statusCalculado = item.status;
      if (!statusCalculado) {
        if (Number(item.nota) < 6.0) statusCalculado = 'em_recuperacao';
        else if (Number(item.faltas) >= 8) statusCalculado = 'em_observacao';
        else statusCalculado = 'regular';
      }

      const existing = await getQuery(
        `SELECT id FROM desempenho WHERE aluno_id = ? AND disciplina_id = ? AND trimestre = ?`,
        [item.aluno_id, item.disciplina_id, item.trimestre || 1]
      );

      if (existing) {
        await runQuery(
          `UPDATE desempenho SET nota = ?, faltas = ?, observacao_comportamental = ?, status = ? WHERE id = ?`,
          [item.nota, item.faltas || 0, item.observacao_comportamental || '', statusCalculado, existing.id]
        );
        saved.push(existing.id);
      } else {
        const result = await runQuery(
          `INSERT INTO desempenho (aluno_id, disciplina_id, trimestre, nota, faltas, observacao_comportamental, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.aluno_id, item.disciplina_id, item.trimestre || 1, item.nota, item.faltas || 0, item.observacao_comportamental || '', statusCalculado]
        );
        saved.push(result.id);
      }
    }

    res.json({ success: true, count: saved.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
