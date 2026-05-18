// Camada de sync entre o AppState (Zustand) e o schema normalizado no Supabase.
//
// Estratégia: writer-only diff. A cada mudança no store, fazemos snapshot do
// estado e geramos upserts/deletes para cada entidade. Boot lê das tabelas e
// monta um AppState.
//
// Não é tempo-real entre devices — o reload busca o estado mais recente.

import { supabase } from './supabase';
import type {
  User, Project, EtapaInfo, EtapaData, Feedback, Pendencia,
  TarefaGantt, Compra, ChecklistDiario, RelatorioSemanal, FotoObra,
} from '../types';

// ---------- mapeadores camelCase <-> snake_case ----------

function projectToRow(p: Project) {
  return {
    id: p.id, nome: p.nome, tipo_obra: p.tipoObra ?? null,
    data_inicio: p.dataInicio ?? null, prazo_uteis: p.prazoUteis ?? null,
    razao_social: p.razaoSocial ?? null, contato: p.contato ?? null,
    email: p.email ?? null, telefone: p.telefone ?? null, cpf_cnpj: p.cpfCnpj ?? null,
    endereco: p.endereco ?? null, bairro: p.bairro ?? null, cidade: p.cidade ?? null,
    estado: p.estado ?? null, cep: p.cep ?? null, area_m2: p.areaM2 ?? null,
    descricao_imovel: p.descricaoImovel ?? null,
    arquiteta_id: p.arquitetaId ?? null, engenheiro_id: p.engenheiroId ?? null,
    gestor_id: p.gestorId ?? null,
    max_revisoes_layouts: p.maxRevisoesLayouts ?? null,
    etapa_atual: p.etapaAtual ?? 1,
    imagem_hero: p.imagemHero ?? null,
    finalizado: p.finalizado ?? false,
    data_finalizacao: p.dataFinalizacao ?? null,
    updated_at: new Date().toISOString(),
  };
}

function rowToProject(r: any, etapas: EtapaInfo[], etapasData: Record<number, EtapaData>): Project {
  return {
    id: r.id, nome: r.nome, tipoObra: r.tipo_obra ?? undefined,
    dataInicio: r.data_inicio ?? undefined, prazoUteis: r.prazo_uteis ?? undefined,
    razaoSocial: r.razao_social ?? undefined, contato: r.contato ?? undefined,
    email: r.email ?? undefined, telefone: r.telefone ?? undefined,
    cpfCnpj: r.cpf_cnpj ?? undefined, endereco: r.endereco ?? undefined,
    bairro: r.bairro ?? undefined, cidade: r.cidade ?? undefined,
    estado: r.estado ?? undefined, cep: r.cep ?? undefined,
    areaM2: r.area_m2 ?? undefined, descricaoImovel: r.descricao_imovel ?? undefined,
    arquitetaId: r.arquiteta_id ?? undefined,
    engenheiroId: r.engenheiro_id ?? undefined,
    gestorId: r.gestor_id ?? undefined,
    maxRevisoesLayouts: r.max_revisoes_layouts ?? undefined,
    etapaAtual: r.etapa_atual ?? 1,
    imagemHero: r.imagem_hero ?? undefined,
    finalizado: r.finalizado ?? undefined,
    dataFinalizacao: r.data_finalizacao ?? undefined,
    etapas,
    etapasData,
  } as Project;
}

// ---------- LOAD (boot) ----------

export interface LoadedState {
  users: User[];
  projects: Project[];
}

