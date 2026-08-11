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
- **Banco de Dados**: libSQL/SQLite via `@libsql/client` — arquivo local `sinergia.db` em desenvolvimento (zero-config) e [Turso](https://turso.tech) em produção, com o mesmo dialeto SQL.
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
Copie o `.env.example` para `.env` e preencha a sua chave da Gemini API:
```env
PORT=3001
GEMINI_API_KEY=sua_chave_gemini_aqui
DEFAULT_MODEL=gemini-1.5-flash

# Deixe em branco localmente: o servidor usa o arquivo sinergia.db
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

> **Nota de Segurança**: o `.env` está no `.gitignore` e **nunca** deve ser commitado — chaves de API não podem ir para o repositório nem para o README. Para alterar o modelo padrão utilizado pela IA, edite `DEFAULT_MODEL` no `.env` ou selecione o modelo diretamente na interface do Módulo de IA.

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

## ☁️ Deploy na Vercel

O frontend é publicado como site estático e o backend Express roda como **Serverless Function** (`api/index.js`), reaproveitando exatamente o mesmo app de desenvolvimento. As reescritas estão em `vercel.json`.

### 1. Criar o banco no Turso
O sistema de arquivos da Vercel é efêmero e somente leitura, então o `sinergia.db` local não serve em produção. O Turso hospeda o mesmo SQLite:

```bash
npm i -g @tursodatabase/cli   # ou: curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup
turso db create sinergia
turso db show sinergia --url        # -> TURSO_DATABASE_URL
turso db tokens create sinergia     # -> TURSO_AUTH_TOKEN
```

### 2. Configurar as Environment Variables do projeto na Vercel
Em **Settings → Environment Variables**, adicione para *Production* e *Preview*:

| Variável | Valor |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://sinergia-<usuario>.turso.io` |
| `TURSO_AUTH_TOKEN` | token gerado no passo anterior |
| `GEMINI_API_KEY` | sua chave da Gemini API |
| `DEFAULT_MODEL` | `gemini-1.5-flash` |

### 3. Publicar e popular
Faça o deploy (`git push` na `main`). O schema das tabelas é criado sozinho na primeira requisição. O banco sobe **vazio**: para carregar os dados de demonstração, acesse a tela de setup e use **Carregar Dados de Demonstração**, ou chame a API diretamente:

```bash
curl -X POST https://<seu-projeto>.vercel.app/api/v1/load-demo
```

> `npm run seed` e o `load-demo` **apagam todas as tabelas** antes de repovoar. Por isso o seed automático nunca roda em produção — apenas no `npm run dev`, e mesmo assim só quando o banco local ainda está vazio.

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
