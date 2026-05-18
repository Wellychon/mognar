import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Accordion } from '../../components/Accordion';
import type { Project, Orcamentacao, ItemOrcamento, FaixaOrcamento } from '../../types';
import { SecaoResumo, SecaoLiberacao } from './shared';

function formatMoeda(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function TabelaOrcamento({ titulo, itens, faixa, onAdd, onRemove }: {
  titulo: string;
  itens: ItemOrcamento[];
  faixa: FaixaOrcamento;
  onAdd: (item: ItemOrcamento) => void;
  onRemove: (id: string) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<Omit<ItemOrcamento, 'id'>>({
    descricao: '', unidade: 'un', quantidade: 1, valorStandard: 0, valorPremium: 0,
  });

  const total = itens.reduce((sum, i) => sum + i.quantidade * (faixa === 'standard' ? i.valorStandard : i.valorPremium), 0);

  const handleAdd = () => {
    if (!form.descricao.trim()) return;
    onAdd({ ...form, id: `item-${Date.now()}` });
    setForm({ descricao: '', unidade: 'un', quantidade: 1, valorStandard: 0, valorPremium: 0 });
    setAddOpen(false);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{titulo}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 uppercase w-16">Un</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-20">Qtd</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-28">Standard</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-28">Premium</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-28">Total ({faixa})</th>
              <th className="w-8 no-print" />
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{item.descricao}</td>
                <td className="px-3 py-2 text-center text-gray-500">{item.unidade}</td>
                <td className="px-3 py-2 text-right text-gray-700">{item.quantidade}</td>
                <td className="px-3 py-2 text-right text-gray-600">{formatMoeda(item.valorStandard)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{formatMoeda(item.valorPremium)}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-800">
                  {formatMoeda(item.quantidade * (faixa === 'standard' ? item.valorStandard : item.valorPremium))}
                </td>
                <td className="px-3 py-2 text-right no-print">
                  <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-400 text-sm italic">Nenhum item adicionado.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={5} className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">Total</td>
              <td className="px-3 py-2 text-right font-bold text-gray-900">{formatMoeda(total)}</td>
              <td className="no-print" />
            </tr>
          </tfoot>
        </table>
      </div>

      {addOpen ? (
        <div className="p-3 border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unidade</label>
              <input type="text" value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
              <input type="number" min={1} value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor Standard (R$)</label>
              <input type="number" min={0} step={0.01} value={form.valorStandard} onChange={e => setForm(f => ({ ...f, valorStandard: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor Premium (R$)</label>
              <input type="number" min={0} step={0.01} value={form.valorPremium} onChange={e => setForm(f => ({ ...f, valorPremium: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Adicionar
            </button>
            <button onClick={() => setAddOpen(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddOpen(true)} className="text-sm text-blue-600 hover:underline no-print">
          + Adicionar item
        </button>
      )}
    </div>
  );
}

function SecaoAprovacaoCliente({ orcamentacao, onUpdate, projectNome }: {
  orcamentacao: Orcamentacao;
  onUpdate: (o: Orcamentacao) => void;
  projectNome: string;
}) {
  const [faixaSelecionada, setFaixaSelecionada] = useState<FaixaOrcamento>('standard');
  const [nomeCliente, setNomeCliente] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const ap = orcamentacao.aprovacao;

  const totalStandard = [...orcamentacao.itensMateriais, ...(orcamentacao.itensMaoDeObra ?? []), ...orcamentacao.itensAcabamentos]
    .reduce((sum, i) => sum + i.quantidade * i.valorStandard, 0);
  const totalPremium = [...orcamentacao.itensMateriais, ...(orcamentacao.itensMaoDeObra ?? []), ...orcamentacao.itensAcabamentos]
    .reduce((sum, i) => sum + i.quantidade * i.valorPremium, 0);

  const confirmar = () => {
    const total = faixaSelecionada === 'standard' ? totalStandard : totalPremium;
    onUpdate({
      ...orcamentacao,
      aprovacao: {
        faixa: faixaSelecionada,
        nomeCliente,
        dataHora: new Date().toISOString(),
        totalAprovado: total,
      },
    });
    setModalOpen(false);
  };

  return (
    <>
      <Accordion title="5. Aprovação do Cliente">
        {ap ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600 text-sm font-semibold">✓ Orçamento aprovado</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Faixa escolhida</p>
                <p className="text-gray-800 capitalize">{ap.faixa}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Total aprovado</p>
                <p className="text-gray-800 font-semibold">{formatMoeda(ap.totalAprovado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Aprovado por</p>
                <p className="text-gray-800">{ap.nomeCliente}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Data</p>
                <p className="text-gray-800">{new Date(ap.dataHora).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg cursor-pointer transition-colors" style={{ borderColor: faixaSelecionada === 'standard' ? '#2563EB' : '#E5E7EB', background: faixaSelecionada === 'standard' ? '#EFF6FF' : undefined }}
                onClick={() => setFaixaSelecionada('standard')}>
                <p className="text-sm font-medium text-gray-800">Standard</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{formatMoeda(totalStandard)}</p>
              </div>
              <div className="p-3 border rounded-lg cursor-pointer transition-colors" style={{ borderColor: faixaSelecionada === 'premium' ? '#2563EB' : '#E5E7EB', background: faixaSelecionada === 'premium' ? '#EFF6FF' : undefined }}
                onClick={() => setFaixaSelecionada('premium')}>
                <p className="text-sm font-medium text-gray-800">Premium</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{formatMoeda(totalPremium)}</p>
              </div>
            </div>
            <button onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors no-print">
              Registrar aprovação do cliente
            </button>
          </div>
        )}
      </Accordion>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center no-print" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4">Confirmar aprovação do orçamento</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Projeto</p>
                <p className="text-sm text-gray-800">{projectNome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Faixa</p>
                <p className="text-sm text-gray-800 capitalize font-semibold">{faixaSelecionada} — {formatMoeda(faixaSelecionada === 'standard' ? totalStandard : totalPremium)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do cliente</label>
                <input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)}
                  placeholder="Nome completo do cliente..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
              <button onClick={confirmar} disabled={!nomeCliente.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Etapa5Orcamentacao({ project, etapa, etapaData }: {
  project: Project;
  etapa: any;
  etapaData: any;
}) {
  const navigate = useNavigate();
  const { updateEtapaData, liberarEtapa, showToast, currentUser } = useStore();
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'FuerzaAdmin';

  const orc: Orcamentacao = etapaData.orcamentacao || {
    itensMateriais: [], itensMaoDeObra: [], itensAcabamentos: [],
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const faixa: FaixaOrcamento = orc.aprovacao?.faixa || 'standard';

  const checklist = [
    { label: 'Itens de materiais cadastrados', ok: orc.itensMateriais.length > 0 },
    { label: 'Itens de mão de obra cadastrados', ok: (orc.itensMaoDeObra ?? []).length > 0 },
    { label: 'Itens de acabamentos cadastrados', ok: orc.itensAcabamentos.length > 0 },
    { label: 'Orçamento aprovado pelo cliente', ok: !!(orc.aprovacao) },
  ];

  const handleUpdate = (o: Orcamentacao) => {
    updateEtapaData(project.id, 5, { orcamentacao: o });
  };

  const addMaterial = (item: ItemOrcamento) => {
    handleUpdate({ ...orc, itensMateriais: [...orc.itensMateriais, item] });
    showToast('Item adicionado!');
  };
  const removeMaterial = (id: string) => handleUpdate({ ...orc, itensMateriais: orc.itensMateriais.filter(i => i.id !== id) });

  const addMaoDeObra = (item: ItemOrcamento) => {
    handleUpdate({ ...orc, itensMaoDeObra: [...(orc.itensMaoDeObra ?? []), item] });
    showToast('Item adicionado!');
  };
  const removeMaoDeObra = (id: string) => handleUpdate({ ...orc, itensMaoDeObra: (orc.itensMaoDeObra ?? []).filter(i => i.id !== id) });

  const addAcabamento = (item: ItemOrcamento) => {
    handleUpdate({ ...orc, itensAcabamentos: [...orc.itensAcabamentos, item] });
    showToast('Item adicionado!');
  };
  const removeAcabamento = (id: string) => handleUpdate({ ...orc, itensAcabamentos: orc.itensAcabamentos.filter(i => i.id !== id) });

  const totalGeral = [...orc.itensMateriais, ...(orc.itensMaoDeObra ?? []), ...orc.itensAcabamentos]
    .reduce((sum, i) => sum + i.quantidade * (faixa === 'standard' ? i.valorStandard : i.valorPremium), 0);

  return (
    <div className="space-y-4">
      <SecaoResumo project={project} />

      <Accordion title="2. Orçamento de Materiais Brutos">
        <TabelaOrcamento
          titulo="Materiais"
          itens={orc.itensMateriais}
          faixa={faixa}
          onAdd={addMaterial}
          onRemove={removeMaterial}
        />
      </Accordion>

      <Accordion title="3. Orçamento de Mão de Obra">
        <TabelaOrcamento
          titulo="Mão de Obra"
          itens={orc.itensMaoDeObra ?? []}
          faixa={faixa}
          onAdd={addMaoDeObra}
          onRemove={removeMaoDeObra}
        />
      </Accordion>

      <Accordion title="4. Orçamento de Acabamentos">
        <div className="space-y-6">
          <TabelaOrcamento
            titulo="Acabamentos"
            itens={orc.itensAcabamentos}
            faixa={faixa}
            onAdd={addAcabamento}
            onRemove={removeAcabamento}
          />

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade do orçamento</label>
              <input type="date" value={orc.dataValidade}
                onChange={e => handleUpdate({ ...orc, dataValidade: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-medium">Total geral ({faixa})</p>
              <p className="text-xl font-bold text-gray-900">{formatMoeda(totalGeral)}</p>
            </div>
          </div>
        </div>
      </Accordion>

      <SecaoAprovacaoCliente
        orcamentacao={orc}
        onUpdate={o => { handleUpdate(o); showToast('Aprovação registrada!'); }}
        projectNome={project.nome}
      />

      {isAdmin && (
        <SecaoLiberacao
          project={project}
          etapaNum={5}
          etapaData={etapaData}
          etapa={etapa}
          checklist={checklist}
          sectionNum={6}
          onLiberar={(obs) => {
            liberarEtapa(project.id, 5, obs);
            showToast('Etapa 5 liberada!');
            setTimeout(() => navigate(`/projetos/${project.id}/etapa/6`), 500);
          }}
        />
      )}
    </div>
  );
}
