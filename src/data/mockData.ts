export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  course: string;
  year: string;
  mainTeacherId: string;
}

export interface Module {
  id: string;
  classId: string;
  name: string;
  description: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  teacherId: string;
  title: string;
  description: string;
  plannedDate: string;
  durationMinutes: number;
  status: 'planned' | 'done' | 'cancelled';
  summary?: string;
  topicsCovered?: string;
  observations?: string;
}

export interface Content {
  id: string;
  moduleId: string;
  teacherId: string;
  title: string;
  type: 'video' | 'pdf' | 'link' | 'code' | 'exercise';
  description: string;
  fileUrl?: string;
  externalUrl?: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  technology: string;
  createdAt: string;
}

export interface Rubric {
  id: string;
  criterion: string;
  maxScore: number;
  description: string;
}

export interface Assignment {
  id: string;
  moduleId: string;
  teacherId: string;
  classId: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  weightPercentage: number;
  rubrics: Rubric[];
  createdAt: string;
}

export interface RubricScore {
  rubricId: string;
  score: number;
  comment?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  status: 'submitted' | 'late' | 'missing';
  githubRepoUrl?: string;
  projectUrl?: string;
  videoUrl?: string;
  finalGrade?: number;
  feedback?: string;
  rubricScores: RubricScore[];
}

export interface Grade {
  id: string;
  studentId: string;
  moduleId: string;
  finalGrade: number;
  calculatedAt: string;
}

export interface AttendanceSession {
  id: string;
  lessonId: string;
  classId: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'justified';
}

export interface GitHubAccount {
  userId: string;
  githubUsername: string;
  connectedAt: string;
}

export interface GitHubRepoActivity {
  id: string;
  studentId: string;
  repoName: string;
  repoUrl: string;
  lastCommitDate: string;
  commitsCount: number;
  languages: string[];
}

// ---------------- MOCK DATA INITIAL RECORDS ----------------

