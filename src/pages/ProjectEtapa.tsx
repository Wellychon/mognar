import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from './etapas/shared';
import { Etapa1Briefing } from './etapas/Etapa1Briefing';
import { Etapa2EstudoPreliminar } from './etapas/Etapa2EstudoPreliminar';
import { Etapa3Compatibilizacao } from './etapas/Etapa3Compatibilizacao';
import { Etapa4ProjetoExecutivo } from './etapas/Etapa4ProjetoExecutivo';
import { Etapa5Orcamentacao } from './etapas/Etapa5Orcamentacao';
import { Etapa6GestaoObra } from './etapas/Etapa6GestaoObra';

export function ProjectEtapa() {
  const { id, n } = useParams<{ id: string; n: string }>();
  const navigate = useNavigate();
  const { projects, currentUser } = useStore();

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

  if (currentUser?.role === 'Engenheiro' && (etapaNum === 1 || etapaNum === 2)) {
    return (
      <div className="p-8 text-center text-gray-500 max-w-md mx-auto my-12 bg-white border rounded-xl shadow-sm">
        <span className="text-4xl">🔒</span>
        <h2 className="text-lg font-bold text-gray-900 mt-4">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 mt-2">
          Como Engenheiro, você não possui acesso às Etapas 1 e 2 (Briefing e Estudo Preliminar).
        </p>
        <button
          onClick={() => navigate(`/projetos/${project.id}`)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para o painel do projeto
        </button>
      </div>
    );
  }

  const etapa = project.etapas.find(e => e.numero === etapaNum);
  const etapaData = project.etapasData[etapaNum] || {};

  const etapaComponents: Record<number, React.ReactElement> = {
    1: <Etapa1Briefing project={project} etapa={etapa} etapaData={etapaData} />,
    2: <Etapa2EstudoPreliminar project={project} etapa={etapa} etapaData={etapaData} />,
    3: <Etapa3Compatibilizacao project={project} etapa={etapa} etapaData={etapaData} />,
    4: <Etapa4ProjetoExecutivo project={project} etapa={etapa} etapaData={etapaData} />,
    5: <Etapa5Orcamentacao project={project} etapa={etapa} etapaData={etapaData} />,
    6: <Etapa6GestaoObra project={project} etapa={etapa} etapaData={etapaData} />,
  };

  return (
    <div>
      <ProgressBar etapas={project.etapas} projectId={project.id} />

      <div className="p-8">
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
            <button
              onClick={() => window.print()}
              className="no-print ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Exportar como PDF"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Exportar PDF
            </button>
          </div>
          {etapa?.dataInicio && (
            <p className="text-sm text-gray-400">
              Início: {new Date(etapa.dataInicio).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {etapaComponents[etapaNum] ?? (
          <div className="text-gray-400 text-sm">Etapa não encontrada.</div>
        )}
      </div>
    </div>
  );
}
