import { useState } from 'react';
import { useStore } from '../store';

export function UserConfig() {
  const { currentUser } = useStore();
  const [nome, setNome] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 600, margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 400,
            color: 'var(--ink-900)',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Configurações
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '6px 0 0' }}>
          Gerencie seu perfil e preferências
        </p>
      </div>

      {/* Perfil */}
      <div
        className="animate-slide-up"
        style={{
          background: 'white',
          border: '1px solid var(--bone)',
          borderRadius: 'var(--r-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Perfil
        </h2>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: 'white',
              fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>{currentUser.name}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: '2px 0 0' }}>{currentUser.role}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 6, letterSpacing: 0.3 }}>
                NOME COMPLETO
              </label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 14,
                  color: 'var(--ink-900)',
                  background: 'var(--paper)',
                  border: '1px solid var(--bone)',
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--terracotta)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 6, letterSpacing: 0.3 }}>
                E-MAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 14,
                  color: 'var(--ink-900)',
                  background: 'var(--paper)',
                  border: '1px solid var(--bone)',
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--terracotta)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 6, letterSpacing: 0.3 }}>
                FUNÇÃO
              </label>
              <input
                type="text"
                value={currentUser.role}
                disabled
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 14,
                  color: 'var(--ink-500)',
                  background: 'var(--bone)',
                  border: '1px solid var(--bone)',
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <button
              type="submit"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'white',
                background: 'var(--terracotta)',
                border: 'none',
                borderRadius: 'var(--r-md)',
                padding: '9px 20px',
                cursor: 'pointer',
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Salvar alterações
            </button>
            {saved && (
              <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                ✓ Salvo com sucesso
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Segurança */}
      <div
        className="animate-slide-up"
        style={{
          background: 'white',
          border: '1px solid var(--bone)',
          borderRadius: 'var(--r-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Segurança
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 6, letterSpacing: 0.3 }}>
              NOVA SENHA
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: 14,
                color: 'var(--ink-900)',
                background: 'var(--paper)',
                border: '1px solid var(--bone)',
                borderRadius: 'var(--r-md)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 6, letterSpacing: 0.3 }}>
              CONFIRMAR SENHA
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: 14,
                color: 'var(--ink-900)',
                background: 'var(--paper)',
                border: '1px solid var(--bone)',
                borderRadius: 'var(--r-md)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
            />
          </div>
          <div>
            <button
              type="button"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink-700)',
                background: 'transparent',
                border: '1px solid var(--bone)',
                borderRadius: 'var(--r-md)',
                padding: '9px 20px',
                cursor: 'pointer',
                transition: 'border-color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ink-500)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bone)')}
            >
              Alterar senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
