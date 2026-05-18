import { useState } from 'react';
import { useStore } from '../store';
import type { User, UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
  FuerzaAdmin: 'Fuerza Admin',
  Admin: 'Admin',
  Arquiteta: 'Arquiteta',
  Engenheiro: 'Engenheiro',
  Gestor: 'Gestor',
};

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  FuerzaAdmin: { bg: '#1a1a2e', color: '#a78bfa' },
  Admin: { bg: '#1e3a5f', color: '#60a5fa' },
  Arquiteta: { bg: '#3b1f2b', color: '#f9a8d4' },
  Engenheiro: { bg: '#1f3b2b', color: '#6ee7b7' },
  Gestor: { bg: '#3b2f1f', color: '#fcd34d' },
};

interface RoleProfile {
  role: UserRole;
  tagline: string;
  coreJob: string;
  etapas: string[];
  acesso: string[];
  semAcesso: string[];
  accent: string;
}

const ROLE_PROFILES: RoleProfile[] = [
  {
    role: 'Admin',
    accent: '#60a5fa',
    tagline: 'Visão 360° sem operar no dia a dia',
    coreJob: 'Saber, em menos de 1 minuto, a saúde de cada projeto em andamento sem precisar perguntar para ninguém.',
    etapas: ['Todos os projetos (visão executiva)'],
    acesso: [
      'Dashboard executivo com todos os projetos ativos',
      'Status macro por projeto: etapa atual, % de avanço, prazo, alertas',
      'Indicadores financeiros consolidados',
      'Drill-down em qualquer projeto para ver detalhes',
      'Gerenciar cadastro de usuários e permissões',
      'Configurar parâmetros globais (revisões padrão, validade de orçamento)',
      'Acessar histórico completo de qualquer projeto',
      'Visualizar relatórios gerados pela gestora',
    ],
    semAcesso: [
      'Não opera dentro das etapas diretamente',
      'Decisões operacionais passam pela Gestora',
      'Não interage com cliente ou equipe técnica diretamente',
    ],
  },
  {
    role: 'Gestor',
    accent: '#fcd34d',
    tagline: 'Supervisão total e garantia do processo',
    coreJob: 'Coordenar todas as partes de uma obra sem perder nenhum fio — garantindo que o cliente nunca precise se preocupar.',
    etapas: ['Todas as etapas (1 a 6)', 'Onboarding e encerramento'],
    acesso: [
      'Criar e configurar projetos (nome, escopo, datas, tipo de reforma)',
      'Atribuir arquiteto e engenheiro ao projeto',
      'Configurar número de revisões permitidas por etapa',
      'Registrar reuniões via upload de vídeo + transcrição',
      'Validar e liberar etapas após aprovação',
      'Criar checklist diário e planejamento semanal',
      'Registrar compras, fornecedores e comprovantes',
      'Gerar relatório semanal semi-automático',
      'Registrar fotos da obra organizadas por data',
      'Conduzir vistoria de encerramento e gerar termo final',
    ],
    semAcesso: [
      'Não faz upload de entregáveis técnicos (arquitetura/engenharia)',
      'Não elabora orçamento de materiais ou mão de obra',
    ],
  },
  {
    role: 'Arquiteta',
    accent: '#f9a8d4',
    tagline: 'Do briefing ao projeto executivo',
    coreJob: 'Focar na criação e entrega técnica sem precisar gerenciar comunicação, aprovações e burocracia por fora da plataforma.',
    etapas: ['Etapa 1 — Levantamento', 'Etapa 2 — Estudo Preliminar', 'Etapa 3 — Compatibilização', 'Etapa 4 — Projeto Executivo', 'Etapa 5 — Orçamentação (acabamentos)', 'Etapa 6 — Acompanhamento parcial'],
    acesso: [
      'Upload de layouts e propostas (PDF, imagem, vídeo)',
      'Registrar e receber solicitações de revisão',
      'Upload de entregáveis finais: 3D/renders, memorial, pontos, paginações, cadernos, luminotécnico',
      'Upload do orçamento de acabamentos',
      'Registrar aprovação tripartite (Mognar + arquiteto + cliente)',
      'Acessar checklist e cronograma em modo leitura na execução',
      'Registrar solicitações de mudança durante execução',
    ],
    semAcesso: [
      'Não libera etapas (aprovação é da Gestora)',
      'Não acessa orçamento de materiais brutos ou mão de obra',
      'Não cria projetos nem configura parâmetros globais',
      'Não se comunica diretamente com cliente fora do sistema',
    ],
  },
  {
    role: 'Engenheiro',
    accent: '#6ee7b7',
    tagline: 'Viabilidade técnica, orçamento e fiscalização',
    coreJob: 'Garantir que o projeto é tecnicamente viável, que o orçamento é preciso e que a obra está sendo executada conforme planejado.',
    etapas: ['Etapa 3 — Compatibilização', 'Etapa 4 — Projeto Executivo (validação)', 'Etapa 5 — Orçamentação', 'Etapa 6 — Gestão de Obra'],
    acesso: [
      'Registrar dúvidas e pendências técnicas',
      'Upload de parecer técnico e relatório de visita ao imóvel',
      'Validar correções e liberar etapa para o arquiteto',
      'Upload do orçamento de materiais brutos e mão de obra',
      'Criar cronograma de obra (categorias → atividades → duração → dependências)',
      'Configurar 2 faixas de orçamento (standard e premium)',
      'Registrar ocorrências técnicas com evidências na execução',
      'Monitorar checklist diário e cronograma Gantt',
    ],
    semAcesso: [
      'Não acessa Etapas 1 e 2 (levantamento e estudo preliminar)',
      'Não aprova etapas (aprovação é da Gestora)',
      'Não se comunica com cliente diretamente',
      'Não cria projetos nem gerencia usuários',
    ],
  },
];

