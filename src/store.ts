import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Project, EtapaData, Feedback } from './types';
import { ETAPAS_NOMES } from './types';

const USERS: User[] = [
  { id: '1', name: 'Ana Lima', role: 'Admin' },
  { id: '2', name: 'Carla Mendes', role: 'Arquiteta' },
  { id: '3', name: 'Bruno Costa', role: 'Engenheiro' },
  { id: '4', name: 'Diego Rocha', role: 'Gestor' },
  { id: '5', name: 'Marcelo', role: 'Admin' },
  { id: '6', name: 'Maria Laura', role: 'Arquiteta' },
  { id: '7', name: 'Rafael', role: 'Engenheiro' },
  { id: '8', name: 'Joyce', role: 'Gestor' },
];

function createEtapas() {
  return ETAPAS_NOMES.map((nome, i) => ({
    numero: i + 1,
    nome,
    status: i === 0 ? ('em_andamento' as const) : ('bloqueada' as const),
    dataInicio: i === 0 ? new Date().toISOString() : undefined,
  }));
}

const TARI_ID = 'tari-restaurante-2026';

// base64 mínimo — arquivo HTML com "oi" (usado como placeholder em todos os anexos de exemplo)
const _OI = 'data:text/html;base64,b2k=';
const _PDF = 'data:application/pdf;base64,b2k=';
const _DOCX = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,b2k=';
const _DWG = 'data:application/acad;base64,b2k=';
const _JPG = 'data:image/jpeg;base64,b2k=';
const _MP4 = 'data:video/mp4;base64,b2k=';

function arq(nome: string, tipo: string, b64: string, tamanho: number) {
  return { nome, tipo, base64: b64, tamanho };
}

const escopo1 = {
  descricao: 'Projeto Arquitetônico completo — levantamento, estudo preliminar (até 3 layouts), anteprojeto, projeto executivo, plantas e 3D.',
  valor: 'R$ 15.860,00',
  formaPagamento: '30% na assinatura, 40% na entrega do anteprojeto, 30% na entrega do executivo.',
  observacoes: 'Inclui acompanhamento semanal presencial durante a fase de execução.',
};

