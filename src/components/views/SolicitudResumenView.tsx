import React from 'react';
import { ServiceRequest, AppView } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface SolicitudResumenViewProps {
  request: ServiceRequest | null;
  onNavigate: (view: AppView) => void;
  onNavigateToDesigners?: () => void;
}

export const SolicitudResumenView: React.FC<SolicitudResumenViewProps> = ({
  request,
  onNavigate,
  onNavigateToDesigners,
}) => {
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  if (!request) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-20 text-center">
        <h2 className="font-headline text-2xl font-bold text-[#012d1d] dark:text-white mb-2">
          {isEn ? 'No active request' : 'No hay solicitud activa'}
        </h2>
        <p className="text-xs text-[#717973] dark:text-[#a0a5a1] mb-6">
          {isEn ? 'Explore our designers and request an upcycling service.' : 'Explora nuestros diseñadores y solicita un servicio de upcycling.'}
        </p>
        <button
          onClick={onNavigateToDesigners || (() => onNavigate('explora'))}
          className="bg-[#012d1d] text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-[#1b4332] inline-flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">design_services</span>
          <span>{isEn ? 'Go to designers' : 'Ir a los diseñadores'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-16">
      {/* Success Card Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h1 className="font-headline text-3xl font-bold text-[#012d1d] dark:text-white mb-2">
          {isEn ? 'Request Submitted Successfully!' : '¡Solicitud Enviada con Éxito!'}
        </h1>
        <p className="text-sm text-[#414844] dark:text-[#c1c8c2] max-w-md mx-auto">
          {isEn ? (
            <>We have notified <strong>{request.clientName ? 'your designer' : 'the workshop'}</strong> about your project.</>
          ) : (
            <>Hemos notificado a <strong>{request.clientName ? 'tu diseñador' : 'el taller'}</strong> sobre tu proyecto.</>
          )}
        </p>
      </div>

      {/* Summary Container */}
      <div className="bg-white dark:bg-[#0e241c] rounded-2xl p-6 md:p-8 shadow-[0_4px_16px_rgba(1,45,29,0.05)] border border-[#efeee9] dark:border-[#2b694d]/40 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#efeee9] dark:border-[#2b694d]/30">
          <div>
            <span className="text-[10px] text-[#717973] dark:text-[#a0a5a1] uppercase tracking-wider block">
              {isEn ? 'Request ID' : 'ID de Solicitud'}
            </span>
            <span className="font-mono text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc]">{request.id}</span>
          </div>
          <span className="bg-[#b0f1cc] text-[#002113] text-xs font-bold px-3 py-1 rounded-full">
            {request.status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#f5f4ef] dark:bg-[#002113]/40 p-4 rounded-xl">
            <span className="text-[11px] text-[#717973] dark:text-[#a0a5a1] block mb-1">
              {isEn ? 'Garment to transform' : 'Prenda a transformar'}
            </span>
            <h4 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white">{request.garmentTitle}</h4>
          </div>

          <div className="bg-[#f5f4ef] dark:bg-[#002113]/40 p-4 rounded-xl">
            <span className="text-[11px] text-[#717973] dark:text-[#a0a5a1] block mb-1">
              {isEn ? 'Service Type' : 'Tipo de Servicio'}
            </span>
            <h4 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white">{request.serviceType}</h4>
          </div>

          <div className="bg-[#f5f4ef] dark:bg-[#002113]/40 p-4 rounded-xl">
            <span className="text-[11px] text-[#717973] dark:text-[#a0a5a1] block mb-1">
              {isEn ? 'Proposed Budget' : 'Presupuesto Propuesto'}
            </span>
            <h4 className="font-headline font-bold text-base text-[#2b694d] dark:text-[#b0f1cc]">
              ${request.budget.toLocaleString('es-CO')} COP
            </h4>
          </div>

          <div className="bg-[#f5f4ef] dark:bg-[#002113]/40 p-4 rounded-xl">
            <span className="text-[11px] text-[#717973] dark:text-[#a0a5a1] block mb-1">
              {isEn ? 'Date of Request' : 'Fecha de Solicitud'}
            </span>
            <h4 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white">{request.createdAt}</h4>
          </div>
        </div>

        {/* Project Notes */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#012d1d] dark:text-[#b0f1cc] mb-2">
            {isEn ? 'Specified details & requirements' : 'Detalles y requerimientos especificados'}
          </h4>
          <p className="text-xs text-[#414844] dark:text-[#c1c8c2] leading-relaxed bg-[#fbfbfa] dark:bg-[#002113]/20 p-4 rounded-xl border border-[#efeee9] dark:border-[#2b694d]/30">
            {request.description}
          </p>
        </div>

        {/* Next Steps Box */}
        <div className="bg-[#b0f1cc]/25 dark:bg-[#002113]/60 rounded-xl p-5 border border-[#2b694d]/20 dark:border-[#2b694d]/40">
          <h4 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#2b694d] dark:text-[#b0f1cc] text-base">route</span>
            <span>{isEn ? 'What happens next?' : '¿Qué sigue ahora?'}</span>
          </h4>
          <ol className="text-xs text-[#414844] dark:text-[#c1c8c2] space-y-1.5 list-decimal list-inside leading-relaxed">
            {isEn ? (
              <>
                <li>The professional will review your garment details within 24 hours.</li>
                <li>You will receive a direct message to coordinate delivery or shipping.</li>
                <li>You can track the upcycling progress from your <strong>My Studio</strong> dashboard.</li>
              </>
            ) : (
              <>
                <li>El profesional revisará las especificaciones de tu prenda en menos de 24h.</li>
                <li>Recibirás un mensaje directo para coordinar la entrega o envío.</li>
                <li>Podrás seguir el progreso del suprareciclaje desde tu panel de <strong>Mi Estudio</strong>.</li>
              </>
            )}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#efeee9] dark:border-[#2b694d]/30">
          <button
            onClick={() => onNavigate('inicio')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#414844] dark:text-[#c1c8c2] hover:bg-[#efeee9] dark:hover:bg-[#2b694d]/30 transition-colors cursor-pointer"
          >
            {isEn ? 'Back to Home' : 'Volver a Inicio'}
          </button>
          <button
            onClick={() => onNavigate('mensajes')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#f5f4ef] dark:bg-[#002113]/50 text-[#012d1d] dark:text-white hover:bg-[#e3e3de] border border-[#c1c8c2]/60 dark:border-[#2b694d]/50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span>{isEn ? 'Open Messages' : 'Abrir Mensajes'}</span>
          </button>
          <button
            onClick={() => onNavigate('mi-estudio')}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#012d1d] text-white hover:bg-[#1b4332] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>{isEn ? 'View in My Studio' : 'Ver en Mi Estudio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
