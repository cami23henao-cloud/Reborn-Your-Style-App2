import React from 'react';
import { GarmentProject, Professional } from '../../types';

interface GarmentDetailModalProps {
  garment: GarmentProject | null;
  onClose: () => void;
  onStartChat: (authorName: string, authorAvatar?: string, garmentTitle?: string) => void;
  onFindCosturero: (garment: GarmentProject) => void;
  professionals?: Professional[];
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
  garment,
  onClose,
  onStartChat,
  onFindCosturero,
  professionals = []
}) => {
  if (!garment) return null;

  // Resolve assigned or recommended tailor
  const assignedTailor: Professional | undefined = professionals.find(
    (p) => p.id === garment.assignedTailorId || p.name.toLowerCase() === garment.assignedTailorName?.toLowerCase()
  );

  const cleanLocation =
    garment.publicLocation ||
    garment.municipality ||
    (garment.department ? `${garment.municipality || ''}, ${garment.department}` : garment.location.split(',')[0]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0e241c] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 flex flex-col relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* HEADER WITH REAL GARMENT PHOTOGRAPH & ACCESSIBLE CONTRAST CLOSE X */}
        {/* ================================================================= */}
        <div className="relative w-full h-72 sm:h-84 bg-[#102b1e] overflow-hidden rounded-t-3xl shrink-0">
          <img
            src={garment.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80'}
            alt={garment.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* CLOSE "X" BUTTON: Clearly visible, high-contrast, top-right, easy to click */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Cerrar detalles de la prenda"
            className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Cerrar ventana"
          >
            <span className="material-symbols-outlined text-2xl font-bold">close</span>
          </button>

          {/* Badges: Category & Listing Type */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="bg-[#012d1d] text-[#b0f1cc] text-xs font-bold px-3 py-1 rounded-full shadow-md border border-[#b0f1cc]/30">
              {garment.category}
            </span>
            <span className="bg-white/95 dark:bg-[#071510]/95 text-[#012d1d] dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {garment.listingType}
            </span>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 left-5 right-5 text-white z-10">
            <span className="text-xs font-bold text-[#b0f1cc] uppercase tracking-wider block drop-shadow-sm">
              {garment.condition}
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-black leading-tight drop-shadow-md">
              {garment.title}
            </h2>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CONTENT BODY: Clean & Professional Distribution                   */}
        {/* ================================================================= */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Metadata Strip: Talla, Color, Ubicación, Presupuesto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-xs">
            <div>
              <span className="text-[#717973] dark:text-[#a7b8ae] block font-medium">Talla:</span>
              <span className="font-bold text-[#012d1d] dark:text-white text-sm">{garment.size || 'Única'}</span>
            </div>
            <div>
              <span className="text-[#717973] dark:text-[#a7b8ae] block font-medium">Color:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {garment.colorHex && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-2xs"
                    style={{ backgroundColor: garment.colorHex }}
                  />
                )}
                <span className="font-bold text-[#012d1d] dark:text-white text-sm truncate">{garment.color || 'Multicolor'}</span>
              </div>
            </div>
            <div>
              <span className="text-[#717973] dark:text-[#a7b8ae] block font-medium">Ubicación:</span>
              <span className="font-bold text-[#012d1d] dark:text-white text-sm truncate block" title={cleanLocation}>
                {cleanLocation}
              </span>
            </div>
            <div>
              <span className="text-[#717973] dark:text-[#a7b8ae] block font-medium">Precio / Presupuesto:</span>
              <span className="font-bold text-[#2b694d] dark:text-[#b0f1cc] text-sm">
                {garment.budget ? `$${garment.budget.toLocaleString('es-CO')} COP` : 'A convenir'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-headline text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] uppercase tracking-wider">
              Descripción de la prenda
            </h3>
            <p className="text-sm text-[#414844] dark:text-[#e8f2ec] leading-relaxed">
              {garment.description}
            </p>
          </div>

          {/* Proposed Modifications / Upcycling */}
          {garment.modifications && (
            <div className="p-4 rounded-2xl bg-[#b0f1cc]/20 dark:bg-[#112920] border border-[#b0f1cc]/60 dark:border-[#2b694d]/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002113] dark:text-[#b0f1cc]">
                <span className="material-symbols-outlined text-base">content_cut</span>
                <span>Transformación propuesta o upcycling deseado:</span>
              </div>
              <p className="text-xs sm:text-sm text-[#012d1d] dark:text-[#e8f2ec] leading-relaxed pl-6">
                {garment.modifications}
              </p>
            </div>
          )}

          {/* Tailor / Designer Information when applicable */}
          {(assignedTailor || garment.assignedTailorName) && (
            <div className="p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={assignedTailor?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'}
                  alt={assignedTailor?.name || garment.assignedTailorName}
                  className="w-12 h-12 rounded-xl object-cover border border-[#2b694d]/30 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc] block">
                    Costurero / Diseñador asignado
                  </span>
                  <p className="text-sm font-bold text-[#012d1d] dark:text-white">
                    {assignedTailor?.name || garment.assignedTailorName}
                  </p>
                  <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">
                    {assignedTailor?.specialty || 'Especialista en Confección y Upcycling Textil'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFindCosturero(garment);
                }}
                className="px-4 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-center cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Ver perfil del costurero</span>
              </button>
            </div>
          )}

          {/* Publisher Card: Removed duplicate "Escribir" button per Requirement 6 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30">
            <div className="flex items-center gap-3">
              <img
                src={garment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={garment.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#0e241c] shadow-xs"
              />
              <div>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">Publicado por</p>
                <p className="text-sm font-bold text-[#012d1d] dark:text-white">{garment.authorName}</p>
                <p className="text-xs text-[#2b694d] dark:text-[#b0f1cc] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">place</span>
                  <span>{cleanLocation}</span>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-[#717973] dark:text-[#a7b8ae] bg-white dark:bg-[#0e241c] px-3 py-1.5 rounded-full border border-[#efeee9] dark:border-[#2b694d]/30">
              {garment.createdAt || 'Publicada recientemente'}
            </span>
          </div>

          {/* Action CTAs: Iniciar conversación & Encontrar costurero asignado */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onStartChat(garment.authorName, garment.authorAvatar, garment.title);
              }}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#b0f1cc]">chat_bubble</span>
              <span>Iniciar conversación sobre esta prenda</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onFindCosturero(garment);
              }}
              className="py-3.5 px-6 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] dark:hover:bg-[#17382c] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2] dark:border-[#2b694d]/40 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">person_search</span>
              <span>Encontrar costurero</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
