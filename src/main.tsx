import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadAll, scheduleSave } from './lib/db'
import { useStore, USERS, TARI_PROJECT, VILA_NOVA_PROJECT } from './store'

async function boot() {
  try {
    const loaded = await loadAll();
    if (loaded && loaded.projects.length) {
      // Hidrata o store com o que veio do Supabase
      useStore.setState({ users: loaded.users.length ? loaded.users : USERS, projects: loaded.projects });
    } else {
      // Banco vazio → faz seed inicial e empurra pro Supabase
      const users = USERS;
      const projects = [TARI_PROJECT, VILA_NOVA_PROJECT];
      useStore.setState({ users, projects });
      scheduleSave({ users, projects });
    }
  } catch (e) {
    console.warn('[boot] loadAll falhou, segue com estado local:', e);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void boot();