const TARI_PROJECT: Project = {
  id: TARI_ID,
  nome: 'TARI — Restaurante',
  tipoObra: 'Reforma Comercial',
  dataInicio: '2026-02-23',
  prazoUteis: '40',
  razaoSocial: 'Sabor & Arte Gastronomia Ltda',
  contato: 'Bruno Ferreira',
  email: 'bruno@saborarte.com.br',
  telefone: '(11) 99812-3456',
  cpfCnpj: '12.345.678/0001-90',
  endereco: 'Rua das Acácias, nº 87',
  bairro: 'Vila Madalena',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '05420-010',
  areaM2: '210',
  descricaoImovel: 'Restaurante em galpão industrial com dois pavimentos e mezanino.',
  arquitetaId: '6',
  engenheiroId: '7',
  gestorId: '8',
  etapaAtual: 6,
  etapas: [
    { numero: 1, nome: 'Briefing', status: 'liberada', dataInicio: '2026-02-23T09:00:00.000Z', dataLiberacao: '2026-03-04T17:30:00.000Z', liberadaPor: 'Marcelo', observacaoLiberacao: 'Briefing concluído. Cliente aprovou escopo e cronograma.' },
    { numero: 2, nome: 'Estudo Preliminar', status: 'liberada', dataInicio: '2026-03-05T09:00:00.000Z', dataLiberacao: '2026-03-18T16:00:00.000Z', liberadaPor: 'Marcelo', observacaoLiberacao: 'Layout C aprovado pelo cliente. Segue para anteprojeto.' },
    { numero: 3, nome: 'Compatibilização', status: 'liberada', dataInicio: '2026-03-19T09:00:00.000Z', dataLiberacao: '2026-04-01T18:00:00.000Z', liberadaPor: 'Marcelo', observacaoLiberacao: 'Projetos complementares compatibilizados sem conflitos relevantes.' },
    { numero: 4, nome: 'Projeto Executivo', status: 'liberada', dataInicio: '2026-04-02T09:00:00.000Z', dataLiberacao: '2026-04-17T17:00:00.000Z', liberadaPor: 'Marcelo', observacaoLiberacao: 'Projeto executivo aprovado. Todos os detalhamentos entregues.' },
    { numero: 5, nome: 'Orçamentação', status: 'liberada', dataInicio: '2026-04-18T09:00:00.000Z', dataLiberacao: '2026-04-28T15:30:00.000Z', liberadaPor: 'Marcelo', observacaoLiberacao: 'Orçamento fechado com a construtora Alfa Engenharia.' },
    { numero: 6, nome: 'Gestão de Obra', status: 'em_andamento', dataInicio: '2026-04-29T09:00:00.000Z' },
  ],
  etapasData: {
    1: {
      escopo: escopo1,
      reuniao: {
        dataReuniao: '2026-02-24',
        participantes: ['Bruno Ferreira', 'Maria Laura', 'Marcelo'],
        transcricao: 'Bruno: Queremos um restaurante moderno, com área de bar integrada ao salão principal.\nMaria Laura: Temos 210m² distribuídos em dois pavimentos. O mezanino pode virar uma área reservada para eventos.\nBruno: Exato. E precisamos de cozinha industrial no fundo, longe da visão dos clientes.\nMarcelo: Prazo apertado — inauguração prevista para julho. Vamos trabalhar com etapas bem definidas.',
        notas: 'Cliente quer paleta neutra (cimento, madeira, metal). Referência enviada: restaurantes industriais em SP. Reunião de validação de layout marcada para 06/03.',
        arquivos: [
          arq('ata-briefing-tari.pdf', 'application/pdf', _PDF, 187432),
          arq('referencias-visuais-cliente.pdf', 'application/pdf', _PDF, 4821600),
          arq('gravacao-reuniao-briefing.mp4', 'video/mp4', _MP4, 28311552),
        ],
      },
      levantamento: {
        dataLevantamento: '2026-02-26',
        observacoes: 'Imóvel em bom estado estrutural. Pé-direito de 4,8m no pavimento térreo e 3,2m no mezanino. Instalações elétricas e hidráulicas antigas — necessário refazer. Identificadas 3 vigas metálicas expostas que serão aproveitadas no projeto.',
        arquivos: [
          arq('planta-levantamento-tari.dwg', 'application/acad', _DWG, 624800),
          arq('planta-levantamento-tari.pdf', 'application/pdf', _PDF, 312400),
          arq('fotos-vistoria-terreo.jpg', 'image/jpeg', _JPG, 3204571),
          arq('fotos-vistoria-mezanino.jpg', 'image/jpeg', _JPG, 2876340),
        ],
      },
      aceite: {
        registradoPor: 'Maria Laura',
        dataHora: '2026-02-28T11:20:00.000Z',
        dataAceite: '2026-02-28',
        escopoSnapshot: { ...escopo1 },
      },
    },
    2: {
      escopo: {
        descricao: 'Desenvolvimento de até 3 layouts alternativos para o salão principal, área de bar, cozinha e mezanino. Apresentação em pranchas A3 com perspectivas 3D para cada opção.',
        valor: 'Incluso no contrato global',
        formaPagamento: 'Por etapa',
        observacoes: 'Revisões ilimitadas dentro de cada layout. Cliente tem 5 dias úteis para retorno após apresentação.',
      },
      reuniao: {
        dataReuniao: '2026-03-06',
        participantes: ['Bruno Ferreira', 'Maria Laura', 'Rafael'],
        transcricao: 'Maria Laura apresentou 3 layouts. Layout A: conceito aberto, bar centralizado. Layout B: cozinha vista, conceito gastronômico. Layout C: bar no mezanino, maior privacidade.\nBruno preferiu o C mas pediu para mover a entrada do bar.\nRafael confirmou viabilidade estrutural da proposta C.',
        notas: 'Layout C selecionado com ajuste na entrada do bar. Maria Laura vai revisar e enviar nova versão até 12/03. Segunda reunião de validação em 14/03.',
        arquivos: [
          arq('layouts-estudo-preliminar-A.pdf', 'application/pdf', _PDF, 9437184),
          arq('layouts-estudo-preliminar-B.pdf', 'application/pdf', _PDF, 8912345),
          arq('layouts-estudo-preliminar-C.pdf', 'application/pdf', _PDF, 9124567),
          arq('ata-reuniao-03-06.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', _DOCX, 48230),
        ],
      },
      levantamento: {
        dataLevantamento: '2026-03-08',
        observacoes: 'Levantamento complementar para o mezanino. Confirmada carga máxima de 300kg/m². Escada existente pode ser aproveitada com revestimento metálico. Guarda-corpo atual não atende NR-18, necessário substituição.',
        arquivos: [
          arq('levantamento-mezanino-detalhe.dwg', 'application/acad', _DWG, 380200),
          arq('laudo-estrutural-mezanino.pdf', 'application/pdf', _PDF, 1248000),
          arq('fotos-escada-existente.jpg', 'image/jpeg', _JPG, 2104320),
        ],
      },
      aceite: {
        registradoPor: 'Maria Laura',
        dataHora: '2026-03-14T14:45:00.000Z',
        dataAceite: '2026-03-14',
        escopoSnapshot: {
          descricao: 'Desenvolvimento de até 3 layouts alternativos para o salão principal, área de bar, cozinha e mezanino. Apresentação em pranchas A3 com perspectivas 3D para cada opção.',
          valor: 'Incluso no contrato global',
          formaPagamento: 'Por etapa',
          observacoes: 'Revisões ilimitadas dentro de cada layout. Cliente tem 5 dias úteis para retorno após apresentação.',
        },
      },
    },
    3: {
      escopo: {
        descricao: 'Compatibilização dos projetos complementares: elétrico (SPDA, QDG, circuitos de força e luz), hidrossanitário (esgoto, água fria/quente, gordura), HVAC (ar-condicionado split + exaustão cozinha) e incêndio (sprinklers, extintores, saída de emergência).',
        valor: 'Incluso no contrato global',
        formaPagamento: 'Por etapa',
        observacoes: 'Compatibilização realizada em BIM (Revit). Relatório de conflitos entregue junto com as plantas revisadas.',
      },
      reuniao: {
        dataReuniao: '2026-03-20',
        participantes: ['Maria Laura', 'Rafael', 'Eng. Hidráulico — André Sousa', 'Eng. Elétrico — Patrícia Nunes'],
        transcricao: 'Rafael apresentou o modelo BIM com sobreposição de todos os sistemas. Identificados 4 conflitos: 2 no forro do térreo (elétrica x hidráulica) e 2 no mezanino (HVAC x estrutura).\nPatrícia propôs rota alternativa para os cabos de força.\nAndré confirmou viabilidade do remanejamento da tubulação de esgoto.\nMaria Laura vai atualizar o modelo e redistribuir até 25/03.',
        notas: 'Relatório de conflitos gerado automaticamente pelo Revit. Prazo de compatibilização mantido. Próxima reunião em 27/03 para validação final.',
        arquivos: [
          arq('modelo-bim-compatibilizacao.rvt', 'application/octet-stream', _OI, 52428800),
          arq('relatorio-conflitos-revit.pdf', 'application/pdf', _PDF, 3145728),
          arq('planta-eletrica-rev01.dwg', 'application/acad', _DWG, 512000),
          arq('planta-hidraulica-rev01.dwg', 'application/acad', _DWG, 487200),
          arq('ata-reuniao-03-20.pdf', 'application/pdf', _PDF, 62400),
        ],
      },
      levantamento: {
        dataLevantamento: '2026-03-22',
        observacoes: 'Vistoria técnica para mapeamento dos pontos de entrada de energia e gás. Quadro de distribuição atual é monofásico — necessário upgrade para trifásico. Entrada de gás existente na lateral esquerda do imóvel, com capacidade suficiente para a cozinha industrial.',
        arquivos: [
          arq('vistoria-tecnica-sistemas.pdf', 'application/pdf', _PDF, 2097152),
          arq('fotos-qd-existente.jpg', 'image/jpeg', _JPG, 1456230),
          arq('fotos-entrada-gas.jpg', 'image/jpeg', _JPG, 987654),
        ],
      },
      aceite: {
        registradoPor: 'Rafael',
        dataHora: '2026-03-27T16:10:00.000Z',
        dataAceite: '2026-03-27',
        escopoSnapshot: {
          descricao: 'Compatibilização dos projetos complementares: elétrico, hidrossanitário, HVAC e incêndio.',
          valor: 'Incluso no contrato global',
          formaPagamento: 'Por etapa',
          observacoes: 'Compatibilização realizada em BIM (Revit). Relatório de conflitos entregue junto com as plantas revisadas.',
        },
      },
    },
    4: {
      escopo: {
        descricao: 'Projeto Executivo completo com todas as pranchas para execução: plantas baixas, cortes, elevações, planta de cobertura, forro, hidráulica, elétrica, detalhamentos de cozinha industrial, banheiros, escada e mezanino. Memorial descritivo e especificação de materiais.',
        valor: 'Incluso no contrato global',
        formaPagamento: 'Por etapa',
        observacoes: 'Entrega em PDF e DWG. Revisões após início de obra serão orçadas separadamente.',
      },
      reuniao: {
        dataReuniao: '2026-04-03',
        participantes: ['Bruno Ferreira', 'Maria Laura', 'Rafael', 'Joyce'],
        transcricao: 'Maria Laura apresentou o conjunto completo de pranchas — 28 arquivos no total.\nBruno solicitou ajuste no posicionamento das mesas do mezanino e reorientação de 2 tomadas na cozinha.\nRafael aprovou as especificações estruturais da escada metálica.\nJoyce levantou dúvida sobre cronograma de entrega dos materiais especificados — Maria Laura vai enviar lista de fornecedores com lead time.',
        notas: 'Revisão R02 entregue em 10/04. Aprovação final do cliente em 12/04. Pranchas lacradas para execução.',
        arquivos: [
          arq('projeto-executivo-TARI-R02.pdf', 'application/pdf', _PDF, 41943040),
          arq('prancha-01-implantacao.dwg', 'application/acad', _DWG, 720000),
          arq('prancha-02-planta-terreo.dwg', 'application/acad', _DWG, 850000),
          arq('prancha-03-planta-mezanino.dwg', 'application/acad', _DWG, 640000),
          arq('prancha-04-cortes-elevacoes.dwg', 'application/acad', _DWG, 920000),
          arq('memorial-descritivo-TARI.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', _DOCX, 186420),
          arq('especificacao-materiais-TARI.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', _OI, 94208),
        ],
      },
      levantamento: {
        dataLevantamento: '2026-04-05',
        observacoes: 'Conferência in loco das cotas do projeto executivo. Identificada divergência de 12cm na largura do corredor de serviço — corrigido na prancha antes da entrega final. Fachada confirmada: revestimento ACM cinza grafite com letreiro em neon.',
        arquivos: [
          arq('conferencia-cotas-executivo.pdf', 'application/pdf', _PDF, 1572864),
          arq('fotos-conferencia-04-05.jpg', 'image/jpeg', _JPG, 4234560),
          arq('croqui-ajuste-corredor.pdf', 'application/pdf', _PDF, 234560),
        ],
      },
      aceite: {
        registradoPor: 'Joyce',
        dataHora: '2026-04-12T10:30:00.000Z',
        dataAceite: '2026-04-12',
        escopoSnapshot: {
          descricao: 'Projeto Executivo completo com todas as pranchas para execução, memorial descritivo e especificação de materiais.',
          valor: 'Incluso no contrato global',
          formaPagamento: 'Por etapa',
          observacoes: 'Entrega em PDF e DWG. Revisão R02 — versão aprovada para execução.',
        },
      },
    },
    5: {
      escopo: {
        descricao: 'Elaboração de planilha orçamentária detalhada por serviço, consulta a no mínimo 3 fornecedores por item, análise comparativa e recomendação. Gestão das propostas e apoio na negociação com as construtoras selecionadas.',
        valor: 'Incluso no contrato global',
        formaPagamento: 'Por etapa',
        observacoes: 'Orçamento dividido em 6 lotes: demolição/alvenaria, estrutura metálica, acabamentos, cozinha industrial, elétrica/hidráulica e paisagismo.',
      },
      reuniao: {
        dataReuniao: '2026-04-18',
        participantes: ['Bruno Ferreira', 'Maria Laura', 'Joyce', 'Marcelo'],
        transcricao: 'Joyce apresentou a planilha consolidada com 3 propostas para cada lote.\nTotal do menor orçamento: R$ 412.000. Total do mais completo: R$ 487.000.\nBruno aprovou a estratégia de contratar a Alfa Engenharia para estrutura e acabamentos, e a Eletro Plus para instalações.\nMarcelo recomendou margem de 8% de contingência. Bruno concordou.',
        notas: 'Contrato com Alfa assinado em 22/04. Início de obra previsto para 29/04. Prazo de execução: 90 dias corridos.',
        arquivos: [
          arq('planilha-orcamentaria-TARI.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', _OI, 312320),
          arq('proposta-alfa-engenharia.pdf', 'application/pdf', _PDF, 2621440),
          arq('proposta-construcao-prime.pdf', 'application/pdf', _PDF, 3145728),
          arq('proposta-reform-plus.pdf', 'application/pdf', _PDF, 1835008),
          arq('analise-comparativa-fornecedores.pdf', 'application/pdf', _PDF, 786432),
          arq('contrato-alfa-engenharia-assinado.pdf', 'application/pdf', _PDF, 4194304),
        ],
      },
      levantamento: {
        dataLevantamento: '2026-04-20',
        observacoes: 'Visita técnica com representante da Alfa Engenharia para levantamento de quantitativos. Confirmados: 42m² de alvenaria a demolir, 18 pontos elétricos novos, 210m² de piso a instalar. Nenhuma surpresa estrutural identificada.',
        arquivos: [
          arq('levantamento-quantitativos-obra.pdf', 'application/pdf', _PDF, 1048576),
          arq('fotos-visita-alfa-20-04.jpg', 'image/jpeg', _JPG, 5242880),
          arq('cronograma-obra-alfa.pdf', 'application/pdf', _PDF, 524288),
        ],
      },
      aceite: {
        registradoPor: 'Joyce',
        dataHora: '2026-04-24T09:15:00.000Z',
        dataAceite: '2026-04-24',
        escopoSnapshot: {
          descricao: 'Planilha orçamentária detalhada com análise comparativa de 3 fornecedores por lote e apoio na negociação.',
          valor: 'Incluso no contrato global',
          formaPagamento: 'Por etapa',
          observacoes: 'Construtora selecionada: Alfa Engenharia. Total contratado: R$ 443.000 (inclui 8% contingência).',
        },
      },
    },
    6: {
      escopo: {
        descricao: 'Acompanhamento semanal presencial da execução da obra, com visitas todas as quintas-feiras. Emissão de relatório fotográfico semanal, controle de cronograma e qualidade, gestão de RDOs (Relatório Diário de Obra) e interface entre cliente, construtora e projetistas complementares.',
        valor: 'Incluso no contrato global',
        formaPagamento: 'Por etapa',
        observacoes: 'Prazo de obra: 90 dias corridos a partir de 29/04/2026. Previsão de conclusão: 27/07/2026.',
      },
      reuniao: {
        dataReuniao: '2026-04-30',
        participantes: ['Bruno Ferreira', 'Maria Laura', 'Joyce', 'Rafael', 'Eng. Responsável Alfa — Ricardo Matos'],
        transcricao: 'Reunião de kick-off de obra.\nRicardo Matos apresentou o plano de ataque: semana 1 — demolições; semanas 2-3 — estrutura metálica; semanas 4-6 — alvenaria e instalações.\nJoyce alertou sobre o lead time de 4 semanas do piso de cimento queimado — pedido deve ser feito até 07/05.\nMaria Laura reforçou a necessidade de aprovação prévia de amostras de materiais antes da aplicação.',
        notas: 'RDO diário no WhatsApp. Visita semanal toda quinta às 9h. Próximo relatório fotográfico: 07/05/2026.',
        arquivos: [
          arq('ata-kickoff-obra-TARI.pdf', 'application/pdf', _PDF, 312400),
          arq('cronograma-fisico-financeiro.pdf', 'application/pdf', _PDF, 1048576),
          arq('plano-ataque-semana1.pdf', 'application/pdf', _PDF, 786432),
          arq('gravacao-kickoff-obra.mp4', 'video/mp4', _MP4, 94371840),
        ],
      },
      levantamento: {
        dataLevantamento: '2026-05-02',
        observacoes: 'Primeira vistoria após início das demolições. Progresso: 60% da alvenaria demolida. Identificada tubulação de água não mapeada na parede norte — Rafael acionado para revisão do projeto hidráulico. Estrutura do mezanino confirmada sem patologias.',
        arquivos: [
          arq('relatorio-semana1-TARI.pdf', 'application/pdf', _PDF, 4194304),
          arq('fotos-demolicao-01.jpg', 'image/jpeg', _JPG, 6291456),
          arq('fotos-demolicao-02.jpg', 'image/jpeg', _JPG, 5767168),
          arq('rdo-semana1-alfa.pdf', 'application/pdf', _PDF, 245760),
        ],
      },
    },
  },
};

