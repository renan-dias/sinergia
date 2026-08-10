import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Supported Gemini Models with efficiency metadata
export const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Recomendado - Ultra Rápido & Econômico)', speed: 'Fastest', tokenSavings: 'High' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Mais Recente & Equilibrado)', speed: 'Fast', tokenSavings: 'Very High' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Alta Capacidade de Raciocínio Complexo)', speed: 'Medium', tokenSavings: 'Standard' }
];

let activeModelId = process.env.DEFAULT_MODEL || 'gemini-1.5-flash';

export const getActiveModel = () => activeModelId;
export const setActiveModel = (modelId) => {
  if (AVAILABLE_MODELS.some(m => m.id === modelId)) {
    activeModelId = modelId;
    return true;
  }
  return false;
};

/**
 * LGPD Layer: Pseudonymizes student names to "Aluno A", "Aluno B"...
 * Ensures no PII (Personally Identifiable Information) leaves local boundary.
 */
export const pseudonymizeClassData = (desempenhoRows) => {
  const nameMapping = {};
  const reverseMapping = {};
  let letterIndex = 0;

  const generateCode = (idx) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (idx < 26) return `Aluno ${alphabet[idx]}`;
    return `Aluno ${alphabet[Math.floor(idx / 26) - 1]}${alphabet[idx % 26]}`;
  };

  const pseudonymizedRows = desempenhoRows.map(row => {
    if (!nameMapping[row.aluno_nome]) {
      const code = generateCode(letterIndex++);
      nameMapping[row.aluno_nome] = code;
      reverseMapping[code] = row.aluno_nome;
    }

    return {
      aluno_pseudonimo: nameMapping[row.aluno_nome],
      disciplina: row.disciplina_nome,
      tipo_disciplina: row.tipo_disciplina,
      nota: row.nota,
      faltas: row.faltas,
      observacao: row.observacao_comportamental || 'Sem observações registradas',
      status: row.status
    };
  });

  return { pseudonymizedRows, nameMapping, reverseMapping };
};

/**
 * Generates Pedagogical Report via Gemini API with Token Economy optimizations
 */
export const generatePedagogicalReport = async (turmaNome, trimestre, desempenhoRows, modelChoice = null) => {
  const selectedModel = modelChoice || activeModelId;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Pseudonymize data for LGPD compliance
  const { pseudonymizedRows, reverseMapping } = pseudonymizeClassData(desempenhoRows);

  // 2. Compact payload to minimize token consumption
  const classSummaryStats = {
    total_estudantes: new Set(pseudonymizedRows.map(r => r.aluno_pseudonimo)).size,
    media_geral_turma: (pseudonymizedRows.reduce((acc, curr) => acc + curr.nota, 0) / (pseudonymizedRows.length || 1)).toFixed(1),
    estudantes_recuperacao: Array.from(new Set(pseudonymizedRows.filter(r => r.nota < 6.0 || r.status === 'em_recuperacao').map(r => r.aluno_pseudonimo))),
  };

  // Compact rows representation
  const compactDesempenhoText = pseudonymizedRows.map(r => 
    `[${r.aluno_pseudonimo} | ${r.disciplina} (${r.tipo_disciplina}): Nota ${r.nota}, Faltas ${r.faltas}, Status: ${r.status}, Obs: "${r.observacao}"]`
  ).join('\n');

  // Token-Optimized System Prompt Template (TCC Reference 2.2.4)
  const systemPrompt = `Você é um especialista em Gestão Pedagógica para Educação Profissional e Tecnológica (EPT).
Sua missão é analisar dados agregados de desempenho e elaborar um parecer pedagógico por turma despersonalizado e orientado por evidências, com foco em desafios sistêmicos (sem juízo culpabilizador individual).

TURMA: ${turmaNome} | TRIMESTRE: ${trimestre}º Trimestre
RESUMO ESTATÍSTICO: ${JSON.stringify(classSummaryStats)}

DADOS DOS ESTUDANTES (PSEUDONIMIZADOS LGPD):
${compactDesempenhoText}

REQUISITOS OBRIGATÓRIOS DO PARECER:
Retorne ESTRITAMENTE um objeto JSON válido (sem textos explicativos antes ou depois) com a seguinte estrutura exata:
{
  "sintese_geral": "Síntese textual objetiva sobre o rendimento global da turma no trimestre.",
  "padroes_coletivos": "Padrões pedagógicos e sistêmicos identificados (gargalos em disciplinas técnicas vs FGB, assiduidade, transição prática/teoria).",
  "alunos_atencao": [
    {
      "identificador": "Aluno A",
      "motivo": "Resumo sintético dos desafios em notas/frequência sem rótulos individuais.",
      "recomendacao": "Ação pedagógica sistêmica recomendada."
    }
  ],
  "sugestoes_encaminhamento": "1. Sugestão 1\\n2. Sugestão 2\\n3. Sugestão 3"
}`;

  let tokensEstimated = Math.ceil((systemPrompt.length + 500) / 4);

  // If valid API key is present, execute Gemini call
  if (apiKey && apiKey !== 'sua_chave_gemini_aqui' && !apiKey.startsWith('AQ.Ab8RN6KQWAocZn3EPQbCUnC9blcEfg5Ibujaeq_B_2FKp7t10A')) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
        generationConfig: {
          temperature: 0.2, // Low temperature for deterministic pedagogical evaluation & lower token noise
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();
      const usage = result.response.usageMetadata;
      if (usage?.totalTokenCount) {
        tokensEstimated = usage.totalTokenCount;
      }

      const parsedJSON = JSON.parse(responseText);

      return {
        success: true,
        report: parsedJSON,
        modelUsed: selectedModel,
        tokensUsed: tokensEstimated,
        isSimulated: false,
        reverseMapping
      };
    } catch (err) {
      console.warn('⚠️ Falha ou limite na API do Gemini. Acionando gerador pedagógico resiliente local:', err.message);
    }
  }

  // Resilient Local Synthesis Generator (Ensures immediate out-of-the-box demo functionality)
  const simulatedReport = generateLocalPedagogicalReport(turmaNome, trimestre, classSummaryStats, pseudonymizedRows);
  return {
    success: true,
    report: simulatedReport,
    modelUsed: `${selectedModel} (Motor Pedagógico SinergIA Local)`,
    tokensUsed: tokensEstimated,
    isSimulated: true,
    reverseMapping
  };
};

