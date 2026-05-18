-- POC Mognar — schema normalizado
-- Rode no SQL Editor do Supabase. Idempotente.

-- Limpa o blob antigo
drop table if exists public.app_state cascade;

-- =========================================================
-- USERS (globais por enquanto — multi-tenant fica pro MVP)
-- =========================================================
create table if not exists public.users (
  id    text primary key,
  name  text not null,
  email text not null unique,
  role  text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- PROJECTS — campos planos do Project
-- =========================================================
create table if not exists public.projects (
  id              text primary key,
  nome            text not null,
  tipo_obra       text,
  data_inicio     text,
  prazo_uteis     text,
  razao_social    text,
  contato         text,
  email           text,
  telefone        text,
  cpf_cnpj        text,
  endereco        text,
  bairro          text,
  cidade          text,
  estado          text,
  cep             text,
  area_m2         text,
  descricao_imovel text,
  arquiteta_id    text references public.users(id),
  engenheiro_id   text references public.users(id),
  gestor_id       text references public.users(id),
  max_revisoes_layouts integer,
  etapa_atual     integer not null default 1,
  imagem_hero     text,
  finalizado      boolean not null default false,
  data_finalizacao text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =========================================================
-- ETAPAS — 1 row por (project, numero)
-- =========================================================
create table if not exists public.etapas (
  project_id  text not null references public.projects(id) on delete cascade,
  numero      integer not null,
  nome        text not null,
  status      text not null,
  data_inicio text,
  data_liberacao text,
  liberada_por text,
  observacao_liberacao text,
  data_aceite_cliente text,
  primary key (project_id, numero)
);

-- =========================================================
-- ETAPA_DATA — payload pesado por etapa em JSONB
-- (briefing, layouts, anteprojeto, executivo, escopo, etc)
-- =========================================================
create table if not exists public.etapa_data (
  project_id text not null references public.projects(id) on delete cascade,
  numero     integer not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (project_id, numero)
);

-- =========================================================
-- FEEDBACKS — comentários por projeto
-- =========================================================
create table if not exists public.feedbacks (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  autor      text,
  texto      text not null,
  data       text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- PENDÊNCIAS (etapa 3)
-- =========================================================
create table if not exists public.pendencias (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  descricao  text not null,
  responsavel text,
  status     text not null,
  data_criacao text,
  data_resolucao text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- GESTÃO DE OBRA (etapa 6)
-- =========================================================
create table if not exists public.gantt_tarefas (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  nome       text not null,
  data_inicio text,
  data_fim    text,
  responsavel text,
  status      text,
  progresso   integer,
  created_at  timestamptz not null default now()
);

create table if not exists public.compras (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  item       text not null,
  fornecedor text,
  valor      numeric,
  data_pedido text,
  data_entrega text,
  status     text,
  created_at timestamptz not null default now()
);

create table if not exists public.checklists (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  data       text,
  responsavel text,
  itens      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.relatorios (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  semana     text,
  resumo     text,
  realizado  text,
  proximos_passos text,
  bloqueios  text,
  data       text,
  created_at timestamptz not null default now()
);

create table if not exists public.fotos_obra (
  id         text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  data       text,
  descricao  text,
  fotos      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RLS — POC libera tudo. Quando entrar auth, restringe.
-- =========================================================
do $$
declare t text;
begin
  for t in select unnest(array[
    'users','projects','etapas','etapa_data','feedbacks',
    'pendencias','gantt_tarefas','compras','checklists','relatorios','fotos_obra'
  ]) loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s open" on public.%I', t, t);
    execute format('create policy "%s open" on public.%I for all using (true) with check (true)', t, t);
  end loop;
end $$;

-- =========================================================
-- Index úteis
-- =========================================================
create index if not exists idx_etapas_project    on public.etapas(project_id);
create index if not exists idx_etapa_data_project on public.etapa_data(project_id);
create index if not exists idx_feedbacks_project on public.feedbacks(project_id);
create index if not exists idx_pendencias_project on public.pendencias(project_id);
create index if not exists idx_gantt_project     on public.gantt_tarefas(project_id);
create index if not exists idx_compras_project   on public.compras(project_id);
create index if not exists idx_checklists_project on public.checklists(project_id);
create index if not exists idx_relatorios_project on public.relatorios(project_id);
create index if not exists idx_fotos_project     on public.fotos_obra(project_id);
