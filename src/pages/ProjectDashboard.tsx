import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, USERS } from '../store';
import { ETAPAS_NOMES } from '../types';
import type { EtapaStatus, Project } from '../types';
import { KpiDashboard } from '../components/KpiDashboard';

const STATUS_CFG: Record<EtapaStatus, { label: string; color: string; bg: string; border: string }> = {
  em_andamento:        { label: 'Em andamento',    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  aguardando_liberacao:{ label: 'Aguard. liberação',color: '#CA8A04', bg: '#FEFCE8', border: '#FDE68A' },
  liberada:            { label: 'Liberada',          color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  bloqueada:           { label: 'Bloqueada',         color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB' },
};

const GANTT_STATUS_CLASS: Record<EtapaStatus, string> = {
  liberada:            '',
  em_andamento:        'terracotta',
  aguardando_liberacao:'yellow',
  bloqueada:           'muted',
};

function fmt(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

function fmtDateTime(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function getUserName(id: string) {
  return USERS.find(u => u.id === id)?.name || id;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* ── Gantt ─────────────────────────────────────────────────── */
function GanttCronograma({ project }: { project: Project }) {
  const start = new Date(project.dataInicio);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Farthest date: last liberation or today+14
  const farthest = project.etapas.reduce((acc, e) => {
    if (e.dataLiberacao) {
      const d = new Date(e.dataLiberacao);
      if (d > acc) return d;
    }
    return acc;
  }, addDays(today, 14));

  const totalDays = Math.max(Math.ceil((farthest.getTime() - start.getTime()) / 86400000), 28);
  const NUM_WEEKS = Math.min(Math.max(Math.ceil(totalDays / 7), 8), 20);
  const spanDays = NUM_WEEKS * 7;

  function pct(date: Date) {
    const d = Math.max(0, date.getTime() - start.getTime()) / 86400000;
    return Math.min(100, (d / spanDays) * 100);
  }

  const todayPct = pct(today);

  // Each etapa bar: starts at etapa.dataInicio or previous etapa end, ends at dataLiberacao or current date
  const bars = project.etapas.map(etapa => {
    const barStart = etapa.dataInicio ? new Date(etapa.dataInicio) : start;
    const barEnd = etapa.dataLiberacao
      ? new Date(etapa.dataLiberacao)
      : etapa.status === 'em_andamento'
      ? today
      : null;

    return { etapa, barStart, barEnd };
  });

  return (
    <div className="mognar-gantt">
      {/* Head */}
      <div className="mognar-gantt-head">
        <div className="left">Etapa</div>
        <div className="right" style={{ position: 'relative' }}>
          {Array.from({ length: NUM_WEEKS }).map((_, i) => {
            const weekStart = addDays(start, i * 7);
            const day = weekStart.getDate().toString().padStart(2, '0');
            const mon = weekStart.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
            return <div key={i} className="week-col">{day} {mon}</div>;
          })}
        </div>
      </div>

      {/* Rows */}
      {bars.map(({ etapa, barStart, barEnd }, idx) => {
        const left = pct(barStart);
        const right = barEnd ? pct(barEnd) : null;
        const width = right !== null ? Math.max(right - left, 1) : null;
        const colorClass = GANTT_STATUS_CLASS[etapa.status];

        return (
          <div key={etapa.numero} className="mognar-gantt-row">
            <div className="left">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: STATUS_CFG[etapa.status].bg, color: STATUS_CFG[etapa.status].color }}
              >
                {etapa.status === 'liberada' ? '✓' : etapa.numero}
              </span>
              <span className="text-xs truncate" style={{ color: 'var(--ink-700)' }}>{ETAPAS_NOMES[idx]}</span>
            </div>
            <div className="right" style={{ position: 'relative' }}>
              {/* Week grid lines */}
              {Array.from({ length: NUM_WEEKS - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="gantt-week-line"
                  style={{ left: `${((i + 1) / NUM_WEEKS) * 100}%` }}
                />
              ))}
              {/* Today line */}
              {todayPct > 0 && todayPct < 100 && (
                <div className="gantt-today" style={{ left: `${todayPct}%` }} />
              )}
              {/* Bar */}
              {width !== null && (
                <div
                  className={`bar-task ${colorClass}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${fmt(etapa.dataInicio)} → ${etapa.dataLiberacao ? fmt(etapa.dataLiberacao) : 'hoje'}`}
                >
                  {width > 8 ? ETAPAS_NOMES[idx] : ''}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div
        className="flex items-center gap-4 px-4 py-2 text-xs"
        style={{ borderTop: '1px solid var(--bone-2)', color: 'var(--ink-500)' }}
      >
        {[
          { cls: '', label: 'Liberada' },
          { cls: 'terracotta', label: 'Em andamento' },
          { cls: 'yellow', label: 'Aguardando' },
          { cls: 'muted', label: 'Bloqueada' },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`bar-task ${cls}`} style={{ position: 'static', width: 16, height: 10, padding: 0, borderRadius: 3 }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 ml-auto">
          <span style={{ display: 'inline-block', width: 0, height: 10, borderLeft: '1.5px dashed var(--terracotta)' }} />
          Hoje
        </span>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, currentUser, finalizarProjeto, reabrirProjeto, adicionarFeedback, setImagemHero, showToast } = useStore();
  const [feedbackText, setFeedbackText] = useState('');
  const heroInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--ink-500)' }}>
        <p>Projeto não encontrado.</p>
        <button onClick={() => navigate('/projetos')} className="mt-4 text-sm underline" style={{ color: 'var(--terracotta)' }}>
          Voltar
        </button>
      </div>
    );
  }

  const etapasLiberadas = project.etapas.filter(e => e.status === 'liberada').length;
  const progressPct = Math.round((etapasLiberadas / 6) * 100);

  function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setImagemHero(project!.id, b64);
      showToast('Imagem do projeto atualizada!');
    };
    reader.readAsDataURL(file);
  }

  function handleFinalize() {
    finalizarProjeto(project!.id);
    showToast('Projeto finalizado!');
  }

  function handleReopen() {
    reabrirProjeto(project!.id);
    showToast('Projeto reaberto.');
  }

  function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    adicionarFeedback(project!.id, feedbackText.trim());
    setFeedbackText('');
    showToast('Comentário registrado.');
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero image ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 200, background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--terracotta) 100%)' }}
      >
        {project.imagemHero ? (
          <img
            src={project.imagemHero}
            alt="Hero"
            className="animate-hero-reveal"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 animate-hero-reveal"
            style={{ opacity: 0.5 }}
          >
            <svg className="w-12 h-12 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4-4a3 3 0 014 0l4 4m-4-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-sm opacity-70">Adicione uma foto panorâmica do local</p>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)' }} />

        {/* Project name over hero */}
        <div className="absolute bottom-0 left-0 right-0 p-5 animate-hero-badge">
          <h1
            className="text-white text-2xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 1px 4px rgba(0,0,0,.4)' }}
          >
            {project.nome}
          </h1>
          <p className="text-white text-sm opacity-80 mt-0.5">{project.razaoSocial} · {project.tipoObra}</p>
        </div>

        {/* Upload button */}
        {currentUser.role !== 'Cliente' && (
          <>
            <button
              onClick={() => heroInputRef.current?.click()}
              className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-sm transition-opacity hover:opacity-100 opacity-70"
              style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
            >
              {project.imagemHero ? 'Trocar foto' : '+ Adicionar foto'}
            </button>
            <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
          </>
        )}
      </div>

      <div className="p-8">
        {/* ── Header row ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ink-300)' }}>Progresso geral</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold" style={{ color: 'var(--terracotta)' }}>{progressPct}%</span>
              <span className="text-sm" style={{ color: 'var(--ink-500)' }}>{etapasLiberadas} de 6 etapas</span>
            </div>
          </div>

          {currentUser.role === 'Cliente' ? (
            project.finalizado ? (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
              >
                ✓ Finalizado em {fmt(project.dataFinalizacao)}
              </span>
            ) : (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}
              >
                Em andamento
              </span>
            )
          ) : project.finalizado ? (
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
              >
                ✓ Finalizado em {fmt(project.dataFinalizacao)}
              </span>
              <button
                onClick={handleReopen}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                style={{ borderColor: 'var(--bone)', color: 'var(--ink-700)' }}
              >
                Reabrir projeto
              </button>
            </div>
          ) : (
            <button
              onClick={handleFinalize}
              className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
              style={{ background: 'var(--terracotta)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--terracotta-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--terracotta)')}
            >
              Finalizar projeto
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-8" style={{ background: 'var(--bone-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: 'var(--terracotta)' }}
          />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Início', value: fmt(project.dataInicio) },
            { label: 'Prazo', value: project.prazoUteis ? `${project.prazoUteis} dias úteis` : '—' },
            { label: 'Área', value: project.areaM2 ? `${project.areaM2} m²` : '—' },
            { label: 'Arquiteta', value: getUserName(project.arquitetaId) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4 border" style={{ background: 'var(--paper)', borderColor: 'var(--bone)' }}>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ink-300)' }}>{label}</p>
              <p className="text-sm font-semibold mt-1 truncate" style={{ color: 'var(--ink-900)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* KPIs do projeto */}
        <KpiDashboard projects={[project]} title="KPIs deste projeto" />

        {/* Stage cards */}
        <div className="mb-10" style={{ marginTop: 40 }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--ink-500)' }}>Etapas do projeto</h2>
          <div className="grid grid-cols-2 gap-4">
            {project.etapas.map((etapa, idx) => {
              const etapaData = project.etapasData[etapa.numero] || {};
              const cfg = STATUS_CFG[etapa.status];
              const isBlocked = etapa.status === 'bloqueada';
              const isActive = etapa.status === 'em_andamento';
              const isReleased = etapa.status === 'liberada';

              const checklist = [
                { label: 'Escopo',       ok: !!(etapaData.escopo?.descricao) },
                { label: 'Reunião',      ok: !!(etapaData.reuniao?.dataReuniao) },
                { label: 'Levantamento', ok: !!(etapaData.levantamento?.dataLevantamento) },
                { label: 'Aceite',       ok: !!(etapaData.aceite) },
              ];
              const doneCount = checklist.filter(c => c.ok).length;

              return (
                <button
                  key={etapa.numero}
                  onClick={() => !isBlocked && navigate(`/projetos/${project.id}/etapa/${etapa.numero}`)}
                  disabled={isBlocked}
                  className={`text-left p-5 rounded-xl border transition-all duration-200 animate-slide-up stagger-${idx} ${
                    isBlocked
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                  } ${isActive ? 'ring-2' : ''}`}
                  style={{
                    borderColor: isReleased ? '#BBF7D0' : isActive ? 'var(--terracotta)' : 'var(--bone)',
                    background: isReleased ? 'var(--green-bg)' : isActive ? 'var(--terracotta-tint)' : '#FFFFFF',
                    outline: isActive ? '2px solid var(--terracotta)' : 'none',
                    outlineOffset: -2,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {isReleased ? '✓' : etapa.numero}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>{ETAPAS_NOMES[idx]}</span>
                    </div>
                    {isBlocked ? (
                      <svg className="w-4 h-4" style={{ color: 'var(--ink-300)' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z" />
                      </svg>
                    ) : (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    )}
                  </div>

                  {!isBlocked && (
                    <>
                      <div className="flex items-center gap-1 mb-2">
                        {checklist.map(item => (
                          <div
                            key={item.label}
                            className="flex-1 h-1.5 rounded-full"
                            style={{ background: item.ok ? 'var(--green)' : 'var(--bone-2)' }}
                            title={item.label}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs" style={{ color: 'var(--ink-300)' }}>
                          {doneCount === 0
                            ? 'Nenhuma seção preenchida'
                            : doneCount === 4
                            ? 'Todas as seções preenchidas'
                            : `${doneCount} de 4 seções`}
                        </p>
                        {etapa.dataLiberacao && (
                          <p className="text-xs" style={{ color: 'var(--ink-300)' }}>Liberada em {fmt(etapa.dataLiberacao)}</p>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cronograma / Gantt ────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--ink-500)' }}>Cronograma</h2>
          <GanttCronograma project={project} />
        </div>

        {/* ── Team ──────────────────────────────────────────── */}
        <div className="mb-10 pt-6 border-t" style={{ borderColor: 'var(--bone)' }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-500)' }}>Equipe</h2>
          <div className="flex gap-6">
            {[
              { role: 'Arquiteta', uid: project.arquitetaId },
              { role: 'Engenheiro', uid: project.engenheiroId },
              { role: 'Gestor', uid: project.gestorId },
            ].map(({ role, uid }) => (
              <div key={role} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--terracotta-tint)', color: 'var(--terracotta)' }}
                >
                  {getUserName(uid).charAt(0)}
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--ink-300)' }}>{role}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--ink-700)' }}>{getUserName(uid)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feedbacks ─────────────────────────────────────── */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--bone)' }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--ink-500)' }}>
            Comentários {project.feedbacks?.length ? `(${project.feedbacks.length})` : ''}
          </h2>

          {/* Comment list */}
          {project.feedbacks && project.feedbacks.length > 0 ? (
            <div className="space-y-3 mb-5">
              {project.feedbacks.map(fb => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl border animate-slide-up"
                  style={{ background: 'var(--paper)', borderColor: 'var(--bone)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--terracotta-tint)', color: 'var(--terracotta)' }}
                      >
                        {fb.autor.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>{fb.autor}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--ink-300)' }}>{fmtDateTime(fb.dataHora)}</span>
                  </div>
                  <p className="text-sm ml-8" style={{ color: 'var(--ink-900)' }}>{fb.texto}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm mb-5" style={{ color: 'var(--ink-300)' }}>Nenhum comentário ainda.</p>
          )}

          {/* Add comment form */}
          <form onSubmit={handleFeedback} className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--terracotta-tint)', color: 'var(--terracotta)' }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Adicionar comentário..."
                className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: 'var(--bone)', background: 'var(--paper-2)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
                onBlur={e => (e.target.style.borderColor = 'var(--bone)')}
              />
              <button
                type="submit"
                disabled={!feedbackText.trim()}
                className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                style={{ background: 'var(--terracotta)' }}
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
