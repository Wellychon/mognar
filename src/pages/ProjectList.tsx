import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Project } from '../types';

function statusLabel(project: Project) {
  if (project.finalizado) return { label: 'Finalizado', color: '#16A34A', bg: '#F0FDF4' };
  const etapa = project.etapas.find(e => e.numero === project.etapaAtual);
  if (!etapa) return { label: 'Em andamento', color: '#2563EB', bg: '#EFF6FF' };
  if (etapa.status === 'aguardando_liberacao') return { label: 'Aguardando liberação', color: '#CA8A04', bg: '#FEFCE8' };
  if (etapa.status === 'liberada') return { label: 'Liberada', color: '#16A34A', bg: '#F0FDF4' };
  return { label: 'Em andamento', color: '#2563EB', bg: '#EFF6FF' };
}

function etapaColor(etapaNum: number) {
  const colors = ['#2563EB', '#7C3AED', '#0891B2', '#D97706', '#DC2626', '#16A34A'];
  return colors[(etapaNum - 1) % colors.length];
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

export function ProjectList() {
  const { projects, currentUser } = useStore();
  const navigate = useNavigate();

  const visibleProjects = currentUser.role === 'Cliente'
    ? projects.filter(p => p.id === 'tari-restaurante-2026')
    : projects;

  const totalPrazo = visibleProjects.reduce((acc, p) => acc + (parseInt(p.prazoUteis) || 0), 0);
  const totalOrcamento = visibleProjects.reduce((acc, p) => {
    for (const ed of Object.values(p.etapasData)) {
      if (ed.escopo?.valor) acc += parseBRL(ed.escopo.valor);
    }
    return acc;
  }, 0);

  return (
    <div className="p-8">
      {/* Stats bar */}
      {visibleProjects.length > 0 && (
        <div
          className="grid grid-cols-3 gap-4 mb-8 p-5 rounded-2xl animate-fade-in"
          style={{ background: 'var(--terracotta-tint)', border: '1px solid var(--bone)' }}
        >
          {[
            { label: 'Projetos', value: String(visibleProjects.length) },
            { label: 'Dias úteis totais', value: `${totalPrazo} dias` },
            { label: 'Orçamento total', value: totalOrcamento > 0 ? fmtBRL(totalOrcamento) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--terracotta)' }}
              >
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-500)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-900)' }}>Meus Projetos</h1>
        {currentUser.role !== 'Cliente' && (
          <button
            onClick={() => navigate('/projetos/novo')}
            className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
            style={{ background: 'var(--terracotta)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--terracotta-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--terracotta)')}
          >
            + Novo Projeto
          </button>
        )}
      </div>

      {visibleProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--paper)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--ink-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--ink-500)' }}>Nenhum projeto ainda.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-300)' }}>Clique em Novo Projeto para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProjects.map((project, i) => {
            const etapaAtual = project.etapas.find(e => e.numero === project.etapaAtual);
            const status = statusLabel(project);
            const staggerClass = `stagger-${Math.min(i, 5)}`;

            return (
              <button
                key={project.id}
                onClick={() => navigate(`/projetos/${project.id}`)}
                className={`text-left p-5 border rounded-2xl hover:shadow-md transition-all bg-white animate-slide-up ${staggerClass}`}
                style={{ borderColor: 'var(--bone)', borderRadius: 'var(--r-lg)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-base" style={{ color: 'var(--ink-900)' }}>{project.nome}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--ink-500)' }}>{project.razaoSocial}</p>
                  </div>
                </div>

                <p className="text-xs mb-3" style={{ color: 'var(--ink-300)' }}>
                  Início: {new Date(project.dataInicio).toLocaleDateString('pt-BR')}
                </p>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'var(--paper)', color: 'var(--ink-700)' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: etapaColor(project.etapaAtual) }}
                    />
                    Etapa {project.etapaAtual} — {etapaAtual?.nome}
                  </span>

                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
