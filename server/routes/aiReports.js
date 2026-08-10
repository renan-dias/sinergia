import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';
import { generatePedagogicalReport, getActiveModel, setActiveModel, AVAILABLE_MODELS } from '../services/ai.js';

const router = express.Router();

// Get list of AI models and current active model
router.get('/models', (req, res) => {
  res.json({
    activeModel: getActiveModel(),
    availableModels: AVAILABLE_MODELS
  });
});

// Set active model
router.post('/models', (req, res) => {
  const { modelId } = req.body;
  if (setActiveModel(modelId)) {
    res.json({ success: true, activeModel: getActiveModel() });
  } else {
    res.status(400).json({ error: 'Modelo inválido' });
  }
});

// Get reports by turma or list all
router.get('/', async (req, res) => {
  try {
    const { turma_id } = req.query;
    let sql = `
      SELECT r.*, t.nome as turma_nome, c.nome as curso_nome
      FROM relatorios_pedagogicos r
      JOIN turmas t ON r.turma_id = t.id
      JOIN cursos c ON t.curso_id = c.id
    `;
    const params = [];
    if (turma_id) {
      sql += ` WHERE r.turma_id = ?`;
      params.push(turma_id);
    }
    sql += ` ORDER BY r.data_geracao DESC`;
    const reports = await allQuery(sql, params);
    
    // Parse JSON field for clients
    const formatted = reports.map(rep => ({
      ...rep,
      alunos_atencao: JSON.parse(rep.alunos_atencao_json || '[]')
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI Report for a specific turma and trimestre
router.post('/generate', async (req, res) => {
  try {
    const { turma_id, trimestre, model_choice } = req.body;
    if (!turma_id) {
      return res.status(400).json({ error: 'turma_id é obrigatório' });
    }

    const turma = await getQuery(`SELECT t.nome, c.nome as curso_nome FROM turmas t JOIN cursos c ON t.curso_id = c.id WHERE t.id = ?`, [turma_id]);
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Fetch performance data for the class
    const sqlDesempenho = `
      SELECT d.*, a.nome as aluno_nome, disc.nome as disciplina_nome, disc.tipo as tipo_disciplina
      FROM desempenho d
      JOIN alunos a ON d.aluno_id = a.id
      JOIN disciplinas disc ON d.disciplina_id = disc.id
      WHERE a.turma_id = ? AND d.trimestre = ?
    `;
    const desempenhoRows = await allQuery(sqlDesempenho, [turma_id, trimestre || 1]);

    if (desempenhoRows.length === 0) {
      return res.status(400).json({ error: 'Não há lançamentos de desempenho registrados para esta turma e trimestre.' });
    }

    // Call LLM Service with LGPD Pseudonymization & Token Economy
    const aiResult = await generatePedagogicalReport(turma.nome, trimestre || 1, desempenhoRows, model_choice);

    // Save report in DB as rascunho_ia
    const reportData = aiResult.report;
    const saveResult = await runQuery(
      `INSERT INTO relatorios_pedagogicos 
        (turma_id, trimestre, sintese_geral, padroes_coletivos, alunos_atencao_json, sugestoes_encaminhamento, status, modelo_llm, tokens_utilizados)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        turma_id,
        trimestre || 1,
        reportData.sintese_geral,
        reportData.padroes_coletivos,
        JSON.stringify(reportData.alunos_atencao || []),
        reportData.sugestoes_encaminhamento,
        'rascunho_ia',
        aiResult.modelUsed,
        aiResult.tokensUsed
      ]
    );

    const savedReport = await getQuery(`SELECT * FROM relatorios_pedagogicos WHERE id = ?`, [saveResult.id]);

    res.json({
      success: true,
      report: {
        ...savedReport,
        alunos_atencao: JSON.parse(savedReport.alunos_atencao_json)
      },
      isSimulated: aiResult.isSimulated,
      reverseMapping: aiResult.reverseMapping
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update / Validate AI Report (Human circuit in the loop)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sintese_geral, padroes_coletivos, alunos_atencao, sugestoes_encaminhamento, status, revisado_por } = req.body;

    const dataValidacao = status === 'validado_humano' ? new Date().toISOString() : null;

    await runQuery(
      `UPDATE relatorios_pedagogicos 
       SET sintese_geral = ?, padroes_coletivos = ?, alunos_atencao_json = ?, sugestoes_encaminhamento = ?, status = ?, revisado_por = ?, data_validacao = ?
       WHERE id = ?`,
      [
        sintese_geral,
        padroes_coletivos,
        JSON.stringify(alunos_atencao || []),
        sugestoes_encaminhamento,
        status || 'rascunho_ia',
        revisado_por || 'Professor/Coordenador',
        dataValidacao,
        id
      ]
    );

    const updated = await getQuery(`SELECT * FROM relatorios_pedagogicos WHERE id = ?`, [id]);
    res.json({
      ...updated,
      alunos_atencao: JSON.parse(updated.alunos_atencao_json)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
