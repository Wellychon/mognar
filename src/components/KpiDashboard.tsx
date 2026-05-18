import type { Project } from '../types';

interface KpiDashboardProps {
  projects: Project[];
  title?: string;
}

function fmtBRL(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function fmtPct(val: number) {
  return `${val.toFixed(1)}%`;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  tag?: string;
}

function KpiCard({ label, value, sub, color, bg, icon, tag }: KpiCardProps) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}22`,
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      {tag && (
        <span style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: 9,
          fontWeight: 700,
          background: '#F3F4F6',
          color: '#9CA3AF',
          borderRadius: 4,
          padding: '2px 6px',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          {tag}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5, paddingRight: tag ? 60 : 0 }}>
          {label}
        </p>
        <span style={{ color, flexShrink: 0 }}>{icon}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color, margin: '0 0 3px', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export function KpiDashboard({ projects, title = 'KPIs do Investidor' }: KpiDashboardProps) {
  // 1. Projetos ativos
  const projetosAtivos = projects.filter(p => !p.finalizado).length;

  // 2. Ticket médio (média dos totalAprovado dos projetos com orçamento aprovado)
  const aprovados = projects
    .map(p => p.etapasData[5]?.orcamentacao?.aprovacao?.totalAprovado)
    .filter((v): v is number => v != null && v > 0);
  const ticketMedio = aprovados.length > 0
    ? aprovados.reduce((a, b) => a + b, 0) / aprovados.length
    : null;

  // 3. Margem bruta — sem dados no modelo
  // 4. Margem por etapa — sem dados no modelo

  // 5. Compras originadas (volume R$ total de compras)
  const totalCompras = projects.reduce((acc, p) => {
    const compras = p.etapasData[6]?.gestaoObra?.compras ?? [];
    return acc + compras.reduce((s, c) => s + c.valor, 0);
  }, 0);

  // 6. Take rate potencial — sem dados no modelo (% sobre GMV)

  // 7. Atraso médio vs. planejado
  const tarefasAtrasadas = projects.reduce((acc, p) => {
    const tarefas = p.etapasData[6]?.gestaoObra?.tarefasGantt ?? [];
    return acc + tarefas.filter(t => t.status === 'atrasada').length;
  }, 0);
  const totalTarefas = projects.reduce((acc, p) => {
    return acc + (p.etapasData[6]?.gestaoObra?.tarefasGantt?.length ?? 0);
  }, 0);

  // 8. NPS — sem dados no modelo

  // 9. Prazo de orçamento (dias entre dataInicio e aprovação do orçamento)
  const prazosOrcamento = projects
    .map(p => {
      const dataApr = p.etapasData[5]?.orcamentacao?.aprovacao?.dataHora;
      if (!dataApr || !p.dataInicio) return null;
      const diff = (new Date(dataApr).getTime() - new Date(p.dataInicio).getTime()) / 86400000;
      return Math.round(diff);
    })
    .filter((v): v is number => v != null && v > 0);
  const prazoMedioOrcamento = prazosOrcamento.length > 0
    ? Math.round(prazosOrcamento.reduce((a, b) => a + b, 0) / prazosOrcamento.length)
    : null;

  // 10. Conversão projeto → execução (etapa >= 6)
  const emExecucao = projects.filter(p => p.etapaAtual >= 6).length;
  const conversaoExecucao = projects.length > 0 ? (emExecucao / projects.length) * 100 : 0;

  // 11. GMV materiais
  const gmvMateriais = projects.reduce((acc, p) => {
    const orc = p.etapasData[5]?.orcamentacao;
    if (!orc?.aprovacao) return acc;
    const faixa = orc.aprovacao.faixa;
    return acc + (orc.itensMateriais ?? []).reduce((s, item) => {
      const preco = faixa === 'premium' ? item.valorPremium : item.valorStandard;
      return s + item.quantidade * preco;
    }, 0);
  }, 0);

  // 12. GMV mão de obra
  const gmvMaoDeObra = projects.reduce((acc, p) => {
    const orc = p.etapasData[5]?.orcamentacao;
    if (!orc?.aprovacao) return acc;
    const faixa = orc.aprovacao.faixa;
    return acc + (orc.itensMaoDeObra ?? []).reduce((s, item) => {
      const preco = faixa === 'premium' ? item.valorPremium : item.valorStandard;
      return s + item.quantidade * preco;
    }, 0);
  }, 0);

  // 13. % compras via rede MOGNAR
  const allCompras = projects.flatMap(p => p.etapasData[6]?.gestaoObra?.compras ?? []);
  const comprasMognar = allCompras.filter(c => c.pagoPor === 'mognar').length;
  const pctMognar = allCompras.length > 0 ? (comprasMognar / allCompras.length) * 100 : null;

  // 14. Fornecedores homologados
  const fornecedores = new Set(allCompras.map(c => c.fornecedor)).size;

  // 15. Recompra/manutenção/pós-obra — sem dados no modelo

  const kpisAtivos: KpiCardProps[] = [
    {
      label: 'Projetos ativos',
      value: projetosAtivos,
      sub: `${projects.filter(p => p.finalizado).length} finalizado(s)`,
      color: '#2563EB',
      bg: '#EFF6FF',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      label: 'Ticket médio',
      value: ticketMedio != null ? fmtBRL(ticketMedio) : '—',
      sub: ticketMedio != null ? `${aprovados.length} projeto(s) aprovado(s)` : 'sem orçamentos aprovados',
      color: '#7C3AED',
      bg: '#F5F3FF',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    },
    {
      label: 'Compras originadas',
      value: totalCompras > 0 ? fmtBRL(totalCompras) : '—',
      sub: totalCompras > 0 ? `${allCompras.length} ordem(s) registrada(s)` : 'sem compras registradas',
      color: '#0891B2',
      bg: '#ECFEFF',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    },
    {
      label: 'Tarefas atrasadas',
      value: totalTarefas > 0 ? tarefasAtrasadas : '—',
      sub: totalTarefas > 0 ? `de ${totalTarefas} tarefa(s) no total` : 'sem cronograma registrado',
      color: tarefasAtrasadas > 0 ? '#DC2626' : '#16A34A',
      bg: tarefasAtrasadas > 0 ? '#FEF2F2' : '#F0FDF4',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      label: 'Prazo médio orçamento',
      value: prazoMedioOrcamento != null ? `${prazoMedioOrcamento}d` : '—',
      sub: prazoMedioOrcamento != null ? 'da entrada à aprovação' : 'sem aprovações registradas',
      color: '#D97706',
      bg: '#FFFBEB',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: 'Conversão → execução',
      value: projects.length > 0 ? fmtPct(conversaoExecucao) : '—',
      sub: `${emExecucao} de ${projects.length} projeto(s)`,
      color: '#16A34A',
      bg: '#F0FDF4',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    },
    {
      label: 'GMV materiais',
      value: gmvMateriais > 0 ? fmtBRL(gmvMateriais) : '—',
      sub: gmvMateriais > 0 ? 'itens de material orçados' : 'sem orçamentos aprovados',
      color: '#7C3AED',
      bg: '#F5F3FF',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    },
    {
      label: 'GMV mão de obra',
      value: gmvMaoDeObra > 0 ? fmtBRL(gmvMaoDeObra) : '—',
      sub: gmvMaoDeObra > 0 ? 'itens de mão de obra orçados' : 'sem orçamentos aprovados',
      color: '#0891B2',
      bg: '#ECFEFF',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    },
    {
      label: '% compras via MOGNAR',
      value: pctMognar != null ? fmtPct(pctMognar) : '—',
      sub: pctMognar != null ? `${comprasMognar} de ${allCompras.length} compra(s)` : 'sem compras registradas',
      color: '#ac440e',
      bg: 'var(--terracotta-tint)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    },
    {
      label: 'Fornecedores homologados',
      value: fornecedores > 0 ? fornecedores : '—',
      sub: fornecedores > 0 ? 'fornecedores únicos' : 'sem compras registradas',
      color: '#2563EB',
      bg: '#EFF6FF',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ];

  const kpisProximaVersao: KpiCardProps[] = [
    {
      label: 'Margem bruta',
      value: '—',
      sub: 'na próxima versão',
      color: '#9CA3AF',
      bg: '#F9FAFB',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    },
    {
      label: 'Margem por etapa',
      value: '—',
      sub: 'na próxima versão',
      color: '#9CA3AF',
      bg: '#F9FAFB',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    },
    {
      label: 'Take rate potencial',
      value: '—',
      sub: 'na próxima versão',
      color: '#9CA3AF',
      bg: '#F9FAFB',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    },
    {
      label: 'NPS',
      value: '—',
      sub: 'na próxima versão',
      color: '#9CA3AF',
      bg: '#F9FAFB',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
    },
    {
      label: 'Recompra / pós-obra',
      value: '—',
      sub: 'na próxima versão',
      color: '#9CA3AF',
      bg: '#F9FAFB',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
    },
  ];

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
          {title}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
        }}
      >
        {kpisAtivos.map(kpi => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--bone)' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-300)', letterSpacing: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Na próxima versão
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--bone)' }} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
        }}
      >
        {kpisProximaVersao.map(kpi => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
    </div>
  );
}
