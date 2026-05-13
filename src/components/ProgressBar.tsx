import { useNavigate, useParams } from 'react-router-dom';
import type { Etapa } from '../types';

interface Props {
  etapas: Etapa[];
  projectId: string;
}

export function ProgressBar({ etapas, projectId }: Props) {
  const navigate = useNavigate();
  const { n } = useParams();
  const currentN = parseInt(n || '1');

  return (
    <div className="flex items-center px-8 py-4 bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
      {etapas.map((etapa, i) => {
        const isActive = etapa.numero === currentN;
        const isLiberada = etapa.status === 'liberada';
        const isBloqueada = etapa.status === 'bloqueada';
        const isLast = i === etapas.length - 1;

        return (
          <div key={etapa.numero} className="flex items-center flex-1">
            <button
              onClick={() => {
                if (!isBloqueada) navigate(`/projetos/${projectId}/etapa/${etapa.numero}`);
              }}
              disabled={isBloqueada}
              className="flex flex-col items-center gap-1 group"
              style={{ cursor: isBloqueada ? 'not-allowed' : 'pointer' }}
              title={isBloqueada ? 'Etapa bloqueada' : etapa.nome}
            >
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isLiberada
                    ? 'bg-green-600 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isLiberada ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isBloqueada ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  etapa.numero
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isActive ? 'text-blue-700' : isLiberada ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {etapa.nome}
              </span>
            </button>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 relative overflow-hidden rounded-full" style={{ background: '#E5E7EB' }}>
                {isLiberada && (
                  <div className="absolute inset-0 bg-green-500 fill-line" />
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500" style={{ width: '50%' }} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
