import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const seedDatabase = async (firebaseConfig: any) => {
  // 1. Create a temp app to avoid signing out the current user on the main connection
  const tempAppName = `TempApp_${Date.now()}`;
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);
  const tempDb = getFirestore(tempApp);

  try {
    const initialUsers = [
      { email: 'joao.appleton@school.pt', name: 'Professor João Appleton', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
      { email: 'maria.costa@school.pt', name: 'Professora Maria Costa', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
      { email: 'pedro.silva@alunos.pt', name: 'Pedro Silva', role: 'student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face', githubUsername: 'pedrosilvadev', connectedAt: '2026-09-20' },
      { email: 'maria.santos@alunos.pt', name: 'Maria Santos', role: 'student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face', githubUsername: 'mariasantosdev', connectedAt: '2026-09-21' },
      { email: 'joao.pires@alunos.pt', name: 'João Pires', role: 'student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', githubUsername: 'joaopiresdev', connectedAt: '2026-10-01' },
      { email: 'ana.rodrigues@alunos.pt', name: 'Ana Rodrigues', role: 'student', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', githubUsername: 'anarodriguescoding', connectedAt: '2026-10-02' },
      { email: 'admin@school.pt', name: 'Coordenador Pedagógico', role: 'admin', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face' }
    ];

    const uids: { [email: string]: string } = {};

    // Create mock auth accounts and profile details
    for (const u of initialUsers) {
      const q = query(collection(tempDb, 'profiles'), where('email', '==', u.email));
      const querySnap = await getDocs(q);
      
      let uid = '';
      if (!querySnap.empty) {
        uid = querySnap.docs[0].id;
      } else {
        try {
          const userCred = await createUserWithEmailAndPassword(tempAuth, u.email, 'password123');
          uid = userCred.user.uid;
        } catch (e: any) {
          console.warn(`User creation warning for ${u.email}:`, e);
          if (e.code === 'auth/email-already-in-use') {
            throw new Error(`O utilizador ${u.email} já existe no Firebase Auth. Limpe a base de dados na consola do Firebase para efetuar um seed limpo.`);
          }
          throw e;
        }
      }

      uids[u.email] = uid;

      const profileData: any = {
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        createdAt: new Date().toISOString()
      };
      if (u.githubUsername) {
        profileData.githubUsername = u.githubUsername;
        profileData.connectedAt = u.connectedAt;
      }
      await setDoc(doc(tempDb, 'profiles', uid), profileData);
    }

    // CLASSES
    const classRefs: { [key: string]: string } = {};
    const class1Doc = await addDoc(collection(tempDb, 'classes'), {
      name: '12ºP',
      course: 'Técnico de Gestão e Programação de Sistemas Informáticos',
      year: '2026/2027',
      mainTeacherId: uids['joao.appleton@school.pt'],
      createdAt: new Date().toISOString()
    });
    classRefs['c-1'] = class1Doc.id;

    const class2Doc = await addDoc(collection(tempDb, 'classes'), {
      name: '11ºP',
      course: 'Técnico de Gestão e Programação de Sistemas Informáticos',
      year: '2026/2027',
      mainTeacherId: uids['maria.costa@school.pt'],
      createdAt: new Date().toISOString()
    });
    classRefs['c-2'] = class2Doc.id;

    // MODULES
    const moduleRefs: { [key: string]: string } = {};
    const m1Doc = await addDoc(collection(tempDb, 'modules'), {
      classId: classRefs['c-1'],
      name: 'HTML & CSS Estruturado',
      description: 'Fundamentos de marcação semântica, folhas de estilo, layout CSS Grid e Flexbox, e design responsivo.',
      orderIndex: 1
    });
    moduleRefs['m-1'] = m1Doc.id;

    const m2Doc = await addDoc(collection(tempDb, 'modules'), {
      classId: classRefs['c-1'],
      name: 'Lógica e Programação em JavaScript',
      description: 'Variáveis, estruturas de decisão e repetição, funções, objetos, arrays e manipulação do DOM no navegador.',
      orderIndex: 2
    });
    moduleRefs['m-2'] = m2Doc.id;

    const m3Doc = await addDoc(collection(tempDb, 'modules'), {
      classId: classRefs['c-1'],
      name: 'Aplicações Web Single Page (React)',
      description: 'Princípios do React, componentes, propriedades, estados, hooks, roteamento e consumo de APIs externas.',
      orderIndex: 3
    });
    moduleRefs['m-3'] = m3Doc.id;

    const m4Doc = await addDoc(collection(tempDb, 'modules'), {
      classId: classRefs['c-1'],
      name: 'Bases de Dados & Firebase',
      description: 'Sistemas relacionais, SQL básico, base de dados em tempo real NoSQL com Firebase Firestore e autenticação de utilizadores.',
      orderIndex: 4
    });
    moduleRefs['m-4'] = m4Doc.id;

    // LESSONS
    const lessonRefs: { [key: string]: string } = {};
    const lessonsData = [
      { key: 'l-1', moduleId: 'm-1', teacherEmail: 'joao.appleton@school.pt', title: 'Introdução ao HTML5 e Semântica', description: 'Estruturação base de páginas web e a importância das tags semânticas para SEO e Acessibilidade.', plannedDate: '2026-09-15', durationMinutes: 90, status: 'done', summary: 'Introdução ao HTML5. Discussão sobre tags semânticas (header, nav, main, section, article, footer) em oposição ao uso indiscriminado de divs.', topicsCovered: 'História do HTML, Tags semânticas principais, Validador do W3C', observations: 'Turma muito participativa, todos conseguiram estruturar o primeiro exercício com sucesso.' },
      { key: 'l-2', moduleId: 'm-1', teacherEmail: 'joao.appleton@school.pt', title: 'Layouts Avançados com Flexbox', description: 'Alinhamento flexível, eixos, distribuição de espaço e ordenação de componentes na página.', plannedDate: '2026-09-22', durationMinutes: 90, status: 'done', summary: 'Estudo das propriedades do Flexbox (flex-direction, justify-content, align-items, flex-wrap). Execução de barra de navegação responsiva.', topicsCovered: 'Flex container e flex items, Eixos main e cross, Alinhamento responsivo', observations: 'Alguns alunos tiveram dificuldades com a propriedade flex-shrink. Dediquei 15 minutos extras a isto.' },
      { key: 'l-3', moduleId: 'm-2', teacherEmail: 'joao.appleton@school.pt', title: 'Manipulação do DOM em JS', description: 'Seleção de elementos, escuta de eventos do utilizador e modificação dinâmica da árvore HTML.', plannedDate: '2026-10-18', durationMinutes: 135, status: 'done', summary: 'Explicação teórica de document.querySelector, addEventListener e manipulação de classes CSS com classList.', topicsCovered: 'Árvore DOM, querySelector, addEventListener, Event objeto', observations: 'Realizámos um jogo do "Clicker" dinâmico na sala.' },
      { key: 'l-4', moduleId: 'm-2', teacherEmail: 'joao.appleton@school.pt', title: 'Consumo de APIs com Fetch', description: 'Requisições assíncronas assentes em Promises, async/await e manipulação de respostas JSON.', plannedDate: '2026-11-05', durationMinutes: 135, status: 'done', summary: 'Introdução à programação assíncrona. Consumo da API pública JSONPlaceholder para renderizar dados dinâmicos.', topicsCovered: 'Promises, fetch(), async/await, tratamento de erros com try/catch', observations: 'Excelente aula. O Pedro e a Maria progrediram muito rápido.' },
      { key: 'l-5', moduleId: 'm-3', teacherEmail: 'joao.appleton@school.pt', title: 'Componentes e State no React', description: 'Criação de componentes funcionais, gestão de estado com useState e fluxo unidirecional de dados.', plannedDate: '2026-05-20', durationMinutes: 135, status: 'planned' },
      { key: 'l-6', moduleId: 'm-3', teacherEmail: 'joao.appleton@school.pt', title: 'Trabalhar com React Hooks (useEffect)', description: 'Ciclo de vida do componente, efeitos secundários, dependências e limpeza de subscrições.', plannedDate: '2026-05-27', durationMinutes: 135, status: 'planned' }
    ];

    for (const l of lessonsData) {
      const docRef = await addDoc(collection(tempDb, 'lessons'), {
        moduleId: moduleRefs[l.moduleId],
        teacherId: uids[l.teacherEmail],
        title: l.title,
        description: l.description,
        plannedDate: l.plannedDate,
        durationMinutes: l.durationMinutes,
        status: l.status,
        summary: l.summary || null,
        topicsCovered: l.topicsCovered || null,
        observations: l.observations || null
      });
      lessonRefs[l.key] = docRef.id;
    }

    // CONTENTS
    const contentsData = [
      { moduleId: 'm-1', teacherEmail: 'joao.appleton@school.pt', title: 'Guia Rápido de Tags Semânticas HTML5', type: 'pdf', description: 'Documento PDF com resumo das principais tags semânticas, quando usar e aspetos chave de acessibilidade.', fileUrl: '/docs/html5_semantic_cheatsheet.pdf', difficulty: 'Iniciante', technology: 'HTML' },
      { moduleId: 'm-1', teacherEmail: 'joao.appleton@school.pt', title: 'Flexbox Froggy - Prática e Jogos', type: 'link', description: 'Link para o famoso jogo interativo para dominar e praticar o alinhamento com CSS Flexbox.', externalUrl: 'https://flexboxfroggy.com/', difficulty: 'Iniciante', technology: 'CSS' },
      { moduleId: 'm-2', teacherEmail: 'joao.appleton@school.pt', title: 'Manipulação de Arrays em JavaScript', type: 'video', description: 'Vídeo aula detalhando métodos de iteração de arrays: map, filter, reduce, find e sort com arrow functions.', externalUrl: 'https://www.youtube.com/embed/rRgD1yqNmsY', difficulty: 'Intermédio', technology: 'JS' },
      { moduleId: 'm-2', teacherEmail: 'joao.appleton@school.pt', title: 'Template Inicial: Calculadora JS', type: 'code', description: 'Estrutura HTML/CSS para os alunos clonarem e iniciarem o desenvolvimento da Calculadora em JavaScript nativo.', fileUrl: '/code/calculator_template.zip', difficulty: 'Intermédio', technology: 'JS' },
      { moduleId: 'm-3', teacherEmail: 'joao.appleton@school.pt', title: 'Desafio Prático: TodoApp em React', type: 'exercise', description: 'Lista de requisitos e critérios de aceitação para desenhar uma aplicação de tarefas funcional com persistência no LocalStorage.', fileUrl: '/exercises/react_todo_specs.pdf', difficulty: 'Intermédio', technology: 'React' }
    ];

    for (const co of contentsData) {
      await addDoc(collection(tempDb, 'contents'), {
        moduleId: moduleRefs[co.moduleId],
        teacherId: uids[co.teacherEmail],
        title: co.title,
        type: co.type,
        description: co.description,
        fileUrl: co.fileUrl || null,
        externalUrl: co.externalUrl || null,
        difficulty: co.difficulty,
        technology: co.technology,
        createdAt: new Date().toISOString()
      });
    }

    // ASSIGNMENTS
    const assignmentRefs: { [key: string]: string } = {};

    const a1Doc = await addDoc(collection(tempDb, 'assignments'), {
      moduleId: moduleRefs['m-1'],
      teacherId: uids['joao.appleton@school.pt'],
      classId: classRefs['c-1'],
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
      createdAt: new Date().toISOString()
    });
    assignmentRefs['a-1'] = a1Doc.id;

    const a2Doc = await addDoc(collection(tempDb, 'assignments'), {
      moduleId: moduleRefs['m-2'],
      teacherId: uids['joao.appleton@school.pt'],
      classId: classRefs['c-1'],
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
      createdAt: new Date().toISOString()
    });
    assignmentRefs['a-2'] = a2Doc.id;

    const a3Doc = await addDoc(collection(tempDb, 'assignments'), {
      moduleId: moduleRefs['m-3'],
      teacherId: uids['joao.appleton@school.pt'],
      classId: classRefs['c-1'],
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
      createdAt: new Date().toISOString()
    });
    assignmentRefs['a-3'] = a3Doc.id;

    // SUBMISSIONS
    const submissionsData = [
      {
        assignmentKey: 'a-1',
        studentEmail: 'pedro.silva@alunos.pt',
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
        assignmentKey: 'a-1',
        studentEmail: 'maria.santos@alunos.pt',
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
        assignmentKey: 'a-2',
        studentEmail: 'pedro.silva@alunos.pt',
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
        assignmentKey: 'a-2',
        studentEmail: 'joao.pires@alunos.pt',
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
        assignmentKey: 'a-3',
        studentEmail: 'pedro.silva@alunos.pt',
        submittedAt: '2026-05-19T21:10:00',
        status: 'submitted',
        githubRepoUrl: 'https://github.com/pedrosilva/react-finance-dashboard',
        projectUrl: 'https://pedro-finance.vercel.app',
        rubricScores: []
      }
    ];

    for (const s of submissionsData) {
      await addDoc(collection(tempDb, 'submissions'), {
        assignmentId: assignmentRefs[s.assignmentKey],
        studentId: uids[s.studentEmail],
        submittedAt: s.submittedAt,
        status: s.status,
        githubRepoUrl: s.githubRepoUrl || null,
        projectUrl: s.projectUrl || null,
        videoUrl: s.videoUrl || null,
        finalGrade: s.finalGrade !== undefined ? s.finalGrade : null,
        feedback: s.feedback || null,
        rubricScores: s.rubricScores
      });
    }

    // GRADES
    const gradesData = [
      { studentEmail: 'pedro.silva@alunos.pt', moduleKey: 'm-1', finalGrade: 17.0, calculatedAt: '2026-10-06' },
      { studentEmail: 'pedro.silva@alunos.pt', moduleKey: 'm-2', finalGrade: 14.5, calculatedAt: '2026-11-20' },
      { studentEmail: 'maria.santos@alunos.pt', moduleKey: 'm-1', finalGrade: 16.5, calculatedAt: '2026-10-06' },
      { studentEmail: 'joao.pires@alunos.pt', moduleKey: 'm-2', finalGrade: 12.0, calculatedAt: '2026-11-21' }
    ];

    for (const g of gradesData) {
      const studentId = uids[g.studentEmail];
      const moduleId = moduleRefs[g.moduleKey];
      await setDoc(doc(tempDb, 'grades', `${studentId}_${moduleId}`), {
        studentId,
        moduleId,
        finalGrade: g.finalGrade,
        calculatedAt: g.calculatedAt
      });
    }

    // ATTENDANCE SESSIONS & RECORDS (Embedded)
    const sessions = [
      {
        lessonKey: 'l-1',
        date: '2026-09-15',
        records: {
          'pedro.silva@alunos.pt': 'present',
          'maria.santos@alunos.pt': 'present',
          'joao.pires@alunos.pt': 'present',
          'ana.rodrigues@alunos.pt': 'present'
        }
      },
      {
        lessonKey: 'l-2',
        date: '2026-09-22',
        records: {
          'pedro.silva@alunos.pt': 'present',
          'maria.santos@alunos.pt': 'late',
          'joao.pires@alunos.pt': 'absent',
          'ana.rodrigues@alunos.pt': 'present'
        }
      },
      {
        lessonKey: 'l-3',
        date: '2026-10-18',
        records: {
          'pedro.silva@alunos.pt': 'present',
          'maria.santos@alunos.pt': 'present',
          'joao.pires@alunos.pt': 'present',
          'ana.rodrigues@alunos.pt': 'present'
        }
      },
      {
        lessonKey: 'l-4',
        date: '2026-11-05',
        records: {
          'pedro.silva@alunos.pt': 'present',
          'maria.santos@alunos.pt': 'present',
          'joao.pires@alunos.pt': 'absent',
          'ana.rodrigues@alunos.pt': 'justified'
        }
      }
    ];

    for (const ses of sessions) {
      const recordsMapped: { [uid: string]: string } = {};
      Object.entries(ses.records).forEach(([email, status]) => {
        recordsMapped[uids[email]] = status;
      });

      await addDoc(collection(tempDb, 'attendance_sessions'), {
        lessonId: lessonRefs[ses.lessonKey],
        classId: classRefs['c-1'],
        date: ses.date,
        records: recordsMapped
      });
    }

    // GITHUB REPO ACTIVITIES
    const activities = [
      { studentEmail: 'pedro.silva@alunos.pt', repoName: 'react-finance-dashboard', repoUrl: 'https://github.com/pedrosilvadev/react-finance-dashboard', lastCommitDate: '2026-05-19T20:55:00', commitsCount: 38, languages: ['TypeScript', 'CSS', 'HTML'] },
      { studentEmail: 'pedro.silva@alunos.pt', repoName: 'javascript-clicker-game', repoUrl: 'https://github.com/pedrosilvadev/javascript-clicker-game', lastCommitDate: '2026-11-19T14:15:00', commitsCount: 22, languages: ['JavaScript', 'HTML', 'CSS'] },
      { studentEmail: 'maria.santos@alunos.pt', repoName: 'my-first-portfolio', repoUrl: 'https://github.com/mariasantosdev/my-first-portfolio', lastCommitDate: '2026-10-05T22:25:00', commitsCount: 14, languages: ['HTML', 'CSS'] },
      { studentEmail: 'joao.pires@alunos.pt', repoName: 'js-clicker', repoUrl: 'https://github.com/joaopiresdev/js-clicker', lastCommitDate: '2026-11-20T23:55:00', commitsCount: 9, languages: ['JavaScript', 'HTML'] }
    ];

    for (const act of activities) {
      await addDoc(collection(tempDb, 'github_repo_activities'), {
        studentId: uids[act.studentEmail],
        repoName: act.repoName,
        repoUrl: act.repoUrl,
        lastCommitDate: act.lastCommitDate,
        commitsCount: act.commitsCount,
        languages: act.languages
      });
    }

  } finally {
    await deleteApp(tempApp);
  }
};
