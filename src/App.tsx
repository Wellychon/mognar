import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProjectList } from './pages/ProjectList';
import { NewProject } from './pages/NewProject';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ProjectEtapa } from './pages/ProjectEtapa';
import { FuerzaAccountManager } from './pages/FuerzaAccountManager';
import { UserConfig } from './pages/UserConfig';
import { Login } from './pages/Login';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/projetos" element={<PrivateRoute><Layout><ProjectList /></Layout></PrivateRoute>} />
        <Route path="/projetos/novo" element={<PrivateRoute><Layout><NewProject /></Layout></PrivateRoute>} />
        <Route path="/projetos/:id" element={<PrivateRoute><Layout><ProjectDashboard /></Layout></PrivateRoute>} />
        <Route path="/projetos/:id/etapa/:n" element={<PrivateRoute><Layout><ProjectEtapa /></Layout></PrivateRoute>} />
        <Route path="/fuerza/contas" element={<PrivateRoute><Layout><FuerzaAccountManager /></Layout></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute><Layout><UserConfig /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
