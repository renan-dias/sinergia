import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Building2, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles,
  Play
} from 'lucide-react';

export default function SchoolSetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [escola, setEscola] = useState({ nome: '', codigo_inep: '', cidade: '', uf: 'MG' });
  const [cursos, setCursos] = useState([
    { nome: 'Técnico em Desenvolvimento de Sistemas', eixo_tecnologico: 'Informação e Comunicação', descricao: 'Formação em desenvolvimento de software e web.' },
    { nome: 'Técnico em Edificações', eixo_tecnologico: 'Infraestrutura', descricao: 'Formação em projetos e obras da construção civil.' }
  ]);
  const [disciplinas, setDisciplinas] = useState([
    { curso_nome: 'Técnico em Desenvolvimento de Sistemas', nome: 'Algoritmos e Lógica de Programação', tipo: 'TECNICO', carga_horaria: 120 },
    { curso_nome: 'Técnico em Desenvolvimento de Sistemas', nome: 'Programação Web I', tipo: 'TECNICO', carga_horaria: 100 },
    { curso_nome: 'Técnico em Desenvolvimento de Sistemas', nome: 'Língua Portuguesa Instrumental', tipo: 'FGB', carga_horaria: 80 }
  ]);
  const [professores, setProfessores] = useState([
    { nome: 'Prof. Carlos Eduardo', email: 'carlos@escola.edu.br', cargo: 'Docente EBTT', especialidade: 'Programação Web' }
  ]);
  const [turmas, setTurmas] = useState([
    { curso_nome: 'Técnico em Desenvolvimento de Sistemas', nome: '1º Des. de Sistemas', ano_letivo: 2026, periodo: '1º Semestre' }
  ]);

  // Handlers for adding/removing array items
  const addCurso = () => setCursos([...cursos, { nome: '', eixo_tecnologico: 'Informação e Comunicação', descricao: '' }]);
  const removeCurso = (idx) => setCursos(cursos.filter((_, i) => i !== idx));

  const addDisciplina = () => setDisciplinas([...disciplinas, { curso_nome: cursos[0]?.nome || '', nome: '', tipo: 'TECNICO', carga_horaria: 80 }]);
  const removeDisciplina = (idx) => setDisciplinas(disciplinas.filter((_, i) => i !== idx));

  const addProfessor = () => setProfessores([...professores, { nome: '', email: '', cargo: 'Docente EBTT', especialidade: '' }]);
  const removeProfessor = (idx) => setProfessores(professores.filter((_, i) => i !== idx));

  const addTurma = () => setTurmas([...turmas, { curso_nome: cursos[0]?.nome || '', nome: '', ano_letivo: 2026, periodo: '1º Semestre' }]);
  const removeTurma = (idx) => setTurmas(turmas.filter((_, i) => i !== idx));

  const handleSubmitSetup = async () => {
    if (!escola.nome) {
      alert('Por favor, informe o nome da sua escola.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Wipe existing sample data
      await api.resetDb();

      // 2. Insert custom school batch
      await api.setupSchool({
        escola,
        cursos,
        disciplinas,
        professores,
        turmas
      });

      setSubmitting(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao configurar escola:', err);
      alert('Falha ao cadastrar escola: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-brand-600/30 text-emerald-400 px-4 py-1.5 rounded-full border border-brand-500/30 text-xs font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Configuração Inicial — Cadastre sua Instituição</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Bem-vindo à SinergIA</h1>
          <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
            Cadastre os dados da sua instituição de ensino técnico para personalizar o sistema de gestão gerencial assistido por Inteligência Artificial.
          </p>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs">
          {[
            { num: 1, label: '1. Escola' },
            { num: 2, label: '2. Cursos' },
            { num: 3, label: '3. Disciplinas' },
            { num: 4, label: '4. Professores' },
            { num: 5, label: '5. Turmas' },
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                step === s.num
                  ? 'bg-brand-600 text-white shadow-md'
                  : step > s.num
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {step > s.num && <Check className="w-3.5 h-3.5" />}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* STEP 1: ESCOLA */}
        {step === 1 && (
          <div className="bg-slate-800/90 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Passo 1: Dados da Escola ou Instituto</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Nome da Escola / Campus *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Instituto Federal de Educação - Campus Central"
                  value={escola.nome}
                  onChange={e => setEscola({ ...escola, nome: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Código INEP (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 31284920"
                  value={escola.codigo_inep}
                  onChange={e => setEscola({ ...escola, codigo_inep: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Cidade *</label>
                  <input
                    type="text"
                    placeholder="Ex: Poços de Caldas"
                    value={escola.cidade}
                    onChange={e => setEscola({ ...escola, cidade: e.target.value })}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">UF *</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="MG"
                    value={escola.uf}
                    onChange={e => setEscola({ ...escola, uf: e.target.value.toUpperCase() })}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-bold outline-none focus:border-brand-500 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CURSOS TÉCNICOS */}
        {step === 2 && (
          <div className="bg-slate-800/90 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Passo 2: Cursos Técnicos Ofertados</span>
              </h2>
              <button
                onClick={addCurso}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Curso</span>
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {cursos.map((c, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3 relative text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-400">
                    <span>Curso #{idx + 1}</span>
                    {cursos.length > 1 && (
                      <button onClick={() => removeCurso(idx)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Nome do Curso Técnico</label>
                      <input
                        type="text"
                        placeholder="Ex: Técnico em Enfermagem"
                        value={c.nome}
                        onChange={e => {
                          const updated = [...cursos];
                          updated[idx].nome = e.target.value;
                          setCursos(updated);
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Eixo Tecnológico</label>
                      <input
                        type="text"
                        placeholder="Ex: Ambiente e Saúde"
                        value={c.eixo_tecnologico}
                        onChange={e => {
                          const updated = [...cursos];
                          updated[idx].eixo_tecnologico = e.target.value;
                          setCursos(updated);
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DISCIPLINAS */}
        {step === 3 && (
          <div className="bg-slate-800/90 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Passo 3: Disciplinas do Curso</span>
              </h2>
              <button
                onClick={addDisciplina}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Disciplina</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {disciplinas.map((d, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 grid md:grid-cols-4 gap-3 text-xs items-center">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Nome da Disciplina</label>
                    <input
                      type="text"
                      placeholder="Ex: Anatomia Aplicada"
                      value={d.nome}
                      onChange={e => {
                        const updated = [...disciplinas];
                        updated[idx].nome = e.target.value;
                        setDisciplinas(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Curso Vinculado</label>
                    <select
                      value={d.curso_nome}
                      onChange={e => {
                        const updated = [...disciplinas];
                        updated[idx].curso_nome = e.target.value;
                        setDisciplinas(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    >
                      {cursos.map((c, i) => <option key={i} value={c.nome}>{c.nome || `Curso #${i+1}`}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Tipo de Formação</label>
                    <select
                      value={d.tipo}
                      onChange={e => {
                        const updated = [...disciplinas];
                        updated[idx].tipo = e.target.value;
                        setDisciplinas(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold"
                    >
                      <option value="TECNICO">Itinerário Técnico</option>
                      <option value="FGB">Formação Geral Básica (FGB)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-slate-400 font-semibold block mb-1">Carga Horária (h)</label>
                      <input
                        type="number"
                        placeholder="80"
                        value={d.carga_horaria}
                        onChange={e => {
                          const updated = [...disciplinas];
                          updated[idx].carga_horaria = Number(e.target.value);
                          setDisciplinas(updated);
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-mono"
                      />
                    </div>
                    {disciplinas.length > 1 && (
                      <button onClick={() => removeDisciplina(idx)} className="text-slate-500 hover:text-rose-400 pt-5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: PROFESSORES */}
        {step === 4 && (
          <div className="bg-slate-800/90 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Passo 4: Corpo Docente (Professores)</span>
              </h2>
              <button
                onClick={addProfessor}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Docente</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {professores.map((p, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 grid md:grid-cols-3 gap-3 text-xs items-center">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Ex: Profa. Maria Silva"
                      value={p.nome}
                      onChange={e => {
                        const updated = [...professores];
                        updated[idx].nome = e.target.value;
                        setProfessores(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">E-mail Institucional</label>
                    <input
                      type="email"
                      placeholder="maria.silva@escola.edu.br"
                      value={p.email}
                      onChange={e => {
                        const updated = [...professores];
                        updated[idx].email = e.target.value;
                        setProfessores(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-slate-400 font-semibold block mb-1">Especialidade</label>
                      <input
                        type="text"
                        placeholder="Ex: Enfermagem / Saúde"
                        value={p.especialidade}
                        onChange={e => {
                          const updated = [...professores];
                          updated[idx].especialidade = e.target.value;
                          setProfessores(updated);
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                      />
                    </div>
                    {professores.length > 1 && (
                      <button onClick={() => removeProfessor(idx)} className="text-slate-500 hover:text-rose-400 pt-5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: TURMAS */}
        {step === 5 && (
          <div className="bg-slate-800/90 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <span>Passo 5: Turmas Iniciais</span>
              </h2>
              <button
                onClick={addTurma}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Turma</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {turmas.map((t, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 grid md:grid-cols-3 gap-3 text-xs items-center">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Nome da Turma</label>
                    <input
                      type="text"
                      placeholder="Ex: 1º Enfermagem Matutino"
                      value={t.nome}
                      onChange={e => {
                        const updated = [...turmas];
                        updated[idx].nome = e.target.value;
                        setTurmas(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Curso Vinculado</label>
                    <select
                      value={t.curso_nome}
                      onChange={e => {
                        const updated = [...turmas];
                        updated[idx].curso_nome = e.target.value;
                        setTurmas(updated);
                      }}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    >
                      {cursos.map((c, i) => <option key={i} value={c.nome}>{c.nome || `Curso #${i+1}`}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-slate-400 font-semibold block mb-1">Ano Letivo</label>
                      <input
                        type="number"
                        placeholder="2026"
                        value={t.ano_letivo}
                        onChange={e => {
                          const updated = [...turmas];
                          updated[idx].ano_letivo = Number(e.target.value);
                          setTurmas(updated);
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-mono"
                      />
                    </div>
                    {turmas.length > 1 && (
                      <button onClick={() => removeTurma(idx)} className="text-slate-500 hover:text-rose-400 pt-5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/demo')}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-5 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-700"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Usar Modo Demonstração (/demo)</span>
              </button>
            )}
          </div>

          <div>
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2 shadow-lg"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitSetup}
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3 rounded-xl transition-all text-xs flex items-center gap-2 shadow-xl disabled:opacity-50"
              >
                {submitting ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{submitting ? 'Finalizando Cadastro...' : 'Concluir Cadastro & Entrar na SinergIA'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
