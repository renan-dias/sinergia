import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const router = express.Router();

// Bulk Import Alunos
router.post('/alunos', async (req, res) => {
  try {
    const { rows, turma_id } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado fornecido para importação.' });
    }

    let importedCount = 0;
    let updatedCount = 0;

    for (const r of rows) {
      if (!r.nome) continue;
      const targetTurmaId = r.turma_id || turma_id || 1;
      const matricula = r.matricula || `MAT${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const existing = await getQuery(`SELECT id FROM alunos WHERE matricula = ?`, [matricula]);
      if (existing) {
        await runQuery(
          `UPDATE alunos SET nome = ?, turma_id = ?, status = ? WHERE id = ?`,
          [r.nome, targetTurmaId, r.status || 'ativo', existing.id]
        );
        updatedCount++;
      } else {
        await runQuery(
          `INSERT INTO alunos (turma_id, matricula, nome, status) VALUES (?, ?, ?, ?)`,
          [targetTurmaId, matricula, r.nome, r.status || 'ativo']
        );
        importedCount++;
      }
    }

    res.json({ success: true, imported: importedCount, updated: updatedCount, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Import Desempenho (Notas & Faltas)
router.post('/desempenho', async (req, res) => {
  try {
    const { rows, disciplina_id, trimestre } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado fornecido para importação.' });
    }

    let processed = 0;

    for (const r of rows) {
      let alunoId = r.aluno_id;

      // Find student by matricula or name if id not present
      if (!alunoId && r.matricula) {
        const a = await getQuery(`SELECT id FROM alunos WHERE matricula = ?`, [r.matricula]);
        if (a) alunoId = a.id;
      }
      if (!alunoId && r.nome) {
        const a = await getQuery(`SELECT id FROM alunos WHERE nome LIKE ?`, [`%${r.nome}%`]);
        if (a) alunoId = a.id;
      }

      if (!alunoId) continue;

      const targetDiscId = r.disciplina_id || disciplina_id || 1;
      const targetTrim = r.trimestre || trimestre || 1;
      const nota = Number(r.nota || 0);
      const faltas = Number(r.faltas || 0);
      const obs = r.observacao || r.observacao_comportamental || '';

      let status = 'regular';
      if (nota < 6.0) status = 'em_recuperacao';
      else if (faltas >= 8) status = 'em_observacao';

      const existing = await getQuery(
        `SELECT id FROM desempenho WHERE aluno_id = ? AND disciplina_id = ? AND trimestre = ?`,
        [alunoId, targetDiscId, targetTrim]
      );

      if (existing) {
        await runQuery(
          `UPDATE desempenho SET nota = ?, faltas = ?, observacao_comportamental = ?, status = ? WHERE id = ?`,
          [nota, faltas, obs, status, existing.id]
        );
      } else {
        await runQuery(
          `INSERT INTO desempenho (aluno_id, disciplina_id, trimestre, nota, faltas, observacao_comportamental, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [alunoId, targetDiscId, targetTrim, nota, faltas, obs, status]
        );
      }
      processed++;
    }

    res.json({ success: true, processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Import Frequência / Ponto Biométrico
router.post('/frequencia', async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado fornecido para importação.' });
    }

    let processed = 0;
    const hoje = new Date().toISOString().split('T')[0];

    for (const r of rows) {
      let alunoId = r.aluno_id;

      if (!alunoId && r.matricula) {
        const a = await getQuery(`SELECT id FROM alunos WHERE matricula = ?`, [r.matricula]);
        if (a) alunoId = a.id;
      }
      if (!alunoId && r.nome) {
        const a = await getQuery(`SELECT id FROM alunos WHERE nome LIKE ?`, [`%${r.nome}%`]);
        if (a) alunoId = a.id;
      }

      if (!alunoId) continue;

      await runQuery(
        `INSERT INTO ponto_biometrico (aluno_id, data, horario_entrada, horario_saida, local_leitor)
         VALUES (?, ?, ?, ?, ?)`,
        [alunoId, r.data || hoje, r.horario_entrada || '07:30:00', r.horario_saida || null, r.local_leitor || 'Portaria Principal']
      );
      processed++;
    }

    res.json({ success: true, processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
