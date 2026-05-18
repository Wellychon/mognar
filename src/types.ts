export type UserRole = 'FuerzaAdmin' | 'Admin' | 'Arquiteta' | 'Engenheiro' | 'Gestor';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  ativo?: boolean;
}

export type EtapaStatus = 'em_andamento' | 'aguardando_liberacao' | 'liberada' | 'bloqueada';

export interface Etapa {
  numero: number;
  nome: string;
  status: EtapaStatus;
  dataInicio?: string;
  dataLiberacao?: string;
  liberadaPor?: string;
  observacaoLiberacao?: string;
}

export interface EscopoContratado {
  descricao: string;
  valor: string;
  formaPagamento: string;
  observacoes: string;
}

export interface AceiteCliente {
  registradoPor: string;
  dataHora: string;
  dataAceite: string;
  escopoSnapshot: EscopoContratado;
}

export interface ArquivoAnexo {
  nome: string;
  tipo: string;
  base64: string;
  tamanho: number;
}

export interface RegistroReuniao {
  dataReuniao: string;
  participantes: string[];
  transcricao: string;
  notas: string;
  arquivos?: ArquivoAnexo[];
}

export interface LevantamentoImovel {
  dataLevantamento: string;
  observacoes: string;
  arquivos: ArquivoAnexo[];
}

// Etapa 1

export interface PreferenciasDesejos {
  texto: string;
  referencias: ArquivoAnexo[];
}

// Etapa 2

export type LayoutStatus = 'aguardando' | 'aprovado' | 'revisao_solicitada';

export interface Layout {
  id: string;
  label: string;
  arquivos: ArquivoAnexo[];
  status: LayoutStatus;
  comentario: string;
}

export interface EstudoPreliminar {
  layouts: Layout[];
  revisoesUsadas: number;
  layoutAprovadoId?: string;
}

// Etapa 3

export interface VisitaTecnica {
  data: string;
  fotos: ArquivoAnexo[];
  notas: string;
}

export interface ParecerTecnico {
  texto: string;
  arquivos: ArquivoAnexo[];
}

export type PendenciaStatus = 'aberta' | 'resolvida';
export type PendenciaResponsavel = 'arquiteto' | 'engenheiro';

export interface Pendencia {
  id: string;
  descricao: string;
  responsavel: PendenciaResponsavel;
  status: PendenciaStatus;
  data: string;
}

export interface Compatibilizacao {
  visitaTecnica?: VisitaTecnica;
  parecerTecnico?: ParecerTecnico;
  pendencias: Pendencia[];
}

// Etapa 4

export type CategoriaEntregavel =
  | 'Renders/3D'
  | 'Memorial Descritivo'
  | 'Pontos Elétricos/Hidráulicos'
  | 'Paginações'
  | 'Cadernos'
  | 'Luminotécnico';

export interface Entregavel {
  id: string;
  categoria: CategoriaEntregavel;
  arquivos: ArquivoAnexo[];
}

export interface AprovacaoTripartite {
  mognar?: { aprovadoPor: string; dataHora: string };
  arquiteto?: { aprovadoPor: string; dataHora: string };
  cliente?: { aprovadoPor: string; dataHora: string };
}

export interface ProjetoExecutivo {
  entregaveis: Entregavel[];
  aprovacao: AprovacaoTripartite;
}

// Etapa 5

export interface ItemOrcamento {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorStandard: number;
  valorPremium: number;
}

export type FaixaOrcamento = 'standard' | 'premium';

export interface AprovacaoOrcamento {
  faixa: FaixaOrcamento;
  nomeCliente: string;
  dataHora: string;
  totalAprovado: number;
}

export interface Orcamentacao {
  itensMateriais: ItemOrcamento[];
  itensMaoDeObra: ItemOrcamento[];
  itensAcabamentos: ItemOrcamento[];
  dataValidade: string;
  aprovacao?: AprovacaoOrcamento;
}

// Etapa 6

export type TarefaGanttStatus = 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada';

export interface TarefaGantt {
  id: string;
  tarefa: string;
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  percentual: number;
  status: TarefaGanttStatus;
  observacao?: string;
}

export interface ItemChecklist {
  id: string;
  texto: string;
  concluido: boolean;
}

export interface ChecklistDiario {
  id: string;
  data: string;
  responsavel: string;
  itens: ItemChecklist[];
  observacoes: string;
}

export type CompraStatus = 'pendente' | 'pago';
export type CompraPagoPor = 'cliente' | 'mognar';
export type CompraCategoria = 'material' | 'mao_de_obra' | 'acabamento' | 'outro';
export type CompraImpactoCronograma = 'sem_impacto' | 'atraso_previsto' | 'atraso_confirmado';

export interface Compra {
  id: string;
  data: string;
  fornecedor: string;
  cnpjFornecedor?: string;
  fabricante?: string;
  descricao: string;
  sku?: string;
  categoria?: CompraCategoria;
  quantidade?: number;
  unidade?: string;
  valorUnitario?: number;
  valor: number;
  pagoPor: CompraPagoPor;
  status: CompraStatus;
  link?: string;
  atividadeVinculadaId?: string;
  prazoPrometido?: string;
  prazoReal?: string;
  responsavelAprovacao?: string;
  responsavelRecebimento?: string;
  impactoNoCronograma?: CompraImpactoCronograma;
  problema?: string;
  evidencia?: ArquivoAnexo;
  notaFiscal?: ArquivoAnexo;
  comprovante?: ArquivoAnexo;
}

export interface RelatorioSemanal {
  id: string;
  semana: number;
  periodo: string;
  percentualAvanco: number;
  resumo: string;
  alertas: string;
  fotos: ArquivoAnexo[];
}

export interface FotoObra {
  id: string;
  data: string;
  descricao: string;
  arquivos: ArquivoAnexo[];
}

export interface GestaoObra {
  tarefasGantt: TarefaGantt[];
  checklists: ChecklistDiario[];
  compras: Compra[];
  relatorios: RelatorioSemanal[];
  fotosObra: FotoObra[];
}

export interface EtapaData {
  escopo?: EscopoContratado;
  aceite?: AceiteCliente;
  reuniao?: RegistroReuniao;
  levantamento?: LevantamentoImovel;
  preferencias?: PreferenciasDesejos;
  estudoPreliminar?: EstudoPreliminar;
  compatibilizacao?: Compatibilizacao;
  projetoExecutivo?: ProjetoExecutivo;
  orcamentacao?: Orcamentacao;
  gestaoObra?: GestaoObra;
}

export interface Feedback {
  id: string;
  autor: string;
  texto: string;
  dataHora: string;
}

export interface Project {
  id: string;
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
  etapas: Etapa[];
  etapaAtual: number;
  etapasData: Record<number, EtapaData>;
  maxRevisoesLayouts?: number;
  finalizado?: boolean;
  dataFinalizacao?: string;
  imagemHero?: string;
  feedbacks?: Feedback[];
}

export const ETAPAS_NOMES = [
  'Briefing',
  'Estudo Preliminar',
  'Compatibilização',
  'Projeto Executivo',
  'Orçamentação',
  'Gestão de Obra',
];

export const TIPOS_OBRA = [
  'Reforma Residencial',
  'Reforma Comercial',
  'Reforma Industrial',
  'Construção Nova',
  'Interiores',
  'Outro',
];

export const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export const CATEGORIAS_ENTREGAVEL: CategoriaEntregavel[] = [
  'Renders/3D',
  'Memorial Descritivo',
  'Pontos Elétricos/Hidráulicos',
  'Paginações',
  'Cadernos',
  'Luminotécnico',
];