export async function loadAll(): Promise<LoadedState | null> {
  try {
    const [u, p, e, ed, fb, pe, gt, co, ch, rel, fo] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('etapas').select('*'),
      supabase.from('etapa_data').select('*'),
      supabase.from('feedbacks').select('*'),
      supabase.from('pendencias').select('*'),
      supabase.from('gantt_tarefas').select('*'),
      supabase.from('compras').select('*'),
      supabase.from('checklists').select('*'),
      supabase.from('relatorios').select('*'),
      supabase.from('fotos_obra').select('*'),
    ]);

    const errors = [u, p, e, ed, fb, pe, gt, co, ch, rel, fo].map(r => r.error).filter(Boolean);
    if (errors.length) {
      console.warn('[db.loadAll] erros:', errors);
      return null;
    }

    if (!p.data?.length) return null; // banco vazio → usa seed local

    const users: User[] = (u.data ?? []).map(r => ({
      id: r.id, name: r.name, email: r.email, role: r.role, ativo: r.ativo,
    }));

    // Index entidades por projeto
    const etapasByProj = groupBy(e.data ?? [], 'project_id');
    const edByProj = groupBy(ed.data ?? [], 'project_id');
    const fbByProj = groupBy(fb.data ?? [], 'project_id');
    const peByProj = groupBy(pe.data ?? [], 'project_id');
    const gtByProj = groupBy(gt.data ?? [], 'project_id');
    const coByProj = groupBy(co.data ?? [], 'project_id');
    const chByProj = groupBy(ch.data ?? [], 'project_id');
    const relByProj = groupBy(rel.data ?? [], 'project_id');
    const foByProj = groupBy(fo.data ?? [], 'project_id');

    const projects: Project[] = (p.data ?? []).map(pr => {
      const etapas: EtapaInfo[] = (etapasByProj[pr.id] ?? [])
        .sort((a, b) => a.numero - b.numero)
        .map(e => ({
          numero: e.numero, nome: e.nome, status: e.status,
          dataInicio: e.data_inicio ?? undefined,
          dataLiberacao: e.data_liberacao ?? undefined,
          liberadaPor: e.liberada_por ?? undefined,
          observacaoLiberacao: e.observacao_liberacao ?? undefined,
          dataAceiteCliente: e.data_aceite_cliente ?? undefined,
        }));

      const etapasData: Record<number, EtapaData> = {};
      for (const row of edByProj[pr.id] ?? []) {
        etapasData[row.numero] = (row.data ?? {}) as EtapaData;
      }

      // Etapa 3: pendências
      const pends: Pendencia[] = (peByProj[pr.id] ?? []).map(r => ({
        id: r.id, descricao: r.descricao, responsavel: r.responsavel,
        status: r.status, dataCriacao: r.data_criacao, dataResolucao: r.data_resolucao,
      } as Pendencia));
      if (pends.length) {
        etapasData[3] = { ...(etapasData[3] ?? {}), pendencias: pends } as EtapaData;
      }

      // Feedbacks vão em etapasData[etapa].feedbacks? Aqui mantemos uma cópia no projeto.
      const feedbacks: Feedback[] = (fbByProj[pr.id] ?? []).map(r => ({
        autor: r.autor, texto: r.texto, data: r.data,
      } as Feedback));

      // Etapa 6: gestaoObra
      const gestao = {
        tarefasGantt: (gtByProj[pr.id] ?? []).map(r => ({
          id: r.id, nome: r.nome, dataInicio: r.data_inicio, dataFim: r.data_fim,
          responsavel: r.responsavel, status: r.status, progresso: r.progresso,
        } as TarefaGantt)),
        compras: (coByProj[pr.id] ?? []).map(r => ({
          id: r.id, item: r.item, fornecedor: r.fornecedor, valor: r.valor,
          dataPedido: r.data_pedido, dataEntrega: r.data_entrega, status: r.status,
        } as Compra)),
        checklists: (chByProj[pr.id] ?? []).map(r => ({
          id: r.id, data: r.data, responsavel: r.responsavel, itens: r.itens ?? [],
        } as ChecklistDiario)),
        relatorios: (relByProj[pr.id] ?? []).map(r => ({
          id: r.id, semana: r.semana, resumo: r.resumo, realizado: r.realizado,
          proximosPassos: r.proximos_passos, bloqueios: r.bloqueios, data: r.data,
        } as RelatorioSemanal)),
        fotosObra: (foByProj[pr.id] ?? []).map(r => ({
          id: r.id, data: r.data, descricao: r.descricao, fotos: r.fotos ?? [],
        } as FotoObra)),
      };
      if (gestao.tarefasGantt.length || gestao.compras.length || gestao.checklists.length ||
          gestao.relatorios.length || gestao.fotosObra.length) {
        etapasData[6] = { ...(etapasData[6] ?? {}), gestaoObra: gestao } as EtapaData;
      }

      const project = rowToProject(pr, etapas, etapasData);
      (project as any).feedbacks = feedbacks;
      return project;
    });

    return { users, projects };
  } catch (e) {
    console.warn('[db.loadAll] exception:', e);
    return null;
  }
}

// ---------- SAVE (a cada mudança) ----------

interface SaveInput {
  users: User[];
  projects: Project[];
}

let saveInFlight: Promise<void> | null = null;
let pendingSave: SaveInput | null = null;

export function scheduleSave(input: SaveInput) {
  pendingSave = input;
  if (saveInFlight) return;
  saveInFlight = (async () => {
    while (pendingSave) {
      const snap = pendingSave;
      pendingSave = null;
      try { await saveAll(snap); } catch (e) { console.warn('[db.saveAll] falhou:', e); }
    }
    saveInFlight = null;
  })();
}

