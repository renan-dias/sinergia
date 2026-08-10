import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  BrainCircuit, 
  Users, 
  Award, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function DiagnosticPage() {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState('');

  // Quiz State
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Evaluation Result State
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    api.getTurmas().then(tRes => {
      setTurmas(tRes);
      if (tRes.length > 0) {
        setSelectedTurma(tRes[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTurma) return;
    api.getAlunos({ turma_id: selectedTurma }).then(aRes => {
      setAlunos(aRes);
      if (aRes.length > 0) {
        setSelectedAluno(aRes[0].id.toString());
      }
    });
  }, [selectedTurma]);

  const handleGenerateQuiz = async () => {
    if (!selectedAluno) return;
    setLoadingQuiz(true);
    setQuestions([]);
    setAnswers({});
    setEvaluation(null);

    try {
      const res = await api.generateDiagnosticQuiz(selectedAluno);
      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
      setLoadingQuiz(false);
    } catch (err) {
      console.error(err);
      setLoadingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionId, optionKey) => {
    setAnswers({ ...answers, [questionId]: optionKey });
  };

  const handleSubmitAnswers = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Por favor, responda a todas as perguntas do questionário antes de submeter.');
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.evaluateDiagnosticQuiz(selectedAluno, answers);
      if (res.success && res.evaluation) {
        setEvaluation(res.evaluation);
      }
      setEvaluating(false);
    } catch (err) {
      console.error(err);
      setEvaluating(false);
    }
  };

  const selectedAlunoObj = alunos.find(a => a.id.toString() === selectedAluno);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-slate-900 text-white p-8 rounded-3xl shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          <span>Diagnóstico Interativo por IA — Aluno por Aluno</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">Questionário Inteligente & Insights de Rendimento</h2>
        <p className="text-emerald-100 text-xs max-w-xl">
          Responda a um questionário de múltipla escolha gerado dinamicamente pela IA para cada estudante e obtenha um parecer diagnóstico imediato com plano de ação personalizado.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Turma</label>
            <select
              value={selectedTurma}
              onChange={e => setSelectedTurma(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Estudante Alvo</label>
            <select
              value={selectedAluno}
              onChange={e => setSelectedAluno(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={loadingQuiz || !selectedAluno}
          className="w-full md:w-auto bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 text-xs shadow-md disabled:opacity-50"
        >
          {loadingQuiz ? (
            <Sparkles className="w-4 h-4 animate-spin text-white" />
          ) : (
            <HelpCircle className="w-4 h-4 text-emerald-300" />
          )}
          <span>{loadingQuiz ? 'Gerando Perguntas com IA...' : 'Gerar Questionário Múltipla Escolha'}</span>
        </button>
      </div>

      {/* QUIZ SECTION */}
      {questions.length > 0 && !evaluation && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Questionário Diagnóstico para: <span className="text-brand-600 font-extrabold">{selectedAlunoObj?.nome}</span>
              </h3>
              <p className="text-xs text-slate-500">Selecione a alternativa de múltipla escolha que melhor descreve o comportamento observado</p>
            </div>
            <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-bold">
              {Object.keys(answers).length} de {questions.length} respondidas
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-start gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q.pergunta}</span>
                </div>

                <div className="grid gap-2 pl-7">
                  {q.opcoes.map(opt => {
                    const isSelected = answers[q.id] === opt.chave;
                    return (
                      <label
                        key={opt.chave}
                        onClick={() => handleAnswerSelect(q.id, opt.chave)}
                        className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-brand-600"
                        />
                        <span className="font-bold uppercase text-[11px] w-4">{opt.chave})</span>
                        <span>{opt.texto}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSubmitAnswers}
              disabled={evaluating || Object.keys(answers).length < questions.length}
              className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition-all text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {evaluating ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{evaluating ? 'Processando Diagnóstico...' : 'Submeter Respostas e Gerar Insight'}</span>
            </button>
          </div>
        </div>
      )}

      {/* EVALUATION INSIGHT CARD */}
      {evaluation && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                IA
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Parecer Diagnóstico por IA — {selectedAlunoObj?.nome}</h3>
                <p className="text-xs text-slate-500">Síntese baseada nas respostas do questionário e histórico de desempenho</p>
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Novo Diagnóstico</span>
            </button>
          </div>

          {/* Perfil */}
          <div className="bg-brand-50/70 p-5 rounded-2xl border border-brand-200 space-y-2">
            <div className="font-bold text-brand-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Perfil Sintético de Aprendizagem</span>
            </div>
            <p className="text-xs text-brand-950 leading-relaxed font-medium">
              {evaluation.perfil_diagnostico}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Pontos Fortes */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pontos Fortes Identificados</span>
              </div>
              <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1 font-medium">
                {evaluation.pontos_fortes?.map((pf, i) => <li key={i}>{pf}</li>)}
              </ul>
            </div>

            {/* Gargalos */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 space-y-2">
              <div className="font-bold text-rose-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Gargalos e Vulnerabilidades</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-950 space-y-1 font-medium">
                {evaluation.gargalos_identificados?.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          </div>

          {/* Recomendação & Plano de Ação */}
          <div className="space-y-3 pt-2">
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
              <div className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                Recomendação Pedagógica Imediata
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {evaluation.recomendacao_pedagogica}
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Plano de Ação Personalizado Sugerido</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                {evaluation.plano_acao_sugerido?.map((pa, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <ArrowRight className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{pa}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
