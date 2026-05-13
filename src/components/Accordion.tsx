import { useState } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#E5E7EB', borderRadius: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? '2000px' : '0',
          transition: 'max-height 200ms ease-out',
        }}
      >
        <div className="p-5 border-t" style={{ borderColor: '#E5E7EB' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
