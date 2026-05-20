# NEXOS — Hub de Aprendizagem & Gestão Pedagógica de Programação

**NEXOS** é uma plataforma educacional (PWA/LMS) concebida especificamente para o Ensino Profissional de Informática e Programação. Funciona como um hub centralizado que integra as necessidades de **Alunos** (aprendizagem, portfólio de código, entregas de projetos) e **Professores** (planeamento de aulas, acompanhamento pedagógico, avaliação por rubricas e integração direta com o GitHub).

---

## 🚀 Visão Geral do Produto

O NEXOS foi estruturado para resolver a fragmentação de ferramentas no ensino técnico, unificando funcionalidades inspiradas no *Google Classroom*, *Moodle*, *GitHub Classroom* e *Notion* numa experiência fluida, moderna e focada em programação.

### 🌟 Principais Funcionalidades

1. **Dashboard do Aluno**:
   - Notificações de aulas ativas e próximas sessões.
   - Checklist interativo de tarefas pendentes e prazos de entrega.
   - Pauta pessoal e progresso modular em tempo real.
   - Acesso rápido a materiais didáticos.

2. **Dashboard do Professor**:
   - Visão estatística de progresso da turma (taxa de aprovação, submissões pendentes, commits da semana).
   - Acesso centralizado aos diferentes módulos funcionais.

3. **Planeamento Pedagógico**:
   - Definição da pauta de conteúdos e objetivos por aula.
   - Criação de planos de aula estruturados (Sumário, Objetivos, Recursos, Metodologia e Critérios).
   - Registo de lições e exportação de sumários em PDF/CSV para preenchimento de plataformas oficiais.

4. **Biblioteca de Conteúdos**:
   - Repositório de slides, templates de código, tutoriais de vídeo (embed) e exercícios práticos.
   - Filtros dinâmicos por módulo, tecnologia e nível de dificuldade (Iniciante, Intermédio, Avançado).

5. **Trabalhos & Avaliações por Rubricas**:
   - Submissão de trabalhos pelos alunos (URLs de repositórios, links de deploy e ficheiros ZIP).
   - Painel de correção docente com grelhas de rubricas dinâmicas.
   - Atribuição automática de classificação calculada com base na ponderação de rubricas e feedback descritivo.

6. **Centro de Integração GitHub**:
   - Sincronização via OAuth para monitorização de commits dos alunos.
   - Gráfico de contribuição visual (estilo GitHub Contributions Grid) para acompanhamento diário de commits.
   - Historial e rastreamento de tecnologias preferidas por estudante.

7. **Pauta de Classificações Modulares**:
   - Planilha de notas em grelha interativa de dupla entrada (Alunos vs Módulos).
   - Edição *inline* direta de notas pelo professor.
   - Destaques automáticos de status de transição e cálculo dinâmico da Média Geral Ponderada (GPA).

8. **Painel Administrativo**:
   - Gestão de utilizadores (Alunos e Professores), turmas, anos letivos e configuração global do curso de Programação.
   - Ferramentas de Backup/Exportação do sistema.

---

## 🛠️ Stack Tecnológica

O projeto foi edificado sobre bases sólidas e de alta performance:
* **Framework**: React 19 com TypeScript
* **Build System**: Vite 8
* **Estilização**: Tailwind CSS v4 (com `@tailwindcss/vite` plugin e CSS Variables natively)
* **Iconografia**: Lucide React + customização de marcas locais.
* **Componentes**: Arquitetura modular assente em Glassmorphism, micro-animações dinâmicas e design dark mode premium.

---

## 📦 Estrutura de Ficheiros

```
src/
 ├── components/           # Componentes modulares de visualização
 │    ├── AdminPanel.tsx           # Configurações globais e de utilizadores
 │    ├── AssignmentsManager.tsx   # Gestão de entregas e correção por rubricas
 │    ├── ContentLibrary.tsx       # Repositório de recursos didáticos
 │    ├── DashboardStudent.tsx     # Visão e checklist do aluno
 │    ├── DashboardTeacher.tsx     # Estatísticas e centro do docente
 │    ├── GitHubCenter.tsx         # Estatísticas de código e commits
 │    ├── GradesSheet.tsx          # Pauta modular e edição inline de notas
 │    ├── Icons.tsx                # SVGs otimizados para logos de marca (GitHub/Youtube)
 │    └── PedagogicalPlanning.tsx  # Planeamento pedagógico e aulas
 ├── data/
 │    └── mockData.ts      # Modelos de dados de domínio e massa de testes
 ├── App.tsx               # Orquestrador central de rotas e estado global
 ├── index.css             # Tema central, variáveis e utilitários de glassmorphism
 └── main.tsx              # Ponto de entrada do React
```

---

## ⚙️ Instalação e Execução

### Pré-requisitos
Certifique-se de que tem o **Node.js** instalado na sua máquina (recomenda-se v18+).

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento (Local)
```bash
npm run dev
```
O servidor de desenvolvimento do Vite iniciará localmente (normalmente em `http://localhost:5173`).

### 3. Compilar para Produção
```bash
npm run build
```
O output otimizado será gerado na pasta `/dist`.

---

## 🔒 Licença

Este projeto é desenvolvido para fins educacionais no âmbito de apoio pedagógico e inovação no Ensino Técnico-Profissional.
