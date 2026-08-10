const API_BASE = '/api/v1';

export const api = {
  // Setup & Database Control
  resetDb: () => fetch(`${API_BASE}/reset-db`, { method: 'POST' }).then(r => r.json()),
  loadDemoData: () => fetch(`${API_BASE}/load-demo`, { method: 'POST' }).then(r => r.json()),
  setupSchool: (data) => fetch(`${API_BASE}/setup-school`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),

  // Admin & Catalog
  getEscolas: () => fetch(`${API_BASE}/escolas`).then(r => r.json()),
  createEscola: (data) => fetch(`${API_BASE}/escolas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  
  getCursos: () => fetch(`${API_BASE}/cursos`).then(r => r.json()),
  createCurso: (data) => fetch(`${API_BASE}/cursos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  
  getDisciplinas: (curso_id) => fetch(`${API_BASE}/disciplinas${curso_id ? `?curso_id=${curso_id}` : ''}`).then(r => r.json()),
  createDisciplina: (data) => fetch(`${API_BASE}/disciplinas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  
  getTurmas: () => fetch(`${API_BASE}/turmas`).then(r => r.json()),
  createTurma: (data) => fetch(`${API_BASE}/turmas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  
  getProfessores: () => fetch(`${API_BASE}/professores`).then(r => r.json()),
  getBncc: () => fetch(`${API_BASE}/bncc`).then(r => r.json()),

  // Alunos
  getAlunos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/alunos${query ? `?${query}` : ''}`).then(r => r.json());
  },
  createAluno: (data) => fetch(`${API_BASE}/alunos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  updateAluno: (id, data) => fetch(`${API_BASE}/alunos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteAluno: (id) => fetch(`${API_BASE}/alunos/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Desempenho
  getDesempenho: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/desempenho${query ? `?${query}` : ''}`).then(r => r.json());
  },
  saveDesempenhoBatch: (items) => fetch(`${API_BASE}/desempenho/batch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }).then(r => r.json()),

  // Central de Importação de Dados
  importAlunos: (rows, turma_id) => fetch(`${API_BASE}/import/alunos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows, turma_id }) }).then(r => r.json()),
  importDesempenho: (rows, disciplina_id) => fetch(`${API_BASE}/import/desempenho`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows, disciplina_id }) }).then(r => r.json()),
  importFrequencia: (rows) => fetch(`${API_BASE}/import/frequencia`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) }).then(r => r.json()),

  // Diagnóstico Interativo por IA (Perguntas Múltipla Escolha)
  generateDiagnosticQuiz: (aluno_id) => fetch(`${API_BASE}/ai-diagnostic/generate-quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aluno_id }) }).then(r => r.json()),
  evaluateDiagnosticQuiz: (aluno_id, respostas) => fetch(`${API_BASE}/ai-diagnostic/evaluate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aluno_id, respostas }) }).then(r => r.json()),

  // Módulo de IA & Pareceres
  getAiModels: () => fetch(`${API_BASE}/ai-reports/models`).then(r => r.json()),
  setAiModel: (modelId) => fetch(`${API_BASE}/ai-reports/models`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modelId }) }).then(r => r.json()),
  getAiReports: (turma_id) => fetch(`${API_BASE}/ai-reports${turma_id ? `?turma_id=${turma_id}` : ''}`).then(r => r.json()),
  generateAiReport: (turma_id, trimestre = 1, model_choice = null) => fetch(`${API_BASE}/ai-reports/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ turma_id, trimestre, model_choice }) }).then(r => r.json()),
  updateAiReport: (id, data) => fetch(`${API_BASE}/ai-reports/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),

  // Attendance & Biometric ESP32 mock
  getAttendanceAlerts: (turma_id) => fetch(`${API_BASE}/attendance/alerts${turma_id ? `?turma_id=${turma_id}` : ''}`).then(r => r.json()),
  punchBiometric: (data) => fetch(`${API_BASE}/attendance/punch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),

  // Calendar
  getCalendarEvents: (turma_id) => fetch(`${API_BASE}/calendar${turma_id ? `?turma_id=${turma_id}` : ''}`).then(r => r.json()),
  createCalendarEvent: (data) => fetch(`${API_BASE}/calendar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteCalendarEvent: (id) => fetch(`${API_BASE}/calendar/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Analytics & Insights
  getDashboardOverview: () => fetch(`${API_BASE}/analytics/dashboard-overview`).then(r => r.json()),
  getComparativoDisciplinas: (curso_id) => fetch(`${API_BASE}/analytics/comparativo-disciplinas${curso_id ? `?curso_id=${curso_id}` : ''}`).then(r => r.json()),
  getConsolidadoTrimestral: () => fetch(`${API_BASE}/analytics/consolidado-trimestral`).then(r => r.json())
};
