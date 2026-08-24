import { db, initSchema, runQuery, getQuery, allQuery } from './database.js';

export const seedDatabase = async () => {
  console.log('🌱 Iniciando povoamento de dados mockup da SinergIA...');
  await initSchema();

  // Clean existing tables
  const tables = [
    'eventos_calendario',
    'ponto_biometrico',
    'relatorios_pedagogicos',
    'desempenho',
    'alunos',
    'professor_disciplina_turma',
    'professores',
    'turmas',
    'disciplinas',
    'bncc_competencias',
    'cursos',
    'escolas'
  ];

  for (const table of tables) {
    await runQuery(`DELETE FROM ${table};`);
    await runQuery(`DELETE FROM sqlite_sequence WHERE name='${table}';`).catch(() => {});
  }

  // 1. Escolas (Mockup Institucional)
  const escolaResult = await runQuery(
    `INSERT INTO escolas (nome, codigo_inep, cidade, uf) VALUES (?, ?, ?, ?)`,
    ['Instituto Tecnológico de Educação Profissional - ITEP', '31284920', 'São Paulo', 'SP']
  );
  const escolaId = escolaResult.id;

  // 2. BNCC Competências
  const bnccItems = [
    { codigo: 'EM13LGG101', area: 'Linguagens e suas Tecnologias', descricao: 'Compreender e usar a linguagem verbal e digital em processos de comunicação técnica e profissional.' },
    { codigo: 'EM13MAT301', area: 'Matemática e suas Tecnologias', descricao: 'Utilizar conceitos estatísticos, algébricos e geométricos para resolução de problemas e algoritmos.' },
    { codigo: 'EM13CNT201', area: 'Ciências da Natureza', descricao: 'Analisar e aplicar circuitos, fenômenos físicos e transformação de energia em protótipos industriais.' },
    { codigo: 'EM13CHS102', area: 'Ciências Humanas e Sociais', descricao: 'Avaliar os impactos socioambientais, éticos e trabalhistas das novas tecnologias na sociedade.' }
  ];

  const bnccIds = {};
  for (const item of bnccItems) {
    const res = await runQuery(
      `INSERT INTO bncc_competencias (codigo, area, descricao) VALUES (?, ?, ?)`,
      [item.codigo, item.area, item.descricao]
    );
    bnccIds[item.codigo] = res.id;
  }

  // 3. Cursos Técnicos
  const cursosData = [
    { nome: 'Técnico em Desenvolvimento de Sistemas', eixo: 'Informação e Comunicação', desc: 'Formação em desenvolvimento web, mobile, lógica de programação e banco de dados.' },
    { nome: 'Técnico em Logística', eixo: 'Gestão e Negócios', desc: 'Formação em supply chain, controle de estoque e operações de transporte.' },
    { nome: 'Técnico em Eletrônica', eixo: 'Controle e Processos Industriais', desc: 'Formação em circuitos elétricos, sistemas embarcados, IoT e microcontroladores.' },
    { nome: 'Técnico em Informática para Internet', eixo: 'Informação e Comunicação', desc: 'Formação em design de interfaces, frontend e redes de computadores.' }
  ];

  const cursoIds = {};
  for (const c of cursosData) {
    const res = await runQuery(
      `INSERT INTO cursos (escola_id, nome, eixo_tecnologico, descricao) VALUES (?, ?, ?, ?)`,
      [escolaId, c.nome, c.eixo, c.desc]
    );
    cursoIds[c.nome] = res.id;
  }

  // 4. Disciplinas
  const devSistemasId = cursoIds['Técnico em Desenvolvimento de Sistemas'];
  const logisticaId = cursoIds['Técnico em Logística'];
  const eletronicaId = cursoIds['Técnico em Eletrônica'];

  const disciplinasData = [
    // Dev Sistemas
    { curso_id: devSistemasId, nome: 'Algoritmos e Lógica de Programação', tipo: 'TECNICO', ch: 120, bncc: bnccIds['EM13MAT301'] },
    { curso_id: devSistemasId, nome: 'Bancos de Dados Relacionais', tipo: 'TECNICO', ch: 90, bncc: bnccIds['EM13MAT301'] },
    { curso_id: devSistemasId, nome: 'Programação Web I', tipo: 'TECNICO', ch: 100, bncc: bnccIds['EM13LGG101'] },
    { curso_id: devSistemasId, nome: 'Engenharia de Software', tipo: 'TECNICO', ch: 80, bncc: bnccIds['EM13CHS102'] },
    { curso_id: devSistemasId, nome: 'Língua Portuguesa e Comunicação Técnica', tipo: 'FGB', ch: 80, bncc: bnccIds['EM13LGG101'] },
    { curso_id: devSistemasId, nome: 'Matemática Aplicada', tipo: 'FGB', ch: 80, bncc: bnccIds['EM13MAT301'] },

    // Logística
    { curso_id: logisticaId, nome: 'Gestão de Almoxarifado e Estoques', tipo: 'TECNICO', ch: 90, bncc: bnccIds['EM13MAT301'] },
    { curso_id: logisticaId, nome: 'Logística Reversa e Sustentabilidade', tipo: 'TECNICO', ch: 60, bncc: bnccIds['EM13CHS102'] },
    { curso_id: logisticaId, nome: 'Transportes e Modais', tipo: 'TECNICO', ch: 80, bncc: bnccIds['EM13CHS102'] },

    // Eletrônica
    { curso_id: eletronicaId, nome: 'Circuitos Elétricos em CC e CA', tipo: 'TECNICO', ch: 100, bncc: bnccIds['EM13CNT201'] },
    { curso_id: eletronicaId, nome: 'Microcontroladores e ESP32', tipo: 'TECNICO', ch: 90, bncc: bnccIds['EM13CNT201'] }
  ];

  const disciplinaIds = {};
  for (const d of disciplinasData) {
    const res = await runQuery(
      `INSERT INTO disciplinas (curso_id, nome, tipo, carga_horaria, bncc_competencia_id) VALUES (?, ?, ?, ?, ?)`,
      [d.curso_id, d.nome, d.tipo, d.ch, d.bncc]
    );
    disciplinaIds[d.nome] = res.id;
  }

  // 5. Turmas
  const turmasData = [
    { curso_id: devSistemasId, nome: '1º Des. de Sistemas', ano: 2026, periodo: '1º Semestre' },
    { curso_id: devSistemasId, nome: '3º Des. de Sistemas', ano: 2026, periodo: '1º Semestre' },
    { curso_id: logisticaId, nome: '1º Logística', ano: 2026, periodo: '1º Semestre' },
    { curso_id: eletronicaId, nome: '1º Eletrônica', ano: 2026, periodo: '1º Semestre' }
  ];

  const turmaIds = {};
  for (const t of turmasData) {
    const res = await runQuery(
      `INSERT INTO turmas (curso_id, nome, ano_letivo, periodo) VALUES (?, ?, ?, ?)`,
      [t.curso_id, t.nome, t.ano, t.periodo]
    );
    turmaIds[t.nome] = res.id;
  }

  // 6. Professores
  const profsData = [
    { nome: 'Prof. Carlos Eduardo', email: 'carlos.eduardo@itep.edu.br', cargo: 'Docente EBTT', espec: 'Desenvolvimento Web e Algoritmos' },
    { nome: 'Profa. Ana Paula Santos', email: 'ana.santos@itep.edu.br', cargo: 'Docente EBTT', espec: 'Banco de Dados e Engenharia de Software' },
    { nome: 'Prof. Marcos Vinícius', email: 'marcos.vinicius@itep.edu.br', cargo: 'Coordenador Pedagógico', espec: 'Gestão de Logística' },
    { nome: 'Profa. Juliana Lima', email: 'juliana.lima@itep.edu.br', cargo: 'Supervisora Pedagógica', espec: 'Linguagens e Educação Profissional' }
  ];

  const profIds = {};
  for (const p of profsData) {
    const res = await runQuery(
      `INSERT INTO professores (nome, email, cargo, especialidade) VALUES (?, ?, ?, ?)`,
      [p.nome, p.email, p.cargo, p.espec]
    );
    profIds[p.nome] = res.id;
  }

  // Vinculação Professores a Turmas e Disciplinas
  const t1Dev = turmaIds['1º Des. de Sistemas'];
  const dAlgo = disciplinaIds['Algoritmos e Lógica de Programação'];
  const dBanco = disciplinaIds['Bancos de Dados Relacionais'];
  const dWeb = disciplinaIds['Programação Web I'];

  await runQuery(`INSERT INTO professor_disciplina_turma (professor_id, disciplina_id, turma_id) VALUES (?, ?, ?)`, [profIds['Prof. Carlos Eduardo'], dAlgo, t1Dev]);
  await runQuery(`INSERT INTO professor_disciplina_turma (professor_id, disciplina_id, turma_id) VALUES (?, ?, ?)`, [profIds['Profa. Ana Paula Santos'], dBanco, t1Dev]);
  await runQuery(`INSERT INTO professor_disciplina_turma (professor_id, disciplina_id, turma_id) VALUES (?, ?, ?)`, [profIds['Prof. Carlos Eduardo'], dWeb, t1Dev]);

  // 7. Alunos da turma 1º Des. de Sistemas (12 alunos mockados)
  const alunosDev = [
    { nome: 'Ana Beatriz Souza', matricula: '20261DS001', status: 'ativo' },
    { nome: 'Bruno Henrique Oliveira', matricula: '20261DS002', status: 'em_risco' },
    { nome: 'Camila Fernandes Costa', matricula: '20261DS003', status: 'ativo' },
    { nome: 'Diego Rodrigues Lima', matricula: '20261DS004', status: 'em_risco' },
    { nome: 'Eduardo Gabriel Alves', matricula: '20261DS005', status: 'ativo' },
    { nome: 'Fernanda Maria Silva', matricula: '20261DS006', status: 'ativo' },
    { nome: 'Gabriel Santos Pereira', matricula: '20261DS007', status: 'ativo' },
    { nome: 'Heitor Carvalho Melo', matricula: '20261DS008', status: 'em_risco' },
    { nome: 'Isabela Martins Ribeiro', matricula: '20261DS009', status: 'ativo' },
    { nome: 'João Pedro Barbosa', matricula: '20261DS010', status: 'ativo' },
    { nome: 'Lucas Teixeira Mendes', matricula: '20261DS011', status: 'evadido' },
    { nome: 'Mariana Rocha Freitas', matricula: '20261DS012', status: 'ativo' }
  ];

  const alunoIdsDev = [];
  for (const a of alunosDev) {
    const res = await runQuery(
      `INSERT INTO alunos (turma_id, matricula, nome, status) VALUES (?, ?, ?, ?)`,
      [t1Dev, a.matricula, a.nome, a.status]
    );
    alunoIdsDev.push({ id: res.id, nome: a.nome, status: a.status });
  }

  // 8. Lançamento de Desempenho (Trimestre 1)
  const desempenhoData = [
    // Ana Beatriz (Excelente)
    { aluno: 0, d: dAlgo, nota: 9.5, faltas: 1, obs: 'Excelente capacidade de abstração lógica e auxílio aos colegas de grupo.', status: 'regular' },
    { aluno: 0, d: dBanco, nota: 9.0, faltas: 0, obs: 'Compreende com facilidade modelagem ER e consultas SQL.', status: 'regular' },
    { aluno: 0, d: dWeb, nota: 9.8, faltas: 2, obs: 'Proativa, projetos bem estruturados em HTML e CSS.', status: 'regular' },

    // Bruno Henrique (Em Risco / Recuperação)
    { aluno: 1, d: dAlgo, nota: 4.5, faltas: 8, obs: 'Dificuldade com estruturas de repetição (while/for). Faltas frequentes às terças.', status: 'em_recuperacao' },
    { aluno: 1, d: dBanco, nota: 5.0, faltas: 6, obs: 'Entregou apenas metade da lista de exercícios de junções SQL.', status: 'em_recuperacao' },
    { aluno: 1, d: dWeb, nota: 5.5, faltas: 5, obs: 'Apresenta ritmo mais lento e falta de prática individual no laboratório.', status: 'em_recuperacao' },

    // Camila Fernandes (Regular)
    { aluno: 2, d: dAlgo, nota: 7.5, faltas: 2, obs: 'Desempenho satisfatório, boa participação nas discussões teóricas.', status: 'regular' },
    { aluno: 2, d: dBanco, nota: 7.0, faltas: 3, obs: 'Boa evolução nas últimas avaliações práticas.', status: 'regular' },

    // Diego Rodrigues (Em Observação)
    { aluno: 3, d: dAlgo, nota: 5.2, faltas: 10, obs: 'Faltas concentradas em dias de avaliações práticas. Demonstra ansiedade.', status: 'em_observacao' },
    { aluno: 3, d: dBanco, nota: 4.8, faltas: 9, obs: 'Dificuldade na interpretação dos requisitos de modelagem.', status: 'em_recuperacao' },

    // Eduardo Gabriel (Bom)
    { aluno: 4, d: dAlgo, nota: 8.2, faltas: 2, obs: 'Bons resultados em algoritmos, pontual nas entregas.', status: 'regular' },
    { aluno: 4, d: dBanco, nota: 8.5, faltas: 1, obs: 'Participação ativa nas aulas de laboratório.', status: 'regular' },

    // Fernanda Maria (Muito Boa)
    { aluno: 5, d: dAlgo, nota: 8.8, faltas: 0, obs: 'Ótima assimilação de funções e vetores.', status: 'regular' },
    { aluno: 5, d: dBanco, nota: 9.2, faltas: 0, obs: 'Construiu diagramas ER impecáveis no projeto prático.', status: 'regular' },

    // Gabriel Santos (Regular)
    { aluno: 6, d: dAlgo, nota: 6.8, faltas: 4, obs: 'Necessita reforço na transição entre pseudocódigo e código em C/JavaScript.', status: 'regular' },
    { aluno: 6, d: dBanco, nota: 6.5, faltas: 3, obs: 'Desempenho mediano, necessita atentar para prazos.', status: 'regular' },

    // Heitor Carvalho (Em Risco)
    { aluno: 7, d: dAlgo, nota: 4.0, faltas: 12, obs: 'Alto número de faltas. Necessita de acompanhamento da supervisão pedagógica.', status: 'em_recuperacao' },
    { aluno: 7, d: dBanco, nota: 4.2, faltas: 11, obs: 'Não realizou a recuperação paralela do mês 2.', status: 'em_recuperacao' },

    // Isabela Martins (Ótima)
    { aluno: 8, d: dAlgo, nota: 9.0, faltas: 1, obs: 'Demonstra autonomia no desenvolvimento de códigos.', status: 'regular' },

    // João Pedro (Bom)
    { aluno: 9, d: dAlgo, nota: 7.8, faltas: 2, obs: 'Empenhado e colaborativo nas atividades de dupla.', status: 'regular' }
  ];

  for (const item of desempenhoData) {
    const alunoId = alunoIdsDev[item.aluno].id;
    await runQuery(
      `INSERT INTO desempenho (aluno_id, disciplina_id, trimestre, nota, faltas, observacao_comportamental, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alunoId, item.d, 1, item.nota, item.faltas, item.obs, item.status]
    );
  }

  // 9. Relatório Pedagógico Gerado por IA (Rascunho de demonstração)
  const alunosAtencaoExemplo = JSON.stringify([
    { identificador: 'Aluno B', motivo: 'Média 4.8 e 8 faltas em Algoritmos. Dificuldade em laços de repetição.', recomendacao: 'Acompanhamento em monitoria e nivelamento de raciocínio lógico.' },
    { identificador: 'Aluno D', motivo: 'Média 5.0 e 10 faltas. Faltas concentradas às terças-feiras.', recomendacao: 'Contato com responsáveis para investigação de motivo de ausência periódica.' },
    { identificador: 'Aluno H', motivo: 'Média 4.1 e 12 faltas. Não realizou avaliação substitutiva.', recomendacao: 'Encaminhamento prioritário à Supervisão Pedagógica.' }
  ]);

  await runQuery(
    `INSERT INTO relatorios_pedagogicos (turma_id, trimestre, sintese_geral, padroes_coletivos, alunos_atencao_json, sugestoes_encaminhamento, status, modelo_llm, tokens_utilizados) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      t1Dev,
      1,
      'A turma de 1º Desenvolvimento de Sistemas apresenta um desempenho médio geral positivo (6.8), com destaque para elevado engajamento prático nas aulas de Programação Web e Algoritmos. No entanto, observa-se uma dispersão entre um grupo de alto rendimento e um subgrupo de estudantes enfrentando dificuldades na transição para o raciocínio computacional abstrato.',
      'Identificou-se que 25% da turma concentra 60% das faltas totais do trimestre, com forte correlação entre ausências às terças-feiras e notas abaixo da média em Algoritmos e Lógica de Programação. A transição entre abstração (pseudocódigo) e sintaxe formal da linguagem representa o principal gargalo pedagógico coletivo.',
      alunosAtencaoExemplo,
      '1. Implementar oficina de nivelamento de lógica de programação utilizando metodologias ativas e resolução de problemas visuais.\n2. Organizar quadro de monitoria entre pares (estudantes com desempenho acima de 8.5 auxiliando colegas em recuperação).\n3. Realizar busca ativa conjunta entre coordenação de curso e supervisão pedagógica para alunos com mais de 8 faltas no trimestre.',
      'rascunho_ia',
      'gemini-1.5-flash',
      1240
    ]
  );

  // 10. Ponto Biométrico Simulado (ESP32 mock para Alertas de Frequência)
  const hoje = new Date().toISOString().split('T')[0];
  await runQuery(
    `INSERT INTO ponto_biometrico (aluno_id, data, horario_entrada, horario_saida, local_leitor) VALUES (?, ?, ?, ?, ?)`,
    [alunoIdsDev[1].id, hoje, '07:28:00', '11:45:00', 'Portaria Principal ESP32'] // Presente de manhã
  );
  await runQuery(
    `INSERT INTO ponto_biometrico (aluno_id, data, horario_entrada, horario_saida, local_leitor) VALUES (?, ?, ?, ?, ?)`,
    [alunoIdsDev[3].id, hoje, '07:32:00', null, 'Portaria Principal ESP32'] // Entrou mas sem saída registrada
  );

  // 11. Eventos do Calendário Acadêmico (com sobreposição intencional na mesma semana)
  await runQuery(
    `INSERT INTO eventos_calendario (turma_id, titulo, tipo, data, descricao) VALUES (?, ?, ?, ?, ?)`,
    [t1Dev, 'Avaliação Teórica de Algoritmos (P1)', 'prova', '2026-08-20', 'Prova individual sobre estruturas condicionais e laços. Valendo 30 pontos.']
  );
  await runQuery(
    `INSERT INTO eventos_calendario (turma_id, titulo, tipo, data, descricao) VALUES (?, ?, ?, ?, ?)`,
    [t1Dev, 'Entrega do Projeto de Banco de Dados', 'projeto', '2026-08-21', 'Apresentação do Diagrama ER e scripts SQL de criação de tabelas. Valendo 25 pontos.']
  ); // Mesma semana! Sobreposição para demonstrar alerta de prevenção de sobrecarga.
  await runQuery(
    `INSERT INTO eventos_calendario (turma_id, titulo, tipo, data, descricao) VALUES (?, ?, ?, ?, ?)`,
    [t1Dev, 'Semana Tecnológica Institucional', 'evento_escolar', '2026-08-28', 'Palestras e minicursos de inovação tecnológica e EPT.']
  );

  console.log('✅ Carga de dados mockup concluída com sucesso!');
};

// If called directly via node server/db/seed.js
if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  });
}
