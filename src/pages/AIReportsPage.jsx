import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { exportToPDF, exportToWord, exportToExcel } from '../utils/exportUtils';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  FileText, 
  FileSpreadsheet, 
  Save, 
  Cpu, 
  BrainCircuit,
  Zap,
  Info
} from 'lucide-react';

export default function AIReportsPage() {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('1');
  
  // LLM Model Choice
  const [modelsInfo, setModelsInfo] = useState({ activeModel: 'gemini-1.5-flash', availableModels: [] });
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');

  // Active Report State
  const [currentReport, setCurrentReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  // Edit fields
  const [editSintese, setEditSintese] = useState('');
  const [editPadroes, setEditPadroes] = useState('');
  const [editSugestoes, setEditSugestoes] = useState('');
  const [editAlunosAtencao, setEditAlunosAtencao] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getTurmas(),
      api.getAiModels()
    ]).then(([turmaRes, modelRes]) => {
      setTurmas(turmaRes);
      if (turmaRes.length > 0) {
        setSelectedTurma(turmaRes[0].id.toString());
        loadExistingReport(turmaRes[0].id.toString());
      }
      setModelsInfo(modelRes);
      if (modelRes.activeModel) setSelectedModel(modelRes.activeModel);
    });
  }, []);

  const loadExistingReport = (turmaId) => {
    api.getAiReports(turmaId).then(reports => {
      if (reports.length > 0) {
        setReportState(reports[0]);
      } else {
        setCurrentReport(null);
      }
    });
  };

  const setReportState = (reportObj) => {
    setCurrentReport(reportObj);
    setEditSintese(reportObj.sintese_geral || '');
    setEditPadroes(reportObj.padroes_coletivos || '');
    setEditSugestoes(reportObj.sugestoes_encaminhamento || '');
    setEditAlunosAtencao(reportObj.alunos_atencao || []);
  };

  const handleGenerateReport = async () => {
    if (!selectedTurma) return;
    setGenerating(true);

    try {
      const res = await api.generateAiReport(selectedTurma, Number(selectedTrimestre), selectedModel);
      if (res.success && res.report) {
        setReportState(res.report);
        setIsSimulated(res.isSimulated || false);
      }
      setGenerating(false);
    } catch (err) {
      console.error('Erro ao gerar parecer:', err);
      setGenerating(false);
    }
  };

  const handleSaveAndValidate = async (newStatus = 'validado_humano') => {
    if (!currentReport) return;
    setSaving(true);

    try {
      const updated = await api.updateAiReport(currentReport.id, {
        sintese_geral: editSintese,
        padroes_coletivos: editPadroes,
        sugestoes_encaminhamento: editSugestoes,
        alunos_atencao: editAlunosAtencao,
        status: newStatus,
        revisado_por: 'Professor/Coordenador (Validado)'
      });

      setReportState(updated);
      setSaving(false);
    } catch (err) {
      console.error('Erro ao validar parecer:', err);
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!currentReport) return;
    exportToPDF({
      title: `Parecer Pedagógico Assistido por IA — ${currentReport.turma_nome || 'Turma EPT'}`,
      subtitle: `Status: ${currentReport.status === 'validado_humano' ? 'Validado por Humano' : 'Rascunho IA'} | Modelo: ${currentReport.modelo_llm || selectedModel}`,
      contentText: `1. SÍNTESE GERAL:\n${editSintese}\n\n2. PADRÕES COLETIVOS:\n${editPadroes}\n\n3. SUGESTÕES DE ENCAMINHAMENTO:\n${editSugestoes}`,
      tableHeaders: ['Estudante (Reidentificado)', 'Desafio Sistêmico', 'Recomendação'],
      tableRows: editAlunosAtencao.map(a => [a.identificador || 'Aluno', a.motivo || '', a.recomendacao || '']),
      filename: `parecer_pedagogico_turma_${selectedTurma}.pdf`
    });
  };

  const handleExportWord = () => {
    if (!currentReport) return;
    exportToWord({
      title: `Parecer Pedagógico — Turma ${currentReport.turma_nome || ''}`,
      sinteseGeral: editSintese,
      padroesColetivos: editPadroes,
      alunosAtencao: editAlunosAtencao,
      sugestoes: editSugestoes,
      filename: `parecer_pedagogico_turma_${selectedTurma}.docx`
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-900 text-white p-8 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Núcleo de Inteligência Gerencial SinergIA</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Geração Assistida de Pareceres Pedagógicos</h2>
            <p className="text-emerald-100 text-xs max-w-xl">
              Transforme dados brutos de notas e faltas em sínteses coletivas orientadas por evidências, com pseudonimização LGPD e validação humana obrigatória.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
            <Cpu className="w-4 h-4 text-emerald-300" />
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            >
              {modelsInfo.availableModels.map(m => (
                <option key={m.id} value={m.id} className="text-slate-900">{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Control Panel Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Turma Alvo</label>
            <select
              value={selectedTurma}
              onChange={e => {
                setSelectedTurma(e.target.value);
                loadExistingReport(e.target.value);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Trimestre</label>
            <select
              value={selectedTrimestre}
              onChange={e => setSelectedTrimestre(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="w-full md:w-auto bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 text-xs shadow-md disabled:opacity-50"
        >
          {generating ? (
            <Sparkles className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Zap className="w-4 h-4 text-emerald-300" />
          )}
          <span>{generating ? 'Processando Prompt & LGPD...' : 'Gerar Parecer Pedagógico'}</span>
        </button>
      </div>

      {/* LGPD Pseudonymization Safeguard Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
        <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-emerald-950 flex items-center gap-2">
            <span>Garantia de Privacidade e Proteção de Dados (LGPD)</span>
            <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Pseudonimização Ativa</span>
          </div>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            Antes de qualquer chamada ao modelo LLM (${selectedModel}), os nomes dos alunos são convertidos em identificadores pseudônimos ("Aluno A", "Aluno B"). A reidentificação aos nomes reais ocorre exclusivamente no seu navegador local.
          </p>
        </div>
      </div>

      {/* MAIN REPORT VIEW */}
      {currentReport && (
        <div className="space-y-6">
          {/* Mandatory Human-in-the-Loop Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            currentReport.status === 'validado_humano'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {currentReport.status === 'validado_humano' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {currentReport.status === 'validado_humano'
                    ? 'PARECER REVISADO E VALIDADO POR HUMANO'
                    : 'RASCUNHO GERADO POR IA — EXIGE VALIDAÇÃO HUMANA'}
                </h4>
                <p className="text-xs opacity-90">
                  {currentReport.status === 'validado_humano'
                    ? `Validado por: ${currentReport.revisado_por || 'Professor'} em ${new Date(currentReport.data_validacao || Date.now()).toLocaleDateString('pt-BR')}`
                    : 'Conforme a hipótese do TCC, pareceres da IA são sempre rascunhos editáveis e nunca tomam decisões automáticas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportWord}
                className="bg-white text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-xs flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>DOCX (Word)</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="bg-white text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-xs flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => handleSaveAndValidate('validado_humano')}
                disabled={saving}
                className="bg-brand-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-brand-700 transition-all text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Validando...' : 'Salvar & Validar (Humano)'}</span>
              </button>
            </div>
          </div>

          {/* EDITABLE SECTIONS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
            {/* Section A: Síntese Geral */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <span>1. Síntese Geral da Turma</span>
              </label>
              <textarea
                rows={4}
                value={editSintese}
                onChange={e => setEditSintese(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 focus:bg-white focus:border-brand-600 outline-none transition-all"
              />
            </div>

            {/* Section B: Padrões Coletivos */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <span>2. Padrões Coletivos Identificados</span>
              </label>
              <textarea
                rows={4}
                value={editPadroes}
                onChange={e => setEditPadroes(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 focus:bg-white focus:border-brand-600 outline-none transition-all"
              />
            </div>

            {/* Section C: Alunos em Acompanhamento / Recuperação */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-ifred-600" />
                <span>3. Estudantes em Acompanhamento e Recuperação</span>
              </label>

              <div className="space-y-3">
                {editAlunosAtencao.map((aluno, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>{aluno.identificador || `Aluno ${idx + 1}`}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">Em Acompanhamento</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium"><strong>Desafio:</strong> {aluno.motivo}</p>
                    <p className="text-xs text-brand-700 font-medium"><strong>Recomendação:</strong> {aluno.recomendacao}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section D: Sugestões de Encaminhamento */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <span>4. Sugestões de Encaminhamento Pedagógico</span>
              </label>
              <textarea
                rows={4}
                value={editSugestoes}
                onChange={e => setEditSugestoes(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 focus:bg-white focus:border-brand-600 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
