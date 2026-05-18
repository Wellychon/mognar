import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Accordion } from '../../components/Accordion';
import type { Project, ProjetoExecutivo, CategoriaEntregavel } from '../../types';
import { CATEGORIAS_ENTREGAVEL } from '../../types';
import { SecaoResumo, SecaoLiberacao, UploadZone, ArquivoItem } from './shared';
import type { ArquivoAnexo } from '../../types';

function SecaoEntregaveis({ projetoExecutivo, onUpdate }: {
  projetoExecutivo: ProjetoExecutivo;
  onUpdate: (pe: ProjetoExecutivo) => void;
}) {
  const [addingCategoria, setAddingCategoria] = useState<CategoriaEntregavel | null>(null);

  const getEntregavel = (cat: CategoriaEntregavel) =>
    projetoExecutivo.entregaveis.find(e => e.categoria === cat);

  const addArquivos = (cat: CategoriaEntregavel, arquivos: ArquivoAnexo[]) => {
    const existing = getEntregavel(cat);
    const entregaveis = existing
      ? projetoExecutivo.entregaveis.map(e => e.categoria === cat ? { ...e, arquivos: [...e.arquivos, ...arquivos] } : e)
      : [...projetoExecutivo.entregaveis, { id: `entregavel-${Date.now()}`, categoria: cat, arquivos }];
    onUpdate({ ...projetoExecutivo, entregaveis });
  };

  const removeArquivo = (cat: CategoriaEntregavel, idx: number) => {
    onUpdate({
      ...projetoExecutivo,
      entregaveis: projetoExecutivo.entregaveis.map(e =>
        e.categoria === cat ? { ...e, arquivos: e.arquivos.filter((_, i) => i !== idx) } : e
      ),
    });
  };

  return (
    <Accordion title="2. Entregáveis por Categoria">
      <div className="space-y-3">
        {CATEGORIAS_ENTREGAVEL.map(cat => {
          const entregavel = getEntregavel(cat);
          const count = entregavel?.arquivos.length ?? 0;
          return (
            <div key={cat} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-800">{cat}</h4>
                <span className="text-xs text-gray-400">{count} arquivo{count !== 1 ? 's' : ''}</span>
              </div>
              {entregavel && entregavel.arquivos.length > 0 && (
                <ul className="space-y-1">
                  {entregavel.arquivos.map((a, idx) => (
                    <ArquivoItem key={idx} a={a} onRemove={() => removeArquivo(cat, idx)} />
                  ))}
                </ul>
              )}
              {addingCategoria === cat ? (
                <div>
                  <UploadZone
                    onAdd={arquivos => { addArquivos(cat, arquivos); setAddingCategoria(null); }}
                    accept=".pdf,.dwg,image/*"
                  />
                  <button onClick={() => setAddingCategoria(null)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCategoria(cat)}
                  className="text-xs text-blue-600 hover:underline no-print"
                >
                  + Adicionar arquivo
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Accordion>
  );
}

function SecaoAprovacaoTripartite({ projetoExecutivo, onUpdate, currentUser }: {
  projetoExecutivo: ProjetoExecutivo;
  onUpdate: (pe: ProjetoExecutivo) => void;
  currentUser: any;
}) {
  const ap = projetoExecutivo.aprovacao;
  const now = new Date().toISOString();

  const partes = [
    { key: 'mognar' as const, label: 'Mognar', roles: ['Admin', 'FuerzaAdmin'] },
    { key: 'arquiteto' as const, label: 'Arquiteto', roles: ['Arquiteta'] },
    { key: 'cliente' as const, label: 'Cliente', roles: ['Admin', 'FuerzaAdmin'] },
  ];

  const aprovar = (key: 'mognar' | 'arquiteto' | 'cliente') => {
    onUpdate({
      ...projetoExecutivo,
      aprovacao: {
        ...ap,
        [key]: { aprovadoPor: currentUser.name, dataHora: now },
      },
    });
  };

  const todasAprovadas = partes.every(p => ap[p.key]);

  return (
    <Accordion title="3. Aprovação Tripartite">
      <div className="space-y-3">
        {todasAprovadas && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 text-sm font-semibold">✓ Projeto executivo aprovado por todos</span>
          </div>
        )}
        {partes.map(parte => {
          const aprovacao = ap[parte.key];
          const podeAprovar = parte.roles.includes(currentUser.role) && !aprovacao;
          return (
            <div key={parte.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800">{parte.label}</p>
                {aprovacao ? (
                  <p className="text-xs text-gray-400">
                    {aprovacao.aprovadoPor} · {new Date(aprovacao.dataHora).toLocaleString('pt-BR')}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Aguardando aprovação</p>
                )}
              </div>
              {aprovacao ? (
                <span className="text-green-600 text-sm">✓</span>
              ) : podeAprovar ? (
                <button
                  onClick={() => aprovar(parte.key)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors no-print"
                >
                  Aprovar
                </button>
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </div>
          );
        })}
      </div>
    </Accordion>
  );
}

export function Etapa4ProjetoExecutivo({ project, etapa, etapaData }: {
  project: Project;
  etapa: any;
  etapaData: any;
}) {
  const navigate = useNavigate();
  const { updateEtapaData, liberarEtapa, showToast, currentUser } = useStore();
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'FuerzaAdmin';

  const pe: ProjetoExecutivo = etapaData.projetoExecutivo || { entregaveis: [], aprovacao: {} };
  const totalArquivos = pe.entregaveis.reduce((sum, e) => sum + e.arquivos.length, 0);

  const checklist = [
    { label: 'Ao menos 1 entregável enviado', ok: totalArquivos > 0 },
    { label: 'Aprovação Mognar', ok: !!(pe.aprovacao.mognar) },
    { label: 'Aprovação Arquiteto', ok: !!(pe.aprovacao.arquiteto) },
    { label: 'Aprovação Cliente', ok: !!(pe.aprovacao.cliente) },
  ];

  const handleUpdate = (pe: ProjetoExecutivo) => {
    updateEtapaData(project.id, 4, { projetoExecutivo: pe });
  };

  return (
    <div className="space-y-4">
      <SecaoResumo project={project} />

      <SecaoEntregaveis
        projetoExecutivo={pe}
        onUpdate={p => { handleUpdate(p); showToast('Entregável atualizado!'); }}
      />

      <SecaoAprovacaoTripartite
        projetoExecutivo={pe}
        onUpdate={p => { handleUpdate(p); showToast('Aprovação registrada!'); }}
        currentUser={currentUser}
      />

      {isAdmin && (
        <SecaoLiberacao
          project={project}
          etapaNum={4}
          etapaData={etapaData}
          etapa={etapa}
          checklist={checklist}
          sectionNum={4}
          onLiberar={(obs) => {
            liberarEtapa(project.id, 4, obs);
            showToast('Etapa 4 liberada!');
            setTimeout(() => navigate(`/projetos/${project.id}/etapa/5`), 500);
          }}
        />
      )}
    </div>
  );
}
