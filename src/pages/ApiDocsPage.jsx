import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, Server, Terminal, Copy } from 'lucide-react';

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/info');
  const [responseJson, setResponseJson] = useState(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { method: 'GET', path: '/api/v1/info', desc: 'Healthcheck e versão da API REST SinergIA (Eixo 3)' },
    { method: 'GET', path: '/api/v1/escolas', desc: 'Listagem de escolas técnicas cadastradas' },
    { method: 'GET', path: '/api/v1/cursos', desc: 'Listagem dos Cursos Técnicos e eixos tecnológicos' },
    { method: 'GET', path: '/api/v1/disciplinas', desc: 'Disciplinas FGB / Técnicas e articulação BNCC' },
    { method: 'GET', path: '/api/v1/turmas', desc: 'Listagem de turmas por curso' },
    { method: 'GET', path: '/api/v1/alunos', desc: 'Estudantes matriculados e status preventivo de risco' },
    { method: 'GET', path: '/api/v1/desempenho', desc: 'Lançamentos de notas, faltas e observações comportamentais' },
    { method: 'GET', path: '/api/v1/ai-reports', desc: 'Pareceres pedagógicos gerados por IA e validados por humanos' },
    { method: 'GET', path: '/api/v1/attendance/alerts', desc: 'Alertas de assiduidade e divergência ponto biométrico ESP32' },
    { method: 'GET', path: '/api/v1/calendar', desc: 'Eventos acadêmicos e detecção de sobreposição de avaliações' },
    { method: 'GET', path: '/api/v1/analytics/dashboard-overview', desc: 'Métricas gerais e indicadores consolidados EPT' },
  ];

  const handleRunEndpoint = async (path) => {
    setSelectedEndpoint(path);
    setLoading(true);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResponseJson(data);
      setLoading(false);
    } catch (err) {
      setResponseJson({ error: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hub de Integração REST API</h2>
          <p className="text-xs text-slate-500">
            Endpoints REST versionados (`/api/v1/...`) que preparam a adoção da SinergIA como hub central de dados pedagógicos da sua instituição.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-mono font-bold">
          <Server className="w-4 h-4 text-emerald-600" />
          <span>HTTP Server :3001 OK</span>
        </div>
      </div>

      {/* Interactive Explorer */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Endpoints List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-600" />
            <span>Catálogo de Endpoints REST v1</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                onClick={() => handleRunEndpoint(ep.path)}
                className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                  selectedEndpoint === ep.path ? 'bg-emerald-50/80 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{ep.desc}</p>
                </div>

                <button className="p-1.5 text-slate-400 hover:text-brand-600">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Response Panel */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl flex flex-col h-[550px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-mono font-bold text-emerald-400">
              <Code2 className="w-4 h-4" />
              <span>{selectedEndpoint}</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              STATUS 200 OK
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 font-mono text-[11px]">
            {loading ? (
              <div className="text-slate-500 italic">Executando requisição HTTP GET...</div>
            ) : responseJson ? (
              <pre className="text-emerald-300 leading-relaxed">
                {JSON.stringify(responseJson, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-500 italic">Selecione um endpoint à esquerda para disparar a requisição interativa.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
