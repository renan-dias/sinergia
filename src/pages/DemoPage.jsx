import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Dashboard from './Dashboard';
import { 
  Sparkles, 
  Play, 
  Trash2, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Info
} from 'lucide-react';

export default function DemoPage() {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingClean, setLoadingClean] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    setMsg('');
    try {
      await api.loadDemoData();
      setLoadingDemo(false);
      setMsg('✅ Dados de demonstração carregados com sucesso!');
      setTimeout(() => setMsg(''), 4000);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoadingDemo(false);
      setMsg('❌ Erro ao carregar dados de demonstração: ' + err.message);
    }
  };

  const handleCleanData = async () => {
    if (confirm('Deseja limpar todos os dados e iniciar o cadastro da sua própria escola do zero?')) {
      setLoadingClean(true);
      try {
        await api.resetDb();
        setLoadingClean(false);
        navigate('/setup');
      } catch (err) {
        console.error(err);
        setLoadingClean(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-brand-700 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ambiente de Demonstração (/demo)</span>
          </div>
          <h2 className="text-2xl font-black">Modo de Demonstração SinergIA</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Base de dados pré-carregada com cursos técnicos (Desenvolvimento de Sistemas, Logística, Eletrônica), notas, assiduidade, pareceres de IA e alertas de frequência para experimentar todas as funcionalidades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadDemo}
            disabled={loadingDemo}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {loadingDemo ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{loadingDemo ? 'Recarregando...' : 'Recarregar Dados Demo'}</span>
          </button>

          <button
            onClick={handleCleanData}
            disabled={loadingClean}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Cadastrar Minha Escola</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Embedded Dashboard */}
      <Dashboard />
    </div>
  );
}
