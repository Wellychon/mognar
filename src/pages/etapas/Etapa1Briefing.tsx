import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Accordion } from '../../components/Accordion';
import type { Project, PreferenciasDesejos } from '../../types';
import {
  SecaoResumo, SecaoEscopo, SecaoReuniao, SecaoLevantamento,
  SecaoAceite, SecaoLiberacao, UploadZone,
} from './shared';
import type { ArquivoAnexo } from '../../types';

function SecaoPreferencias({ preferencias, onSave }: {
  preferencias?: PreferenciasDesejos;
  onSave: (p: PreferenciasDesejos) => void;
}) {
  const hasData = !!(preferencias?.texto);
  const [editing, setEditing] = useState(!hasData);
  const [texto, setTexto] = useState(preferencias?.texto || '');
  const [refs, setRefs] = useState<ArquivoAnexo[]>(preferencias?.referencias || []);

  const handleSave = () => {
    onSave({ texto, referencias: refs });
    setEditing(false);
  };

  return (
    <Accordion title="3. Preferências e Desejos">
      {!editing ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{preferencias?.texto || '—'}</p>
          </div>
          {preferencias?.referencias && preferencias.referencias.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Referências visuais</p>
              <ul className="space-y-1">
                {preferencias.referencias.map((a, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                    {a.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar preferências
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição de preferências e desejos</label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={4}
              placeholder="Descreva o estilo, materiais, referências e expectativas do cliente..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Referências visuais</label>
            <UploadZone
              onAdd={novos => setRefs(r => [...r, ...novos])}
              arquivos={refs}
              onRemove={idx => setRefs(r => r.filter((_, i) => i !== idx))}
              accept="image/*,application/pdf"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Salvar preferências
            </button>
            {hasData && (
              <button onClick={() => { setTexto(preferencias!.texto); setRefs(preferencias!.referencias); setEditing(false); }}
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

export function Etapa1Briefing({ project, etapa, etapaData }: {
  project: Project;
  etapa: any;
  etapaData: any;
}) {
  const navigate = useNavigate();
  const { updateEtapaData, liberarEtapa, registrarAceite, showToast, currentUser } = useStore();
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'FuerzaAdmin';

  const checklist = [
    { label: 'Escopo contratado preenchido', ok: !!(etapaData.escopo?.descricao) },
    { label: 'Aceite do cliente registrado', ok: !!(etapaData.aceite) },
    { label: 'Registro de reunião salvo', ok: !!(etapaData.reuniao?.dataReuniao) },
  ];

  return (
    <div className="space-y-4">
      <SecaoResumo project={project} />

      <SecaoEscopo
        projectId={project.id}
        etapaNum={1}
        escopo={etapaData.escopo}
        sectionTitle="2. Escopo Contratado"
        onSave={(escopo) => {
          updateEtapaData(project.id, 1, { escopo });
          showToast('Escopo salvo com sucesso!');
        }}
      />

      <SecaoPreferencias
        preferencias={etapaData.preferencias}
        onSave={(preferencias) => {
          updateEtapaData(project.id, 1, { preferencias });
          showToast('Preferências salvas!');
        }}
      />

      <SecaoReuniao
        projectId={project.id}
        etapaNum={1}
        reuniao={etapaData.reuniao}
        sectionTitle="4. Registro de Reunião"
        onSave={(reuniao) => {
          updateEtapaData(project.id, 1, { reuniao });
          showToast('Registro de reunião salvo!');
        }}
      />

      <SecaoLevantamento
        levantamento={etapaData.levantamento}
        sectionTitle="5. Levantamento do Imóvel"
        onSave={(levantamento) => {
          updateEtapaData(project.id, 1, { levantamento });
          showToast('Levantamento salvo!');
        }}
      />

      <SecaoAceite
        project={project}
        etapaNum={1}
        escopo={etapaData.escopo}
        aceite={etapaData.aceite}
        sectionTitle="6. Aceite do Cliente"
        onAceite={(dataAceite) => {
          registrarAceite(project.id, 1, dataAceite);
          showToast('Aceite do cliente registrado!');
        }}
      />

      {isAdmin && (
        <SecaoLiberacao
          project={project}
          etapaNum={1}
          etapaData={etapaData}
          etapa={etapa}
          checklist={checklist}
          sectionNum={7}
          onLiberar={(obs) => {
            liberarEtapa(project.id, 1, obs);
            showToast('Etapa 1 liberada com sucesso!');
            setTimeout(() => navigate(`/projetos/${project.id}/etapa/2`), 500);
          }}
        />
      )}
    </div>
  );
}
