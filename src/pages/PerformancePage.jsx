import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { exportToExcel } from '../utils/exportUtils';
import { 
  FileSpreadsheet, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Info,
  Layers
} from 'lucide-react';

export default function PerformancePage() {
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('1');

  // Grid Data
  const [gridRows, setGridRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getTurmas(),
      api.getDisciplinas()
    ]).then(([turmaRes, discRes]) => {
      setTurmas(turmaRes);
      setDisciplinas(discRes);
      if (turmaRes.length > 0) setSelectedTurma(turmaRes[0].id.toString());
      if (discRes.length > 0) setSelectedDisciplina(discRes[0].id.toString());
    });
  }, []);

  const loadGrid = () => {
    if (!selectedTurma || !selectedDisciplina) return;
    setLoading(true);

    // Fetch students for class and performance entries
    Promise.all([
      api.getAlunos({ turma_id: selectedTurma }),
      api.getDesempenho({ turma_id: selectedTurma, disciplina_id: selectedDisciplina, trimestre: selectedTrimestre })
    ]).then(([alunos, desempenho]) => {
      const merged = alunos.map(aluno => {
        const existing = desempenho.find(d => d.aluno_id === aluno.id);
        return {
          aluno_id: aluno.id,
          aluno_nome: aluno.nome,
          matricula: aluno.matricula,
          disciplina_id: Number(selectedDisciplina),
          trimestre: Number(selectedTrimestre),
          nota: existing ? existing.nota : 7.0,
          faltas: existing ? existing.faltas : 0,
          observacao_comportamental: existing ? (existing.observacao_comportamental || '') : '',
          status: existing ? existing.status : 'regular'
        };
      });

      setGridRows(merged);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadGrid();
  }, [selectedTurma, selectedDisciplina, selectedTrimestre]);

  const handleCellChange = (index, field, value) => {
    const updated = [...gridRows];
    updated[index][field] = value;

    // Recalculate status dynamically
    if (field === 'nota' || field === 'faltas') {
      const nota = Number(updated[index].nota);
      const faltas = Number(updated[index].faltas);
      if (nota < 6.0) updated[index].status = 'em_recuperacao';
      else if (faltas >= 8) updated[index].status = 'em_observacao';
      else updated[index].status = 'regular';
    }

    setGridRows(updated);
  };

  const handleSaveBatch = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      await api.saveDesempenhoBatch(gridRows);
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadGrid();
    } catch (err) {
      console.error('Erro ao salvar lote:', err);
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = gridRows.map(r => ({
      Matrícula: r.matricula,
      Nome: r.aluno_nome,
      Nota: r.nota,
      Faltas: r.faltas,
      'Observação Comportamental': r.observacao_comportamental,
      Status: r.status === 'em_recuperacao' ? 'Em Recuperação' : r.status === 'em_observacao' ? 'Em Observação' : 'Regular'
    }));
    exportToExcel(dataToExport, `diario_desempenho_turma_${selectedTurma}.xlsx`, 'Desempenho');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Save CTA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lançamento de Desempenho em Lote</h2>
          <p className="text-xs text-slate-500">
            Interface estilo planilha editável para digitação rápida de notas, assiduidade e observações comportamentais semiestruturadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 transition-all text-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Planilha (XLSX)</span>
          </button>

          <button
            onClick={handleSaveBatch}
            disabled={saving}
            className="bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2 text-xs shadow-md disabled:opacity-50"
          >
            {saving ? (
              <Sparkles className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lançamentos da turma salvos com sucesso no banco SQLite!</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Turma EPT</label>
          <select
            value={selectedTurma}
            onChange={e => setSelectedTurma(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
          >
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Disciplina</label>
          <select
            value={selectedDisciplina}
            onChange={e => setSelectedDisciplina(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
          >
            {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome} ({d.tipo})</option>)}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Trimestre</label>
          <select
            value={selectedTrimestre}
            onChange={e => setSelectedTrimestre(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
          >
            <option value="1">1º Trimestre</option>
            <option value="2">2º Trimestre</option>
            <option value="3">3º Trimestre</option>
          </select>
        </div>
      </div>

      {/* EDITABLE SPREADSHEET GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
            <span className="text-xs">Carregando diário de classe da turma...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3 border-b border-slate-200">Matrícula</th>
                  <th className="p-3 border-b border-slate-200">Estudante</th>
                  <th className="p-3 border-b border-slate-200 w-28 text-center">Nota (0 - 10)</th>
                  <th className="p-3 border-b border-slate-200 w-24 text-center">Nº Faltas</th>
                  <th className="p-3 border-b border-slate-200">Observação Comportamental / Pedagógica</th>
                  <th className="p-3 border-b border-slate-200 w-32 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {gridRows.map((row, idx) => (
                  <tr key={row.aluno_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-slate-600 font-bold">{row.matricula}</td>
                    <td className="p-3 font-bold text-slate-900">{row.aluno_nome}</td>
                    
                    {/* Editable Nota */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.nota}
                        onChange={e => handleCellChange(idx, 'nota', e.target.value)}
                        className={`w-20 text-center font-bold p-1.5 rounded-lg border outline-none text-xs ${
                          Number(row.nota) < 6.0 
                            ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-2 focus:ring-rose-500' 
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-600'
                        }`}
                      />
                    </td>

                    {/* Editable Faltas */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={row.faltas}
                        onChange={e => handleCellChange(idx, 'faltas', e.target.value)}
                        className={`w-16 text-center font-bold p-1.5 rounded-lg border outline-none text-xs ${
                          Number(row.faltas) >= 8
                            ? 'bg-amber-50 border-amber-300 text-amber-800 focus:ring-2 focus:ring-amber-500'
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-600'
                        }`}
                      />
                    </td>

                    {/* Editable Observação */}
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Ex: Excelente participação / Dificuldade no laboratório..."
                        value={row.observacao_comportamental}
                        onChange={e => handleCellChange(idx, 'observacao_comportamental', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-brand-600 outline-none"
                      />
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        row.status === 'em_recuperacao'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : row.status === 'em_observacao'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {row.status === 'em_recuperacao' ? 'Em Recuperação' : row.status === 'em_observacao' ? 'Em Observação' : 'Regular'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
