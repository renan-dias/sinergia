import express from 'express';
import { runQuery, getQuery, allQuery } from '../db/database.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Generate Dynamic AI Multiple Choice Quiz for a specific student
router.post('/generate-quiz', async (req, res) => {
  try {
    const { aluno_id } = req.body;
    if (!aluno_id) {
      return res.status(400).json({ error: 'aluno_id é obrigatório' });
    }

    const aluno = await getQuery(
      `SELECT a.*, t.nome as turma_nome, c.nome as curso_nome 
       FROM alunos a 
       JOIN turmas t ON a.turma_id = t.id 
       JOIN cursos c ON t.curso_id = c.id 
       WHERE a.id = ?`,
      [aluno_id]
    );

    if (!aluno) {
      return res.status(404).json({ error: 'Estudante não encontrado' });
    }

    const desempenho = await allQuery(
      `SELECT d.*, disc.nome as disciplina_nome, disc.tipo as tipo_disciplina
       FROM desempenho d
       JOIN disciplinas disc ON d.disciplina_id = disc.id
       WHERE d.aluno_id = ?`,
      [aluno_id]
    );

    const prompt = `Você é um especialista em Diagnóstico Pedagógico para Educação Profissional e Tecnológica (EPT).
Com base nos dados a seguir do estudante, elabore EXATAMENTE 4 PERGUNTAS DE MÚLTIPLA ESCOLHA pedagógicas direcionadas para o professor/coordenador responder sobre a postura e o ambiente de aprendizagem do aluno.

DADOS DO ESTUDANTE:
- Nome/Identificador: ${aluno.nome} (Matrícula: ${aluno.matricula})
- Turma: ${aluno.turma_nome} | Curso: ${aluno.curso_nome}
- Histórico de Notas e Faltas: ${JSON.stringify(desempenho)}

ESTRUTURA OBRIGATÓRIA DE RESPOSTA (JSON estrito):
Retorne ESTRITAMENTE um array JSON contendo objetos no seguinte formato:
[
  {
    "id": "q1",
    "pergunta": "Texto da pergunta de múltipla escolha...",
    "opcoes": [
      { "chave": "a", "texto": "Opção A de comportamento..." },
      { "chave": "b", "texto": "Opção B de comportamento..." },
      { "chave": "c", "texto": "Opção C de comportamento..." },
      { "chave": "d", "texto": "Opção D de comportamento..." }
    ]
  }
]`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'sua_chave_gemini_aqui') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const questionsJSON = JSON.parse(result.response.text());
        return res.json({ success: true, questions: questionsJSON, isSimulated: false });
      } catch (err) {
        console.warn('⚠️ Erro na API Gemini para Quiz. Utilizando simulador local:', err.message);
      }
    }

    // Dynamic Fallback Quiz Generator
    const questionsFallback = [
      {
        id: 'q1',
        pergunta: `Como o estudante ${aluno.nome} demonstra absorção nos conteúdos de raciocínio computacional e prática em laboratório?`,
        opcoes: [
          { chave: 'a', texto: 'Excelente autonomia e capacidade de resolução de problemas em dupla/grupo.' },
          { chave: 'b', texto: 'Acompanha o ritmo regular, mas necessita de apoio eventual de monitores.' },
          { chave: 'c', texto: 'Demonstra ansiedade/bloqueio na transição entre teoria e prática individual.' },
          { chave: 'd', texto: 'Apresenta desinteresse ou ausências frequentes nos dias de aula prática.' }
        ]
      },
      {
        id: 'q2',
        pergunta: `Qual o principal fator observado pelo corpo docente referente à assiduidade e pontualidade?`,
        opcoes: [
          { chave: 'a', texto: 'Presença e pontualidade exemplares em todas as aulas.' },
          { chave: 'b', texto: 'Faltas pontuais justificadas por motivos de saúde ou transporte.' },
          { chave: 'c', texto: 'Faltas concentradas em dias específicos de avaliações ou laboratórios.' },
          { chave: 'd', texto: 'Elevado índice de faltas não justificadas com risco de reprovação por assiduidade.' }
        ]
      },
      {
        id: 'q3',
        pergunta: `Como é a interação do estudante com os colegas e nas entregas dos projetos integradores?`,
        opcoes: [
          { chave: 'a', texto: 'Liderança positiva e excelente organização nas entregas em equipe.' },
          { chave: 'b', texto: 'Participação colaborativa dentro das funções atribuídas.' },
          { chave: 'c', texto: 'Dificuldade de comunicação e dependência de outros colegas para concluir etapas.' },
          { chave: 'd', texto: 'Isolamento ou conflitos pontuais na divisão de tarefas do grupo.' }
        ]
      },
      {
        id: 'q4',
        pergunta: `Qual o grau de engajamento demonstrado nas atividades de recuperação paralela ou reforço?`,
        opcoes: [
          { chave: 'a', texto: 'Proativo, busca sanar dúvidas imediatamente com os professores.' },
          { chave: 'b', texto: 'Participa quando convocado pela coordenação ou supervisão pedagógica.' },
          { chave: 'c', texto: 'Demonstra boa intenção, porém falta rotina individual de estudos em casa.' },
          { chave: 'd', texto: 'Não compareceu aos momentos de recuperação oferecidos.' }
        ]
      }
    ];

    res.json({ success: true, questions: questionsFallback, isSimulated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate Answers and Synthesize Deep Pedagogical Diagnostic Insight
router.post('/evaluate', async (req, res) => {
  try {
    const { aluno_id, respostas } = req.body; // respostas: { q1: 'a', q2: 'c', ... }
    
    const aluno = await getQuery(
      `SELECT a.*, t.nome as turma_nome, c.nome as curso_nome 
       FROM alunos a 
       JOIN turmas t ON a.turma_id = t.id 
       JOIN cursos c ON t.curso_id = c.id 
       WHERE a.id = ?`,
      [aluno_id]
    );

    const prompt = `Você é um consultor especialista em Gestão Pedagógica EPT.
Analise as respostas de múltipla escolha fornecidas pelo professor para o estudante ${aluno?.nome || 'Estudante'} e elabore um DIAGNÓSTICO ESTRUTURADO DE DESEMPENHO.

RESPOSTAS DO PROFESSOR (QUESTIONÁRIO):
${JSON.stringify(respostas)}

REQUISITOS DA RESPOSTA (JSON estrito):
Retorne ESTRITAMENTE um objeto JSON no formato:
{
  "perfil_diagnostico": "Resumo sintético do perfil de aprendizagem do aluno...",
  "pontos_fortes": ["Ponto forte 1", "Ponto forte 2"],
  "gargalos_identificados": ["Gargalo 1", "Gargalo 2"],
  "recomendacao_pedagogica": "Ação imediata recomendada para a coordenação...",
  "plano_acao_sugerido": [
    "Etapa 1: Atendimento individualizado...",
    "Etapa 2: Acompanhamento de assiduidade...",
    "Etapa 3: Plano de nivelamento em laboratório..."
  ]
}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'sua_chave_gemini_aqui') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const evaluationJSON = JSON.parse(result.response.text());
        return res.json({ success: true, evaluation: evaluationJSON, isSimulated: false });
      } catch (err) {
        console.warn('⚠️ Erro na API Gemini para avaliação. Utilizando síntese local:', err.message);
      }
    }

    // Local Evaluation Fallback
    const evaluationFallback = {
      perfil_diagnostico: `O estudante ${aluno?.nome || 'Estudante'} demonstra bom potencial cognitivo nas matérias do eixo técnico, porém apresenta vulnerabilidades operacionais na gestão do tempo e na constância de assiduidade.`,
      pontos_fortes: [
        'Boa receptividade aos conceitos práticos quando presente em sala',
        'Capacidade de trabalho colaborativo em grupo'
      ],
      gargalos_identificados: [
        'Instabilidade no ritmo de estudo individual extraclasse',
        'Acúmulo de ausências concentradas em dias de avaliação prática'
      ],
      recomendacao_pedagogica: 'Encaminhar o estudante para atendimento com a Supervisão Pedagógica para pactuação de contrato didático de assiduidade e inclusão em monitoria de nivelamento.',
      plano_acao_sugerido: [
        '1. Entrevista de acolhimento pedagógico para mapeamento de rotina extraescolar.',
        '2. Inclusão no programa de monitoria entre pares para reforço em tópicos essenciais.',
        '3. Acompanhamento semanal de assiduidade via relatórios de frequência da portaria.'
      ]
    };

    res.json({ success: true, evaluation: evaluationFallback, isSimulated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
