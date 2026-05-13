import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, USERS } from '../store';
import { TIPOS_OBRA, ESTADOS_BR } from '../types';

interface FormErrors {
  [key: string]: string;
}

interface FormData {
  nome: string;
  tipoObra: string;
  dataInicio: string;
  prazoUteis: string;
  razaoSocial: string;
  contato: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  areaM2: string;
  descricaoImovel: string;
  arquitetaId: string;
  engenheiroId: string;
  gestorId: string;
}

const INITIAL: FormData = {
  nome: '', tipoObra: '', dataInicio: '', prazoUteis: '',
  razaoSocial: '', contato: '', email: '', telefone: '', cpfCnpj: '',
  endereco: '', bairro: '', cidade: '', estado: '', cep: '', areaM2: '', descricaoImovel: '',
  arquitetaId: '', engenheiroId: '', gestorId: '',
};

function Field({ label, name, value, onChange, error, required, type = 'text', placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  error?: string; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div className={error ? 'animate-shake' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        style={{ borderRadius: 6 }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, error, required, options, placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  error?: string; required?: boolean; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <div className={error ? 'animate-shake' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        style={{ borderRadius: 6 }}
      >
        <option value="">{placeholder || 'Selecione...'}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <div className="h-px bg-gray-200 mt-2" />
    </div>
  );
}

export function NewProject() {
  const navigate = useNavigate();
  const { addProject } = useStore();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    const e: FormErrors = {};
    if (!form.nome) e.nome = 'Nome do projeto é obrigatório';
    if (!form.tipoObra) e.tipoObra = 'Tipo de obra é obrigatório';
    if (!form.dataInicio) e.dataInicio = 'Data de início é obrigatória';
    if (!form.razaoSocial) e.razaoSocial = 'Razão social é obrigatória';
    if (!form.email) e.email = 'E-mail é obrigatório';
    if (!form.endereco) e.endereco = 'Endereço é obrigatório';
    if (!form.cidade) e.cidade = 'Cidade é obrigatória';
    if (!form.estado) e.estado = 'Estado é obrigatório';
    if (!form.arquitetaId) e.arquitetaId = 'Arquiteta é obrigatória';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const id = addProject(form);
    navigate(`/projetos/${id}/etapa/1`);
  };

  const arquitetas = USERS.filter(u => u.role === 'Arquiteta' || u.role === 'Admin');
  const engenheiros = USERS.filter(u => u.role === 'Engenheiro' || u.role === 'Admin');
  const gestores = USERS.filter(u => u.role === 'Gestor' || u.role === 'Admin');

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Projeto</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* A. Dados do Projeto */}
        <section>
          <SectionHeader title="A. Dados do Projeto" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nome do projeto" name="nome" value={form.nome} onChange={set('nome')} error={errors.nome} required />
            </div>
            <SelectField
              label="Tipo de obra" name="tipoObra" value={form.tipoObra} onChange={set('tipoObra')}
              error={errors.tipoObra} required
              options={TIPOS_OBRA.map(t => ({ value: t, label: t }))}
            />
            <Field label="Data de início" name="dataInicio" value={form.dataInicio} onChange={set('dataInicio')} error={errors.dataInicio} required type="date" />
            <div className="col-span-2">
              <Field label="Prazo em dias úteis" name="prazoUteis" value={form.prazoUteis} onChange={set('prazoUteis')} type="number" placeholder="Ex: 90" />
            </div>
          </div>
        </section>

        {/* B. Dados do Cliente */}
        <section>
          <SectionHeader title="B. Dados do Cliente" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Razão social / Nome" name="razaoSocial" value={form.razaoSocial} onChange={set('razaoSocial')} error={errors.razaoSocial} required />
            </div>
            <Field label="Nome do contato" name="contato" value={form.contato} onChange={set('contato')} />
            <Field label="E-mail" name="email" value={form.email} onChange={set('email')} error={errors.email} required type="email" />
            <Field label="Telefone" name="telefone" value={form.telefone} onChange={set('telefone')} placeholder="(11) 99999-9999" />
            <Field label="CPF / CNPJ" name="cpfCnpj" value={form.cpfCnpj} onChange={set('cpfCnpj')} />
          </div>
        </section>

        {/* C. Dados do Imóvel */}
        <section>
          <SectionHeader title="C. Dados do Imóvel" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Endereço" name="endereco" value={form.endereco} onChange={set('endereco')} error={errors.endereco} required />
            </div>
            <Field label="Bairro" name="bairro" value={form.bairro} onChange={set('bairro')} />
            <Field label="Cidade" name="cidade" value={form.cidade} onChange={set('cidade')} error={errors.cidade} required />
            <SelectField
              label="Estado" name="estado" value={form.estado} onChange={set('estado')}
              error={errors.estado} required
              options={ESTADOS_BR.map(uf => ({ value: uf, label: uf }))}
            />
            <Field label="CEP" name="cep" value={form.cep} onChange={set('cep')} placeholder="00000-000" />
            <Field label="Área (m²)" name="areaM2" value={form.areaM2} onChange={set('areaM2')} type="number" />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do imóvel</label>
              <textarea
                value={form.descricaoImovel}
                onChange={e => set('descricaoImovel')(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderRadius: 6 }}
              />
            </div>
          </div>
        </section>

        {/* D. Equipe */}
        <section>
          <SectionHeader title="D. Equipe" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Arquiteta" name="arquitetaId" value={form.arquitetaId} onChange={set('arquitetaId')}
              error={errors.arquitetaId} required
              options={arquitetas.map(u => ({ value: u.id, label: u.name }))}
            />
            <SelectField
              label="Engenheiro" name="engenheiroId" value={form.engenheiroId} onChange={set('engenheiroId')}
              options={engenheiros.map(u => ({ value: u.id, label: u.name }))}
            />
            <SelectField
              label="Gestor" name="gestorId" value={form.gestorId} onChange={set('gestorId')}
              options={gestores.map(u => ({ value: u.id, label: u.name }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
              <div className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-500" style={{ borderRadius: 6 }}>
                Ana Lima (Admin)
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Criando...
              </>
            ) : (
              'Criar projeto e ir para o Briefing →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