export const initialUsers: User[] = [
  { id: 'u-1', name: 'Professor João Appleton', email: 'joao.appleton@school.pt', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
  { id: 'u-2', name: 'Professora Maria Costa', email: 'maria.costa@school.pt', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { id: 'u-3', name: 'Pedro Silva', email: 'pedro.silva@alunos.pt', role: 'student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face' },
  { id: 'u-4', name: 'Maria Santos', email: 'maria.santos@alunos.pt', role: 'student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face' },
  { id: 'u-5', name: 'João Pires', email: 'joao.pires@alunos.pt', role: 'student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { id: 'u-6', name: 'Ana Rodrigues', email: 'ana.rodrigues@alunos.pt', role: 'student', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  { id: 'u-7', name: 'Coordenador Pedagógico', email: 'admin@school.pt', role: 'admin', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face' }
];

export const initialClasses: Class[] = [
  { id: 'c-1', name: '12ºP', course: 'Técnico de Gestão e Programação de Sistemas Informáticos', year: '2026/2027', mainTeacherId: 'u-1' },
  { id: 'c-2', name: '11ºP', course: 'Técnico de Gestão e Programação de Sistemas Informáticos', year: '2026/2027', mainTeacherId: 'u-2' }
];

export const initialModules: Module[] = [
  { id: 'm-1', classId: 'c-1', name: 'HTML & CSS Estruturado', description: 'Fundamentos de marcação semântica, folhas de estilo, layout CSS Grid e Flexbox, e design responsivo.', orderIndex: 1 },
  { id: 'm-2', classId: 'c-1', name: 'Lógica e Programação em JavaScript', description: 'Variáveis, estruturas de decisão e repetição, funções, objetos, arrays e manipulação do DOM no navegador.', orderIndex: 2 },
  { id: 'm-3', classId: 'c-1', name: 'Aplicações Web Single Page (React)', description: 'Princípios do React, componentes, propriedades, estados, hooks, roteamento e consumo de APIs externas.', orderIndex: 3 },
  { id: 'm-4', classId: 'c-1', name: 'Bases de Dados & Firebase', description: 'Sistemas relacionais, SQL básico, base de dados em tempo real NoSQL com Firebase Firestore e autenticação de utilizadores.', orderIndex: 4 }
];

export const initialLessons: Lesson[] = [
  { id: 'l-1', moduleId: 'm-1', teacherId: 'u-1', title: 'Introdução ao HTML5 e Semântica', description: 'Estruturação base de páginas web e a importância das tags semânticas para SEO e Acessibilidade.', plannedDate: '2026-09-15', durationMinutes: 90, status: 'done', summary: 'Introdução ao HTML5. Discussão sobre tags semânticas (header, nav, main, section, article, footer) em oposição ao uso indiscriminado de divs.', topicsCovered: 'História do HTML, Tags semânticas principais, Validador do W3C', observations: 'Turma muito participativa, todos conseguiram estruturar o primeiro exercício com sucesso.' },
  { id: 'l-2', moduleId: 'm-1', teacherId: 'u-1', title: 'Layouts Avançados com Flexbox', description: 'Alinhamento flexível, eixos, distribuição de espaço e ordenação de componentes na página.', plannedDate: '2026-09-22', durationMinutes: 90, status: 'done', summary: 'Estudo das propriedades do Flexbox (flex-direction, justify-content, align-items, flex-wrap). Execução de barra de navegação responsiva.', topicsCovered: 'Flex container e flex items, Eixos main e cross, Alinhamento responsivo', observations: 'Alguns alunos tiveram dificuldades com a propriedade flex-shrink. Dediquei 15 minutos extras a isto.' },
  { id: 'l-3', moduleId: 'm-2', teacherId: 'u-1', title: 'Manipulação do DOM em JS', description: 'Seleção de elementos, escuta de eventos do utilizador e modificação dinâmica da árvore HTML.', plannedDate: '2026-10-18', durationMinutes: 135, status: 'done', summary: 'Explicação teórica de document.querySelector, addEventListener e manipulação de classes CSS com classList.', topicsCovered: 'Árvore DOM, querySelector, addEventListener, Event objeto', observations: 'Realizámos um jogo do "Clicker" dinâmico na sala.' },
  { id: 'l-4', moduleId: 'm-2', teacherId: 'u-1', title: 'Consumo de APIs com Fetch', description: 'Requisições assíncronas assentes em Promises, async/await e manipulação de respostas JSON.', plannedDate: '2026-11-05', durationMinutes: 135, status: 'done', summary: 'Introdução à programação assíncrona. Consumo da API pública JSONPlaceholder para renderizar dados dinâmicos.', topicsCovered: 'Promises, fetch(), async/await, tratamento de erros com try/catch', observations: 'Excelente aula. O Pedro e a Maria progrediram muito rápido.' },
  { id: 'l-5', moduleId: 'm-3', teacherId: 'u-1', title: 'Componentes e State no React', description: 'Criação de componentes funcionais, gestão de estado com useState e fluxo unidirecional de dados.', plannedDate: '2026-05-20', durationMinutes: 135, status: 'planned' },
  { id: 'l-6', moduleId: 'm-3', teacherId: 'u-1', title: 'Trabalhar com React Hooks (useEffect)', description: 'Ciclo de vida do componente, efeitos secundários, dependências e limpeza de subscrições.', plannedDate: '2026-05-27', durationMinutes: 135, status: 'planned' }
];

export const initialContents: Content[] = [
  { id: 'co-1', moduleId: 'm-1', teacherId: 'u-1', title: 'Guia Rápido de Tags Semânticas HTML5', type: 'pdf', description: 'Documento PDF com resumo das principais tags semânticas, quando usar e aspetos chave de acessibilidade.', fileUrl: '/docs/html5_semantic_cheatsheet.pdf', difficulty: 'Iniciante', technology: 'HTML', createdAt: '2026-09-14' },
  { id: 'co-2', moduleId: 'm-1', teacherId: 'u-1', title: 'Flexbox Froggy - Prática e Jogos', type: 'link', description: 'Link para o famoso jogo interativo para dominar e praticar o alinhamento com CSS Flexbox.', externalUrl: 'https://flexboxfroggy.com/', difficulty: 'Iniciante', technology: 'CSS', createdAt: '2026-09-20' },
  { id: 'co-3', moduleId: 'm-2', teacherId: 'u-1', title: 'Manipulação de Arrays em JavaScript', type: 'video', description: 'Vídeo aula detalhando métodos de iteração de arrays: map, filter, reduce, find e sort com arrow functions.', externalUrl: 'https://www.youtube.com/embed/rRgD1yqNmsY', difficulty: 'Intermédio', technology: 'JS', createdAt: '2026-10-10' },
  { id: 'co-4', moduleId: 'm-2', teacherId: 'u-1', title: 'Template Inicial: Calculadora JS', type: 'code', description: 'Estrutura HTML/CSS para os alunos clonarem e iniciarem o desenvolvimento da Calculadora em JavaScript nativo.', fileUrl: '/code/calculator_template.zip', difficulty: 'Intermédio', technology: 'JS', createdAt: '2026-10-25' },
  { id: 'co-5', moduleId: 'm-3', teacherId: 'u-1', title: 'Desafio Prático: TodoApp em React', type: 'exercise', description: 'Lista de requisitos e critérios de aceitação para desenhar uma aplicação de tarefas funcional com persistência no LocalStorage.', fileUrl: '/exercises/react_todo_specs.pdf', difficulty: 'Intermédio', technology: 'React', createdAt: '2026-05-18' }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'a-1',
    moduleId: 'm-1',
    teacherId: 'u-1',
    classId: 'c-1',
    title: 'Portfólio Web Pessoal Estático',
    description: 'Criação de um website estático utilizando HTML5 Semântico e CSS Responsivo puro para apresentar o teu percurso técnico.',
    instructions: 'O website deve conter: 1. Cabeçalho com navegação, 2. Secção sobre mim, 3. Lista de competências, 4. Secção de portfólio (com grelha CSS Grid), 5. Formulário de contacto desenhado sem tabelas. Deve ser responsivo (mobile first).',
    dueDate: '2026-10-05T23:59:00',
    weightPercentage: 25,
    rubrics: [
      { id: 'r-1-1', criterion: 'Semântica HTML', maxScore: 5, description: 'Utilização correta e variada de tags semânticas do HTML5.' },
      { id: 'r-1-2', criterion: 'Responsividade', maxScore: 5, description: 'Adaptação a vários ecrãs através de CSS Media Queries e unidades fluidas.' },
      { id: 'r-1-3', criterion: 'Estilização CSS & Grid', maxScore: 5, description: 'Desenho visual moderno, paleta harmoniosa, uso correto de Flexbox/Grid.' },
      { id: 'r-1-4', criterion: 'Acessibilidade & Boas Práticas', maxScore: 5, description: 'Contraste, atributos alt em imagens, semântica geral e linting do código.' }
    ],
    createdAt: '2026-09-18'
  },
  {
    id: 'a-2',
    moduleId: 'm-2',
    teacherId: 'u-1',
    classId: 'c-1',
    title: 'Desafio Prático DOM: Jogo do Clicker',
    description: 'Desenvolvimento de um jogo interativo no navegador assente em JavaScript de manipulação do DOM e contadores.',
    instructions: 'Cria uma aplicação em que o utilizador clica num botão e ganha pontos. Permite comprar upgrades que geram cliques por segundo automáticos. Usa localStorage para salvar o progresso.',
    dueDate: '2026-11-20T23:59:00',
    weightPercentage: 35,
    rubrics: [
      { id: 'r-2-1', criterion: 'Manipulação DOM', maxScore: 5, description: 'Atualização fluida de elementos de texto, imagens e classes.' },
      { id: 'r-2-2', criterion: 'Gestão de Eventos', maxScore: 5, description: 'Tratamento correto de clicks, inputs e intervalos temporais (setInterval).' },
      { id: 'r-2-3', criterion: 'Persistência de Dados', maxScore: 5, description: 'Uso robusto de LocalStorage para guardar o estado do utilizador (JSON.stringify/parse).' },
      { id: 'r-2-4', criterion: 'Arquitetura de Código', maxScore: 5, description: 'Divisão lógica em funções reutilizáveis, nomeação clara e zero erros na consola.' }
    ],
    createdAt: '2026-11-01'
  },
  {
    id: 'a-3',
    moduleId: 'm-3',
    teacherId: 'u-1',
    classId: 'c-1',
    title: 'Dashboard de Finanças Pessoais em React',
    description: 'Criação de um painel financeiro utilizando componentes React funcionais, hooks básicos e integração de gráficos.',
    instructions: 'Cria um sistema de registo de despesas e receitas. O utilizador deve poder: 1. Adicionar transações, 2. Filtrar por categoria, 3. Ver balanço total em tempo real, 4. Ver gráfico simples de distribuição por despesa.',
    dueDate: '2026-06-05T23:59:00',
    weightPercentage: 40,
    rubrics: [
      { id: 'r-3-1', criterion: 'Estado React & Hooks', maxScore: 5, description: 'Uso apropriado de useState e useEffect para fluxos de dados e efeitos secundários.' },
      { id: 'r-3-2', criterion: 'Arquitetura de Componentes', maxScore: 5, description: 'Decomposição em componentes pequenos, reutilizáveis e com tipos corretos.' },
      { id: 'r-3-3', criterion: 'Design de UI & UX', maxScore: 5, description: 'Aparência moderna, mensagens de erro claras e feedback visual apropriado.' },
      { id: 'r-3-4', criterion: 'Integração de Bibliotecas', maxScore: 5, description: 'Uso de pacotes como Chart.js ou SVG nativos para representar graficamente as despesas.' }
    ],
    createdAt: '2026-05-15'
  }
];

export const initialSubmissions: Submission[] = [
  {
    id: 's-1',
    assignmentId: 'a-1',
    studentId: 'u-3', // Pedro
    submittedAt: '2026-10-04T18:45:00',
    status: 'submitted',
    githubRepoUrl: 'https://github.com/pedrosilva/portfolio-estatico',
    projectUrl: 'https://pedro-silva-portfolio.netlify.app',
    videoUrl: 'https://vimeo.com/987654321',
    finalGrade: 17,
    feedback: 'Excelente trabalho, Pedro! O layout responsivo está impecável e o código HTML é exemplar na semântica. Como melhoria, poderias ter otimizado o peso das imagens na secção de portfólio.',
    rubricScores: [
      { rubricId: 'r-1-1', score: 5, comment: 'Tags semânticas utilizadas perfeitamente.' },
      { rubricId: 'r-1-2', score: 4, comment: 'Adaptação excelente. Apenas uma pequena quebra num ecrã intermédio.' },
      { rubricId: 'r-1-3', score: 4, comment: 'Design muito limpo e moderno. Grid bem estruturada.' },
      { rubricId: 'r-1-4', score: 4, comment: 'Cumpre com bons contrastes de cor.' }
    ]
  },
  {
    id: 's-2',
    assignmentId: 'a-1',
    studentId: 'u-4', // Maria
    submittedAt: '2026-10-05T22:30:00',
    status: 'submitted',
    githubRepoUrl: 'https://github.com/mariasantos/my-first-portfolio',
    projectUrl: 'https://maria-santos-web.vercel.app',
    finalGrade: 16.5,
    feedback: 'Belo portfólio, Maria. O uso do CSS Grid está muito criativo. O único ponto a rever é o alinhamento da secção de contacto em dispositivos pequenos.',
    rubricScores: [
      { rubricId: 'r-1-1', score: 5, comment: 'Excelente estrutura de cabeçalho e artigos.' },
      { rubricId: 'r-1-2', score: 3.5, comment: 'Problemas menores de overflow horizontal em ecrãs menores que 360px.' },
      { rubricId: 'r-1-3', score: 4, comment: 'Grelha muito bonita e fluida.' },
      { rubricId: 'r-1-4', score: 4, comment: 'Imagens têm tags alt descritivas e corretas.' }
    ]
  },
  {
    id: 's-3',
    assignmentId: 'a-2',
    studentId: 'u-3', // Pedro
    submittedAt: '2026-11-19T14:20:00',
    status: 'submitted',
    githubRepoUrl: 'https://github.com/pedrosilva/javascript-clicker-game',
    projectUrl: 'https://pedro-clicker.netlify.app',
    finalGrade: 14.5,
    feedback: 'O jogo funciona muito bem e o LocalStorage está robusto. Contudo, tens alguns erros na consola devidos a variáveis não declaradas no escopo local. Presta atenção ao "use strict" e a avisos de linting.',
    rubricScores: [
      { rubricId: 'r-2-1', score: 4, comment: 'Atualização rápida e correta no DOM.' },
      { rubricId: 'r-2-2', score: 4, comment: 'Eventos funcionam conforme o planeado.' },
      { rubricId: 'r-2-3', score: 4, comment: 'Salva os contadores e multiplicadores perfeitamente.' },
      { rubricId: 'r-2-4', score: 2.5, comment: 'Alguns erros na consola. Variáveis declaradas sem let/const.' }
    ]
  },
  {
    id: 's-4',
    assignmentId: 'a-2',
    studentId: 'u-5', // João Pires
    submittedAt: '2026-11-20T23:58:00',
    status: 'submitted',
    githubRepoUrl: 'https://github.com/joaopiresdev/js-clicker',
    finalGrade: 12.0,
    feedback: 'O projeto foi entregue à justa. O jogo funciona, mas se recarregarmos a página o localStorage falha ao recuperar o estado atual porque guardaste strings vazias em alguns campos. É preciso corrigir isto.',
    rubricScores: [
      { rubricId: 'r-2-1', score: 3, comment: 'Funciona, mas a animação do clique sobrepõe o texto.' },
      { rubricId: 'r-2-2', score: 3, comment: 'Alguns atrasos na resposta aos cliques.' },
      { rubricId: 'r-2-3', score: 3, comment: 'Recuperação de estado falha com erros na consola.' },
      { rubricId: 'r-2-4', score: 3, comment: 'Funções muito longas, seria melhor separá-las.' }
    ]
  },
  {
    id: 's-5',
    assignmentId: 'a-3',
    studentId: 'u-3', // Pedro
    submittedAt: '2026-05-19T21:10:00',
    status: 'submitted',
    githubRepoUrl: 'https://github.com/pedrosilva/react-finance-dashboard',
    projectUrl: 'https://pedro-finance.vercel.app',
    // Currently NOT graded (teacher needs to grade)
    rubricScores: []
  }
];

export const initialGitHubAccounts: GitHubAccount[] = [
  { userId: 'u-3', githubUsername: 'pedrosilvadev', connectedAt: '2026-09-20' },
  { userId: 'u-4', githubUsername: 'mariasantosdev', connectedAt: '2026-09-21' },
  { userId: 'u-5', githubUsername: 'joaopiresdev', connectedAt: '2026-10-01' },
  { userId: 'u-6', githubUsername: 'anarodriguescoding', connectedAt: '2026-10-02' }
];

export const initialGitHubRepoActivity: GitHubRepoActivity[] = [
  {
    id: 'ra-1',
    studentId: 'u-3',
    repoName: 'react-finance-dashboard',
    repoUrl: 'https://github.com/pedrosilvadev/react-finance-dashboard',
    lastCommitDate: '2026-05-19T20:55:00',
    commitsCount: 38,
    languages: ['TypeScript', 'CSS', 'HTML']
  },
  {
    id: 'ra-2',
    studentId: 'u-3',
    repoName: 'javascript-clicker-game',
    repoUrl: 'https://github.com/pedrosilvadev/javascript-clicker-game',
    lastCommitDate: '2026-11-19T14:15:00',
    commitsCount: 22,
    languages: ['JavaScript', 'HTML', 'CSS']
  },
  {
    id: 'ra-3',
    studentId: 'u-4',
    repoName: 'my-first-portfolio',
    repoUrl: 'https://github.com/mariasantosdev/my-first-portfolio',
    lastCommitDate: '2026-10-05T22:25:00',
    commitsCount: 14,
    languages: ['HTML', 'CSS']
  },
  {
    id: 'ra-4',
    studentId: 'u-5',
    repoName: 'js-clicker',
    repoUrl: 'https://github.com/joaopiresdev/js-clicker',
    lastCommitDate: '2026-11-20T23:55:00',
    commitsCount: 9,
    languages: ['JavaScript', 'HTML']
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  // Session 1 (l-1)
  { id: 'ar-1', sessionId: 'as-1', studentId: 'u-3', status: 'present' },
  { id: 'ar-2', sessionId: 'as-1', studentId: 'u-4', status: 'present' },
  { id: 'ar-3', sessionId: 'as-1', studentId: 'u-5', status: 'present' },
  { id: 'ar-4', sessionId: 'as-1', studentId: 'u-6', status: 'present' },
  // Session 2 (l-2)
  { id: 'ar-5', sessionId: 'as-2', studentId: 'u-3', status: 'present' },
  { id: 'ar-6', sessionId: 'as-2', studentId: 'u-4', status: 'late' },
  { id: 'ar-7', sessionId: 'as-2', studentId: 'u-5', status: 'absent' },
  { id: 'ar-8', sessionId: 'as-2', studentId: 'u-6', status: 'present' },
  // Session 3 (l-3)
  { id: 'ar-9', sessionId: 'as-3', studentId: 'u-3', status: 'present' },
  { id: 'ar-10', sessionId: 'as-3', studentId: 'u-4', status: 'present' },
  { id: 'ar-11', sessionId: 'as-3', studentId: 'u-5', status: 'present' },
  { id: 'ar-12', sessionId: 'as-3', studentId: 'u-6', status: 'present' },
  // Session 4 (l-4)
  { id: 'ar-13', sessionId: 'as-4', studentId: 'u-3', status: 'present' },
  { id: 'ar-14', sessionId: 'as-4', studentId: 'u-4', status: 'present' },
  { id: 'ar-15', sessionId: 'as-4', studentId: 'u-5', status: 'absent' },
  { id: 'ar-16', sessionId: 'as-4', studentId: 'u-6', status: 'justified' }
];

export const initialAttendanceSessions: AttendanceSession[] = [
  { id: 'as-1', lessonId: 'l-1', classId: 'c-1', date: '2026-09-15' },
  { id: 'as-2', lessonId: 'l-2', classId: 'c-1', date: '2026-09-22' },
  { id: 'as-3', lessonId: 'l-3', classId: 'c-1', date: '2026-10-18' },
  { id: 'as-4', lessonId: 'l-4', classId: 'c-1', date: '2026-11-05' }
];
