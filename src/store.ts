import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { scheduleSave } from './lib/db';

import type {
  User, Project, EtapaData, Feedback,
  Pendencia, TarefaGantt, Compra, ChecklistDiario,
  RelatorioSemanal, FotoObra,
} from './types';
import { ETAPAS_NOMES } from './types';

const USERS: User[] = [
  { id: '0', name: 'Fuerza Studio', email: 'admin@fuerzastudio.com.br', role: 'FuerzaAdmin', ativo: true },
  { id: '1', name: 'Ana Lima', email: 'ana@mognar.com.br', role: 'Admin', ativo: true },
  { id: '2', name: 'Carla Mendes', email: 'carla@mognar.com.br', role: 'Arquiteta', ativo: true },
  { id: '3', name: 'Bruno Costa', email: 'bruno@mognar.com.br', role: 'Engenheiro', ativo: true },
  { id: '4', name: 'Diego Rocha', email: 'diego@mognar.com.br', role: 'Gestor', ativo: true },
  { id: '5', name: 'Marcelo', email: 'marcelo@tari.com.br', role: 'Admin', ativo: true },
  { id: '6', name: 'Maria Laura', email: 'marialaurа@tari.com.br', role: 'Arquiteta', ativo: true },
  { id: '7', name: 'Rafael', email: 'rafael@tari.com.br', role: 'Engenheiro', ativo: true },
  { id: '8', name: 'Joyce', email: 'joyce@tari.com.br', role: 'Gestor', ativo: true },
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

const _OI = 'data:text/html;base64,b2k=';
const _PDF = 'data:application/pdf;base64,b2k=';
const _DOCX = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,b2k=';
const _DWG = 'data:application/acad;base64,b2k=';
const _MP4 = 'data:video/mp4;base64,b2k=';

function _img(label: string, sub: string, c1: string, c2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><rect x="40" y="260" width="720" height="3" fill="rgba(255,255,255,0.15)"/><rect x="40" y="360" width="720" height="3" fill="rgba(255,255,255,0.08)"/><rect x="100" y="200" width="3" height="300" fill="rgba(255,255,255,0.1)"/><rect x="400" y="140" width="3" height="360" fill="rgba(255,255,255,0.1)"/><rect x="700" y="200" width="3" height="300" fill="rgba(255,255,255,0.1)"/><rect x="40" y="200" width="720" height="60" fill="rgba(0,0,0,0.25)" rx="6"/><text x="400" y="240" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial,sans-serif" font-size="28" font-weight="bold">${label}</text><text x="400" y="290" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="Arial,sans-serif" font-size="16">${sub}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

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
  nome: 'TARI TESTE — Restaurante',
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
  maxRevisoesLayouts: 3,
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
      preferencias: {
        texto: 'Paleta neutra — cimento, madeira e metal. Iluminação quente (2700K–3000K). Sem divisórias: ambientes integrados com fluxo contínuo entre salão, bar e mezanino. Referência: restaurantes industriais de São Paulo. Peças de design assinado na entrada.',
        referencias: [
          arq('referencias-moodboard-tari.pdf', 'application/pdf', _PDF, 3145728),
          arq('ref-restaurante-bardot-sp.jpg', 'image/svg+xml', _img('Referência — Bardot SP', 'Industrial Moderno', '#2d3748', '#1a202c'), 2457600),
          arq('ref-restaurante-clos-sp.jpg', 'image/svg+xml', _img('Referência — Clos SP', 'Concreto + Madeira', '#4a5568', '#2d3748'), 1987654),
        ],
      },
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
          arq('fotos-vistoria-terreo.jpg', 'image/svg+xml', _img('Vistoria — Térreo', 'Levantamento TARI • Fev 2026', '#4a5568', '#2d3748'), 3204571),
          arq('fotos-vistoria-mezanino.jpg', 'image/svg+xml', _img('Vistoria — Mezanino', 'Levantamento TARI • Fev 2026', '#553c9a', '#44337a'), 2876340),
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
      estudoPreliminar: {
        revisoesUsadas: 1,
        layoutAprovadoId: 'layout-c',
        layouts: [
          {
            id: 'layout-a',
            label: 'Layout A',
            status: 'revisao_solicitada',
            comentario: 'Bar centralizado gera gargalo no fluxo de garçons. Cliente preferiu manter bar próximo à parede.',
            arquivos: [
              arq('layout-A-terreo.pdf', 'application/pdf', _PDF, 9437184),
              arq('layout-A-3d-perspectiva.jpg', 'image/svg+xml', _img('Layout A — Perspectiva 3D', 'Bar Centralizado', '#2b6cb0', '#2c5282'), 4194304),
            ],
          },
          {
            id: 'layout-b',
            label: 'Layout B',
            status: 'revisao_solicitada',
            comentario: 'Conceito de cozinha à vista não agradou ao cliente. Preocupação com ruído e odor.',
            arquivos: [
              arq('layout-B-terreo.pdf', 'application/pdf', _PDF, 8912345),
              arq('layout-B-3d-perspectiva.jpg', 'image/svg+xml', _img('Layout B — Perspectiva 3D', 'Cozinha Vista', '#276749', '#22543d'), 3932160),
            ],
          },
          {
            id: 'layout-c',
            label: 'Layout C',
            status: 'aprovado',
            comentario: 'Aprovado pelo cliente em 14/03. Entrada do bar ajustada para o lado esquerdo conforme solicitado.',
            arquivos: [
              arq('layout-C-terreo.pdf', 'application/pdf', _PDF, 9124567),
              arq('layout-C-mezanino.pdf', 'application/pdf', _PDF, 7340032),
              arq('layout-C-3d-salao.jpg', 'image/svg+xml', _img('Layout C — Salão', 'Bar no Mezanino', '#744210', '#5f370e'), 5242880),
              arq('layout-C-3d-bar.jpg', 'image/svg+xml', _img('Layout C — Bar', 'Vista do Mezanino', '#5f370e', '#4a2a0e'), 4718592),
            ],
          },
        ],
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
          arq('fotos-escada-existente.jpg', 'image/svg+xml', _img('Escada Existente', 'Mezanino TARI • Mar 2026', '#2b6cb0', '#2c5282'), 2104320),
        ],
      },
      aceite: {
        registradoPor: 'Maria Laura',
        dataHora: '2026-03-14T14:45:00.000Z',
        dataAceite: '2026-03-14',
        escopoSnapshot: {
          descricao: 'Desenvolvimento de até 3 layouts alternativos para o salão principal, área de bar, cozinha e mezanino.',
          valor: 'Incluso no contrato global',
          formaPagamento: 'Por etapa',
          observacoes: 'Layout C aprovado. Revisão R01 concluída.',
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
      compatibilizacao: {
        visitaTecnica: {
          data: '2026-03-22',
          notas: 'Quadro de distribuição atual é monofásico — necessário upgrade para trifásico. Entrada de gás existente na lateral esquerda com capacidade suficiente para a cozinha industrial. Shaft hidráulico existente aproveitável com adaptações.',
          fotos: [
            arq('fotos-qd-existente.jpg', 'image/svg+xml', _img('QD Existente', 'Vistoria Técnica • Mar 2026', '#276749', '#22543d'), 1456230),
            arq('fotos-entrada-gas.jpg', 'image/svg+xml', _img('Entrada de Gás', 'Vistoria Técnica • Mar 2026', '#c05621', '#9c4221'), 987654),
            arq('fotos-shaft-hidraulico.jpg', 'image/svg+xml', _img('Shaft Hidráulico', 'Vistoria Técnica • Mar 2026', '#285e61', '#234e52'), 1123456),
          ],
        },
        parecerTecnico: {
          texto: 'Após análise do modelo BIM com sobreposição de todos os sistemas, foram identificados 4 conflitos: 2 no forro do térreo (elétrica x hidráulica) e 2 no mezanino (HVAC x estrutura). Todos resolvidos conforme registro. Upgrade do QDG para trifásico 200A necessário antes do início das instalações. Sistema de exaustão da cozinha dimensionado para 3.000m³/h com duto independente na fachada lateral.',
          arquivos: [
            arq('parecer-tecnico-compatibilizacao.pdf', 'application/pdf', _PDF, 2097152),
            arq('modelo-bim-compatibilizacao.rvt', 'application/octet-stream', _OI, 52428800),
            arq('relatorio-conflitos-revit.pdf', 'application/pdf', _PDF, 3145728),
            arq('planta-eletrica-rev02.dwg', 'application/acad', _DWG, 512000),
            arq('planta-hidraulica-rev02.dwg', 'application/acad', _DWG, 487200),
          ],
        },
        pendencias: [
          {
            id: 'p1',
            descricao: 'Confirmar rota dos cabos de força do QDG até a cozinha industrial — Patrícia (elétrica) propôs rota alternativa pelo forro falso.',
            responsavel: 'engenheiro',
            status: 'resolvida',
            data: '2026-03-20',
          },
          {
            id: 'p2',
            descricao: 'Remanejamento da tubulação de esgoto para evitar conflito com fundação do pilar P7.',
            responsavel: 'arquiteto',
            status: 'resolvida',
            data: '2026-03-21',
          },
          {
            id: 'p3',
            descricao: 'Dimensionamento final do sistema de HVAC do mezanino após redefinição do forro.',
            responsavel: 'engenheiro',
            status: 'resolvida',
            data: '2026-03-25',
          },
        ],
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
          arq('fotos-qd-existente.jpg', 'image/svg+xml', _img('QD Existente', 'Vistoria Técnica • Mar 2026', '#276749', '#22543d'), 1456230),
          arq('fotos-entrada-gas.jpg', 'image/svg+xml', _img('Entrada de Gás', 'Vistoria Técnica • Mar 2026', '#c05621', '#9c4221'), 987654),
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
      projetoExecutivo: {
        aprovacao: {
          mognar: { aprovadoPor: 'Marcelo', dataHora: '2026-04-12T09:00:00.000Z' },
          arquiteto: { aprovadoPor: 'Maria Laura', dataHora: '2026-04-12T10:00:00.000Z' },
          cliente: { aprovadoPor: 'Bruno Ferreira', dataHora: '2026-04-12T10:30:00.000Z' },
        },
        entregaveis: [
          {
            id: 'e4-renders',
            categoria: 'Renders/3D',
            arquivos: [
              arq('render-salao-principal.jpg', 'image/svg+xml', _img('Render — Salão Principal', 'Projeto Executivo TARI', '#744210', '#5f370e'), 8388608),
              arq('render-bar-mezanino.jpg', 'image/svg+xml', _img('Render — Bar Mezanino', 'Projeto Executivo TARI', '#553c9a', '#44337a'), 7340032),
              arq('render-fachada.jpg', 'image/svg+xml', _img('Render — Fachada', 'Projeto Executivo TARI', '#2d3748', '#1a202c'), 6291456),
              arq('render-cozinha.jpg', 'image/svg+xml', _img('Render — Cozinha Industrial', 'Projeto Executivo TARI', '#276749', '#22543d'), 5767168),
            ],
          },
          {
            id: 'e4-memorial',
            categoria: 'Memorial Descritivo',
            arquivos: [
              arq('memorial-descritivo-TARI.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', _DOCX, 186420),
              arq('especificacao-materiais-TARI.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', _OI, 94208),
            ],
          },
          {
            id: 'e4-eletrico',
            categoria: 'Pontos Elétricos/Hidráulicos',
            arquivos: [
              arq('prancha-eletrica-forca.dwg', 'application/acad', _DWG, 720000),
              arq('prancha-eletrica-iluminacao.dwg', 'application/acad', _DWG, 680000),
              arq('prancha-hidraulica-agua-fria.dwg', 'application/acad', _DWG, 650000),
              arq('prancha-hidraulica-esgoto.dwg', 'application/acad', _DWG, 610000),
            ],
          },
          {
            id: 'e4-paginacoes',
            categoria: 'Paginações',
            arquivos: [
              arq('paginacao-piso-terreo.pdf', 'application/pdf', _PDF, 3145728),
              arq('paginacao-piso-mezanino.pdf', 'application/pdf', _PDF, 2621440),
              arq('paginacao-revestimento-banheiros.pdf', 'application/pdf', _PDF, 1048576),
            ],
          },
          {
            id: 'e4-cadernos',
            categoria: 'Cadernos',
            arquivos: [
              arq('caderno-marmoraria.pdf', 'application/pdf', _PDF, 2097152),
              arq('caderno-marcenaria.pdf', 'application/pdf', _PDF, 3145728),
              arq('caderno-vidracaria.pdf', 'application/pdf', _PDF, 1572864),
            ],
          },
          {
            id: 'e4-luminotecnico',
            categoria: 'Luminotécnico',
            arquivos: [
              arq('projeto-luminotecnico-TARI.pdf', 'application/pdf', _PDF, 4194304),
              arq('memorial-luminotecnico.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', _DOCX, 124560),
            ],
          },
        ],
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
          arq('fotos-conferencia-04-05.jpg', 'image/svg+xml', _img('Conferência de Cotas', 'In loco • Abr 2026', '#744210', '#5f370e'), 4234560),
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
      orcamentacao: {
        dataValidade: '2026-05-28',
        aprovacao: {
          faixa: 'standard',
          nomeCliente: 'Bruno Ferreira',
          dataHora: '2026-04-24T09:15:00.000Z',
          totalAprovado: 412000,
        },
        itensMateriais: [
          { id: 'm1', descricao: 'Demolição de alvenaria e revestimentos existentes', unidade: 'm²', quantidade: 42, valorStandard: 85, valorPremium: 85 },
          { id: 'm2', descricao: 'Piso cimento queimado polido', unidade: 'm²', quantidade: 180, valorStandard: 320, valorPremium: 480 },
          { id: 'm3', descricao: 'Revestimento cerâmico banheiros', unidade: 'm²', quantidade: 28, valorStandard: 180, valorPremium: 350 },
          { id: 'm4', descricao: 'Estrutura metálica mezanino — perfis e soldagem', unidade: 'un', quantidade: 1, valorStandard: 38000, valorPremium: 52000 },
          { id: 'm5', descricao: 'Escada metálica com guarda-corpo de vidro', unidade: 'un', quantidade: 1, valorStandard: 22000, valorPremium: 31000 },
          { id: 'm6', descricao: 'Forro de gesso acartonado com moldura', unidade: 'm²', quantidade: 95, valorStandard: 120, valorPremium: 165 },
          { id: 'm7', descricao: 'Tinta epóxi para cozinha industrial', unidade: 'm²', quantidade: 65, valorStandard: 95, valorPremium: 130 },
          { id: 'm8', descricao: 'Porta de vidro temperado — entrada principal', unidade: 'un', quantidade: 2, valorStandard: 4800, valorPremium: 7200 },
        ],
        itensMaoDeObra: [
          { id: 'mo1', descricao: 'Mestre de obras + equipe (90 dias)', unidade: 'vb', quantidade: 1, valorStandard: 85000, valorPremium: 105000 },
          { id: 'mo2', descricao: 'Eletricista — instalações completas', unidade: 'vb', quantidade: 1, valorStandard: 38000, valorPremium: 48000 },
          { id: 'mo3', descricao: 'Encanador — hidráulica e esgoto', unidade: 'vb', quantidade: 1, valorStandard: 22000, valorPremium: 28000 },
          { id: 'mo4', descricao: 'Serralheiro — estrutura metálica e guarda-corpos', unidade: 'vb', quantidade: 1, valorStandard: 45000, valorPremium: 58000 },
          { id: 'mo5', descricao: 'Pintor — paredes, teto e cozinha', unidade: 'vb', quantidade: 1, valorStandard: 18000, valorPremium: 22000 },
          { id: 'mo6', descricao: 'Azulejista — revestimentos e pisos', unidade: 'vb', quantidade: 1, valorStandard: 28000, valorPremium: 35000 },
          { id: 'mo7', descricao: 'Marceneiro — instalação mobiliário', unidade: 'vb', quantidade: 1, valorStandard: 12000, valorPremium: 15000 },
          { id: 'mo8', descricao: 'Limpeza de obra e retirada de entulho', unidade: 'vb', quantidade: 1, valorStandard: 8914, valorPremium: 12000 },
        ],
        itensAcabamentos: [
          { id: 'a1', descricao: 'Bancada bar — granito preto absoluto', unidade: 'm²', quantidade: 12, valorStandard: 580, valorPremium: 920 },
          { id: 'a2', descricao: 'Luminária pendente sobre bar — industrial', unidade: 'un', quantidade: 8, valorStandard: 380, valorPremium: 720 },
          { id: 'a3', descricao: 'Revestimento parede tijolo aparente', unidade: 'm²', quantidade: 35, valorStandard: 210, valorPremium: 210 },
          { id: 'a4', descricao: 'Marcenaria — balcão e estante cozinha', unidade: 'un', quantidade: 1, valorStandard: 18500, valorPremium: 28000 },
          { id: 'a5', descricao: 'Marcenaria — mobiliário bar (back-bar)', unidade: 'un', quantidade: 1, valorStandard: 12000, valorPremium: 19500 },
          { id: 'a6', descricao: 'Letreiro neon fachada', unidade: 'un', quantidade: 1, valorStandard: 3800, valorPremium: 6200 },
          { id: 'a7', descricao: 'Ar-condicionado split inverter 18.000 BTU', unidade: 'un', quantidade: 4, valorStandard: 3200, valorPremium: 4800 },
          { id: 'a8', descricao: 'Sistema de som ambiente — caixas embutidas', unidade: 'un', quantidade: 1, valorStandard: 8500, valorPremium: 15000 },
        ],
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
          arq('fotos-visita-alfa-20-04.jpg', 'image/svg+xml', _img('Visita Alfa Engenharia', 'Levantamento de Quantitativos • Abr 2026', '#285e61', '#234e52'), 5242880),
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
      gestaoObra: {
        tarefasGantt: [
          { id: 'g1', tarefa: 'Mobilização e proteção do canteiro', responsavel: 'Alfa Engenharia', dataInicio: '2026-04-29', dataFim: '2026-04-30', percentual: 100, status: 'concluida' },
          { id: 'g2', tarefa: 'Demolições — alvenaria e revestimentos', responsavel: 'Alfa Engenharia', dataInicio: '2026-04-29', dataFim: '2026-05-06', percentual: 80, status: 'em_andamento' },
          { id: 'g3', tarefa: 'Estrutura metálica mezanino', responsavel: 'MetalForm', dataInicio: '2026-05-07', dataFim: '2026-05-21', percentual: 0, status: 'nao_iniciada' },
          { id: 'g4', tarefa: 'Instalações elétricas — passagem de eletrodutos', responsavel: 'Eletro Plus', dataInicio: '2026-05-07', dataFim: '2026-05-28', percentual: 0, status: 'nao_iniciada' },
          { id: 'g5', tarefa: 'Instalações hidrossanitárias', responsavel: 'HidroTec', dataInicio: '2026-05-07', dataFim: '2026-05-28', percentual: 0, status: 'nao_iniciada' },
          { id: 'g6', tarefa: 'Alvenaria nova e revestimento base', responsavel: 'Alfa Engenharia', dataInicio: '2026-05-14', dataFim: '2026-06-04', percentual: 0, status: 'nao_iniciada' },
          { id: 'g7', tarefa: 'Piso cimento queimado — aplicação', responsavel: 'Alfa Engenharia', dataInicio: '2026-06-05', dataFim: '2026-06-19', percentual: 0, status: 'nao_iniciada' },
          { id: 'g8', tarefa: 'Marcenaria e mobiliário sob medida', responsavel: 'Mogna Marcenaria', dataInicio: '2026-06-12', dataFim: '2026-07-03', percentual: 0, status: 'nao_iniciada' },
          { id: 'g9', tarefa: 'Instalação ar-condicionado e sistema de som', responsavel: 'Eletro Plus', dataInicio: '2026-06-26', dataFim: '2026-07-10', percentual: 0, status: 'nao_iniciada' },
          { id: 'g10', tarefa: 'Pintura e acabamentos finais', responsavel: 'Alfa Engenharia', dataInicio: '2026-07-04', dataFim: '2026-07-18', percentual: 0, status: 'nao_iniciada' },
          { id: 'g11', tarefa: 'Limpeza final e vistoria de entrega', responsavel: 'Alfa Engenharia', dataInicio: '2026-07-21', dataFim: '2026-07-25', percentual: 0, status: 'nao_iniciada' },
        ],
        checklists: [
          {
            id: 'cl1',
            data: '2026-04-29',
            responsavel: 'Joyce',
            observacoes: 'Início oficial da obra. Canteiro montado. EPI distribuídos.',
            itens: [
              { id: 'cl1-1', texto: 'Canteiro de obras delimitado com tapumes', concluido: true },
              { id: 'cl1-2', texto: 'EPI distribuídos para toda a equipe', concluido: true },
              { id: 'cl1-3', texto: 'Placas de obra instaladas na fachada', concluido: true },
              { id: 'cl1-4', texto: 'Gerador provisório ligado e testado', concluido: true },
              { id: 'cl1-5', texto: 'Projeto executivo impresso e fixado no canteiro', concluido: true },
            ],
          },
          {
            id: 'cl2',
            data: '2026-04-30',
            responsavel: 'Joyce',
            observacoes: 'Início das demolições no pavimento térreo.',
            itens: [
              { id: 'cl2-1', texto: 'Marcação de paredes a demolir conforme projeto', concluido: true },
              { id: 'cl2-2', texto: 'Desligamento elétrico e hidráulico confirmado', concluido: true },
              { id: 'cl2-3', texto: 'Início demolição — parede norte (42m²)', concluido: true },
              { id: 'cl2-4', texto: 'Caçamba posicionada para entulho', concluido: true },
            ],
          },
          {
            id: 'cl3',
            data: '2026-05-02',
            responsavel: 'Joyce',
            observacoes: 'Tubulação não mapeada encontrada. Rafael acionado.',
            itens: [
              { id: 'cl3-1', texto: 'Inspeção diária do progresso de demolição', concluido: true },
              { id: 'cl3-2', texto: 'Registro fotográfico das demolições', concluido: true },
              { id: 'cl3-3', texto: 'Tubulação não mapeada — Rafael notificado', concluido: true },
              { id: 'cl3-4', texto: 'Caçamba substituída (capacidade atingida)', concluido: true },
              { id: 'cl3-5', texto: 'Revisão do projeto hidráulico solicitada', concluido: false },
            ],
          },
          {
            id: 'cl4',
            data: '2026-05-06',
            responsavel: 'Joyce',
            observacoes: 'Visita semanal — relatório fotográfico enviado ao cliente.',
            itens: [
              { id: 'cl4-1', texto: 'Visita presencial de acompanhamento', concluido: true },
              { id: 'cl4-2', texto: 'Relatório fotográfico semanal elaborado', concluido: true },
              { id: 'cl4-3', texto: 'Relatório enviado ao cliente por e-mail', concluido: true },
              { id: 'cl4-4', texto: 'Reunião de alinhamento com Ricardo Matos (Alfa)', concluido: true },
              { id: 'cl4-5', texto: 'Pedido do piso cimento queimado realizado', concluido: false },
            ],
          },
        ],
        compras: [
          { id: 'cp1', data: '2026-04-29', fornecedor: 'EPI Total', descricao: 'EPIs para equipe de obra (capacetes, luvas, óculos, botas)', valor: 1840, pagoPor: 'mognar', status: 'pago' },
          { id: 'cp2', data: '2026-04-30', fornecedor: 'Leroy Merlin', descricao: 'Materiais de proteção — tapumes, lonas, fita de sinalização', valor: 2340, pagoPor: 'mognar', status: 'pago' },
          { id: 'cp3', data: '2026-05-02', fornecedor: 'Caçambas Alfa', descricao: 'Locação de 2 caçambas para entulho (semana 1)', valor: 980, pagoPor: 'mognar', status: 'pago' },
          { id: 'cp4', data: '2026-05-06', fornecedor: 'Pisos & Cimento SP', descricao: 'Piso cimento queimado polido — 180m² (lead time 4 semanas)', valor: 57600, pagoPor: 'cliente', status: 'pendente' },
          { id: 'cp5', data: '2026-05-06', fornecedor: 'MetalForm SP', descricao: 'Sinal de início — estrutura metálica mezanino', valor: 12000, pagoPor: 'cliente', status: 'pendente' },
        ],
        relatorios: [
          {
            id: 'r1',
            semana: 1,
            periodo: '29/04 – 02/05/2026',
            percentualAvanco: 8,
            resumo: 'Canteiro montado e demolições iniciadas no pavimento térreo. 60% da alvenaria prevista demolida. Identificada tubulação de água não mapeada na parede norte — Rafael acionado para revisão do projeto hidráulico. Sem outros imprevistos estruturais.',
            alertas: 'Tubulação não mapeada na parede norte — pode impactar cronograma de instalações hidráulicas em até 3 dias. Pedido do piso cimento queimado deve ser feito até 07/05 para garantir entrega no prazo.',
            fotos: [
              arq('relatorio-semana1-TARI.pdf', 'application/pdf', _PDF, 4194304),
              arq('fotos-demolicao-01.jpg', 'image/svg+xml', _img('Demolição — Semana 1', 'Obra TARI • Mai 2026', '#742a2a', '#63171b'), 6291456),
              arq('fotos-demolicao-02.jpg', 'image/svg+xml', _img('Demolição — Detalhe', 'Obra TARI • Mai 2026', '#63171b', '#4a1515'), 5767168),
            ],
          },
        ],
        fotosObra: [
          {
            id: 'fo1',
            data: '2026-04-29',
            descricao: 'Dia 1 — Mobilização do canteiro e início das demolições',
            arquivos: [
              arq('fotos-dia1-canteiro.jpg', 'image/svg+xml', _img('Canteiro — Dia 1', 'Mobilização TARI • Abr 2026', '#2d3748', '#1a202c'), 4194304),
              arq('fotos-dia1-tapumes.jpg', 'image/svg+xml', _img('Tapumes Instalados', 'Canteiro TARI • Abr 2026', '#2b6cb0', '#2c5282'), 3670016),
            ],
          },
          {
            id: 'fo2',
            data: '2026-05-02',
            descricao: 'Semana 1 — Demolições em andamento',
            arquivos: [
              arq('fotos-demolicao-01.jpg', 'image/svg+xml', _img('Demolição — Semana 1', 'Obra TARI • Mai 2026', '#742a2a', '#63171b'), 6291456),
              arq('fotos-demolicao-02.jpg', 'image/svg+xml', _img('Demolição — Detalhe', 'Obra TARI • Mai 2026', '#63171b', '#4a1515'), 5767168),
              arq('fotos-tubulacao-nao-mapeada.jpg', 'image/svg+xml', _img('Tubulação Encontrada', 'Parede Norte • Mai 2026', '#744210', '#5f370e'), 2621440),
            ],
          },
        ],
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
          arq('fotos-demolicao-01.jpg', 'image/svg+xml', _img('Demolição — Semana 1', 'Obra TARI • Mai 2026', '#742a2a', '#63171b'), 6291456),
          arq('fotos-demolicao-02.jpg', 'image/svg+xml', _img('Demolição — Detalhe', 'Obra TARI • Mai 2026', '#63171b', '#4a1515'), 5767168),
          arq('rdo-semana1-alfa.pdf', 'application/pdf', _PDF, 245760),
        ],
      },
    },
  },
};

const VILA_NOVA_ID = 'vila-nova-residencia-2026';

const VILA_NOVA_PROJECT: Project = {
  id: VILA_NOVA_ID,
  nome: 'Vila Nova — Residência',
  tipoObra: 'Reforma Residencial',
  dataInicio: new Date().toISOString().slice(0, 10),
  prazoUteis: '30',
  razaoSocial: '',
  contato: '',
  email: '',
  telefone: '',
  cpfCnpj: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  areaM2: '',
  descricaoImovel: '',
  arquitetaId: '6',
  engenheiroId: '7',
  gestorId: '8',
  etapaAtual: 1,
  etapas: createEtapas(),
  etapasData: {},
};

interface AppState {
  users: User[];
  currentUser: User;
  projects: Project[];
  toast: { message: string; type: 'success' | 'error' } | null;
  isAuthenticated: boolean;

  setCurrentUser: (userId: string) => void;
  addUser: (user: Omit<User, 'id' | 'ativo'>) => void;
  updateUser: (userId: string, data: Partial<Omit<User, 'id'>>) => void;
  toggleUserAtivo: (userId: string) => void;
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

  // Etapa 3 — Pendências
  adicionarPendencia: (projectId: string, pendencia: Omit<Pendencia, 'id'>) => void;
  resolverPendencia: (projectId: string, pendenciaId: string) => void;

  // Etapa 6 — Gantt
  adicionarTarefaGantt: (projectId: string, tarefa: Omit<TarefaGantt, 'id'>) => void;
  atualizarTarefaGantt: (projectId: string, tarefaId: string, data: Partial<TarefaGantt>) => void;
  removerTarefaGantt: (projectId: string, tarefaId: string) => void;

  // Etapa 6 — Compras
  adicionarCompra: (projectId: string, compra: Omit<Compra, 'id'>) => void;
  atualizarStatusCompra: (projectId: string, compraId: string, status: Compra['status']) => void;

  // Etapa 6 — Checklists
  adicionarChecklist: (projectId: string, checklist: Omit<ChecklistDiario, 'id'>) => void;
  toggleItemChecklist: (projectId: string, checklistId: string, itemId: string) => void;

  // Etapa 6 — Relatórios
  adicionarRelatorio: (projectId: string, relatorio: Omit<RelatorioSemanal, 'id'>) => void;

  // Etapa 6 — Fotos
  adicionarFotosObra: (projectId: string, fotoObra: Omit<FotoObra, 'id'>) => void;
}

function getGestaoObra(state: AppState, projectId: string) {
  const p = state.projects.find(p => p.id === projectId);
  return p?.etapasData[6]?.gestaoObra ?? {
    tarefasGantt: [], checklists: [], compras: [], relatorios: [], fotosObra: [],
  };
}

function updateGestaoObra(
  state: AppState,
  projectId: string,
  updater: (go: NonNullable<AppState['projects'][0]['etapasData'][6]['gestaoObra']>) => NonNullable<AppState['projects'][0]['etapasData'][6]['gestaoObra']>
) {
  return {
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      const current = p.etapasData[6]?.gestaoObra ?? {
        tarefasGantt: [], checklists: [], compras: [], relatorios: [], fotosObra: [],
      };
      return {
        ...p,
        etapasData: {
          ...p.etapasData,
          6: { ...p.etapasData[6], gestaoObra: updater(current) },
        },
      };
    }),
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: USERS,
      currentUser: USERS[0],
      projects: [TARI_PROJECT, VILA_NOVA_PROJECT],
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
        const user = get().users.find(u => u.id === userId);
        if (user) set({ currentUser: user });
      },

      addUser: (userData) => {
        const newUser: User = { ...userData, id: crypto.randomUUID(), ativo: true };
        set(s => ({ users: [...s.users, newUser] }));
      },

      updateUser: (userId, data) => {
        set(s => ({
          users: s.users.map(u => u.id === userId ? { ...u, ...data } : u),
        }));
      },

      toggleUserAtivo: (userId) => {
        set(s => ({
          users: s.users.map(u => u.id === userId ? { ...u, ativo: !u.ativo } : u),
        }));
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

      adicionarPendencia: (projectId, pendencia) => {
        const nova = { ...pendencia, id: crypto.randomUUID() };
        set(s => ({
          projects: s.projects.map(p => {
            if (p.id !== projectId) return p;
            const comp = p.etapasData[3]?.compatibilizacao ?? { pendencias: [] };
            return {
              ...p,
              etapasData: {
                ...p.etapasData,
                3: { ...p.etapasData[3], compatibilizacao: { ...comp, pendencias: [...comp.pendencias, nova] } },
              },
            };
          }),
        }));
      },

      resolverPendencia: (projectId, pendenciaId) => {
        set(s => ({
          projects: s.projects.map(p => {
            if (p.id !== projectId) return p;
            const comp = p.etapasData[3]?.compatibilizacao ?? { pendencias: [] };
            return {
              ...p,
              etapasData: {
                ...p.etapasData,
                3: {
                  ...p.etapasData[3],
                  compatibilizacao: {
                    ...comp,
                    pendencias: comp.pendencias.map(pen =>
                      pen.id === pendenciaId ? { ...pen, status: 'resolvida' as const } : pen
                    ),
                  },
                },
              },
            };
          }),
        }));
      },

      adicionarTarefaGantt: (projectId, tarefa) => {
        const nova = { ...tarefa, id: crypto.randomUUID() };
        set(s => updateGestaoObra(s, projectId, go => ({ ...go, tarefasGantt: [...go.tarefasGantt, nova] })));
      },

      atualizarTarefaGantt: (projectId, tarefaId, data) => {
        set(s => updateGestaoObra(s, projectId, go => ({
          ...go,
          tarefasGantt: go.tarefasGantt.map(t => t.id === tarefaId ? { ...t, ...data } : t),
        })));
      },

      removerTarefaGantt: (projectId, tarefaId) => {
        set(s => updateGestaoObra(s, projectId, go => ({
          ...go,
          tarefasGantt: go.tarefasGantt.filter(t => t.id !== tarefaId),
        })));
      },

      adicionarCompra: (projectId, compra) => {
        const nova = { ...compra, id: crypto.randomUUID() };
        set(s => updateGestaoObra(s, projectId, go => ({ ...go, compras: [...go.compras, nova] })));
      },

      atualizarStatusCompra: (projectId, compraId, status) => {
        set(s => updateGestaoObra(s, projectId, go => ({
          ...go,
          compras: go.compras.map(c => c.id === compraId ? { ...c, status } : c),
        })));
      },

      adicionarChecklist: (projectId, checklist) => {
        const novo = { ...checklist, id: crypto.randomUUID() };
        set(s => updateGestaoObra(s, projectId, go => ({ ...go, checklists: [...go.checklists, novo] })));
      },

      toggleItemChecklist: (projectId, checklistId, itemId) => {
        set(s => updateGestaoObra(s, projectId, go => ({
          ...go,
          checklists: go.checklists.map(cl =>
            cl.id !== checklistId ? cl : {
              ...cl,
              itens: cl.itens.map(it => it.id === itemId ? { ...it, concluido: !it.concluido } : it),
            }
          ),
        })));
      },

      adicionarRelatorio: (projectId, relatorio) => {
        const novo = { ...relatorio, id: crypto.randomUUID() };
        set(s => updateGestaoObra(s, projectId, go => ({ ...go, relatorios: [...go.relatorios, novo] })));
      },

      adicionarFotosObra: (projectId, fotoObra) => {
        const nova = { ...fotoObra, id: crypto.randomUUID() };
        set(s => updateGestaoObra(s, projectId, go => ({ ...go, fotosObra: [...go.fotosObra, nova] })));
      },
    }),
    {
      name: 'mognar-storage',
      version: 8,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as AppState;
        if (version < 3) {
          const others = (state.projects ?? []).filter(p => p.id !== TARI_ID && p.id !== VILA_NOVA_ID);
          state.projects = [TARI_PROJECT, VILA_NOVA_PROJECT, ...others];
        }
        if (version < 5) {
          state.isAuthenticated = false;
        }
        if (version < 8) {
          const others = (state.projects ?? []).filter(p => p.id !== TARI_ID && p.id !== VILA_NOVA_ID);
          state.projects = [TARI_PROJECT, VILA_NOVA_PROJECT, ...others];
        }
        return state;
      },
    }
  )
);

export { USERS, TARI_PROJECT, VILA_NOVA_PROJECT };

// Sincroniza qualquer mudança em users/projects com o Supabase (normalizado).
let lastUsers = useStore.getState().users;
let lastProjects = useStore.getState().projects;
useStore.subscribe((s) => {
  if (s.users !== lastUsers || s.projects !== lastProjects) {
    lastUsers = s.users;
    lastProjects = s.projects;
    scheduleSave({ users: s.users, projects: s.projects });
  }
});

// helpers para leitura do estado fora do hook (não usado diretamente nos componentes)
export function _getGestaoObra(state: AppState, projectId: string) {
  return getGestaoObra(state, projectId);
}
