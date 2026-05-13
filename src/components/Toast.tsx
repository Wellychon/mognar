import { useStore } from '../store';

export function Toast() {
  const { toast, clearToast } = useStore();

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-slide-in-right"
      style={{ background: toast.type === 'success' ? '#16A34A' : '#DC2626' }}
      onClick={clearToast}
    >
      <span>{toast.type === 'success' ? '✓' : '✕'}</span>
      <span>{toast.message}</span>
    </div>
  );
}
