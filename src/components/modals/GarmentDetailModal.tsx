import React from 'react';
import { GarmentProject } from '../../types';

interface GarmentDetailModalProps {
  garment: GarmentProject | null;
  onClose: () => void;
  onStartChat: (authorName: string, authorAvatar?: string, garmentTitle?: string) => void;
  onFindCosturero: (garment: GarmentProject) => void;
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
  garment,
  onClose,
  onStartChat,
  onFindCosturero
}) => {
  if (!garment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#012d1d]/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#c1c8c2]/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative w-full h-72 sm:h-80 bg-[#102b1e] overflow-hidden rounded-t-3xl">
          <img
            src={garment.imageUrl}
            alt={garment.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>

          {/* Type and Category Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-[#012d1d] text-[#b0f1cc] text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {garment.category}
            </span>
            <span className="bg-white/90 text-[#012d1d] text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {garment.listingType}
            </span>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs font-semibold text-[#b0f1cc] uppercase tracking-wider block">
              {garment.condition}
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
              {garment.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Metadata strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#faf9f4] border border-[#efeee9] text-xs">
            <div>
              <span className="text-[#717973] block">Talla:</span>
              <span className="font-bold text-[#012d1d] text-sm">{garment.size || 'Única'}</span>
            </div>
            <div>
              <span className="text-[#717973] block">Color:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {garment.colorHex && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300"
                    style={{ backgroundColor: garment.colorHex }}
                  />
                )}
                <span className="font-bold text-[#012d1d] text-sm">{garment.color || 'Multicolor'}</span>
              </div>
            </div>
            <div>
              <span className="text-[#717973] block">Ubicación:</span>
              <span className="font-bold text-[#012d1d] text-sm truncate block" title={garment.location}>
                {garment.municipality || garment.location.split(',')[0]}
              </span>
            </div>
            <div>
              <span className="text-[#717973] block">Presupuesto / Valor:</span>
              <span className="font-bold text-[#2b694d] text-sm">
                {garment.budget ? `$${garment.budget.toLocaleString()} COP` : 'A convenir'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-headline text-sm font-bold text-[#012d1d] uppercase tracking-wider">
              Descripción de la prenda
            </h3>
            <p className="text-sm text-[#414844] leading-relaxed">
              {garment.description}
            </p>
          </div>

          {/* Proposed Modifications */}
          {garment.modifications && (
            <div className="p-4 rounded-2xl bg-[#b0f1cc]/20 border border-[#b0f1cc]/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002113]">
                <span className="material-symbols-outlined text-base">content_cut</span>
                <span>Transformación propuesta o upcycling deseado:</span>
              </div>
              <p className="text-xs text-[#012d1d] leading-relaxed pl-6">
                {garment.modifications}
              </p>
            </div>
          )}

          {/* Author Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf9f4] border border-[#efeee9]">
            <div className="flex items-center gap-3">
              <img
                src={garment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={garment.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <p className="text-xs text-[#717973]">Publicado por</p>
                <p className="text-sm font-bold text-[#012d1d]">{garment.authorName}</p>
                <p className="text-[11px] text-[#2b694d]">{garment.location}</p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onStartChat(garment.authorName, garment.authorAvatar, garment.title);
              }}
              className="px-4 py-2 bg-white hover:bg-[#efeee9] text-[#012d1d] border border-[#c1c8c2] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              <span>Escribir</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onStartChat(garment.authorName, garment.authorAvatar, garment.title);
              }}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">chat_bubble</span>
              <span>Iniciar conversación sobre esta prenda</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onFindCosturero(garment);
              }}
              className="py-3.5 px-6 rounded-2xl bg-[#faf9f4] hover:bg-[#efeee9] text-[#012d1d] border border-[#c1c8c2] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
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
