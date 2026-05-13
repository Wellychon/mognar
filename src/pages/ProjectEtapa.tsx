import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Project } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Accordion } from '../components/Accordion';
import { Modal } from '../components/Modal';
import { USERS } from '../store';
import type { ArquivoAnexo, EscopoContratado } from '../types';

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    em_andamento: { label: 'Em andamento', color: '#2563EB', bg: '#EFF6FF' },
    aguardando_liberacao: { label: 'Aguardando liberação', color: '#CA8A04', bg: '#FEFCE8' },
    liberada: { label: 'Liberada', color: '#16A34A', bg: '#F0FDF4' },
    bloqueada: { label: 'Bloqueada', color: '#6B7280', bg: '#F3F4F6' },
  };
  const c = cfg[status] || cfg.bloqueada;
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ color: c.color, background: c.bg, borderRadius: 4 }}>
      {c.label}
    </span>
  );
}

function InfoGrid({ data }: { data: Record<string, string | undefined> }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
      {Object.entries(data).map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-sm text-gray-800 mt-0.5">{value || '—'}</p>
        </div>
      ))}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isRealImage(a: ArquivoAnexo) {
  return a.tipo.startsWith('image/') && (a.base64.split(',')[1]?.length ?? 0) > 100;
}

function ArquivoItem({ a, onRemove }: { a: ArquivoAnexo; onRemove?: () => void }) {
  if (isRealImage(a)) {
    return (
      <li className="rounded-xl overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
        <img
          src={a.base64}
          alt={a.nome}
          className="w-full object-cover"
          style={{ maxHeight: 240, background: '#f3f4f6' }}
        />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-sm">
          <span className="flex-1 truncate text-gray-700">{a.nome}</span>
          <span className="text-xs text-gray-400 shrink-0">{formatBytes(a.tamanho)}</span>
          {onRemove && (
            <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2 text-sm py-1.5 px-3 bg-gray-50 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <span className="flex-1 truncate text-gray-700">{a.nome}</span>
      <span className="text-xs text-gray-400 shrink-0">{formatBytes(a.tamanho)}</span>
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </li>
  );
}

function UploadZone({
  onAdd,
  arquivos,
  onRemove,
  accept,
}: {
  onAdd: (files: ArquivoAnexo[]) => void;
  arquivos?: ArquivoAnexo[];
  onRemove?: (idx: number) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = async (fileList: FileList) => {
    const results: ArquivoAnexo[] = [];
    for (const file of Array.from(fileList)) {
      const base64 = await readAsBase64(file);
      results.push({ nome: file.name, tipo: file.type, base64, tamanho: file.size });
    }
    onAdd(results);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? '#2563EB' : '#D1D5DB',
          background: dragging ? '#EFF6FF' : undefined,
          borderRadius: 8,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={e => e.target.files && handle(e.target.files)}
        />
        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-500">Arraste aqui ou <span className="text-blue-600 font-medium">clique para selecionar</span></p>
        <p className="text-xs text-gray-400 mt-1">{accept || 'Qualquer arquivo'} · máx. 10MB por arquivo</p>
      </div>

      {arquivos && arquivos.length > 0 && (
        <ul className="mt-3 space-y-1">
          {arquivos.map((a, idx) => (
            <ArquivoItem key={idx} a={a} onRemove={onRemove ? () => onRemove(idx) : undefined} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProjectEtapa() {
  const { id, n } = useParams<{ id: string; n: string }>();
  const navigate = useNavigate();
  const { projects, currentUser, updateEtapaData, liberarEtapa, registrarAceite, showToast } = useStore();

  const project = projects.find(p => p.id === id);
  const etapaNum = parseInt(n || '1');

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Projeto não encontrado.</p>
        <button onClick={() => navigate('/projetos')} className="mt-4 text-blue-600 underline text-sm">Voltar</button>
      </div>
    );
  }

  const etapa = project.etapas.find(e => e.numero === etapaNum);
  const etapaData = project.etapasData[etapaNum] || {};
  const isAdmin = currentUser.role === 'Admin';

  return (
    <div>
      <ProgressBar etapas={project.etapas} projectId={project.id} />

      <div className="p-8">
        {/* Breadcrumb + header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/projetos/${project.id}`)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors mb-3"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Visão geral do projeto
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Etapa {etapaNum} — {etapa?.nome}
            </h1>
            {etapa && <StatusBadge status={etapa.status} />}
          </div>
          {etapa?.dataInicio && (
            <p className="text-sm text-gray-400">
              Início: {new Date(etapa.dataInicio).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <SecaoResumo project={project} />

          <SecaoEscopo
            projectId={project.id}
            etapaNum={etapaNum}
            escopo={etapaData.escopo}
            onSave={(escopo) => {
              updateEtapaData(project.id, etapaNum, { escopo });
              showToast('Escopo salvo com sucesso!');
            }}
          />

          <SecaoReuniao
            projectId={project.id}
            etapaNum={etapaNum}
            reuniao={etapaData.reuniao}
            onSave={(reuniao) => {
              updateEtapaData(project.id, etapaNum, { reuniao });
              showToast('Registro de reunião salvo!');
            }}
          />

          <SecaoLevantamento
            levantamento={etapaData.levantamento}
            onSave={(levantamento) => {
              updateEtapaData(project.id, etapaNum, { levantamento });
              showToast('Levantamento salvo!');
            }}
          />

          <SecaoAceite
            project={project}
            etapaNum={etapaNum}
            escopo={etapaData.escopo}
            aceite={etapaData.aceite}
            onAceite={(dataAceite) => {
              registrarAceite(project.id, etapaNum, dataAceite);
              showToast('Aceite do cliente registrado!');
            }}
          />

          {isAdmin && (
            <SecaoLiberacao
              project={project}
              etapaNum={etapaNum}
              etapaData={etapaData}
              etapa={etapa!}
              onLiberar={(obs) => {
                liberarEtapa(project.id, etapaNum, obs);
                showToast(`Etapa ${etapaNum} liberada com sucesso!`);
                if (etapaNum < 6) {
                  setTimeout(() => navigate(`/projetos/${project.id}/etapa/${etapaNum + 1}`), 500);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seção 1: Resumo ────────────────────────────────────────────────────────
function SecaoResumo({ project }: { project: Project }) {
  const [editOpen, setEditOpen] = useState(false);
  const getUserName = (id: string) => USERS.find(u => u.id === id)?.name || id;

  return (
    <>
      <Accordion title="1. Resumo do Projeto">
        <InfoGrid data={{
          'Nome': project.nome,
          'Tipo de Obra': project.tipoObra,
          'Data de Início': project.dataInicio ? new Date(project.dataInicio).toLocaleDateString('pt-BR') : '',
          'Prazo (dias úteis)': project.prazoUteis || '—',
          'Cliente': project.razaoSocial,
          'Contato': project.contato || '—',
          'E-mail': project.email,
          'Telefone': project.telefone || '—',
          'Endereço': project.endereco,
          'Cidade/UF': `${project.cidade}/${project.estado}`,
          'Área': project.areaM2 ? `${project.areaM2} m²` : '—',
          'Arquiteta': getUserName(project.arquitetaId),
        }} />
        <div className="mt-4">
          <button onClick={() => setEditOpen(true)} className="text-sm text-blue-600 hover:underline">
            Editar informações
          </button>
        </div>
      </Accordion>

      {editOpen && (
        <Modal title="Editar informações do projeto" onClose={() => setEditOpen(false)}>
          <p className="text-sm text-gray-500">Funcionalidade de edição em desenvolvimento.</p>
        </Modal>
      )}
    </>
  );
}

// ─── Seção 2: Escopo ────────────────────────────────────────────────────────
function SecaoEscopo({ projectId: _p, etapaNum: _e, escopo, onSave }: {
  projectId: string; etapaNum: number;
  escopo?: EscopoContratado;
  onSave: (e: EscopoContratado) => void;
}) {
  const hasData = !!(escopo?.descricao);
  const [editing, setEditing] = useState(!hasData);
  const [form, setForm] = useState<EscopoContratado>(
    escopo || { descricao: '', valor: '', formaPagamento: '', observacoes: '' }
  );

  const set = (field: keyof EscopoContratado) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  return (
    <Accordion title="2. Escopo Contratado">
      {!editing ? (
        <div className="space-y-4">
          <InfoGrid data={{
            'Descrição': escopo?.descricao,
            'Valor contratado': escopo?.valor ? `R$ ${escopo.valor}` : undefined,
            'Forma de pagamento': escopo?.formaPagamento,
            'Observações': escopo?.observacoes || '—',
          }} />
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar escopo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do serviço</label>
            <textarea value={form.descricao} onChange={set('descricao')} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor contratado (R$)</label>
              <input type="text" value={form.valor} onChange={set('valor')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
              <select value={form.formaPagamento} onChange={set('formaPagamento')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione...</option>
                <option>À vista</option>
                <option>Parcelado</option>
                <option>Por etapa</option>
                <option>Outro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={set('observacoes')} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Salvar escopo
            </button>
            {hasData && (
              <button onClick={() => { setForm(escopo!); setEditing(false); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </Accordion>
  );
}

// ─── Seção 3: Reunião ────────────────────────────────────────────────────────
function SecaoReuniao({ projectId: _p, etapaNum: _e, reuniao, onSave }: {
  projectId: string; etapaNum: number;
  reuniao?: { dataReuniao: string; participantes: string[]; transcricao: string; notas: string; arquivos?: ArquivoAnexo[] };
  onSave: (r: any) => void;
}) {
  const hasData = !!(reuniao?.dataReuniao);
  const [editing, setEditing] = useState(!hasData);
  const [form, setForm] = useState({
    dataReuniao: reuniao?.dataReuniao || '',
    transcricao: reuniao?.transcricao || '',
    notas: reuniao?.notas || '',
    arquivos: reuniao?.arquivos || [] as ArquivoAnexo[],
  });

  const handleSave = () => {
    onSave({ ...form, participantes: [] });
    setEditing(false);
  };

  const addArquivos = (novos: ArquivoAnexo[]) => {
    setForm(f => ({ ...f, arquivos: [...f.arquivos, ...novos] }));
  };

  const removeArquivo = (idx: number) => {
    setForm(f => ({ ...f, arquivos: f.arquivos.filter((_, i) => i !== idx) }));
  };

  return (
    <Accordion title="3. Registro de Reunião">
      {!editing ? (
        <div className="space-y-4">
          <InfoGrid data={{
            'Data da reunião': reuniao?.dataReuniao ? new Date(reuniao.dataReuniao + 'T12:00:00').toLocaleDateString('pt-BR') : undefined,
            'Notas': reuniao?.notas || '—',
          }} />
          {reuniao?.transcricao && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Transcrição</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{reuniao.transcricao}</p>
            </div>
          )}
          {reuniao?.arquivos && reuniao.arquivos.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Arquivos</p>
              <ul className="space-y-1">
                {reuniao.arquivos.map((a, idx) => (
                  <ArquivoItem key={idx} a={a} />
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar registro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da reunião</label>
            <input type="date" value={form.dataReuniao}
              onChange={e => setForm(f => ({ ...f, dataReuniao: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <UploadZone
            onAdd={addArquivos}
            arquivos={form.arquivos}
            onRemove={removeArquivo}
            accept="video/mp4,application/pdf,.docx,.doc"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transcrição / Anotações</label>
            <textarea value={form.transcricao}
              onChange={e => setForm(f => ({ ...f, transcricao: e.target.value }))}
              rows={4} placeholder="Cole a transcrição ou faça upload de um arquivo..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas livres</label>
            <textarea value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Salvar registro
            </button>
            {hasData && (
              <button onClick={() => { setForm({ dataReuniao: reuniao!.dataReuniao, transcricao: reuniao!.transcricao, notas: reuniao!.notas, arquivos: reuniao!.arquivos || [] }); setEditing(false); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </Accordion>
  );
}

// ─── Seção 4: Levantamento ───────────────────────────────────────────────────
function SecaoLevantamento({ levantamento, onSave }: {
  levantamento?: { dataLevantamento: string; observacoes: string; arquivos: ArquivoAnexo[] };
  onSave: (l: any) => void;
}) {
  const hasData = !!(levantamento?.dataLevantamento);
  const [editing, setEditing] = useState(!hasData);
  const [form, setForm] = useState({
    dataLevantamento: levantamento?.dataLevantamento || '',
    observacoes: levantamento?.observacoes || '',
    arquivos: levantamento?.arquivos || [] as ArquivoAnexo[],
  });

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  const addArquivos = (novos: ArquivoAnexo[]) => {
    setForm(f => ({ ...f, arquivos: [...f.arquivos, ...novos] }));
  };

  const removeArquivo = (idx: number) => {
    setForm(f => ({ ...f, arquivos: f.arquivos.filter((_, i) => i !== idx) }));
  };

  return (
    <Accordion title="4. Levantamento do Imóvel">
      {!editing ? (
        <div className="space-y-4">
          <InfoGrid data={{
            'Data do levantamento': levantamento?.dataLevantamento ? new Date(levantamento.dataLevantamento + 'T12:00:00').toLocaleDateString('pt-BR') : undefined,
            'Observações': levantamento?.observacoes || '—',
          }} />
          {levantamento?.arquivos && levantamento.arquivos.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Arquivos</p>
              <ul className="space-y-1">
                {levantamento.arquivos.map((a, idx) => (
                  <ArquivoItem key={idx} a={a} />
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar levantamento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {!hasData && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              <span>⚠</span>
              <span>Este documento ainda não foi recebido.</span>
            </div>
          )}

          <UploadZone
            onAdd={addArquivos}
            arquivos={form.arquivos}
            onRemove={removeArquivo}
            accept=".pdf,.dwg,image/*"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do levantamento</label>
            <input type="date" value={form.dataLevantamento}
              onChange={e => setForm(f => ({ ...f, dataLevantamento: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Salvar levantamento
            </button>
            {hasData && (
              <button onClick={() => { setForm({ dataLevantamento: levantamento!.dataLevantamento, observacoes: levantamento!.observacoes, arquivos: levantamento!.arquivos }); setEditing(false); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </Accordion>
  );
}

// ─── Seção 5: Aceite ─────────────────────────────────────────────────────────
function SecaoAceite({ project, etapaNum: _e, escopo, aceite, onAceite }: {
  project: any; etapaNum: number;
  escopo?: EscopoContratado;
  aceite?: any;
  onAceite: (dataAceite: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dataAceite, setDataAceite] = useState(new Date().toISOString().split('T')[0]);
  const hasEscopo = !!(escopo?.descricao);

  return (
    <>
      <Accordion title="5. Aceite do Cliente">
        {aceite ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600 font-semibold text-sm">✓ Aceite registrado</span>
              <span className="text-xs text-gray-500">
                por {aceite.registradoPor} em {new Date(aceite.dataHora).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-xs text-gray-500 font-medium uppercase mb-2">Escopo aprovado (snapshot)</p>
              <p className="text-sm text-gray-700">{aceite.escopoSnapshot.descricao}</p>
              <p className="text-sm text-gray-600 mt-1">Valor: R$ {aceite.escopoSnapshot.valor}</p>
              <p className="text-sm text-gray-600">Pagamento: {aceite.escopoSnapshot.formaPagamento}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">O aceite é operado pela equipe responsável pelo projeto.</p>
            <button
              onClick={() => hasEscopo && setModalOpen(true)}
              disabled={!hasEscopo}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                hasEscopo ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Registrar aceite do cliente
            </button>
            {!hasEscopo && (
              <p className="text-xs text-gray-400">Preencha o escopo contratado antes de registrar o aceite.</p>
            )}
          </div>
        )}
      </Accordion>

      {modalOpen && escopo && (
        <Modal
          title="Confirmar aceite do cliente"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => { onAceite(dataAceite); setModalOpen(false); }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar aceite
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Cliente</p>
              <p className="text-sm text-gray-800 mt-0.5">{project.razaoSocial}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Escopo aprovado</p>
              <p className="text-sm text-gray-800 mt-0.5">{escopo.descricao}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Valor contratado</p>
              <p className="text-sm text-gray-800 mt-0.5">R$ {escopo.valor}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase mb-1">Data do aceite</label>
              <input
                type="date"
                value={dataAceite}
                onChange={e => setDataAceite(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Seção 6: Liberar Etapa (Admin only) ─────────────────────────────────────
function SecaoLiberacao({ project: _p, etapaNum, etapaData, etapa, onLiberar }: {
  project: any; etapaNum: number; etapaData: any; etapa: any; onLiberar: (obs: string) => void;
}) {
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);

  if (etapa.status === 'liberada') {
    return (
      <Accordion title="6. Liberar Etapa">
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-600 text-sm font-semibold">✓ Etapa liberada</span>
          <span className="text-xs text-gray-500">
            por {etapa.liberadaPor} em {etapa.dataLiberacao ? new Date(etapa.dataLiberacao).toLocaleString('pt-BR') : ''}
          </span>
        </div>
        {etapa.observacaoLiberacao && (
          <p className="text-sm text-gray-600 mt-2">{etapa.observacaoLiberacao}</p>
        )}
      </Accordion>
    );
  }

  const checklist = [
    { label: 'Escopo contratado preenchido', ok: !!(etapaData.escopo?.descricao) },
    { label: 'Aceite do cliente registrado', ok: !!(etapaData.aceite) },
    { label: 'Registro de reunião salvo', ok: !!(etapaData.reuniao?.dataReuniao) },
  ];
  const allDone = checklist.every(c => c.ok);

  const handleLiberar = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    onLiberar(obs);
    setLoading(false);
  };

  return (
    <Accordion title="6. Liberar Etapa">
      <div className="space-y-4">
        <div className="space-y-2">
          {checklist.map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? <span className="text-green-600">✅</span> : <span className="text-gray-400">☐</span>}
              <span className={item.ok ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Adicione uma observação ao liberar esta etapa..." />
        </div>
        <button
          onClick={handleLiberar}
          disabled={!allDone || loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            allDone ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Liberando...
            </>
          ) : (
            `Liberar Etapa ${etapaNum < 6 ? etapaNum + 1 : ''}`
          )}
        </button>
      </div>
    </Accordion>
  );
}
