-- DEVCLASS DATABASE SCHEMA & SEED SCRIPT
-- Copy and paste this script into the Supabase SQL Editor to configure your database.

-- 1. ENABLE EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. CLEANUP EXISTING TABLES (IF ANY)
drop table if exists public.attendance_records cascade;
drop table if exists public.attendance_sessions cascade;
drop table if exists public.grades cascade;
drop table if exists public.rubric_scores cascade;
drop table if exists public.submissions cascade;
drop table if exists public.rubrics cascade;
drop table if exists public.assignments cascade;
drop table if exists public.contents cascade;
drop table if exists public.lessons cascade;
drop table if exists public.modules cascade;
drop table if exists public.classes cascade;
drop table if exists public.github_repo_activities cascade;
drop table if exists public.github_accounts cascade;
drop table if exists public.profiles cascade;

-- 3. CREATE TABLES

-- PROFILES: linked to auth.users (Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLASSES
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course text not null,
  year text not null,
  main_teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MODULES
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  description text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LESSONS
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  planned_date date not null,
  duration_minutes integer not null,
  status text not null check (status in ('planned', 'done', 'cancelled')),
  summary text,
  topics_covered text,
  observations text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTENTS (Library items)
create table public.contents (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  type text not null check (type in ('video', 'pdf', 'link', 'code', 'exercise')),
  description text,
  file_url text,
  external_url text,
  difficulty text not null check (difficulty in ('Iniciante', 'Intermédio', 'Avançado')),
  technology text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ASSIGNMENTS (Trabalhos práticos)
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  class_id uuid references public.classes(id) on delete cascade not null,
  title text not null,
  description text,
  instructions text,
  due_date timestamp with time zone not null,
  weight_percentage numeric not null check (weight_percentage >= 0 and weight_percentage <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RUBRICS (Critérios da grelha de avaliação)
create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  criterion text not null,
  max_score numeric not null default 5,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUBMISSIONS (Trabalhos entregues pelos alunos)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null check (status in ('submitted', 'late', 'missing')),
  github_repo_url text,
  project_url text,
  video_url text, -- Mock storage ZIP / video name
  final_grade numeric,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RUBRIC SCORES (Pontuação individual por critério)
create table public.rubric_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions(id) on delete cascade not null,
  rubric_id uuid references public.rubrics(id) on delete cascade not null,
  score numeric not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (submission_id, rubric_id)
);

-- GRADES (Pauta Final por Módulo)
create table public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  module_id uuid references public.modules(id) on delete cascade not null,
  final_grade numeric not null check (final_grade >= 0 and final_grade <= 20),
  calculated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, module_id)
);

-- ATTENDANCE SESSIONS (Registo de presenças por aula)
create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ATTENDANCE RECORDS (Presença do aluno na sessão)
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.attendance_sessions(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('present', 'absent', 'late', 'justified')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (session_id, student_id)
);

-- GITHUB ACCOUNTS
create table public.github_accounts (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  github_username text not null,
  connected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GITHUB REPO ACTIVITIES
create table public.github_repo_activities (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  repo_name text not null,
  repo_url text not null,
  last_commit_date timestamp with time zone not null,
  commits_count integer not null default 0,
  languages text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.contents enable row level security;
alter table public.assignments enable row level security;
alter table public.rubrics enable row level security;
alter table public.submissions enable row level security;
alter table public.rubric_scores enable row level security;
alter table public.grades enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.github_accounts enable row level security;
alter table public.github_repo_activities enable row level security;

-- General Profiles Policies
create policy "Allow public profiles read access" on public.profiles
  for select using (true);
create policy "Allow users to update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Structures and materials (read: authenticated, write: teachers/admins)
create policy "Read classes" on public.classes for select using (true);
create policy "Manage classes" on public.classes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read modules" on public.modules for select using (true);
create policy "Manage modules" on public.modules for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read lessons" on public.lessons for select using (true);
create policy "Manage lessons" on public.lessons for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read contents" on public.contents for select using (true);
create policy "Manage contents" on public.contents for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read assignments" on public.assignments for select using (true);
create policy "Manage assignments" on public.assignments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read rubrics" on public.rubrics for select using (true);
create policy "Manage rubrics" on public.rubrics for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- Submissions and grading policies
create policy "Read submissions" on public.submissions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')) or student_id = auth.uid()
);
create policy "Insert own submissions" on public.submissions for insert with check (
  student_id = auth.uid()
);
create policy "Update submissions" on public.submissions for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')) or student_id = auth.uid()
);

