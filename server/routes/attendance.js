import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const router = express.Router();

// Get attendance logs and divergence alerts
router.get('/alerts', async (req, res) => {
  try {
    const { turma_id } = req.query;
    let sql = `
      SELECT p.*, a.nome as aluno_nome, a.matricula, t.nome as turma_nome,
             d.faltas as faltas_diario
      FROM ponto_biometrico p
      JOIN alunos a ON p.aluno_id = a.id
      JOIN turmas t ON a.turma_id = t.id
      LEFT JOIN desempenho d ON d.aluno_id = a.id
    `;
    const params = [];
    if (turma_id) {
      sql += ` WHERE a.turma_id = ?`;
      params.push(turma_id);
    }
    sql += ` ORDER BY p.data DESC, p.horario_entrada DESC`;

    const rawLogs = await allQuery(sql, params);

    // Compute divergence alerts (e.g. Present in morning biometric, but absent in afternoon class call, or missing exit scan)
    const alerts = rawLogs.map(log => {
      let tipoAlerta = null;
      let gravidade = 'baixo';

      if (!log.horario_saida) {
        tipoAlerta = 'Ponto de Saída não registrado no leitor ESP32';
        gravidade = 'medio';
      } else if (log.faltas_diario > 5) {
        tipoAlerta = 'Divergência: Aluno presente na catraca porém com alto índice de faltas em diário';
        gravidade = 'alto';
      }

      return {
        ...log,
        alerta: tipoAlerta,
        gravidade
      };
    });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mock ESP32 biometric punch endpoint
router.post('/punch', async (req, res) => {
  try {
    const { aluno_id, horario_entrada, horario_saida, local_leitor } = req.body;
    const dataHoje = new Date().toISOString().split('T')[0];

    const result = await runQuery(
      `INSERT INTO ponto_biometrico (aluno_id, data, horario_entrada, horario_saida, local_leitor)
       VALUES (?, ?, ?, ?, ?)`,
      [aluno_id, dataHoje, horario_entrada || '07:30:00', horario_saida || null, local_leitor || 'Portaria ESP32']
    );

    const created = await getQuery(`SELECT * FROM ponto_biometrico WHERE id = ?`, [result.id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
