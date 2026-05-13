import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        navigate('/projetos', { replace: true });
      } else {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-ui)' }}>
      {/* Left — brand */}
      <div
        className="login-brand"
        style={{
          width: '55%',
          background: 'var(--navy-900)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        {/* Animated orbs */}
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 72,
              color: '#fff',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-1px',
            }}
          >
            Mognar
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              color: 'var(--terracotta)',
              margin: '16px 0 0',
              fontStyle: 'italic',
            }}
          >
            Gestão de Reformas Arquitetônicas
          </p>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 24,
              lineHeight: 1.6,
            }}
          >
            Do briefing à entrega — tudo em um único lugar.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              marginTop: 48,
            }}
          >
            {['Briefing', 'Projeto', 'Obra'].map((label, i) => (
              <span
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  animationDelay: `${i * 120}ms`,
                }}
                className="animate-hero-badge"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          width: '45%',
          background: 'var(--paper-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }} className="animate-slide-in-right">
          <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 4px' }}>
            Bem-vindo de volta
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '0 0 32px' }}>
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-700)', display: 'block', marginBottom: 6 }}>
                E-mail
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@mognar.com.br"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--bone)',
                  fontSize: 14,
                  color: 'var(--ink-900)',
                  background: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--terracotta)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-700)', display: 'block', marginBottom: 6 }}>
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--bone)',
                  fontSize: 14,
                  color: 'var(--ink-900)',
                  background: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--terracotta)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: 'var(--red)', margin: 0 }} className="animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: '12px',
                background: loading ? 'var(--ink-300)' : 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--terracotta-hover)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--terracotta)'; }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 32, textAlign: 'center' }}>
            Acesso restrito. Somente usuários autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}