async function saveAll({ users, projects }: SaveInput) {
  // Users
  if (users.length) {
    await supabase.from('users').upsert(users.map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role, ativo: u.ativo,
    })), { onConflict: 'id' });
  }

  // Projects
  if (projects.length) {
    await supabase.from('projects').upsert(projects.map(projectToRow), { onConflict: 'id' });
  }

  // Para cada projeto, sincroniza filhos via delete+insert (POC: simples e correto)
  for (const p of projects) {
    const pid = p.id;

    // Etapas (max 7) — upsert
    const etapasRows = (p.etapas ?? []).map(e => ({
      project_id: pid, numero: e.numero, nome: e.nome, status: e.status,
      data_inicio: e.dataInicio ?? null, data_liberacao: e.dataLiberacao ?? null,
      liberada_por: e.liberadaPor ?? null,
      observacao_liberacao: e.observacaoLiberacao ?? null,
      data_aceite_cliente: e.dataAceiteCliente ?? null,
    }));
    if (etapasRows.length) {
      await supabase.from('etapas').upsert(etapasRows, { onConflict: 'project_id,numero' });
    }

    // etapa_data — JSONB sem as listas que viram tabela própria
    const edRows: any[] = [];
    for (const [k, v] of Object.entries(p.etapasData ?? {})) {
      const cleaned: any = { ...(v as any) };
      delete cleaned.pendencias;
      delete cleaned.gestaoObra;
      edRows.push({ project_id: pid, numero: Number(k), data: cleaned, updated_at: new Date().toISOString() });
    }
    if (edRows.length) {
      await supabase.from('etapa_data').upsert(edRows, { onConflict: 'project_id,numero' });
    }

    // Pendências (etapa 3)
    const pends: Pendencia[] = (p.etapasData?.[3] as any)?.pendencias ?? [];
    await replaceChildren('pendencias', pid, pends.map(pn => ({
      id: pn.id, project_id: pid, descricao: pn.descricao,
      responsavel: (pn as any).responsavel ?? null,
      status: pn.status,
      data_criacao: (pn as any).dataCriacao ?? null,
      data_resolucao: (pn as any).dataResolucao ?? null,
    })));

    // Feedbacks
    const feedbacks: Feedback[] = (p as any).feedbacks ?? [];
    await replaceChildren('feedbacks', pid, feedbacks.map((f, i) => ({
      id: `${pid}-fb-${i}`, project_id: pid,
      autor: (f as any).autor ?? null, texto: f.texto, data: (f as any).data ?? null,
    })));

    // Gestão de obra (etapa 6)
    const go: any = (p.etapasData?.[6] as any)?.gestaoObra ?? {};
    await replaceChildren('gantt_tarefas', pid, (go.tarefasGantt ?? []).map((t: TarefaGantt) => ({
      id: t.id, project_id: pid, nome: t.nome,
      data_inicio: (t as any).dataInicio ?? null, data_fim: (t as any).dataFim ?? null,
      responsavel: (t as any).responsavel ?? null, status: (t as any).status ?? null,
      progresso: (t as any).progresso ?? null,
    })));
    await replaceChildren('compras', pid, (go.compras ?? []).map((c: Compra) => ({
      id: c.id, project_id: pid, item: (c as any).item ?? '',
      fornecedor: (c as any).fornecedor ?? null, valor: (c as any).valor ?? null,
      data_pedido: (c as any).dataPedido ?? null, data_entrega: (c as any).dataEntrega ?? null,
      status: (c as any).status ?? null,
    })));
    await replaceChildren('checklists', pid, (go.checklists ?? []).map((c: ChecklistDiario) => ({
      id: c.id, project_id: pid,
      data: (c as any).data ?? null, responsavel: (c as any).responsavel ?? null,
      itens: (c as any).itens ?? [],
    })));
    await replaceChildren('relatorios', pid, (go.relatorios ?? []).map((r: RelatorioSemanal) => ({
      id: r.id, project_id: pid,
      semana: (r as any).semana ?? null, resumo: (r as any).resumo ?? null,
      realizado: (r as any).realizado ?? null, proximos_passos: (r as any).proximosPassos ?? null,
      bloqueios: (r as any).bloqueios ?? null, data: (r as any).data ?? null,
    })));
    await replaceChildren('fotos_obra', pid, (go.fotosObra ?? []).map((f: FotoObra) => ({
      id: f.id, project_id: pid,
      data: (f as any).data ?? null, descricao: (f as any).descricao ?? null,
      fotos: (f as any).fotos ?? [],
    })));
  }
}

async function replaceChildren(table: string, projectId: string, rows: any[]) {
  await supabase.from(table).delete().eq('project_id', projectId);
  if (rows.length) await supabase.from(table).insert(rows);
}

// ---------- utils ----------
function groupBy<T extends Record<string, any>>(rows: T[], key: string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const r of rows) {
    const k = r[key];
    (out[k] ??= []).push(r);
  }
  return out;
}
