import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { KpiDashboard } from '../components/KpiDashboard';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function parseBRL(val: string): number {
  const n = parseFloat(
    val.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim()
  );
  return isNaN(n) ? 0 : n;
}

function fmtBRL(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const ETAPA_COLORS = ['#2563EB', '#7C3AED', '#0891B2', '#D97706', '#DC2626', '#16A34A'];

export function Home() {
  const { currentUser, projects } = useStore();
  const navigate = useNavigate();

  const ativos = projects.filter(p => !p.finalizado);
  const finalizados = projects.filter(p => p.finalizado);
  const totalOrcamento = projects.reduce((acc, p) => {
    for (const ed of Object.values(p.etapasData)) {
      if (ed.escopo?.valor) acc += parseBRL(ed.escopo.valor);
    }
    return acc;
  }, 0);
  const aguardando = projects.filter(p =>
    p.etapas.some(e => e.status === 'aguardando_liberacao')
  );

  const firstName = currentUser.name.split(' ')[0];

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 960, margin: '0 auto' }}>

      {/* Saudação */}
      <div className="animate-fade-in" style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 4px', letterSpacing: 0.3 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 38,
            fontWeight: 400,
            color: 'var(--ink-900)',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {greeting()}, {firstName}.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '8px 0 0' }}>
          {ativos.length === 0
            ? 'Nenhum projeto ativo no momento.'
            : `Você tem ${ativos.length} projeto${ativos.length > 1 ? 's' : ''} em andamento.`}
        </p>
      </div>

      {/* Cards de resumo */}
      <div
        className="animate-slide-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {[
          {
            label: 'Projetos ativos',
            value: ativos.length,
            sub: `${finalizados.length} finalizados`,
            color: '#2563EB',
            bg: '#EFF6FF',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            ),
          },
          {
            label: 'Aguard. liberação',
            value: aguardando.length,
            sub: aguardando.length > 0 ? 'requer atenção' : 'tudo em dia',
            color: aguardando.length > 0 ? '#D97706' : '#16A34A',
            bg: aguardando.length > 0 ? '#FFFBEB' : '#F0FDF4',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            ),
          },
          {
            label: 'Total orçado',
            value: totalOrcamento > 0 ? fmtBRL(totalOrcamento) : '—',
            sub: 'soma dos escopos',
            color: '#7C3AED',
            bg: '#F5F3FF',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            ),
          },
          {
            label: 'Seu perfil',
            value: currentUser.role,
            sub: currentUser.email ?? '',
            color: '#ac440e',
            bg: 'var(--terracotta-tint)',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            ),
          },
        ].map(({ label, value, sub, color, bg, icon }) => (
          <div
            key={label}
            style={{
              background: bg,
              border: `1px solid ${color}22`,
              borderRadius: 'var(--r-lg)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
              </p>
              <span style={{ color }}>{icon}</span>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color, margin: '0 0 3px', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Projetos recentes */}
      {projects.length > 0 && (
        <div className="animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              Projetos
            </h2>
            <button
              onClick={() => navigate('/projetos/novo')}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--terracotta)',
                background: 'transparent',
                border: '1px solid var(--terracotta)',
                borderRadius: 'var(--r-sm)',
                padding: '5px 12px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--terracotta-tint)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              + Novo projeto
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map(project => {
              const etapa = project.etapas.find(e => e.numero === project.etapaAtual);
              const cor = ETAPA_COLORS[(project.etapaAtual - 1) % ETAPA_COLORS.length];
              const progresso = Math.round(((project.etapaAtual - 1) / 6) * 100);

              return (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projetos/${project.id}`)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'white',
                    border: '1px solid var(--bone)',
                    borderRadius: 'var(--r-lg)',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 150ms, transform 150ms',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                        {project.nome}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: '2px 0 0' }}>
                        {project.razaoSocial}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: project.finalizado ? '#F0FDF4' : `${cor}14`,
                      color: project.finalizado ? '#16A34A' : cor,
                      border: `1px solid ${project.finalizado ? '#16A34A33' : cor + '33'}`,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      marginLeft: 12,
                    }}>
                      {project.finalizado ? 'Finalizado' : etapa?.nome ?? 'Em andamento'}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--bone)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${progresso}%`, height: '100%', background: cor, borderRadius: 2, transition: 'width 600ms' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--ink-500)', flexShrink: 0 }}>
                      Etapa {project.etapaAtual}/6
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPIs do Investidor */}
      <KpiDashboard projects={projects} />

      {/* Estado vazio */}
      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-700)', margin: '0 0 8px' }}>
            Nenhum projeto ainda
          </h3>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '0 0 24px' }}>
            Crie seu primeiro projeto para começar a gerenciar a reforma.
          </p>
          <button
            onClick={() => navigate('/projetos/novo')}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              background: 'var(--terracotta)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            + Criar projeto
          </button>
        </div>
      )}
    </div>
  );
}
