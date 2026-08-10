import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Users, 
  GraduationCap, 
  Calendar,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('alunos');
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');

  // Input text & parsed rows
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getTurmas(),
      api.getDisciplinas()
    ]).then(([tRes, dRes]) => {
      setTurmas(tRes);
      setDisciplinas(dRes);
      if (tRes.length > 0) setSelectedTurma(tRes[0].id.toString());
      if (dRes.length > 0) setSelectedDisciplina(dRes[0].id.toString());
    });
  }, []);

  // Parse CSV text into array of objects
  const handleParseCsv = (text) => {
    setCsvText(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.trim().split('\n');
    if (lines.length === 0) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      rows.push(obj);
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleParseCsv(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setResultMsg(null);

    try {
      if (activeTab === 'alunos') {
        const res = await api.importAlunos(parsedRows, Number(selectedTurma));
        setResultMsg(`✅ Importação concluída! ${res.imported} novos alunos cadastrados e ${res.updated} atualizados.`);
      } else if (activeTab === 'desempenho') {
        const res = await api.importDesempenho(parsedRows, Number(selectedDisciplina));
        setResultMsg(`✅ Importação concluída! ${res.processed} lançamentos de notas processados.`);
      } else if (activeTab === 'frequencia') {
        const res = await api.importFrequencia(parsedRows);
        setResultMsg(`✅ Importação concluída! ${res.processed} registros de frequência importados.`);
      }

      setImporting(false);
      setParsedRows([]);
      setCsvText('');
    } catch (err) {
      console.error(err);
      setImporting(false);
      setResultMsg('❌ Erro na importação: ' + err.message);
    }
  };

  const downloadSampleTemplate = () => {
    let content = '';
    let filename = '';

    if (activeTab === 'alunos') {
      content = 'matricula,nome,status\n20261DS001,Ana Beatriz Souza,ativo\n20261DS002,Bruno Henrique Oliveira,em_risco\n20261DS003,Camila Fernandes Costa,ativo';
      filename = 'modelo_importacao_alunos.csv';
    } else if (activeTab === 'desempenho') {
      content = 'matricula,nome,nota,faltas,observacao\n20261DS001,Ana Beatriz Souza,9.5,1,Excelente raciocínio lógico\n20261DS002,Bruno Henrique Oliveira,4.5,8,Necessita nivelamento em algoritmos';
      filename = 'modelo_importacao_notas.csv';
    } else if (activeTab === 'frequencia') {
      content = 'matricula,nome,data,horario_entrada,horario_saida,local_leitor\n20261DS001,Ana Beatriz Souza,2026-08-10,07:28:00,11:45:00,Portaria Principal\n20261DS002,Bruno Henrique Oliveira,2026-08-10,07:32:00,,Portaria Principal';
      filename = 'modelo_importacao_frequencia.csv';
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-600" />
            <span>Central de Importação de Dados</span>
          </h2>
          <p className="text-xs text-slate-500">
            Importe listas de alunos, notas e registros de assiduidade em lote via arquivos CSV ou planilhas Excel.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold px-4 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-300 shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Baixar Modelo CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'alunos', label: '1. Importar Alunos', icon: Users },
          { id: 'desempenho', label: '2. Importar Notas e Faltas', icon: GraduationCap },
          { id: 'frequencia', label: '3. Importar Frequência', icon: Calendar },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setParsedRows([]);
                setCsvText('');
                setResultMsg(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Options Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid md:grid-cols-2 gap-4">
        {activeTab === 'alunos' && (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Selecione a Turma Destino</label>
            <select
              value={selectedTurma}
              onChange={e => setSelectedTurma(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
        )}

        {activeTab === 'desempenho' && (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Selecione a Disciplina Destino</label>
            <select
              value={selectedDisciplina}
              onChange={e => setSelectedDisciplina(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* CSV Input / Drag & Drop Area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">
            Cole os Dados CSV ou Selecione um Arquivo (.csv, .txt)
          </label>
          <input
            type="file"
            accept=".csv, .txt"
            onChange={handleFileUpload}
            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
          />
        </div>

        <textarea
          rows={5}
          placeholder="matricula,nome,status..."
          value={csvText}
          onChange={e => handleParseCsv(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono leading-relaxed text-slate-800 focus:bg-white focus:border-brand-600 outline-none transition-all"
        />
      </div>

      {/* Result Message */}
      {resultMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          resultMsg.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {resultMsg.startsWith('✅') ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{resultMsg}</span>
        </div>
      )}

      {/* PREVIEW TABLE */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-600" />
              <span>Pré-visualização dos Dados ({parsedRows.length} linhas detectadas)</span>
            </h3>

            <button
              onClick={handleExecuteImport}
              disabled={importing}
              className="bg-brand-600 text-white font-bold px-5 py-2 rounded-xl hover:bg-brand-700 transition-all text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {importing ? (
                <Sparkles className="w-4 h-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
              <span>{importing ? 'Importando...' : 'Confirmar e Importar no Banco'}</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider sticky top-0">
                <tr>
                  {Object.keys(parsedRows[0]).map((h, i) => (
                    <th key={i} className="p-3 bg-slate-100 border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="p-3 font-medium">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
