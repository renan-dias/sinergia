import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const router = express.Router();

// Get academic calendar events & check for assessment overlaps
router.get('/', async (req, res) => {
  try {
    const { turma_id } = req.query;
    let sql = `
      SELECT e.*, t.nome as turma_nome, c.nome as curso_nome
      FROM eventos_calendario e
      JOIN turmas t ON e.turma_id = t.id
      JOIN cursos c ON t.curso_id = c.id
    `;
    const params = [];
    if (turma_id) {
      sql += ` WHERE e.turma_id = ?`;
      params.push(turma_id);
    }
    sql += ` ORDER BY e.data ASC`;
    const eventos = await allQuery(sql, params);

    // Overlap detection algorithm (Axis 2 requirement: detect multiple exams/projects in the same 7-day window)
    const eventosComAlerta = eventos.map(e => {
      const eDate = new Date(e.data);
      const isAssessment = e.tipo === 'prova' || e.tipo === 'projeto';

      if (!isAssessment) return { ...e, temSobreposicao: false, sobreposicoes: [] };

      const sobreposicoes = eventos.filter(other => {
        if (other.id === e.id || other.turma_id !== e.turma_id) return false;
        if (other.tipo !== 'prova' && other.tipo !== 'projeto') return false;

        const otherDate = new Date(other.data);
        const diffDays = Math.abs((eDate - otherDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 5; // Within 5 calendar days (same week)
      });

      return {
        ...e,
        temSobreposicao: sobreposicoes.length > 0,
        sobreposicoes: sobreposicoes.map(s => ({ id: s.id, titulo: s.titulo, data: s.data, tipo: s.tipo }))
      };
    });

    res.json(eventosComAlerta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Calendar Event
router.post('/', async (req, res) => {
  try {
    const { turma_id, titulo, tipo, data, descricao } = req.body;
    const result = await runQuery(
      `INSERT INTO eventos_calendario (turma_id, titulo, tipo, data, descricao) VALUES (?, ?, ?, ?, ?)`,
      [turma_id, titulo, tipo, data, descricao || '']
    );
    const created = await getQuery(`SELECT * FROM eventos_calendario WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery(`DELETE FROM eventos_calendario WHERE id = ?`, [id]);
    res.json({ message: 'Evento excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