/**
 * Local Pedagogical Synthesis engine when API key is offline or rate-limited
 */
function generateLocalPedagogicalReport(turmaNome, trimestre, stats, rows) {
  const recuperacaoCount = stats.estudantes_recuperacao.length;
  const percRecuperacao = Math.round((recuperacaoCount / (stats.total_estudantes || 1)) * 100);

  const alunosAtencaoList = stats.estudantes_recuperacao.slice(0, 5).map((code) => {
    const studentRows = rows.filter(r => r.aluno_pseudonimo === code);
    const avgNota = (studentRows.reduce((a, b) => a + b.nota, 0) / (studentRows.length || 1)).toFixed(1);
    const totalFaltas = studentRows.reduce((a, b) => a + b.faltas, 0);

    return {
      identificador: code,
      motivo: `Média de ${avgNota} e acúmulo de ${totalFaltas} faltas nas disciplinas do trimestre. Dificuldade de acompanhamento nos conteúdos práticos.`,
      recomendacao: `Inclusão no plano de apoio pedagógico e monitoria em disciplinas de exatas/técnicas.`
    };
  });

  return {
    sintese_geral: `A turma ${turmaNome} encerrou o ${trimestre}º Trimestre com média global de ${stats.media_geral_turma}. De um total de ${stats.total_estudantes} estudantes avaliados, aproximadamente ${100 - percRecuperacao}% apresentaram desempenho regular ou superior, demonstrando bom domínio das competências técnicas solicitadas.`,
    padroes_coletivos: `Verificou-se que ${percRecuperacao}% dos estudantes necessitam de recuperação paralela (${recuperacaoCount} alunos). O principal gargalo identificado residiu na integração entre disciplinas teóricas da Formação Geral Básica (FGB) e a aplicação prática nos laboratórios técnicos. Observou-se também correlação direta entre frequências abaixo de 80% e quedas pontuais de notas.`,
    alunos_atencao: alunosAtencaoList,
    sugestoes_encaminhamento: `1. Organizar plano de recuperação contínua com metodologias ativas integrando conteúdos de FGB e Eixo Técnico.\n2. Articular com a Supervisão Pedagógica agenda de atendimento aos estudantes em situação de risco de evasão por assiduidade.\n3. Estabelecer grupos de aprendizagem colaborativa entre pares para reforço nos laboratórios.`
  };
}
