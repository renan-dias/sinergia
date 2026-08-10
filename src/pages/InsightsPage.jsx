import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Sparkles, 
  Layers, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';

export default function InsightsPage() {
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [comparativoDisciplinas, setComparativoDisciplinas] = useState([]);
  const [consolidadoTrimestral, setConsolidadoTrimestral] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCursos().then(cursoRes => {
      setCursos(cursoRes);
      if (cursoRes.length > 0) {
        setSelectedCurso(cursoRes[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCurso) return;
    setLoading(true);
    Promise.all([
      api.getComparativoDisciplinas(selectedCurso),
      api.getConsolidadoTrimestral()
    ]).then(([compRes, consRes]) => {
      setComparativoDisciplinas(compRes);
      setConsolidadoTrimestral(consRes);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedCurso]);

  // BNCC vs EPT Competency Radar Data Mock
  const radarData = [
    { area: 'Linguagens (BNCC)', nota: 8.5 },
    { area: 'Matemática (BNCC)', nota: 7.2 },
    { area: 'Lógica Computacional', nota: 6.8 },
    { area: 'Bancos de Dados', nota: 7.9 },
    { area: 'Prática de Laboratório', nota: 8.8 },
    { area: 'Ciências Humanas', nota: 8.1 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-brand-600" />
        <span>Gerando gráficos e tabelas comparativas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Insights, Tendências & Articulação BNCC</h2>
          <p className="text-xs text-slate-500">
            Painel analítico comparativo entre disciplinas da Formação Geral Básica (FGB) e do Itinerário Técnico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Filtrar Curso Técnico:</label>
          <select
            value={selectedCurso}
            onChange={e => setSelectedCurso(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
          >
            {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart: BNCC vs Technical Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" />
            <span>Perfil de Competências (BNCC vs Eixo Técnico)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Média da Turma" dataKey="nota" stroke="#006b1f" fill="#006b1f" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Subjects Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Média de Notas por Disciplina</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoDisciplinas}>
                <XAxis dataKey="disciplina_nome" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="media_nota" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COMPARATIVE ANALYSIS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Análise Comparativa de Desempenho por Disciplina do Curso</span>
          </h3>
          <span className="text-[11px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded font-mono font-bold">Métricas Atualizadas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Disciplina</th>
                <th className="p-3">Eixo / Formação</th>
                <th className="p-3">Carga Horária</th>
                <th className="p-3">Média de Notas</th>
                <th className="p-3">Alunos em Recuperação</th>
                <th className="p-3">Taxa de Recuperação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparativoDisciplinas.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{item.disciplina_nome}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.tipo_disciplina === 'TECNICO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.tipo_disciplina}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{item.carga_horaria} h</td>
                  <td className="p-3 font-bold text-slate-900">{item.media_nota} / 10</td>
                  <td className="p-3 font-semibold text-rose-700">{item.alunos_recuperacao} estudantes</td>
                  <td className="p-3">
                    <span className="bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200">
                      {item.taxa_recuperacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONSOLIDATED TRIMESTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Consolidado Trimestral de Rendimento por Turma</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Turma</th>
                <th className="p-3">Curso Técnico</th>
                <th className="p-3">Trimestre</th>
                <th className="p-3">Média Geral</th>
                <th className="p-3">Total Faltas</th>
                <th className="p-3">Estudantes em Recuperação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {consolidadoTrimestral.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{row.turma_nome}</td>
                  <td className="p-3 font-medium text-slate-600">{row.curso_nome}</td>
                  <td className="p-3 font-mono font-bold text-slate-800">{row.trimestre}º Trimestre</td>
                  <td className="p-3 font-bold text-emerald-700">{row.media_turma} / 10</td>
                  <td className="p-3 font-mono text-slate-600">{row.faltas_turma} faltas</td>
                  <td className="p-3 font-semibold text-rose-700">{row.qtd_recuperacao} alunos</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