type Tab = 'projetos' | 'usuarios';

interface UserModalState {
  open: boolean;
  editing: User | null;
}

export function FuerzaAccountManager() {
  const { users, projects, addUser, updateUser, toggleUserAtivo } = useStore();
  const [tab, setTab] = useState<Tab>('projetos');
  const [modal, setModal] = useState<UserModalState>({ open: false, editing: null });
  const [form, setForm] = useState({ name: '', email: '', role: 'Admin' as UserRole });
  const [search, setSearch] = useState('');
  const [showPerfis, setShowPerfis] = useState(false);
  const [activeProfile, setActiveProfile] = useState<UserRole>('Admin');

  const openAdd = () => {
    setForm({ name: '', email: '', role: 'Admin' });
    setModal({ open: true, editing: null });
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email ?? '', role: user.role });
    setModal({ open: true, editing: user });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const saveUser = () => {
    if (!form.name.trim()) return;
    if (modal.editing) {
      updateUser(modal.editing.id, { name: form.name, email: form.email, role: form.role });
    } else {
      addUser({ name: form.name, email: form.email, role: form.role });
    }
    closeModal();
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#a78bfa', textTransform: 'uppercase' }}>
            Fuerza Admin
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
          Gerenciador de Contas
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 4 }}>
          Visão completa de projetos ativos e controle de usuários da plataforma.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Projetos', value: projects.length, sub: `${projects.filter(p => !p.finalizado).length} ativos` },
          { label: 'Usuários', value: users.filter(u => u.role !== 'FuerzaAdmin').length, sub: `${users.filter(u => u.ativo !== false && u.role !== 'FuerzaAdmin').length} ativos` },
          { label: 'Concluídos', value: projects.filter(p => p.finalizado).length, sub: 'projetos finalizados' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--paper)', border: '1px solid var(--bone)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
            <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 2px' }}>{stat.value}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: 0 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--bone)', marginBottom: 28 }}>
        {(['projetos', 'usuarios'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--terracotta)' : 'var(--ink-500)',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--terracotta)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              textTransform: 'capitalize',
            }}
          >
            {t === 'projetos' ? 'Projetos' : 'Usuários'}
          </button>
        ))}
      </div>

      {/* Tab: Projetos */}
      {tab === 'projetos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map(project => {
            const arquiteta = users.find(u => u.id === project.arquitetaId);
            const engenheiro = users.find(u => u.id === project.engenheiroId);
            const gestor = users.find(u => u.id === project.gestorId);
            const etapaAtual = project.etapas.find(e => e.numero === project.etapaAtual);

            return (
              <div
                key={project.id}
                style={{ background: 'var(--paper)', border: '1px solid var(--bone)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', margin: 0 }}>
                        {project.nome}
                      </h3>
                      {project.finalizado && (
                        <span style={{ fontSize: 11, padding: '2px 8px', background: '#f0fdf4', color: '#15803d', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                          Concluído
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: '0 0 14px' }}>
                      {project.razaoSocial || '—'} · {project.cidade || '—'} · {project.tipoObra}
                    </p>

                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Equipe</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {[
                            { label: 'Arquiteta', user: arquiteta },
                            { label: 'Engenheiro', user: engenheiro },
                            { label: 'Gestor', user: gestor },
                          ].map(({ label, user }) => (
                            <span key={label} style={{ fontSize: 12, padding: '3px 10px', background: 'var(--bone)', borderRadius: 20, color: 'var(--ink-700)' }}>
                              {label}: {user?.name ?? '—'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Etapa atual</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--terracotta)', margin: 0 }}>
                      {etapaAtual ? `${etapaAtual.numero}. ${etapaAtual.nome}` : '—'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 2 }}>
                      Início: {new Date(project.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Usuários */}
      {tab === 'usuarios' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                maxWidth: 360,
                padding: '8px 14px',
                fontSize: 13,
                border: '1px solid var(--bone)',
                borderRadius: 'var(--r-md)',
                background: 'var(--paper)',
                color: 'var(--ink-900)',
                outline: 'none',
              }}
            />
            <button
              onClick={openAdd}
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                background: 'var(--terracotta)',
                border: 'none',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
              }}
            >
              + Novo Usuário
            </button>
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--bone)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bone)', background: 'var(--paper-2)' }}>
                  {['Nome', 'E-mail', 'Role', 'Status', 'Projetos', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-400)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => {
                  const projetosDoUser = projects.filter(p =>
                    p.arquitetaId === user.id || p.engenheiroId === user.id || p.gestorId === user.id
                  );
                  const rc = ROLE_COLORS[user.role];
                  const isAtivo = user.ativo !== false;

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--bone)' : 'none',
                        opacity: isAtivo ? 1 : 0.55,
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>
                        {user.name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-500)' }}>
                        {user.email ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: rc.bg, color: rc.color }}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: isAtivo ? '#f0fdf4' : '#fef2f2',
                          color: isAtivo ? '#15803d' : '#dc2626',
                          border: `1px solid ${isAtivo ? '#bbf7d0' : '#fecaca'}`,
                        }}>
                          {isAtivo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-500)' }}>
                        {projetosDoUser.length > 0
                          ? projetosDoUser.map(p => p.nome).join(', ')
                          : <span style={{ color: 'var(--ink-300)' }}>Nenhum</span>
                        }
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {user.role !== 'FuerzaAdmin' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => openEdit(user)}
                              style={{ fontSize: 12, padding: '4px 10px', border: '1px solid var(--bone)', borderRadius: 'var(--r-sm)', background: 'transparent', color: 'var(--ink-600)', cursor: 'pointer' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleUserAtivo(user.id)}
                              style={{
                                fontSize: 12,
                                padding: '4px 10px',
                                border: `1px solid ${isAtivo ? '#fecaca' : '#bbf7d0'}`,
                                borderRadius: 'var(--r-sm)',
                                background: 'transparent',
                                color: isAtivo ? '#dc2626' : '#15803d',
                                cursor: 'pointer',
                              }}
                            >
                              {isAtivo ? 'Desativar' : 'Reativar'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Guia de Perfis */}
          <div style={{ marginTop: 32 }}>
            <button
              onClick={() => setShowPerfis(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: '1px solid var(--bone)',
                borderRadius: 'var(--r-md)',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--ink-600)',
                cursor: 'pointer',
                marginBottom: showPerfis ? 20 : 0,
              }}
            >
              <span style={{ fontSize: 11 }}>{showPerfis ? '▲' : '▼'}</span>
              {showPerfis ? 'Fechar guia de perfis' : 'Ver guia de permissões por perfil'}
            </button>

            {showPerfis && (
              <div>
                <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: '0 0 20px' }}>
                  Referência rápida do que cada role pode e não pode fazer na plataforma.
                </p>

                {/* Role selector */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  {ROLE_PROFILES.map(p => {
                    const isActive = activeProfile === p.role;
                    return (
                      <button
                        key={p.role}
                        onClick={() => setActiveProfile(p.role)}
                        style={{
                          padding: '7px 16px',
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          background: isActive ? ROLE_COLORS[p.role].bg : 'var(--paper)',
                          color: isActive ? ROLE_COLORS[p.role].color : 'var(--ink-600)',
                          border: `1px solid ${isActive ? p.accent : 'var(--bone)'}`,
                          borderRadius: 'var(--r-md)',
                          cursor: 'pointer',
                          transition: 'all 150ms',
                        }}
                      >
                        {ROLE_LABELS[p.role]}
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const p = ROLE_PROFILES.find(r => r.role === activeProfile);
                  if (!p) return null;
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {/* Esquerda */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: 'var(--paper)', border: '1px solid var(--bone)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: p.accent, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>
                            Missão
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.7, margin: '0 0 14px', fontStyle: 'italic' }}>
                            "{p.coreJob}"
                          </p>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>
                            Etapas com acesso
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {p.etapas.map(e => (
                              <span key={e} style={{ fontSize: 11, padding: '3px 10px', background: `${p.accent}15`, border: `1px solid ${p.accent}40`, borderRadius: 20, color: p.accent, fontWeight: 500 }}>
                                {e}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '3px solid #dc2626', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>
                            Sem acesso / restrições
                          </p>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {p.semAcesso.map((item, i) => (
                              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
                                <span style={{ flexShrink: 0, color: '#dc2626', fontWeight: 700 }}>✕</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Direita */}
                      <div style={{ background: 'var(--paper)', border: '1px solid var(--bone)', borderLeft: `3px solid ${p.accent}`, borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: p.accent, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>
                          O que pode fazer
                        </p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {p.acesso.map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.6 }}>
                              <span style={{ flexShrink: 0, color: p.accent, fontWeight: 700, paddingTop: 1 }}>✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {modal.open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={closeModal}
        >
          <div
            style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: 32, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px', color: 'var(--ink-900)' }}>
              {modal.editing ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', display: 'block', marginBottom: 6 }}>Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid var(--bone)', borderRadius: 'var(--r-md)', background: 'var(--paper)', color: 'var(--ink-900)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', display: 'block', marginBottom: 6 }}>E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid var(--bone)', borderRadius: 'var(--r-md)', background: 'var(--paper)', color: 'var(--ink-900)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', display: 'block', marginBottom: 6 }}>Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid var(--bone)', borderRadius: 'var(--r-md)', background: 'var(--paper)', color: 'var(--ink-900)', outline: 'none' }}
                >
                  {(['Admin', 'Arquiteta', 'Engenheiro', 'Gestor'] as UserRole[]).map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
              <button
                onClick={closeModal}
                style={{ padding: '8px 18px', fontSize: 13, border: '1px solid var(--bone)', borderRadius: 'var(--r-md)', background: 'transparent', color: 'var(--ink-600)', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={saveUser}
                style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 'var(--r-md)', background: 'var(--terracotta)', color: '#fff', cursor: 'pointer' }}
              >
                {modal.editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
