'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // Focus the dialog after render
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else {
      document.body.style.overflow = '';
      // Restore focus when closing
      previousFocus.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape key + A11Y-02: Focus trap
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto outline-none"
      >
        <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-bold text-txt">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-txt-muted" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
