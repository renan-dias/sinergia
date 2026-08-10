import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  GraduationCap, 
  BrainCircuit, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Code2,
  UploadCloud,
  HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-900 text-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/20">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Sistema de Informação Gerencial EPT</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            SinergIA: Gestão Pedagógica Potencializada por Inteligência Artificial
          </h1>

          <p className="text-emerald-100 text-lg font-light leading-relaxed">
            Elimine a lacuna de comunicação entre equipes docentes e pedagógicas na Educação Profissional e Tecnológica (EPT), transformando avaliações e assiduidade em pareceres preventivos orientados por evidências.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/setup')}
              className="bg-white text-brand-700 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 group"
            >
              <span>Cadastrar Minha Escola</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="bg-brand-700/50 backdrop-blur-md text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 hover:bg-brand-700/80 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Experimentar Modo Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Core Problem & Solution */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-xl font-bold text-slate-800">Comunicação Integrada na EPT</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Professores de disciplinas técnicas e coordenadores pedagógicos necessitam de uma visão única e contextualizada sobre o aprendizado dos estudantes, superando a análise superficial baseada apenas em médias finais.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-brand-600 rounded-xl flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-xl font-bold text-slate-800">Pareceres & Diagnóstico com IA</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            A SinergIA agrega notas, frequências e observações, gerando sínteses pedagógicas coletivas e questionários diagnósticos de múltipla escolha por aluno para orientar intervenções preventivas imediatas.
          </p>
        </div>
      </div>

      {/* Pillars of SinergIA */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800">Recursos e Pilares do Produto</h2>
          <p className="text-sm text-slate-500">Desenvolvido com foco na privacidade, agilidade e tomada de decisão humana</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Lock className="w-8 h-8 text-brand-600" />
            <h4 className="font-bold text-slate-800">1. Pseudonimização LGPD</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nenhum dado pessoal identificável (PII) é enviado para modelos externos de IA. Os nomes dos alunos são convertidos em códigos antes de qualquer processamento.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
            <h4 className="font-bold text-slate-800">2. Humano no Controle</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Todo parecer gerado pela IA é apresentado como rascunho editável. A validação final e a deliberação são sempre de responsabilidade do docente e coordenador.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <BrainCircuit className="w-8 h-8 text-brand-600" />
            <h4 className="font-bold text-slate-800">3. Importação & Quiz IA</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ferramentas completas para importar turmas via CSV/Excel e gerar questionários de múltipla escolha para mapear gargalos aluno a aluno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
