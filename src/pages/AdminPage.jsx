import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Building2, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Plus, 
  Check, 
  Award, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('disciplinas');
  
  // Catalogs state
  const [escolas, setEscolas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [bncc, setBncc] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / Forms state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getEscolas(),
      api.getCursos(),
      api.getTurmas(),
      api.getDisciplinas(),
      api.getProfessores(),
      api.getBncc()
    ]).then(([escolaRes, cursoRes, turmaRes, discRes, profRes, bnccRes]) => {
      setEscolas(escolaRes);
      setCursos(cursoRes);
      setTurmas(turmaRes);
      setDisciplinas(discRes);
      setProfessores(profRes);
      setBncc(bnccRes);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDisciplina = async (e) => {
    e.preventDefault();
    await api.createDisciplina(formData);
    setShowModal(false);
    setFormData({});
    loadData();
  };

  const handleCreateCurso = async (e) => {
    e.preventDefault();
    await api.createCurso({ ...formData, escola_id: escolas[0]?.id || 1 });
    setShowModal(false);
    setFormData({});
    loadData();
  };

  const handleCreateTurma = async (e) => {
    e.preventDefault();
    await api.createTurma(formData);
    setShowModal(false);
    setFormData({});
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-brand-600" />
        <span>Carregando cadastros administrativos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Administração EPT & Mapeamento BNCC</h2>
          <p className="text-xs text-slate-500">
            Cadastre cursos, disciplinas técnicas e estabeleça a articulação com as competências da Formação Geral Básica (BNCC).
          </p>
        </div>

        <button
          onClick={() => { setFormData({}); setShowModal(true); }}
          className="bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Item</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'disciplinas', label: 'Disciplinas & BNCC', icon: BookOpen, count: disciplinas.length },
          { id: 'cursos', label: 'Cursos Técnicos', icon: Layers, count: cursos.length },
          { id: 'turmas', label: 'Turmas', icon: GraduationCap, count: turmas.length },
          { id: 'professores', label: 'Professores', icon: Users, count: professores.length },
          { id: 'escolas', label: 'Escolas', icon: Building2, count: escolas.length },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DISCIPLINAS & BNCC MAPPING */}
      {activeTab === 'disciplinas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" />
              <span>Relação entre Disciplinas Técnicas e Competências BNCC</span>
            </h3>
            <span className="text-xs text-slate-500">Formação Geral Básica (FGB) vs Itinerário Técnico</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Nome da Disciplina</th>
                  <th className="p-3.5">Eixo / Tipo</th>
                  <th className="p-3.5">Curso Vinculado</th>
                  <th className="p-3.5">Carga Horária</th>
                  <th className="p-3.5">Competência BNCC Articulada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {disciplinas.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{d.nome}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.tipo === 'TECNICO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {d.tipo === 'TECNICO' ? 'Itinerário Técnico' : 'FGB (Geral)'}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{d.curso_nome}</td>
                    <td className="p-3.5">{d.carga_horaria} h</td>
                    <td className="p-3.5">
                      {d.bncc_codigo ? (
                        <div className="space-y-0.5">
                          <span className="bg-purple-100 text-purple-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {d.bncc_codigo}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{d.bncc_descricao}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Sem articulação direta cadastrada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CURSOS TÉCNICOS */}
      {activeTab === 'cursos' && (
        <div className="grid md:grid-cols-2 gap-4">
          {cursos.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{c.nome}</h3>
                  <span className="text-xs text-slate-500">{c.escola_nome}</span>
                </div>
                <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold border border-brand-200">
                  {c.eixo_tecnologico}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{c.descricao}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                <span>📚 {c.total_disciplinas || 0} disciplinas</span>
                <span>🎓 {c.total_turmas || 0} turmas ativas</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">
              Cadastrar Nova Disciplina e Articular BNCC
            </h3>

            <form onSubmit={handleCreateDisciplina} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Curso Técnico Vinculado</label>
                <select
                  required
                  value={formData.curso_id || ''}
                  onChange={e => setFormData({ ...formData, curso_id: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione o Curso...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nome da Disciplina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Engenharia de Requisitos"
                  value={formData.nome || ''}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Tipo de Formação</label>
                  <select
                    required
                    value={formData.tipo || 'TECNICO'}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="TECNICO">Itinerário Técnico</option>
                    <option value="FGB">Formação Geral Básica (FGB)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Carga Horária (Horas)</label>
                  <input
                    type="number"
                    required
                    placeholder="80"
                    value={formData.carga_horaria || ''}
                    onChange={e => setFormData({ ...formData, carga_horaria: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Competência da BNCC Relacionada</label>
                <select
                  value={formData.bncc_competencia_id || ''}
                  onChange={e => setFormData({ ...formData, bncc_competencia_id: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                >
                  <option value="">Nenhuma / Não aplicável</option>
                  {bncc.map(b => (
                    <option key={b.id} value={b.id}>
                      [{b.codigo}] {b.area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-md"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
