import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, ArquivoAnexo, CompraCategoria, CompraImpactoCronograma } from '../../types';
import { useStore } from '../../store';
import {
  SecaoResumo,
  SecaoEscopo,
  SecaoAceite,
  SecaoLiberacao,
  UploadZone,
  ArquivoItem,
} from './shared';

interface Props {
  project: Project;
  etapa: any;
  etapaData: any;
}

function formatMoeda(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function SecaoCronogramaGantt({ project }: { project: Project }) {
  const { adicionarTarefaGantt, atualizarTarefaGantt, currentUser } = useStore();
  const gestaoObra = project.etapasData[6]?.gestaoObra;
  const tarefas = gestaoObra?.tarefasGantt ?? [];
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'FuerzaAdmin' || currentUser?.role === 'Engenheiro' || currentUser?.role === 'Gestor';

  const [nova, setNova] = useState({ tarefa: '', responsavel: '', dataInicio: '', dataFim: '', percentual: 0, status: 'nao_iniciada' as const, observacao: '' });
  const [adding, setAdding] = useState(false);

  const statusColor: Record<string, string> = {
    nao_iniciada: 'bg-gray-100 text-gray-600',
    em_andamento: 'bg-blue-100 text-blue-700',
    concluida: 'bg-green-100 text-green-700',
    atrasada: 'bg-red-100 text-red-700',
  };

  function salvar() {
    if (!nova.tarefa || !nova.dataInicio || !nova.dataFim) return;
    adicionarTarefaGantt(project.id, nova);
    setNova({ tarefa: '', responsavel: '', dataInicio: '', dataFim: '', percentual: 0, status: 'nao_iniciada', observacao: '' });
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">2. Cronograma de Obra</h2>
        {canEdit && !adding && (
          <button onClick={() => setAdding(true)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Tarefa</button>
        )}
      </div>

      {adding && (
        <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
          <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Descrição da tarefa" value={nova.tarefa} onChange={e => setNova(p => ({ ...p, tarefa: e.target.value }))} />
          <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Responsável" value={nova.responsavel} onChange={e => setNova(p => ({ ...p, responsavel: e.target.value }))} />
          <div className="flex gap-2">
            <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.dataInicio} onChange={e => setNova(p => ({ ...p, dataInicio: e.target.value }))} />
            <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.dataFim} onChange={e => setNova(p => ({ ...p, dataFim: e.target.value }))} />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">% Conclusão:</label>
            <input type="number" min={0} max={100} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" value={nova.percentual} onChange={e => setNova(p => ({ ...p, percentual: Number(e.target.value) }))} />
            <select className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" value={nova.status} onChange={e => setNova(p => ({ ...p, status: e.target.value as any }))}>
              <option value="nao_iniciada">Não iniciada</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="atrasada">Atrasada</option>
            </select>
          </div>
          <textarea className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} placeholder="Observação (opcional)" value={nova.observacao} onChange={e => setNova(p => ({ ...p, observacao: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={salvar} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">Adicionar</button>
            <button onClick={() => setAdding(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}

      {tarefas.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma tarefa cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Tarefa</th>
                <th className="pb-2 pr-4">Responsável</th>
                <th className="pb-2 pr-4">Início</th>
                <th className="pb-2 pr-4">Fim</th>
                <th className="pb-2 pr-4">Progresso</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Observação</th>
                {canEdit && <th className="pb-2">Atualizar</th>}
              </tr>
            </thead>
            <tbody>
              {tarefas.map(t => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{t.tarefa}</td>
                  <td className="py-2 pr-4 text-gray-600">{t.responsavel}</td>
                  <td className="py-2 pr-4 text-gray-600">{t.dataInicio}</td>
                  <td className="py-2 pr-4 text-gray-600">{t.dataFim}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${t.percentual}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{t.percentual}%</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>
                      {t.status === 'nao_iniciada' ? 'Não iniciada' : t.status === 'em_andamento' ? 'Em andamento' : t.status === 'concluida' ? 'Concluída' : 'Atrasada'}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-500 max-w-[160px]">{t.observacao || '—'}</td>
                  {canEdit && (
                    <td className="py-2">
                      <select className="text-xs border border-gray-200 rounded px-1 py-0.5" value={t.status} onChange={e => atualizarTarefaGantt(project.id, t.id, { status: e.target.value as any })}>
                        <option value="nao_iniciada">Não iniciada</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="atrasada">Atrasada</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SecaoChecklistDiario({ project }: { project: Project }) {
  const { adicionarChecklist, toggleItemChecklist, currentUser } = useStore();
  const gestaoObra = project.etapasData[6]?.gestaoObra;
  const checklists = gestaoObra?.checklists ?? [];
  const isCliente = currentUser?.role === 'Cliente';

  const [novaData, setNovaData] = useState('');
  const [novaResp, setNovaResp] = useState(currentUser?.name ?? '');
  const [novaObs, setNovaObs] = useState('');
  const [novaItens, setNovaItens] = useState(['']);
  const [adding, setAdding] = useState(false);

  function salvar() {
    if (!novaData || novaItens.filter(Boolean).length === 0) return;
    adicionarChecklist(project.id, {
      data: novaData,
      responsavel: novaResp,
      itens: novaItens.filter(Boolean).map(t => ({ id: crypto.randomUUID(), texto: t, concluido: false })),
      observacoes: novaObs,
    });
    setNovaData(''); setNovaObs(''); setNovaItens(['']);
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">3. Checklist Diário</h2>
        {!adding && !isCliente && (
          <button onClick={() => setAdding(true)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Novo Checklist</button>
        )}
      </div>

      {adding && (
        <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
          <div className="flex gap-2">
            <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={novaData} onChange={e => setNovaData(e.target.value)} />
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Responsável" value={novaResp} onChange={e => setNovaResp(e.target.value)} />
          </div>
          <div className="space-y-1">
            {novaItens.map((item, i) => (
              <input key={i} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder={`Item ${i + 1}`} value={item} onChange={e => setNovaItens(p => p.map((v, j) => j === i ? e.target.value : v))} />
            ))}
            <button onClick={() => setNovaItens(p => [...p, ''])} className="text-xs text-blue-600 hover:underline">+ Adicionar item</button>
          </div>
          <textarea className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} placeholder="Observações" value={novaObs} onChange={e => setNovaObs(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={salvar} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">Salvar</button>
            <button onClick={() => setAdding(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}

      {checklists.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum checklist registrado.</p>
      ) : (
        <div className="space-y-3">
          {[...checklists].reverse().map(cl => {
            const total = cl.itens.length;
            const concluidos = cl.itens.filter(i => i.concluido).length;
            return (
              <div key={cl.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-800 text-sm">{cl.data}</span>
                    <span className="text-gray-400 text-xs ml-2">— {cl.responsavel}</span>
                  </div>
                  <span className="text-xs text-gray-500">{concluidos}/{total} itens</span>
                </div>
                <div className="space-y-1">
                  {cl.itens.map(item => (
                    <label key={item.id} className={`flex items-center gap-2 text-sm ${isCliente ? '' : 'cursor-pointer'}`}>
                      <input type="checkbox" checked={item.concluido} disabled={isCliente} onChange={() => toggleItemChecklist(project.id, cl.id, item.id)} className="rounded" />
                      <span className={item.concluido ? 'line-through text-gray-400' : 'text-gray-700'}>{item.texto}</span>
                    </label>
                  ))}
                </div>
                {cl.observacoes && <p className="mt-2 text-xs text-gray-500">{cl.observacoes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SecaoCompras({ project }: { project: Project }) {
  const { adicionarCompra, atualizarStatusCompra, currentUser } = useStore();
  const gestaoObra = project.etapasData[6]?.gestaoObra;
  const compras = gestaoObra?.compras ?? [];
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'FuerzaAdmin' || currentUser?.role === 'Gestor';
  const isCliente = currentUser?.role === 'Cliente';

  const [nova, setNova] = useState({
    data: '',
    fornecedor: '',
    descricao: '',
    valor: '',
    pagoPor: 'cliente' as 'cliente' | 'mognar',
    link: '',
    categoria: '' as CompraCategoria | '',
    quantidade: '',
    unidade: '',
    valorUnitario: '',
    atividadeVinculadaId: '',
    prazoPrometido: '',
    impactoNoCronograma: '' as CompraImpactoCronograma | '',
  });
  const [adding, setAdding] = useState(false);

  const tarefas = project.etapasData[6]?.gestaoObra?.tarefasGantt ?? [];

  function salvar() {
    if (!nova.fornecedor || !nova.descricao || !nova.valor) return;
    adicionarCompra(project.id, {
      data: nova.data,
      fornecedor: nova.fornecedor,
      descricao: nova.descricao,
      valor: Number(nova.valor.replace(',', '.')),
      pagoPor: nova.pagoPor,
      status: 'pendente',
      link: nova.link || undefined,
      categoria: nova.categoria || undefined,
      quantidade: nova.quantidade ? Number(nova.quantidade) : undefined,
      unidade: nova.unidade || undefined,
      valorUnitario: nova.valorUnitario ? Number(nova.valorUnitario.replace(',', '.')) : undefined,
      atividadeVinculadaId: nova.atividadeVinculadaId || undefined,
      prazoPrometido: nova.prazoPrometido || undefined,
      impactoNoCronograma: (nova.impactoNoCronograma || undefined) as CompraImpactoCronograma | undefined,
    });
    setNova({ data: '', fornecedor: '', descricao: '', valor: '', pagoPor: 'cliente', link: '', categoria: '', quantidade: '', unidade: '', valorUnitario: '', atividadeVinculadaId: '', prazoPrometido: '', impactoNoCronograma: '' });
    setAdding(false);
  }

  const total = compras.reduce((s, c) => s + c.valor, 0);
  const pago = compras.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">4. Registro de Compras</h2>
        {!adding && !isCliente && (
          <button onClick={() => setAdding(true)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Compra</button>
        )}
      </div>

      {compras.length > 0 && (
        <div className="flex gap-4 mb-4">
          <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-800">{formatMoeda(total)}</span></div>
          <div className="text-sm text-gray-600">Pago: <span className="font-semibold text-green-700">{formatMoeda(pago)}</span></div>
          <div className="text-sm text-gray-600">Pendente: <span className="font-semibold text-amber-700">{formatMoeda(total - pago)}</span></div>
        </div>
      )}

      {adding && (
        <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
          <div className="flex gap-2">
            <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.data} onChange={e => setNova(p => ({ ...p, data: e.target.value }))} />
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Fornecedor" value={nova.fornecedor} onChange={e => setNova(p => ({ ...p, fornecedor: e.target.value }))} />
            <select className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.categoria} onChange={e => setNova(p => ({ ...p, categoria: e.target.value as CompraCategoria | '' }))}>
              <option value="">Categoria</option>
              <option value="material">Material</option>
              <option value="mao_de_obra">Mão de obra</option>
              <option value="acabamento">Acabamento</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Descrição do item" value={nova.descricao} onChange={e => setNova(p => ({ ...p, descricao: e.target.value }))} />
          <div className="flex gap-2">
            <input className="w-24 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Qtd" type="number" min={0} value={nova.quantidade} onChange={e => setNova(p => ({ ...p, quantidade: e.target.value }))} />
            <input className="w-24 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Un (m², un…)" value={nova.unidade} onChange={e => setNova(p => ({ ...p, unidade: e.target.value }))} />
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Valor unitário (R$)" value={nova.valorUnitario} onChange={e => setNova(p => ({ ...p, valorUnitario: e.target.value }))} />
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Valor total (R$)" value={nova.valor} onChange={e => setNova(p => ({ ...p, valor: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Link do produto (opcional)" value={nova.link} onChange={e => setNova(p => ({ ...p, link: e.target.value }))} />
            <select className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.pagoPor} onChange={e => setNova(p => ({ ...p, pagoPor: e.target.value as 'cliente' | 'mognar' }))}>
              <option value="cliente">Pago por: Cliente</option>
              <option value="mognar">Pago por: Mognar</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" title="Prazo prometido pelo fornecedor" value={nova.prazoPrometido} onChange={e => setNova(p => ({ ...p, prazoPrometido: e.target.value }))} placeholder="Prazo prometido" />
            {tarefas.length > 0 && (
              <select className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.atividadeVinculadaId} onChange={e => setNova(p => ({ ...p, atividadeVinculadaId: e.target.value }))}>
                <option value="">Atividade vinculada (opcional)</option>
                {tarefas.map(t => <option key={t.id} value={t.id}>{t.tarefa}</option>)}
              </select>
            )}
            <select className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={nova.impactoNoCronograma} onChange={e => setNova(p => ({ ...p, impactoNoCronograma: e.target.value as CompraImpactoCronograma | '' }))}>
              <option value="">Impacto no cronograma</option>
              <option value="sem_impacto">Sem impacto</option>
              <option value="atraso_previsto">Atraso previsto</option>
              <option value="atraso_confirmado">Atraso confirmado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={salvar} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">Registrar</button>
            <button onClick={() => setAdding(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}

      {compras.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma compra registrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Data</th>
                <th className="pb-2 pr-4">Fornecedor</th>
                <th className="pb-2 pr-4">Descrição</th>
                <th className="pb-2 pr-4">Categoria</th>
                <th className="pb-2 pr-4">Qtd</th>
                <th className="pb-2 pr-4">Valor</th>
                <th className="pb-2 pr-4">Pago por</th>
                <th className="pb-2 pr-4">Impacto</th>
                <th className="pb-2 pr-4">Link</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {compras.map(c => {
                const impactoColor: Record<string, string> = {
                  sem_impacto: 'bg-green-100 text-green-700',
                  atraso_previsto: 'bg-amber-100 text-amber-700',
                  atraso_confirmado: 'bg-red-100 text-red-700',
                };
                const impactoLabel: Record<string, string> = {
                  sem_impacto: 'Sem impacto',
                  atraso_previsto: 'Atraso previsto',
                  atraso_confirmado: 'Atraso confirmado',
                };
                const catLabel: Record<string, string> = {
                  material: 'Material',
                  mao_de_obra: 'Mão de obra',
                  acabamento: 'Acabamento',
                  outro: 'Outro',
                };
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{c.data}</td>
                    <td className="py-2 pr-4 text-gray-700">{c.fornecedor}</td>
                    <td className="py-2 pr-4 text-gray-700">{c.descricao}</td>
                    <td className="py-2 pr-4 text-gray-500 text-xs">{c.categoria ? catLabel[c.categoria] : '—'}</td>
                    <td className="py-2 pr-4 text-gray-600 text-xs">{c.quantidade != null ? `${c.quantidade}${c.unidade ? ' ' + c.unidade : ''}` : '—'}</td>
                    <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">{formatMoeda(c.valor)}</td>
                    <td className="py-2 pr-4 text-gray-600 capitalize">{c.pagoPor}</td>
                    <td className="py-2 pr-4">
                      {c.impactoNoCronograma ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${impactoColor[c.impactoNoCronograma]}`}>
                          {impactoLabel[c.impactoNoCronograma]}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="py-2 pr-4">
                      {c.link ? <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver</a> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="py-2">
                      {canEdit && c.status === 'pendente' ? (
                        <button onClick={() => atualizarStatusCompra(project.id, c.id, 'pago')} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200">Marcar pago</button>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SecaoRelatorios({ project }: { project: Project }) {
  const { adicionarRelatorio, currentUser } = useStore();
  const gestaoObra = project.etapasData[6]?.gestaoObra;
  const relatorios = gestaoObra?.relatorios ?? [];
  const isCliente = currentUser?.role === 'Cliente';

  const [semana, setSemana] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [percentual, setPercentual] = useState('');
  const [resumo, setResumo] = useState('');
  const [alertas, setAlertas] = useState('');
  const [fotos, setFotos] = useState<ArquivoAnexo[]>([]);
  const [adding, setAdding] = useState(false);

  function salvar() {
    if (!semana || !periodo) return;
    adicionarRelatorio(project.id, {
      semana: Number(semana),
      periodo,
      percentualAvanco: Number(percentual),
      resumo,
      alertas,
      fotos,
    });
    setSemana(''); setPeriodo(''); setPercentual(''); setResumo(''); setAlertas(''); setFotos([]);
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">5. Relatório Semanal</h2>
        {!adding && !isCliente && (
          <button onClick={() => setAdding(true)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Relatório</button>
        )}
      </div>

      {adding && (
        <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
          <div className="flex gap-2">
            <input className="w-24 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Semana nº" type="number" value={semana} onChange={e => setSemana(e.target.value)} />
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Período (ex: 12/05 – 18/05)" value={periodo} onChange={e => setPeriodo(e.target.value)} />
            <input className="w-28 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="% Avanço" type="number" min={0} max={100} value={percentual} onChange={e => setPercentual(e.target.value)} />
          </div>
          <textarea className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={3} placeholder="Resumo do período" value={resumo} onChange={e => setResumo(e.target.value)} />
          <textarea className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} placeholder="Alertas e pendências" value={alertas} onChange={e => setAlertas(e.target.value)} />
          <UploadZone
            onAdd={(files) => setFotos(p => [...p, ...files])}
            arquivos={fotos}
            onRemove={(idx) => setFotos(p => p.filter((_, i) => i !== idx))}
            accept="image/*"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={salvar} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">Salvar</button>
            <button onClick={() => setAdding(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}

      {relatorios.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum relatório registrado.</p>
      ) : (
        <div className="space-y-3">
          {[...relatorios].reverse().map(r => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 text-sm">Semana {r.semana} — {r.periodo}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${r.percentualAvanco}%` }} />
                  </div>
                  <span className="text-xs text-gray-600">{r.percentualAvanco}%</span>
                </div>
              </div>
              {r.resumo && <p className="text-sm text-gray-700 mb-1">{r.resumo}</p>}
              {r.alertas && <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs">{r.alertas}</p>}
              {r.fotos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.fotos.map((f, i) => (
                    f.tipo.startsWith('image/') ? (
                      <img key={i} src={f.base64} alt={f.nome} className="w-16 h-16 object-cover rounded border" />
                    ) : (
                      <ArquivoItem key={i} a={f} />
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecaoFotosObra({ project }: { project: Project }) {
  const { adicionarFotosObra, currentUser } = useStore();
  const gestaoObra = project.etapasData[6]?.gestaoObra;
  const fotosGrupos = gestaoObra?.fotosObra ?? [];
  const isCliente = currentUser?.role === 'Cliente';

  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivos, setArquivos] = useState<ArquivoAnexo[]>([]);
  const [adding, setAdding] = useState(false);

  function salvar() {
    if (!data || arquivos.length === 0) return;
    adicionarFotosObra(project.id, { data, descricao, arquivos });
    setData(''); setDescricao(''); setArquivos([]);
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">6. Fotos da Obra</h2>
        {!adding && !isCliente && (
          <button onClick={() => setAdding(true)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Adicionar Fotos</button>
        )}
      </div>

      {adding && (
        <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
          <div className="flex gap-2">
            <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" value={data} onChange={e => setData(e.target.value)} />
            <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Descrição (opcional)" value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
          <UploadZone
            onAdd={(files) => setArquivos(p => [...p, ...files])}
            arquivos={arquivos}
            onRemove={(idx) => setArquivos(p => p.filter((_, i) => i !== idx))}
            accept="image/*"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={salvar} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">Salvar</button>
            <button onClick={() => setAdding(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
          </div>
        </div>
      )}

      {fotosGrupos.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma foto registrada.</p>
      ) : (
        <div className="space-y-4">
          {[...fotosGrupos].reverse().map(g => (
            <div key={g.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">{g.data}</span>
                {g.descricao && <span className="text-sm text-gray-400">— {g.descricao}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {g.arquivos.map((f: ArquivoAnexo, i: number) => (
                  f.tipo.startsWith('image/') ? (
                    <img key={i} src={f.base64} alt={f.nome} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <ArquivoItem key={i} a={f} />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Etapa6GestaoObra({ project, etapa, etapaData }: Props) {
  const navigate = useNavigate();
  const { updateEtapaData, registrarAceite, liberarEtapa, showToast, currentUser } = useStore();
  const gestaoObra = etapaData?.gestaoObra;
  const tarefas = gestaoObra?.tarefasGantt ?? [];
  const relatorios = gestaoObra?.relatorios ?? [];
  const canRelease = currentUser?.role === 'Admin' || currentUser?.role === 'FuerzaAdmin' || currentUser?.role === 'Gestor';

  const checklist = [
    { label: 'Cronograma com ao menos uma tarefa', ok: tarefas.length > 0 },
    { label: 'Ao menos um relatório semanal registrado', ok: relatorios.length > 0 },
  ];

  return (
    <div className="space-y-4">
      <SecaoResumo project={project} />

      <SecaoEscopo
        projectId={project.id}
        etapaNum={6}
        escopo={etapaData?.escopo}
        sectionTitle="1. Escopo Contratado"
        onSave={(escopo) => {
          updateEtapaData(project.id, 6, { escopo });
          showToast('Escopo salvo!');
        }}
      />

      <SecaoCronogramaGantt project={project} />
      <SecaoChecklistDiario project={project} />
      <SecaoCompras project={project} />
      <SecaoRelatorios project={project} />
      <SecaoFotosObra project={project} />

      <SecaoAceite
        project={project}
        etapaNum={6}
        escopo={etapaData?.escopo}
        aceite={etapaData?.aceite}
        sectionTitle="8. Aceite do Cliente"
        onAceite={(dataAceite) => {
          registrarAceite(project.id, 6, dataAceite);
          showToast('Aceite do cliente registrado!');
        }}
      />

      {canRelease && (
        <SecaoLiberacao
          project={project}
          etapaNum={6}
          etapaData={etapaData}
          etapa={etapa}
          checklist={checklist}
          sectionNum={9}
          onLiberar={(obs) => {
            liberarEtapa(project.id, 6, obs);
            showToast('Etapa 6 liberada com sucesso!');
            void navigate;
          }}
        />
      )}
    </div>
  );
}

export default Etapa6GestaoObra;
