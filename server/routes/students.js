import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const router = express.Router();

// Get Students (with filters for class, status, or search query)
router.get('/', async (req, res) => {
  try {
    const { turma_id, status, search } = req.query;
    let sql = `
      SELECT a.*, t.nome as turma_nome, c.nome as curso_nome
      FROM alunos a
      JOIN turmas t ON a.turma_id = t.id
      JOIN cursos c ON t.curso_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (turma_id) {
      sql += ` AND a.turma_id = ?`;
      params.push(turma_id);
    }
    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (a.nome LIKE ? OR a.matricula LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY a.nome ASC`;
    const alunos = await allQuery(sql, params);
    res.json(alunos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Student
router.post('/', async (req, res) => {
  try {
    const { turma_id, matricula, nome, status } = req.body;
    const result = await runQuery(
      `INSERT INTO alunos (turma_id, matricula, nome, status) VALUES (?, ?, ?, ?)`,
      [turma_id, matricula, nome, status || 'ativo']
    );
    const created = await getQuery(`SELECT * FROM alunos WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Student Status / Details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, matricula, turma_id, status } = req.body;
    await runQuery(
      `UPDATE alunos SET nome = ?, matricula = ?, turma_id = ?, status = ? WHERE id = ?`,
      [nome, matricula, turma_id, status, id]
    );
    const updated = await getQuery(`SELECT * FROM alunos WHERE id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery(`DELETE FROM alunos WHERE id = ?`, [id]);
    res.json({ message: 'Aluno removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
