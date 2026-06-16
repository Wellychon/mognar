import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { useAuth } from '../authStore';
import { Toast } from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentUser, projects } = useStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeProject = id ? projects.find(p => p.id === id) : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Topbar */}
      <header
        style={{
          height: 56,
          background: 'var(--navy-900)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        {/* Hamburger */}
        <button
          className={`hamburger${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: '#fff',
            textDecoration: 'none',
            letterSpacing: '-0.5px',
            flexShrink: 0,
          }}
        >
          Mognar
        </Link>

        {/* Active project name */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          {activeProject ? (
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProject.nome}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              Gestão de Reformas Arquitetônicas
            </span>
          )}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={async () => {
              await logout();
              useStore.getState().logout();
              navigate('/login', { replace: true });
            }}
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--r-sm)',
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'color 150ms, border-color 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          style={{
            width: sidebarOpen ? 240 : 0,
            transition: 'width 260ms cubic-bezier(.4,0,.2,1)',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--paper)',
            borderRight: '1px solid var(--bone)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ width: 240, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ flex: 1, paddingTop: 8, overflowY: 'auto' }}>
              {/* Início */}
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: location.pathname === '/' ? 'var(--terracotta-tint)' : 'transparent',
                  border: 'none',
                  borderLeft: location.pathname === '/' ? '3px solid var(--terracotta)' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  marginBottom: 2,
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { if (location.pathname !== '/') e.currentTarget.style.background = 'var(--bone-2)'; }}
                onMouseLeave={e => { if (location.pathname !== '/') e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={location.pathname === '/' ? 'var(--terracotta)' : 'var(--ink-500)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: location.pathname === '/' ? 'var(--terracotta)' : 'var(--ink-700)' }}>
                  Início
                </span>
              </button>

              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-300)', padding: '8px 16px 4px', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Projetos
              </p>

              {currentUser.role === 'FuerzaAdmin' && (
                <button
                  onClick={() => navigate('/fuerza/contas')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: location.pathname === '/fuerza/contas' ? '#1a1a2e' : 'transparent',
                    border: 'none',
                    borderLeft: location.pathname === '/fuerza/contas' ? '3px solid #a78bfa' : '3px solid transparent',
                    cursor: 'pointer',
                    marginBottom: 4,
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', margin: 0, letterSpacing: 0.5 }}>
                    GERENCIADOR DE CONTAS
                  </p>
                </button>
              )}
              {(() => {
                const visibleProjects = currentUser.role === 'Cliente'
                  ? projects.filter(p => p.id === 'tari-restaurante-2026')
                  : projects;

                if (visibleProjects.length === 0) {
                  return <p style={{ fontSize: 12, color: 'var(--ink-300)', padding: '12px 16px' }}>Nenhum projeto ainda.</p>;
                }

                return visibleProjects.map(project => {
                  const isActive = project.id === id;
                  const etapaAtual = project.etapas.find(e => e.numero === project.etapaAtual);
                  return (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/projetos/${project.id}`)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: isActive ? 'var(--terracotta-tint)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '3px solid var(--terracotta)' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bone-2)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.nome}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--ink-500)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.razaoSocial}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--terracotta)', marginTop: 2 }}>
                        {etapaAtual?.nome}
                      </p>
                    </button>
                  );
                });
              })()}
            </div>

            <div style={{ borderTop: '1px solid var(--bone)' }}>
              {currentUser.role !== 'Cliente' && (
                <button
                  onClick={() => navigate('/projetos/novo')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--terracotta)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--bone)',
                    cursor: 'pointer',
                    transition: 'background 150ms',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--terracotta-tint)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  + Novo Projeto
                </button>
              )}

              {/* Configurações */}
              <button
                onClick={() => navigate('/configuracoes')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: location.pathname === '/configuracoes' ? 'var(--bone)' : 'transparent',
                  border: 'none',
                  borderLeft: location.pathname === '/configuracoes' ? '3px solid var(--ink-500)' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { if (location.pathname !== '/configuracoes') e.currentTarget.style.background = 'var(--bone-2)'; }}
                onMouseLeave={e => { if (location.pathname !== '/configuracoes') e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-700)' }}>
                  Configurações
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--paper-2)' }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <Toast />
    </div>
  );
}
