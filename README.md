# SinergIA — Sistema de Informação Gerencial Potencializado por IA para Educação Profissional e Tecnológica (EPT)

> Protótipo funcional do Sistema de Informação Gerencial (SIG) desenvolvido como produto técnico do Relatório de Formação (TCC) de Pós-Graduação em Gestão na EPT — **IFSULDEMINAS (Campus Poços de Caldas)**.

---

## 📌 Apresentação & Contexto

A **SinergIA** existe para reduzir a **"lacuna de tradução"** entre a equipe pedagógica e a equipe técnica nas escolas de Educação Profissional e Tecnológica (EPT). O sistema transforma dados brutos de notas, assiduidade e observações comportamentais semiestruturadas em **pareceres pedagógicos despersonalizados e orientados por evidências**, sem jamais substituir o julgamento humano do professor ou coordenador pedagógico.

### 🌟 Pilares Fundamentais do Protótipo

1. **Privacidade e Pseudonimização LGPD**: Antes de qualquer envio de dados para serviços externos de Inteligência Artificial (LLM - Gemini), os nomes dos estudantes são convertidos em identificadores pseudônimos ("Aluno A", "Aluno B"). A reidentificação aos nomes reais ocorre exclusivamente no navegador local do professor.
2. **Humano no Circuito (Human-in-the-Loop)**: Todo parecer gerado pela IA é apresentado obrigatoriamente como um **rascunho editável**. Nenhuma decisão ou parecer é publicado automaticamente sem a revisão, edição e validação formal de um docente ou coordenador.
3. **Economia de Tokens & LLM Flexível**: Estruturação compacta de prompts com suporte a múltiplos modelos da família Gemini (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) com fallback de simulação pedagógica local.
4. **Articulação EPT & BNCC**: Mapeamento completo de disciplinas do Itinerário Técnico e da Formação Geral Básica (FGB) associadas às competências da BNCC.
5. **Exportação Multiformato**: Exportação nativa de relatórios pedagógicos e diários para **PDF**, **Excel (XLSX)** e **Word (DOCX)**.
6. **Plataforma Viva de Calendário (Eixo 2)**: Algoritmo automático de detecção de sobreposição de avaliações na mesma semana.
7. **Camada de API Interna (Eixo 3)**: Endpoints REST v1 versionados e documentados para integração futura como hub central.

---

## 🛠️ Stack Técnica

- **Frontend**: React 19 (Vite), React Router v7, TailwindCSS, Recharts (gráficos), Lucide React.
- **Exportações**: `jspdf` & `jspdf-autotable` (PDF), `xlsx` (Excel), `docx` & `file-saver` (Word).
- **Backend**: Node.js (Express) com suporte a roteamento REST v1 (`/api/v1/...`).
- **Banco de Dados**: SQLite3 (armazenado em `sinergia.db`, zero-config para execução local).
- **Serviço de IA**: `@google/generative-ai` com integração Gemini API (variável de ambiente `GEMINI_API_KEY`).

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
- Node.js versão 18 ou superior instalado.
- Gerenciador de pacotes `npm`.

### 2. Instalação de Dependências
No terminal, dentro da pasta raiz do projeto (`d:\projetos\sinergia`), execute:
```bash
npm install
```

### 3. Configuração das Variáveis de Ambiente (`.env`)
O arquivo `.env` já foi criado com a sua chave da Gemini API configurada:
```env
PORT=3001
GEMINI_API_KEY=AQ.Ab8RN6KQWAocZn3EPQbCUnC9blcEfg5Ibujaeq_B_2FKp7t10A
DEFAULT_MODEL=gemini-1.5-flash
```

> **Nota de Segurança**: Para alterar o modelo padrão utilizado pela IA, você pode editar o campo `DEFAULT_MODEL` no `.env` ou selecionar dinamicamente o modelo diretamente na interface do Módulo de IA.

### 4. Inicialização e Carga de Dados (Seed)
O banco de dados SQLite será criado e populado automaticamente na primeira execução. Caso deseje forçar o recarregamento do seed com dados fictícios do IFSULDEMINAS (turmas de 1º Des. de Sistemas, 1º Logística, 1º Eletrônica), execute:
```bash
npm run seed
```

### 5. Execução do Servidor Dev (Backend + Frontend em paralelo)
Para iniciar simultaneamente o backend Express (porta 3001) e o frontend Vite (porta 5173):
```bash
npm run dev
```
Em seguida, abra o navegador em: **`http://localhost:5173`**

---

## 🏫 Como Implementar na sua Escola

### Passo 1: Cadastro da Estrutura Institucional
1. Acesse o menu **Administração EPT**.
2. Cadastre a sua Escola/Campus (Nome, Código INEP, Cidade/UF).
3. Cadastre os **Cursos Técnicos** (ex.: Técnico em Agronomia, Técnico em Eletrônica, Técnico em Informática).
4. Cadastre as **Turmas** vinculadas aos cursos e os **Professores**.

### Passo 2: Articulação de Disciplinas e BNCC
1. Na aba **Disciplinas & BNCC**, insira as disciplinas da matriz curricular.
2. Defina o tipo de formação: **Formação Geral Básica (FGB)** ou **Itinerário Técnico**.
3. Selecione a competência da BNCC correspondente para garantir o acompanhamento integrado da formação do estudante.

### Passo 3: Digitação do Desempenho (Notas, Faltas e Observações)
1. Acesse a tela **Notas e Faltas**.
2. Selecione a Turma e a Disciplina.
3. Utilize a **Planilha Editável** para digitação em lote. À medida que as notas e faltas são digitadas, o status de risco do aluno é calculado em tempo real.
4. Clique em **Salvar Alterações**.

### Passo 4: Geração Assistida do Parecer com IA
1. Acesse o **Módulo IA — Parecer**.
2. Escolha o modelo da IA (ex.: `Gemini 1.5 Flash` para maior velocidade e economia de tokens).
3. Clique em **Gerar Parecer Pedagógico**.
4. O sistema pseudonymizará os dados via LGPD e retornará a síntese com a lista de alunos em recuperação sistêmica.
5. Edite os campos conforme necessário para refletir o contexto local.
6. Clique em **Salvar & Validar (Humano)** para homologar o relatório e exporte em **PDF**, **Word** ou **Excel**.

---

## 📄 Licença e Créditos

Desenvolvido para o Relatório de Formação em Gestão na Educação Profissional e Tecnológica — **IFSULDEMINAS**.
