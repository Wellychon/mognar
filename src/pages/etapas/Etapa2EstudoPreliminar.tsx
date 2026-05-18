import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Accordion } from '../../components/Accordion';
import type { Project, EstudoPreliminar, Layout, LayoutStatus } from '../../types';
import { SecaoResumo, SecaoEscopo, SecaoAceite, SecaoLiberacao, UploadZone, ArquivoItem } from './shared';
import type { ArquivoAnexo } from '../../types';

const STATUS_LAYOUT: Record<LayoutStatus, { label: string; color: string; bg: string }> = {
  aguardando: { label: 'Aguardando revisão', color: '#CA8A04', bg: '#FEFCE8' },
  aprovado: { label: 'Aprovado', color: '#16A34A', bg: '#F0FDF4' },
  revisao_solicitada: { label: 'Revisão solicitada', color: '#DC2626', bg: '#FEF2F2' },
};

function LayoutCard({
  layout,
  isAprovado,
  onStatusChange,
  onArquivosAdd,
  onArquivoRemove,
  onAprovar,
}: {
  layout: Layout;
  isAprovado: boolean;
  onStatusChange: (id: string, status: LayoutStatus, comentario: string) => void;
  onArquivosAdd: (id: string, arquivos: ArquivoAnexo[]) => void;
  onArquivoRemove: (id: string, idx: number) => void;
  onAprovar: (id: string) => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [comentario, setComentario] = useState(layout.comentario || '');
  const cfg = STATUS_LAYOUT[layout.status];

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${isAprovado ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">{layout.label}</h4>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
      </div>

      {layout.arquivos.length > 0 ? (
        <ul className="space-y-1">
          {layout.arquivos.map((a, idx) => (
            <ArquivoItem key={idx} a={a} onRemove={() => onArquivoRemove(layout.id, idx)} />
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400 italic">Nenhum arquivo enviado.</p>
      )}

      <UploadZone
        onAdd={arquivos => onArquivosAdd(layout.id, arquivos)}
        accept=".pdf,image/*,.dwg"
      />

      {layout.comentario && (
        <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <p className="text-xs text-red-600 font-medium uppercase mb-0.5">Revisão solicitada</p>
          <p className="text-sm text-red-700">{layout.comentario}</p>
        </div>
      )}

      {layout.status !== 'aprovado' && (
        <div className="flex gap-2 flex-wrap no-print">
          <button
            onClick={() => onAprovar(layout.id)}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Aprovar este layout
          </button>
          <button
            onClick={() => setShowFeedback(v => !v)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Solicitar revisão
          </button>
        </div>
      )}

      {showFeedback && (
        <div className="space-y-2">
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={2}
            placeholder="Descreva o que precisa ser revisado..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onStatusChange(layout.id, 'revisao_solicitada', comentario); setShowFeedback(false); }}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirmar revisão
            </button>
            <button onClick={() => setShowFeedback(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SecaoLayouts({
  estudoPreliminar,
  maxRevisoes,
  onUpdate,
}: {
  estudoPreliminar?: EstudoPreliminar;
  maxRevisoes: number;
  onUpdate: (ep: EstudoPreliminar) => void;
}) {
  const ep = estudoPreliminar || { layouts: [], revisoesUsadas: 0 };

  const addLayout = () => {
    const idx = ep.layouts.length + 1;
    const labels = ['A', 'B', 'C', 'D', 'E'];
    const novo: Layout = {
      id: `layout-${Date.now()}`,
      label: `Layout ${labels[idx - 1] || idx}`,
      arquivos: [],
      status: 'aguardando',
      comentario: '',
    };
    onUpdate({ ...ep, layouts: [...ep.layouts, novo] });
  };

  const updateStatus = (id: string, status: LayoutStatus, comentario: string) => {
    const revisoesUsadas = status === 'revisao_solicitada' ? ep.revisoesUsadas + 1 : ep.revisoesUsadas;
    onUpdate({
      ...ep,
      revisoesUsadas,
      layouts: ep.layouts.map(l => l.id === id ? { ...l, status, comentario } : l),
    });
  };

  const addArquivos = (id: string, arquivos: ArquivoAnexo[]) => {
    onUpdate({
      ...ep,
      layouts: ep.layouts.map(l => l.id === id ? { ...l, arquivos: [...l.arquivos, ...arquivos] } : l),
    });
  };

  const removeArquivo = (id: string, idx: number) => {
    onUpdate({
      ...ep,
      layouts: ep.layouts.map(l => l.id === id ? { ...l, arquivos: l.arquivos.filter((_, i) => i !== idx) } : l),
    });
  };

  const aprovar = (id: string) => {
    onUpdate({
      ...ep,
      layoutAprovadoId: id,
      layouts: ep.layouts.map(l => ({ ...l, status: l.id === id ? 'aprovado' : l.status })),
    });
  };

  const revisoesRestantes = maxRevisoes - ep.revisoesUsadas;

  return (
    <Accordion title="2. Layouts">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Revisões utilizadas: <strong>{ep.revisoesUsadas}</strong> / {maxRevisoes}
            </span>
            {revisoesRestantes <= 0 && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Limite de revisões atingido</span>
            )}
          </div>
          {ep.layouts.length < maxRevisoes && !ep.layoutAprovadoId && (
            <button
              onClick={addLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors no-print"
            >
              + Adicionar layout
            </button>
          )}
        </div>

        {ep.layouts.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Nenhum layout adicionado ainda.</p>
        ) : (
          <div className="space-y-3">
            {ep.layouts.map(layout => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                isAprovado={ep.layoutAprovadoId === layout.id}
                onStatusChange={updateStatus}
                onArquivosAdd={addArquivos}
                onArquivoRemove={removeArquivo}
                onAprovar={aprovar}
              />
            ))}
          </div>
        )}

        {ep.layoutAprovadoId && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 text-sm font-semibold">✓ Layout aprovado</span>
            <span className="text-xs text-gray-500">
              {ep.layouts.find(l => l.id === ep.layoutAprovadoId)?.label}
            </span>
          </div>
        )}
      </div>
    </Accordion>
  );
}

export function Etapa2EstudoPreliminar({ project, etapa, etapaData }: {
  project: Project;
  etapa: any;
  etapaData: any;
}) {
  const navigate = useNavigate();
  const { updateEtapaData, liberarEtapa, registrarAceite, showToast, currentUser } = useStore();
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'FuerzaAdmin';
  const maxRevisoes = project.maxRevisoesLayouts ?? 3;
  const ep: EstudoPreliminar = etapaData.estudoPreliminar || { layouts: [], revisoesUsadas: 0 };

  const checklist = [
    { label: 'Escopo preenchido', ok: !!(etapaData.escopo?.descricao) },
    { label: 'Ao menos um layout enviado', ok: ep.layouts.length > 0 },
    { label: 'Layout aprovado pelo cliente', ok: !!(ep.layoutAprovadoId) },
    { label: 'Aceite do cliente registrado', ok: !!(etapaData.aceite) },
  ];

  return (
    <div className="space-y-4">
      <SecaoResumo project={project} />

      <SecaoEscopo
        projectId={project.id}
        etapaNum={2}
        escopo={etapaData.escopo}
        sectionTitle="2. Escopo da Etapa"
        onSave={(escopo) => {
          updateEtapaData(project.id, 2, { escopo });
          showToast('Escopo salvo!');
        }}
      />

      <SecaoLayouts
        estudoPreliminar={etapaData.estudoPreliminar}
        maxRevisoes={maxRevisoes}
        onUpdate={(ep) => {
          updateEtapaData(project.id, 2, { estudoPreliminar: ep });
        }}
      />

      <SecaoAceite
        project={project}
        etapaNum={2}
        escopo={etapaData.escopo}
        aceite={etapaData.aceite}
        sectionTitle="3. Aceite do Cliente"
        onAceite={(dataAceite) => {
          registrarAceite(project.id, 2, dataAceite);
          showToast('Aceite registrado!');
        }}
      />

      {isAdmin && (
        <SecaoLiberacao
          project={project}
          etapaNum={2}
          etapaData={etapaData}
          etapa={etapa}
          checklist={checklist}
          sectionNum={4}
          onLiberar={(obs) => {
            liberarEtapa(project.id, 2, obs);
            showToast('Etapa 2 liberada!');
            setTimeout(() => navigate(`/projetos/${project.id}/etapa/3`), 500);
          }}
        />
      )}
    </div>
  );
}
