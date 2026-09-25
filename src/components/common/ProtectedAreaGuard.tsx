import React from 'react';

interface ProtectedAreaGuardProps {
  title: string;
  description: string;
  onOpenAuth: () => void;
  onNavigateHome: () => void;
}

export const ProtectedAreaGuard: React.FC<ProtectedAreaGuardProps> = ({
  title,
  description,
  onOpenAuth,
  onNavigateHome,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(1,45,29,0.06)] border border-[#efeee9] p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Decorative subtle background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b0f1cc]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#012d1d]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Security Shield Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#012d1d]/5 border border-[#012d1d]/10 flex items-center justify-center mx-auto mb-6 text-[#012d1d] shadow-sm">
          <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#012d1d]">
            lock
          </span>
        </div>

        {/* Security / Privacy Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f4ef] border border-[#c1c8c2]/50 text-[#012d1d] text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="material-symbols-outlined text-sm text-[#2b694d]">
            verified_user
          </span>
          <span>Área Privada Protegida</span>
        </div>

        {/* Title and Description */}
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#012d1d] mb-3">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-[#414844] max-w-xl mx-auto leading-relaxed mb-8">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#012d1d] text-white font-semibold text-sm hover:bg-[#1b4332] active:scale-95 transition-all shadow-[0_4px_16px_rgba(1,45,29,0.15)] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Iniciar Sesión Segura</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#f5f4ef] hover:bg-[#e9e8e3] text-[#012d1d] font-semibold text-sm transition-colors border border-[#c1c8c2]/50"
          >
            Volver a la Página Principal
          </button>
        </div>

        {/* Data Protection Notice */}
        <div className="mt-10 pt-6 border-t border-[#efeee9] max-w-lg mx-auto flex items-center justify-center gap-2 text-xs text-[#717973]">
          <span className="material-symbols-outlined text-sm text-[#2b694d]">
            shield_lock
          </span>
          <span>
            Protocolo de Cero Exposición: tus datos y proyectos permanecen encriptados y confidenciales.
          </span>
        </div>
      </div>
    </div>
  );
};
