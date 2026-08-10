import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  AlertCircle, 
  UserCheck, 
  UserX,
  Sparkles
} from 'lucide-react';

export default function StudentsPage() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ status: 'ativo' });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getAlunos({ turma_id: selectedTurma, status: selectedStatus, search }),
      api.getTurmas()
    ]).then(([alunoRes, turmaRes]) => {
      setAlunos(alunoRes);
      setTurmas(turmaRes);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [selectedTurma, selectedStatus, search]);

  const handleCreateAluno = async (e) => {
    e.preventDefault();
    await api.createAluno(formData);
    setShowModal(false);
    setFormData({ status: 'ativo' });
    loadData();
  };

  const handleExportExcel = () => {
    const dataToExport = alunos.map(a => ({
      Matrícula: a.matricula,
      Nome: a.nome,
      Turma: a.turma_nome,
      Curso: a.curso_nome,
      Status: a.status === 'ativo' ? 'Ativo' : a.status === 'em_risco' ? 'Em Risco' : 'Evadido'
    }));
    exportToExcel(dataToExport, 'lista_estudantes_sinergia.xlsx', 'Estudantes');
  };

  const handleExportPDF = () => {
    const headers = ['Matrícula', 'Nome do Estudante', 'Turma', 'Status'];
    const rows = alunos.map(a => [
      a.matricula,
      a.nome,
      a.turma_nome,
      a.status === 'ativo' ? 'Ativo' : a.status === 'em_risco' ? 'Em Risco' : 'Evadido'
    ]);
    exportToPDF({
      title: 'Listagem Oficial de Estudantes EPT',
      subtitle: `Filtro: ${selectedTurma ? 'Turma selecionada' : 'Todas as turmas'} | Total: ${alunos.length} alunos`,
      tableHeaders: headers,
      tableRows: rows,
      filename: 'estudantes_sinergia.pdf'
    });
  };

  if (loading && alunos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-brand-600" />
        <span>Carregando cadastro de estudantes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner & Export Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestão de Estudantes EPT</h2>
          <p className="text-xs text-slate-500">
            Acompanhe o status de matrículas, sinalização preventiva de riscos e vinculação a turmas técnicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold px-3.5 py-2 rounded-xl border border-emerald-200 transition-all text-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel (.XLSX)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold px-3.5 py-2 rounded-xl border border-slate-200 transition-all text-xs flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-brand-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-600 outline-none"
          />
        </div>

        <select
          value={selectedTurma}
          onChange={e => setSelectedTurma(e.target.value)}
          className="w-full sm:w-48 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
        >
          <option value="">Todas as Turmas</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="w-full sm:w-40 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
        >
          <option value="">Todos os Status</option>
          <option value="ativo">Regular / Ativo</option>
          <option value="em_risco">Em Risco</option>
          <option value="evadido">Evadido</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Matrícula</th>
                <th className="p-3.5">Nome do Aluno</th>
                <th className="p-3.5">Turma Vinculada</th>
                <th className="p-3.5">Curso Técnico</th>
                <th className="p-3.5">Status de Risco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 italic">
                    Nenhum aluno encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                alunos.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-600">{a.matricula}</td>
                    <td className="p-3.5 font-bold text-slate-900">{a.nome}</td>
                    <td className="p-3.5 font-medium">{a.turma_nome}</td>
                    <td className="p-3.5 text-slate-500">{a.curso_nome}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'ativo' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : a.status === 'em_risco' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {a.status === 'ativo' && <UserCheck className="w-3 h-3 text-emerald-600" />}
                        {a.status === 'em_risco' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {a.status === 'evadido' && <UserX className="w-3 h-3 text-slate-500" />}
                        {a.status === 'ativo' ? 'Ativo / Regular' : a.status === 'em_risco' ? 'Em Risco Preventivo' : 'Evadido'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STUDENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Estudante</h3>
            
            <form onSubmit={handleCreateAluno} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Turma Vinculada</label>
                <select
                  required
                  value={formData.turma_id || ''}
                  onChange={e => setFormData({ ...formData, turma_id: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione a Turma...</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Matrícula Escolar</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 20261DS015"
                  value={formData.matricula || ''}
                  onChange={e => setFormData({ ...formData, matricula: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do aluno"
                  value={formData.nome || ''}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Status Inicial</label>
                <select
                  value={formData.status || 'ativo'}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="ativo">Ativo / Regular</option>
                  <option value="em_risco">Em Risco Preventivo</option>
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
                  Salvar Estudante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