create policy "Read rubric scores" on public.rubric_scores for select using (
  exists (
    select 1 from public.submissions s 
    where s.id = submission_id and (s.student_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')))
  )
);
create policy "Manage rubric scores" on public.rubric_scores for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read grades" on public.grades for select using (
  student_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Manage grades" on public.grades for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- Attendance and sessions
create policy "Read attendance sessions" on public.attendance_sessions for select using (true);
create policy "Manage attendance sessions" on public.attendance_sessions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

create policy "Read attendance records" on public.attendance_records for select using (
  student_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Manage attendance records" on public.attendance_records for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- GitHub accounts and activities
create policy "Read github accounts" on public.github_accounts for select using (true);
create policy "Manage own github account" on public.github_accounts for all using (user_id = auth.uid());

create policy "Read github activity" on public.github_repo_activities for select using (true);
create policy "Manage own github activity" on public.github_repo_activities for all using (student_id = auth.uid());


-- 5. TRIGGER ON SIGNUP TO AUTOMATICALLY POPULATE PROFILES TABLE
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Utilizador'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 6. SEED MOCK DATA & ACCOUNTS
-- Generate password hashes for "password123" to allow instant login using Supabase Auth

-- SEED AUTH USERS
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values 
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'joao.appleton@school.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Professor João Appleton","role":"teacher","avatar":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'maria.costa@school.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Professora Maria Costa","role":"teacher","avatar":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'pedro.silva@alunos.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Pedro Silva","role":"student","avatar":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'maria.santos@alunos.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Maria Santos","role":"student","avatar":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'joao.pires@alunos.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"João Pires","role":"student","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000006',
    'authenticated',
    'authenticated',
    'ana.rodrigues@alunos.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Ana Rodrigues","role":"student","avatar":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000007',
    'authenticated',
    'authenticated',
    'admin@school.pt',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Coordenador Pedagógico","role":"admin","avatar":"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face"}',
    now(),
    now()
  );

-- SEED CLASSES
insert into public.classes (id, name, course, year, main_teacher_id)
values 
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '12ºP', 'Técnico de Gestão e Programação de Sistemas Informáticos', '2026/2027', '00000000-0000-0000-0000-000000000001'),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', '11ºP', 'Técnico de Gestão e Programação de Sistemas Informáticos', '2026/2027', '00000000-0000-0000-0000-000000000002');

