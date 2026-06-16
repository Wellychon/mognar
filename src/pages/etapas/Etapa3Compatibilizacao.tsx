import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Accordion } from '../../components/Accordion';
import type { Project, Compatibilizacao, Pendencia, PendenciaResponsavel } from '../../types';
import { SecaoResumo, SecaoLiberacao, UploadZone, ArquivoItem, InfoGrid } from './shared';
import type { ArquivoAnexo } from '../../types';

function SecaoAnteprojeto({ project }: { project: Project }) {
  const { projects } = useStore();
  const ep = projects.find(p => p.id === project.id)?.etapasData[2]?.estudoPreliminar;
  const layoutAprovado = ep?.layouts.find(l => l.id === ep.layoutAprovadoId);

  return (
    <Accordion title="2. Anteprojeto (base)">
      {layoutAprovado ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 text-sm font-semibold">✓ {layoutAprovado.label} aprovado na Etapa 2</span>
          </div>
          {layoutAprovado.arquivos.length > 0 && (
            <ul className="space-y-1">
              {layoutAprovado.arquivos.map((a, idx) => <ArquivoItem key={idx} a={a} />)}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Nenhum layout aprovado na Etapa 2. Conclua o Estudo Preliminar primeiro.</p>
      )}
    </Accordion>
  );
}

function SecaoVisitaTecnica({ compatibilizacao, onUpdate }: {
  compatibilizacao: Compatibilizacao;
  onUpdate: (c: Compatibilizacao) => void;
}) {
  const { currentUser } = useStore();
  const isCliente = currentUser?.role === 'Cliente';
  const vt = compatibilizacao.visitaTecnica;
  const hasData = !!(vt?.data);
  const [editing, setEditing] = useState(!hasData && !isCliente);
  const [form, setForm] = useState({ data: vt?.data || '', notas: vt?.notas || '', fotos: vt?.fotos || [] as ArquivoAnexo[] });

  const handleSave = () => {
    onUpdate({ ...compatibilizacao, visitaTecnica: form });
    setEditing(false);
  };

  return (
    <Accordion title="3. Visita Técnica">
      {!editing ? (
        <div className="space-y-3">
          <InfoGrid data={{
            'Data': vt?.data ? new Date(vt.data + 'T12:00:00').toLocaleDateString('pt-BR') : undefined,
            'Notas': vt?.notas || '—',
          }} />
          {vt?.fotos && vt.fotos.length > 0 && (
            <ul className="space-y-1">
              {vt.fotos.map((a, idx) => <ArquivoItem key={idx} a={a} />)}
            </ul>
          )}
          {!isCliente && <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">Editar</button>}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da visita</label>
            <input type="date" value={form.data}
              onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <UploadZone
            onAdd={novos => setForm(f => ({ ...f, fotos: [...f.fotos, ...novos] }))}
            arquivos={form.fotos}
            onRemove={idx => setForm(f => ({ ...f, fotos: f.fotos.filter((_, i) => i !== idx) }))}
            accept="image/*,application/pdf"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Salvar
            </button>
            {hasData && (
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
            )}
          </div>
        </div>
      )}
    </Accordion>
  );
}

function SecaoParecerTecnico({ compatibilizacao, onUpdate }: {
  compatibilizacao: Compatibilizacao;
  onUpdate: (c: Compatibilizacao) => void;
}) {
  const { currentUser } = useStore();
  const isCliente = currentUser?.role === 'Cliente';
  const pt = compatibilizacao.parecerTecnico;
  const hasData = !!(pt?.texto);
  const [editing, setEditing] = useState(!hasData && !isCliente);
  const [texto, setTexto] = useState(pt?.texto || '');
  const [arquivos, setArquivos] = useState<ArquivoAnexo[]>(pt?.arquivos || []);

  const handleSave = () => {
    onUpdate({ ...compatibilizacao, parecerTecnico: { texto, arquivos } });
    setEditing(false);
  };

  return (
    <Accordion title="4. Parecer Técnico">
      {!editing ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{pt?.texto || '—'}</p>
          {pt?.arquivos && pt.arquivos.length > 0 && (
            <ul className="space-y-1">
              {pt.arquivos.map((a, idx) => <ArquivoItem key={idx} a={a} />)}
            </ul>
          )}
          {!isCliente && <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">Editar</button>}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parecer técnico</label>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={5}
              placeholder="Descreva os resultados da compatibilização entre projetos..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <UploadZone
            onAdd={novos => setArquivos(a => [...a, ...novos])}
            arquivos={arquivos}
            onRemove={idx => setArquivos(a => a.filter((_, i) => i !== idx))}
            accept=".pdf,.dwg,image/*"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Salvar parecer
            </button>
            {hasData && (
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
            )}
          </div>
        </div>
      )}
    </Accordion>
  );
}

function SecaoPendencias({ compatibilizacao, onUpdate }: {
  compatibilizacao: Compatibilizacao;
  onUpdate: (c: Compatibilizacao) => void;
}) {
  const { currentUser } = useStore();
  const isCliente = currentUser?.role === 'Cliente';
  const [addOpen, setAddOpen] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState<PendenciaResponsavel>('arquiteto');

  const pendenciasAbertas = compatibilizacao.pendencias.filter(p => p.status === 'aberta');

  const addPendencia = () => {
    if (!descricao.trim()) return;
    const nova: Pendencia = {
      id: `pend-${Date.now()}`,
      descricao: descricao.trim(),
      responsavel,
      status: 'aberta',
      data: new Date().toISOString().split('T')[0],
    };
    onUpdate({ ...compatibilizacao, pendencias: [...compatibilizacao.pendencias, nova] });
    setDescricao('');
    setAddOpen(false);
  };

  const resolver = (id: string) => {
    onUpdate({
      ...compatibilizacao,
      pendencias: compatibilizacao.pendencias.map(p => p.id === id ? { ...p, status: 'resolvida' as const } : p),
    });
  };

  return (
    <Accordion title="5. Pendências">
      <div className="space-y-4">
        {pendenciasAbertas.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            <span>{pendenciasAbertas.length} pendência{pendenciasAbertas.length > 1 ? 's' : ''} em aberto — etapa bloqueada para liberação</span>
          </div>
        )}

        <div className="space-y-2">
          {compatibilizacao.pendencias.map(p => (
            <div key={p.id} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${p.status === 'resolvida' ? 'bg-gray-50 border-gray-200' : 'bg-white border-yellow-200'}`}>
              <span className={p.status === 'resolvida' ? 'text-green-600 mt-0.5' : 'text-yellow-500 mt-0.5'}>
                {p.status === 'resolvida' ? '✓' : '○'}
              </span>
              <div className="flex-1">
                <p className={p.status === 'resolvida' ? 'text-gray-400 line-through' : 'text-gray-800'}>{p.descricao}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.responsavel === 'arquiteto' ? 'Arquiteto' : 'Engenheiro'} · {new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
              {p.status === 'aberta' && !isCliente && (
                <button onClick={() => resolver(p.id)} className="text-xs text-green-600 hover:underline shrink-0 no-print">
                  Resolver
                </button>
              )}
            </div>
          ))}
          {compatibilizacao.pendencias.length === 0 && (
            <p className="text-sm text-gray-400 italic">Nenhuma pendência registrada.</p>
          )}
        </div>

        {addOpen ? (
          <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select value={responsavel} onChange={e => setResponsavel(e.target.value as PendenciaResponsavel)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="arquiteto">Arquiteto</option>
                <option value="engenheiro">Engenheiro</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={addPendencia} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Adicionar
              </button>
              <button onClick={() => setAddOpen(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
            </div>
          </div>
        ) : (
          !isCliente && (
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline no-print">
              + Adicionar pendência
            </button>
          )
        )}
      </div>
    </Accordion>
  );
}

export function Etapa3Compatibilizacao({ project, etapa, etapaData }: {
  project: Project;
  etapa: any;
  etapaData: any;
}) {
  const navigate = useNavigate();
  const { updateEtapaData, liberarEtapa, showToast, currentUser } = useStore();
  const canRelease = currentUser.role === 'Admin' || currentUser.role === 'FuerzaAdmin' || currentUser.role === 'Gestor';

  const comp: Compatibilizacao = etapaData.compatibilizacao || { pendencias: [] };
  const pendenciasAbertas = comp.pendencias.filter(p => p.status === 'aberta').length;

  const checklist = [
    { label: 'Visita técnica registrada', ok: !!(comp.visitaTecnica?.data) },
    { label: 'Parecer técnico emitido', ok: !!(comp.parecerTecnico?.texto) },
    { label: 'Sem pendências em aberto', ok: pendenciasAbertas === 0 },
  ];

  const handleUpdate = (c: Compatibilizacao) => {
    updateEtapaData(project.id, 3, { compatibilizacao: c });
  };

  return (
    <div className="space-y-4">
      <SecaoResumo project={project} />

      <SecaoAnteprojeto project={project} />

      <SecaoVisitaTecnica
        compatibilizacao={comp}
        onUpdate={c => { handleUpdate(c); showToast('Visita salva!'); }}
      />

      <SecaoParecerTecnico
        compatibilizacao={comp}
        onUpdate={c => { handleUpdate(c); showToast('Parecer salvo!'); }}
      />

      <SecaoPendencias
        compatibilizacao={comp}
        onUpdate={handleUpdate}
      />

      {canRelease && (
        <SecaoLiberacao
          project={project}
          etapaNum={3}
          etapaData={etapaData}
          etapa={etapa}
          checklist={checklist}
          sectionNum={6}
          onLiberar={(obs) => {
            liberarEtapa(project.id, 3, obs);
            showToast('Etapa 3 liberada!');
            setTimeout(() => navigate(`/projetos/${project.id}/etapa/4`), 500);
          }}
        />
      )}
    </div>
  );
}
