import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function DetailDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const nodes = ref.current?.querySelectorAll<HTMLElement>('button, a[href], input');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus({ preventScroll: true }); };
  }, [onClose]);
  return createPortal(<div className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="glass-panel rounded-2xl p-5 sm:p-8 max-w-4xl w-full max-h-[90dvh] overflow-y-auto">
      <div className="flex justify-between items-start gap-4 mb-6"><h2 className="text-2xl text-white font-bold">{title}</h2><button type="button" onClick={onClose} aria-label="Close details" className="enhancement-button"><X /></button></div>{children}
    </div>
  </div>, document.body);
}
