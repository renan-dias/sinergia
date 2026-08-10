import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardOverview(),
      api.getAttendanceAlerts()
    ]).then(([ovData, alertData]) => {
      setOverview(ovData);
      setAlerts(alertData);
      setLoading(false);
    }).catch(err => {
      console.error('Erro ao carregar dashboard:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-brand-600" />
        <span>Carregando indicadores do painel...</span>
      </div>
    );
  }

  const chartData = overview?.distribuicaoNotas || [];
  const COLORS = ['#006b1f', '#2563eb', '#bc0009'];

  return (
    <div className="space-y-8">
      {/* Top Banner / Action CTA */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>Visão Geral do Desempenho EPT</span>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono">1º Trimestre 2026</span>
          </h2>
          <p className="text-emerald-100 text-xs max-w-xl">
            Monitore o rendimento pedagógico, assiduidade via ponto biométrico e acione a IA para sínteses de turma despersonalizadas.
          </p>
        </div>

        <button
          onClick={() => navigate('/ai-reports')}
          className="bg-white text-brand-700 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs shrink-0"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Gerar Parecer com IA</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Estudantes</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{overview?.totalEstudantes || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Matriculados em 4 cursos técnicos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Estudantes em Risco</span>
            <AlertTriangle className="w-4 h-4 text-ifred-600" />
          </div>
          <div className="text-2xl font-black text-ifred-600">{overview?.alunosEmRisco || 0}</div>
          <div className="text-[11px] text-rose-600 font-medium">
            Média abaixo de 6.0 ou faltas &gt; 8
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Média Global EPT</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{overview?.mediaGeralGlobal || '0.0'} / 10</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Em disciplinas técnicas e FGB
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pareceres Validados</span>
            <ShieldCheck className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{overview?.relatoriosValidados || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Revisados por humanos (Human-in-the-Loop)
          </div>
        </div>
      </div>

      {/* Main Content Grid: Performance Chart & Biometric Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Distribuição de Desempenho por Faixa</h3>
              <p className="text-xs text-slate-500">Avaliações consolidadas do 1º Trimestre</p>
            </div>
            <button 
              onClick={() => navigate('/insights')} 
              className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver Análise Detalhada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="faixa" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                />
                <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Divergence Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Alertas de Frequência</span>
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              Biometria ESP32
            </span>
          </div>
          <p className="text-xs text-slate-500">Divergências entre entrada na portaria e registro em diário de classe</p>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">Nenhum alerta de frequência registrado hoje.</p>
            ) : (
              alerts.slice(0, 4).map((item) => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{item.aluno_nome}</span>
                    <span className="text-[10px] text-slate-500">{item.horario_entrada}</span>
                  </div>
                  <div className="text-slate-600 font-medium text-[11px]">{item.turma_nome}</div>
                  {item.alerta && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 font-medium">
                      ⚠️ {item.alerta}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
