export type UserRole = 'Admin' | 'Arquiteta' | 'Engenheiro' | 'Gestor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
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

export interface EtapaData {
  escopo?: EscopoContratado;
  aceite?: AceiteCliente;
  reuniao?: RegistroReuniao;
  levantamento?: LevantamentoImovel;
}

export interface Feedback {
  id: string;
  autor: string;
  texto: string;
  dataHora: string;
}

export interface Project {
  id: string;
  // Dados do Projeto
  nome: string;
  tipoObra: string;
  dataInicio: string;
  prazoUteis: string;
  // Dados do Cliente
  razaoSocial: string;
  contato: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  // Dados do Imóvel
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  areaM2: string;
  descricaoImovel: string;
  // Equipe
  arquitetaId: string;
  engenheiroId: string;
  gestorId: string;
  // Etapas
  etapas: Etapa[];
  etapaAtual: number;
  etapasData: Record<number, EtapaData>;
  // Extras
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
