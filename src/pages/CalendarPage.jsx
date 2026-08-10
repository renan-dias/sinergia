import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Calendar, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Trash2,
  Clock,
  BookOpen
} from 'lucide-react';

export default function CalendarPage() {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'prova' });

  const loadEvents = () => {
    setLoading(true);
    Promise.all([
      api.getTurmas(),
      api.getCalendarEvents(selectedTurma)
    ]).then(([turmaRes, eventRes]) => {
      setTurmas(turmaRes);
      if (!selectedTurma && turmaRes.length > 0) {
        setSelectedTurma(turmaRes[0].id.toString());
      }
      setEventos(eventRes);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadEvents();
  }, [selectedTurma]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    await api.createCalendarEvent({ ...formData, turma_id: selectedTurma || turmas[0]?.id });
    setShowModal(false);
    setFormData({ tipo: 'prova' });
    loadEvents();
  };

  const handleDeleteEvent = async (id) => {
    if (confirm('Deseja remover este evento do calendário acadêmico?')) {
      await api.deleteCalendarEvent(id);
      loadEvents();
    }
  };

  const overLappingCount = eventos.filter(e => e.temSobreposicao).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Plataforma Viva de Calendário Acadêmico</h2>
          <p className="text-xs text-slate-500">
            Monitoramento integrado de avaliações com algoritmo automático de prevenção de sobrecarga semanal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTurma}
            onChange={e => setSelectedTurma(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
          >
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-1.5 text-xs shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Avaliação</span>
          </button>
        </div>
      </div>

      {/* OVERLAP ALERT BANNER (Eixo 2 Requirement) */}
      {overLappingCount > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-950 flex items-center gap-2">
              <span>Alerta do Eixo 2: Sobreposição de Avaliações Identificada!</span>
              <span className="bg-rose-200 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                {overLappingCount} eventos em conflito
              </span>
            </div>
            <p className="text-rose-800 leading-relaxed text-[11px]">
              Foram detectadas 2 ou mais avaliações/projetos agendados na mesma semana para a turma selecionada. Recomendamos o redimensionamento das datas para evitar a sobrecarga cognitiva dos estudantes.
            </p>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
            <span className="text-xs">Carregando calendário...</span>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 italic text-xs">
            Nenhum evento agendado para esta turma.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventos.map(event => (
              <div 
                key={event.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                  event.temSobreposicao 
                    ? 'bg-rose-50/50 border-rose-300 shadow-sm' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    event.tipo === 'prova' ? 'bg-rose-100 text-rose-800' : event.tipo === 'projeto' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.tipo}
                  </span>

                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{event.titulo}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{event.descricao || 'Sem descrição.'}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    {new Date(event.data).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-[11px] text-slate-400">{event.turma_nome}</span>
                </div>

                {/* Overlap badge */}
                {event.temSobreposicao && (
                  <div className="bg-rose-100 text-rose-800 text-[10px] p-2 rounded-xl border border-rose-200 font-semibold space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Conflito na mesma semana com:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                      {event.sobreposicoes.map(s => (
                        <li key={s.id}>{s.titulo} ({new Date(s.data).toLocaleDateString('pt-BR')})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Agendar Novo Evento / Avaliação</h3>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Título da Avaliação ou Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prova Substitutiva de Algoritmos"
                  value={formData.titulo || ''}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Tipo de Evento</label>
                  <select
                    value={formData.tipo || 'prova'}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="prova">Prova / Avaliação</option>
                    <option value="projeto">Projeto Prático</option>
                    <option value="atividade">Atividade Continuada</option>
                    <option value="evento_escolar">Evento Escolar</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Data do Evento</label>
                  <input
                    type="date"
                    required
                    value={formData.data || ''}
                    onChange={e => setFormData({ ...formData, data: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Descrição / Observações</label>
                <textarea
                  rows={3}
                  placeholder="Conteúdos cobrados, critérios de avaliação..."
                  value={formData.descricao || ''}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
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
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