interface AppState {
  users: User[];
  currentUser: User;
  projects: Project[];
  toast: { message: string; type: 'success' | 'error' } | null;
  isAuthenticated: boolean;

  setCurrentUser: (userId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'etapas' | 'etapaAtual' | 'etapasData'>) => string;
  updateEtapaData: (projectId: string, etapa: number, data: Partial<EtapaData>) => void;
  liberarEtapa: (projectId: string, etapa: number, obs: string) => void;
  registrarAceite: (projectId: string, etapa: number, dataAceite: string) => void;
  finalizarProjeto: (projectId: string) => void;
  reabrirProjeto: (projectId: string) => void;
  adicionarFeedback: (projectId: string, texto: string) => void;
  setImagemHero: (projectId: string, base64: string) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  clearToast: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: USERS,
      currentUser: USERS[0],
      projects: [TARI_PROJECT],
      toast: null,
      isAuthenticated: false,

      login: (email, password) => {
        if (email === 'admin@mognar.com.br' && password === 'mognar2026') {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),

      setCurrentUser: (userId) => {
        const user = USERS.find(u => u.id === userId);
        if (user) set({ currentUser: user });
      },

      addProject: (projectData) => {
        const id = crypto.randomUUID();
        const project: Project = {
          ...projectData,
          id,
          etapas: createEtapas(),
          etapaAtual: 1,
          etapasData: {},
        };
        set(s => ({ projects: [...s.projects, project] }));
        return id;
      },

      updateEtapaData: (projectId, etapa, data) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id !== projectId ? p : {
              ...p,
              etapasData: {
                ...p.etapasData,
                [etapa]: { ...p.etapasData[etapa], ...data },
              },
            }
          ),
        }));
      },

      liberarEtapa: (projectId, etapaNum, obs) => {
        const { currentUser } = get();
        set(s => ({
          projects: s.projects.map(p => {
            if (p.id !== projectId) return p;
            const etapas = p.etapas.map(e => {
              if (e.numero === etapaNum) {
                return { ...e, status: 'liberada' as const, dataLiberacao: new Date().toISOString(), liberadaPor: currentUser.name, observacaoLiberacao: obs };
              }
              if (e.numero === etapaNum + 1) {
                return { ...e, status: 'em_andamento' as const, dataInicio: new Date().toISOString() };
              }
              return e;
            });
            return { ...p, etapas, etapaAtual: etapaNum < 6 ? etapaNum + 1 : etapaNum };
          }),
        }));
      },

      registrarAceite: (projectId, etapaNum, dataAceite) => {
        const { currentUser, projects } = get();
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const escopo = project.etapasData[etapaNum]?.escopo;
        if (!escopo) return;

        set(s => ({
          projects: s.projects.map(p =>
            p.id !== projectId ? p : {
              ...p,
              etapasData: {
                ...p.etapasData,
                [etapaNum]: {
                  ...p.etapasData[etapaNum],
                  aceite: {
                    registradoPor: currentUser.name,
                    dataHora: new Date().toISOString(),
                    dataAceite,
                    escopoSnapshot: { ...escopo },
                  },
                },
              },
            }
          ),
        }));
      },

      finalizarProjeto: (projectId) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id !== projectId ? p : { ...p, finalizado: true, dataFinalizacao: new Date().toISOString() }
          ),
        }));
      },

      reabrirProjeto: (projectId) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id !== projectId ? p : { ...p, finalizado: false, dataFinalizacao: undefined }
          ),
        }));
      },

      adicionarFeedback: (projectId, texto) => {
        const { currentUser } = get();
        const feedback: Feedback = {
          id: crypto.randomUUID(),
          autor: currentUser.name,
          texto,
          dataHora: new Date().toISOString(),
        };
        set(s => ({
          projects: s.projects.map(p =>
            p.id !== projectId ? p : { ...p, feedbacks: [...(p.feedbacks ?? []), feedback] }
          ),
        }));
      },

      setImagemHero: (projectId, base64) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id !== projectId ? p : { ...p, imagemHero: base64 }
          ),
        }));
      },

      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3500);
      },

      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'mognar-storage',
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as AppState;
        if (version < 3) {
          const others = (state.projects ?? []).filter(p => p.id !== TARI_ID);
          state.projects = [TARI_PROJECT, ...others];
        }
        if (version < 5) {
          state.isAuthenticated = false;
        }
        return state;
      },
    }
  )
);

export { USERS };
