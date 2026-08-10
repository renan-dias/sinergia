import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const router = express.Router();

// General Dashboard Stats
router.get('/dashboard-overview', async (req, res) => {
  try {
    const totalEstudantes = await getQuery(`SELECT COUNT(*) as count FROM alunos`);
    const totalTurmas = await getQuery(`SELECT COUNT(*) as count FROM turmas`);
    const totalCursos = await getQuery(`SELECT COUNT(*) as count FROM cursos`);
    const relatoriosValidados = await getQuery(`SELECT COUNT(*) as count FROM relatorios_pedagogicos WHERE status = 'validado_humano'`);
    const alunosEmRisco = await getQuery(`SELECT COUNT(*) as count FROM alunos WHERE status = 'em_risco'`);
    const mediaGeralGlobal = await getQuery(`SELECT AVG(nota) as media FROM desempenho`);

    const distribuicaoNotas = await allQuery(`
      SELECT 
        CASE 
          WHEN nota >= 8.5 THEN 'Excelente (8.5 - 10)'
          WHEN nota >= 6.0 THEN 'Regular (6.0 - 8.4)'
          ELSE 'Em Recuperação (< 6.0)'
        END as faixa,
        COUNT(*) as quantidade
      FROM desempenho
      GROUP BY faixa
    `);

    res.json({
      totalEstudantes: totalEstudantes.count,
      totalTurmas: totalTurmas.count,
      totalCursos: totalCursos.count,
      relatoriosValidados: relatoriosValidados.count,
      alunosEmRisco: alunosEmRisco.count,
      mediaGeralGlobal: Number(mediaGeralGlobal.media || 0).toFixed(1),
      distribuicaoNotas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Technical Subjects Performance Comparison (Reproducing Table 2.5 TCC)
router.get('/comparativo-disciplinas', async (req, res) => {
  try {
    const { curso_id } = req.query;
    let sql = `
      SELECT disc.id, disc.nome as disciplina_nome, disc.tipo as tipo_disciplina, disc.carga_horaria,
             c.nome as curso_nome, b.codigo as bncc_codigo, b.area as bncc_area,
             AVG(d.nota) as media_nota,
             SUM(d.faltas) as total_faltas,
             COUNT(CASE WHEN d.nota < 6.0 THEN 1 END) as alunos_recuperacao,
             COUNT(d.id) as total_avaliacoes
      FROM disciplinas disc
      JOIN cursos c ON disc.curso_id = c.id
      LEFT JOIN bncc_competencias b ON disc.bncc_competencia_id = b.id
      LEFT JOIN desempenho d ON d.disciplina_id = disc.id
    `;
    const params = [];
    if (curso_id) {
      sql += ` WHERE disc.curso_id = ?`;
      params.push(curso_id);
    }
    sql += ` GROUP BY disc.id ORDER BY disc.tipo DESC, media_nota ASC`;

    const result = await allQuery(sql, params);
    const formatted = result.map(r => ({
      ...r,
      media_nota: Number(r.media_nota || 0).toFixed(1),
      taxa_recuperacao: r.total_avaliacoes ? ((r.alunos_recuperacao / r.total_avaliacoes) * 100).toFixed(0) + '%' : '0%'
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consolidated Trimester & Course Metrics (Reproducing Table 2.4 TCC)
router.get('/consolidado-trimestral', async (req, res) => {
  try {
    const sql = `
      SELECT t.id as turma_id, t.nome as turma_nome, c.nome as curso_nome, d.trimestre,
             AVG(d.nota) as media_turma,
             SUM(d.faltas) as faltas_turma,
             COUNT(DISTINCT CASE WHEN d.nota < 6.0 THEN d.aluno_id END) as qtd_recuperacao,
             COUNT(DISTINCT a.id) as total_alunos
      FROM turmas t
      JOIN cursos c ON t.curso_id = c.id
      JOIN alunos a ON a.turma_id = t.id
      LEFT JOIN desempenho d ON d.aluno_id = a.id
      GROUP BY t.id, d.trimestre
      ORDER BY t.nome ASC, d.trimestre ASC
    `;
    const rows = await allQuery(sql);
    const formatted = rows.map(r => ({
      ...r,
      media_turma: Number(r.media_turma || 0).toFixed(1)
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
