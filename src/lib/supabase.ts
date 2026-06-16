import { createClient } from '@supabase/supabase-js';
import type { StateStorage } from 'zustand/middleware';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_KEY as string;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

// Storage adapter para zustand/persist usando a tabela app_state (JSONB).
// Estratégia: cache local síncrono em localStorage + hidratação assíncrona do Supabase.
// O persist do zustand é síncrono — o adapter retorna o que está em cache e dispara
// sync em background. Em conflitos, server > local (last fetch wins ao abrir).

const LS_PREFIX = 'mognar:';

export function supabaseStorage(tenantId: string): StateStorage {
  return {
    getItem: (name) => {
      // Síncrono: retorna do localStorage (cache). Hidratação real ocorre em hydrateFromSupabase().
      return localStorage.getItem(LS_PREFIX + name);
    },
    setItem: (name, value) => {
      localStorage.setItem(LS_PREFIX + name, value);
      // Fire-and-forget: persistência remota
      void supabase
        .from('app_state')
        .upsert({ tenant_id: tenantId, state: JSON.parse(value), updated_at: new Date().toISOString() })
        .then(({ error }: any) => {
          if (error) console.warn('[supabase] persist falhou:', error.message);
        });
    },
    removeItem: (name) => {
      localStorage.removeItem(LS_PREFIX + name);
      void supabase.from('app_state').delete().eq('tenant_id', tenantId);
    },
  };
}

// Hidrata o estado a partir do Supabase ANTES do app montar (caso exista snapshot mais novo).
export async function hydrateFromSupabase(tenantId: string, persistKey: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('state, updated_at')
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) {
      console.warn('[supabase] hydrate falhou:', error.message);
      return;
    }
    if (data?.state) {
      localStorage.setItem(LS_PREFIX + persistKey, JSON.stringify(data.state));
    }
  } catch (e) {
    console.warn('[supabase] hydrate exception:', e);
  }
}
