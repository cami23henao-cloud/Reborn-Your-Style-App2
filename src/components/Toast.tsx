import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const iconName = isSuccess ? 'check_circle' : isError ? 'error' : 'info';
        const bgColor = isSuccess 
          ? 'bg-[#012d1d] text-white border border-[#2b694d]' 
          : isError 
            ? 'bg-[#ba1a1a] text-white' 
            : 'bg-[#1b4332] text-white';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg transition-all transform translate-y-0 opacity-100 ${bgColor}`}
          >
            <span className="material-symbols-outlined shrink-0 text-xl mt-0.5">
              {iconName}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/70 hover:text-white transition-colors shrink-0 p-1"
              aria-label="Cerrar notificación"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