-- SEED MODULES
insert into public.modules (id, class_id, name, description, order_index)
values 
  ('80000000-0000-0000-0000-000000000001', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'HTML & CSS Estruturado', 'Fundamentos de marcação semântica, folhas de estilo, layout CSS Grid e Flexbox, e design responsivo.', 1),
  ('80000000-0000-0000-0000-000000000002', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Lógica e Programação em JavaScript', 'Variáveis, estruturas de decisão e repetição, funções, objetos, arrays e manipulação do DOM no navegador.', 2),
  ('80000000-0000-0000-0000-000000000003', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Aplicações Web Single Page (React)', 'Princípios do React, componentes, propriedades, estados, hooks, roteamento e consumo de APIs externas.', 3),
  ('80000000-0000-0000-0000-000000000004', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Bases de Dados & Firebase', 'Sistemas relacionais, SQL básico, base de dados em tempo real NoSQL com Firebase Firestore e autenticação de utilizadores.', 4);

-- SEED LESSONS
insert into public.lessons (id, module_id, teacher_id, title, description, planned_date, duration_minutes, status, summary, topics_covered, observations)
values 
  ('b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Introdução ao HTML5 e Semântica', 'Estruturação base de páginas web e a importância das tags semânticas para SEO e Acessibilidade.', '2026-09-15', 90, 'done', 'Introdução ao HTML5. Discussão sobre tags semânticas (header, nav, main, section, article, footer) em oposição ao uso indiscriminado de divs.', 'História do HTML, Tags semânticas principais, Validador do W3C', 'Turma muito participativa, todos conseguiram estruturar o primeiro exercício com sucesso.'),
  ('b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Layouts Avançados com Flexbox', 'Alinhamento flexível, eixos, distribuição de espaço e ordenação de componentes na página.', '2026-09-22', 90, 'done', 'Estudo das propriedades do Flexbox (flex-direction, justify-content, align-items, flex-wrap). Execução de barra de navegação responsiva.', 'Flex container e flex items, Eixos main e cross, Alinhamento responsivo', 'Alguns alunos tiveram dificuldades com a propriedade flex-shrink. Dediquei 15 minutos extras a isto.'),
  ('b0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Manipulação do DOM em JS', 'Seleção de elementos, escuta de eventos do utilizador e modificação dinâmica da árvore HTML.', '2026-10-18', 135, 'done', 'Explicação teórica de document.querySelector, addEventListener e manipulação de classes CSS com classList.', 'Árvore DOM, querySelector, addEventListener, Event objeto', 'Realizámos um jogo do "Clicker" dinâmico na sala.'),
  ('b0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Consumo de APIs com Fetch', 'Requisições assíncronas assentes em Promises, async/await e manipulação de respostas JSON.', '2026-11-05', 135, 'done', 'Introdução à programação assíncrona. Consumo da API pública JSONPlaceholder para renderizar dados dinâmicos.', 'Promises, fetch(), async/await, tratamento de erros com try/catch', 'Excelente aula. O Pedro e a Maria progrediram muito rápido.'),
  ('b0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Componentes e State no React', 'Criação de componentes funcionais, gestão de estado com useState e fluxo unidirecional de dados.', '2026-05-20', 135, 'planned', null, null, null),
  ('b0000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Trabalhar com React Hooks (useEffect)', 'Ciclo de vida do componente, efeitos secundários, dependências e limpeza de subscrições.', '2026-05-27', 135, 'planned', null, null, null);

-- SEED CONTENTS
insert into public.contents (id, module_id, teacher_id, title, type, description, file_url, external_url, difficulty, technology, created_at)
values 
  ('d0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Guia Rápido de Tags Semânticas HTML5', 'pdf', 'Documento PDF com resumo das principais tags semânticas, quando usar e aspetos chave de acessibilidade.', '/docs/html5_semantic_cheatsheet.pdf', null, 'Iniciante', 'HTML', '2026-09-14 10:00:00+00'),
  ('d0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Flexbox Froggy - Prática e Jogos', 'link', 'Link para o famoso jogo interativo para dominar e praticar o alinhamento com CSS Flexbox.', null, 'https://flexboxfroggy.com/', 'Iniciante', 'CSS', '2026-09-20 12:00:00+00'),
  ('d0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Manipulação de Arrays em JavaScript', 'video', 'Vídeo aula detalhando métodos de iteração de arrays: map, filter, reduce, find e sort com arrow functions.', null, 'https://www.youtube.com/embed/rRgD1yqNmsY', 'Intermédio', 'JS', '2026-10-10 14:00:00+00'),
  ('d0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Template Inicial: Calculadora JS', 'code', 'Estrutura HTML/CSS para os alunos clonarem e iniciarem o desenvolvimento da Calculadora em JavaScript nativo.', '/code/calculator_template.zip', null, 'Intermédio', 'JS', '2026-10-25 09:00:00+00'),
  ('d0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Desafio Prático: TodoApp em React', 'exercise', 'Lista de requisitos e critérios de aceitação para desenhar uma aplicação de tarefas funcional com persistência no LocalStorage.', '/exercises/react_todo_specs.pdf', null, 'Intermédio', 'React', '2026-05-18 16:30:00+00');

-- SEED ASSIGNMENTS
insert into public.assignments (id, module_id, teacher_id, class_id, title, description, instructions, due_date, weight_percentage, created_at)
values 
  (
    'a0000000-0000-0000-0000-000000000001', 
    '80000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000001', 
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 
    'Portfólio Web Pessoal Estático', 
    'Criação de um website estático utilizando HTML5 Semântico e CSS Responsivo puro para apresentar o teu percurso técnico.', 
    'O website deve conter: 1. Cabeçalho com navegação, 2. Secção sobre mim, 3. Lista de competências, 4. Secção de portfólio (com grelha CSS Grid), 5. Formulário de contacto desenhado sem tabelas. Deve ser responsivo (mobile first).', 
    '2026-10-05 23:59:00+00', 
    25, 
    '2026-09-18 08:00:00+00'
  ),
  (
    'a0000000-0000-0000-0000-000000000002', 
    '80000000-0000-0000-0000-000000000002', 
    '00000000-0000-0000-0000-000000000001', 
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 
    'Desafio Prático DOM: Jogo do Clicker', 
    'Desenvolvimento de um jogo interativo no navegador assente em JavaScript de manipulação do DOM e contadores.', 
    'Cria uma aplicação em que o utilizador clica num botão e ganha pontos. Permite comprar upgrades que geram cliques por segundo automáticos. Usa localStorage para salvar o progresso.', 
    '2026-11-20 23:59:00+00', 
    35, 
    '2026-11-01 08:00:00+00'
  ),
  (
    'a0000000-0000-0000-0000-000000000003', 
    '80000000-0000-0000-0000-000000000003', 
    '00000000-0000-0000-0000-000000000001', 
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 
    'Dashboard de Finanças Pessoais em React', 
    'Criação de um painel financeiro utilizando componentes React funcionais, hooks básicos e integração de gráficos.', 
    'Cria um sistema de registo de despesas e receitas. O utilizador deve poder: 1. Adicionar transações, 2. Filtrar por categoria, 3. Ver balanço total em tempo real, 4. Ver gráfico simples de distribuição por despesa.', 
    '2026-06-05 23:59:00+00', 
    40, 
    '2026-05-15 08:00:00+00'
  );

-- SEED RUBRICS
insert into public.rubrics (id, assignment_id, criterion, max_score, description)
values 
  ('70000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Semântica HTML', 5, 'Utilização correta e variada de tags semânticas do HTML5.'),
  ('70000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'Responsividade', 5, 'Adaptação a vários ecrãs através de CSS Media Queries e unidades fluidas.'),
  ('70000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'Estilização CSS & Grid', 5, 'Desenho visual moderno, paleta harmoniosa, uso correto de Flexbox/Grid.'),
  ('70000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'Acessibilidade & Boas Práticas', 5, 'Contraste, atributos alt em imagens, semântica geral e linting do código.'),
  
  ('70000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000002', 'Manipulação DOM', 5, 'Atualização fluida de elementos de texto, imagens e classes.'),
  ('70000000-0000-0000-0000-000000000202', 'a0000000-0000-0000-0000-000000000002', 'Gestão de Eventos', 5, 'Tratamento correto de clicks, inputs e intervalos temporais (setInterval).'),
  ('70000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000002', 'Persistência de Dados', 5, 'Uso robusto de LocalStorage para guardar o estado do utilizador (JSON.stringify/parse).'),
  ('70000000-0000-0000-0000-000000000204', 'a0000000-0000-0000-0000-000000000002', 'Arquitetura de Código', 5, 'Divisão lógica em funções reutilizáveis, nomeação clara e zero erros na consola.'),
  
  ('70000000-0000-0000-0000-000000000301', 'a0000000-0000-0000-0000-000000000003', 'Estado React & Hooks', 5, 'Uso apropriado de useState e useEffect para fluxos de dados e efeitos secundários.'),
  ('70000000-0000-0000-0000-000000000302', 'a0000000-0000-0000-0000-000000000003', 'Arquitetura de Componentes', 5, 'Decomposição em componentes pequenos, reutilizáveis e com tipos corretos.'),
  ('70000000-0000-0000-0000-000000000303', 'a0000000-0000-0000-0000-000000000003', 'Design de UI & UX', 5, 'Aparência moderna, mensagens de erro claras e feedback visual apropriado.'),
  ('70000000-0000-0000-0000-000000000304', 'a0000000-0000-0000-0000-000000000003', 'Integração de Bibliotecas', 5, 'Uso de pacotes como Chart.js ou SVG nativos para representar graficamente as despesas.');

-- SEED SUBMISSIONS
insert into public.submissions (id, assignment_id, student_id, submitted_at, status, github_repo_url, project_url, video_url, final_grade, feedback)
values
  (
    '50000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003', -- Pedro
    '2026-10-04 18:45:00+00',
    'submitted',
    'https://github.com/pedrosilva/portfolio-estatico',
    'https://pedro-silva-portfolio.netlify.app',
    'https://vimeo.com/987654321',
    17,
    'Excelente trabalho, Pedro! O layout responsivo está impecável e o código HTML é exemplar na semântica. Como melhoria, poderias ter otimizado o peso das imagens na secção de portfólio.'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004', -- Maria
    '2026-10-05 22:30:00+00',
    'submitted',
    'https://github.com/mariasantos/my-first-portfolio',
    'https://maria-santos-web.vercel.app',
    null,
    16.5,
    'Belo portfólio, Maria. O uso do CSS Grid está muito criativo. O único ponto a rever é o alinhamento da secção de contacto em dispositivos pequenos.'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003', -- Pedro
    '2026-11-19 14:20:00+00',
    'submitted',
    'https://github.com/pedrosilva/javascript-clicker-game',
    'https://pedro-clicker.netlify.app',
    null,
    14.5,
    'O jogo funciona muito bem e o LocalStorage está robusto. Contudo, tens alguns erros na consola devidos a variáveis não declaradas no escopo local. Presta atenção ao "use strict" e a avisos de linting.'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005', -- João Pires
    '2026-11-20 23:58:00+00',
    'submitted',
    'https://github.com/joaopiresdev/js-clicker',
    null,
    null,
    12.0,
    'O projeto foi entregue à justa. O jogo funciona, mas se recarregarmos a página o localStorage falha ao recuperar o estado atual porque guardaste strings vazias em alguns campos. É preciso corrigir isto.'
  ),
  (
    '50000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003', -- Pedro
    '2026-05-19 21:10:00+00',
    'submitted',
    'https://github.com/pedrosilva/react-finance-dashboard',
    'https://pedro-finance.vercel.app',
    null,
    null,
    null
  );

-- SEED RUBRIC SCORES
insert into public.rubric_scores (submission_id, rubric_id, score, comment)
values
  ('50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000101', 5, 'Tags semânticas utilizadas perfeitamente.'),
  ('50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000102', 4, 'Adaptação excelente. Apenas uma pequena quebra num ecrã intermédio.'),
  ('50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000103', 4, 'Design muito limpo e moderno. Grid bem estruturada.'),
  ('50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000104', 4, 'Cumpre com bons contrastes de cor.'),
  
  ('50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000101', 5, 'Excelente estrutura de cabeçalho e artigos.'),
  ('50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000102', 3.5, 'Problemas menores de overflow horizontal em ecrãs menores que 360px.'),
  ('50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000103', 4, 'Grelha muito bonita e fluida.'),
  ('50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000104', 4, 'Imagens têm tags alt descritivas e corretas.'),

  ('50000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000201', 4, 'Atualização rápida e correta no DOM.'),
  ('50000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000202', 4, 'Eventos funcionam conforme o planeado.'),
  ('50000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000203', 4, 'Salva os contadores e multiplicadores perfeitamente.'),
  ('50000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000204', 2.5, 'Alguns erros na consola. Variáveis declaradas sem let/const.'),

  ('50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000201', 3, 'Funciona, mas a animação do clique sobrepõe o texto.'),
  ('50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000202', 3, 'Alguns atrasos na resposta aos cliques.'),
  ('50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000203', 3, 'Recuperação de estado falha com erros na consola.'),
  ('50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000204', 3, 'Funções muito longas, seria melhor separá-las.');

-- SEED GRADES
insert into public.grades (student_id, module_id, final_grade, calculated_at)
values
  ('00000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000001', 17.0, '2026-10-06 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', 14.5, '2026-11-20 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', 16.5, '2026-10-06 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000002', 12.0, '2026-11-21 00:00:00+00');

-- SEED ATTENDANCE SESSIONS
insert into public.attendance_sessions (id, lesson_id, class_id, date)
values
  ('55000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '2026-09-15'),
  ('55000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '2026-09-22'),
  ('55000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '2026-10-18'),
  ('55000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '2026-11-05');

-- SEED ATTENDANCE RECORDS
insert into public.attendance_records (session_id, student_id, status)
values
  ('55000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'present'),
  ('55000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'present'),
  ('55000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'present'),
  ('55000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'present'),
  
  ('55000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'present'),
  ('55000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'late'),
  ('55000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'absent'),
  ('55000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'present'),
  
  ('55000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'present'),
  ('55000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'present'),
  ('55000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'present'),
  ('55000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'present'),
  
  ('55000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'present'),
  ('55000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'present'),
  ('55000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'absent'),
  ('55000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'justified');

-- SEED GITHUB ACCOUNTS
insert into public.github_accounts (user_id, github_username, connected_at)
values
  ('00000000-0000-0000-0000-000000000003', 'pedrosilvadev', '2026-09-20 10:00:00+00'),
  ('00000000-0000-0000-0000-000000000004', 'mariasantosdev', '2026-09-21 11:00:00+00'),
  ('00000000-0000-0000-0000-000000000005', 'joaopiresdev', '2026-10-01 14:00:00+00'),
  ('00000000-0000-0000-0000-000000000006', 'anarodriguescoding', '2026-10-02 09:30:00+00');

-- SEED GITHUB REPO ACTIVITIES
insert into public.github_repo_activities (student_id, repo_name, repo_url, last_commit_date, commits_count, languages)
values
  ('00000000-0000-0000-0000-000000000003', 'react-finance-dashboard', 'https://github.com/pedrosilvadev/react-finance-dashboard', '2026-05-19 20:55:00+00', 38, array['TypeScript', 'CSS', 'HTML']),
  ('00000000-0000-0000-0000-000000000003', 'javascript-clicker-game', 'https://github.com/pedrosilvadev/javascript-clicker-game', '2026-11-19 14:15:00+00', 22, array['JavaScript', 'HTML', 'CSS']),
  ('00000000-0000-0000-0000-000000000004', 'my-first-portfolio', 'https://github.com/mariasantosdev/my-first-portfolio', '2026-10-05 22:25:00+00', 14, array['HTML', 'CSS']),
  ('00000000-0000-0000-0000-000000000005', 'js-clicker', 'https://github.com/joaopiresdev/js-clicker', '2026-11-20 23:55:00+00', 9, array['JavaScript', 'HTML']);
