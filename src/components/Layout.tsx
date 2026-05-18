import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { useAuth } from '../authStore';
import { Toast } from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { users, currentUser, setCurrentUser, projects } = useStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
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
          to="/projetos"
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
            onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
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
            <div style={{ flex: 1, paddingTop: 12, overflowY: 'auto' }}>
              {projects.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--ink-300)', padding: '12px 16px' }}>Nenhum projeto ainda.</p>
              ) : (
                projects.map(project => {
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
                })
              )}
            </div>

            <div style={{ padding: 12, borderTop: '1px solid var(--bone)' }}>
              <button
                onClick={() => navigate('/projetos/novo')}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--terracotta)',
                  background: 'transparent',
                  border: '1px solid var(--terracotta)',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--terracotta-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                + Novo Projeto
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
