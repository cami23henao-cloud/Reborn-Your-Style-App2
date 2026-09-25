import React, { useState } from 'react';
import { GarmentProject } from '../../types';

interface AdminPostsManagementProps {
  garments: GarmentProject[];
  onApproveGarment?: (id: string) => void;
  onDeleteGarment?: (id: string) => void;
  onToggleHideGarment?: (id: string, currentlyHidden: boolean) => void;
}

export const AdminPostsManagement: React.FC<AdminPostsManagementProps> = ({
  garments,
  onApproveGarment,
  onDeleteGarment,
  onToggleHideGarment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'Publicada' | 'En revisión' | 'Oculta'>('todas');
  const [selectedGarmentForDetail, setSelectedGarmentForDetail] = useState<GarmentProject | null>(null);
  const [garmentToDelete, setGarmentToDelete] = useState<GarmentProject | null>(null);

  const filteredGarments = garments.filter((g) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      (g.authorName && g.authorName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'todas' || g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2b694d]">styler</span>
            <span>Gestión de Publicaciones y Prendas</span>
          </h2>
          <p className="text-xs text-[#717973]">
            Curaduría, aprobación, visualización detallada y moderación del catálogo textil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#012d1d] bg-[#b0f1cc]/40 border border-[#2b694d]/20 px-3 py-1.5 rounded-xl">
            {garments.length} prendas totales en base de datos
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-[#f5f4ef] p-1 rounded-xl">
          {(['todas', 'Publicada', 'En revisión', 'Oculta'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                statusFilter === st
                  ? 'bg-white text-[#012d1d] shadow-xs'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, categoría o autor..."
            className="w-full bg-white border border-[#c1c8c2]/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1b1c19] outline-none focus:border-[#012d1d]"
          />
        </div>
      </div>

      {/* Garments Grid */}
      {filteredGarments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50">
          <span className="material-symbols-outlined text-4xl text-[#717973] mb-2">
            inventory_2
          </span>
          <p className="text-xs text-[#717973]">No se encontraron publicaciones con estos criterios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGarments.map((g) => {
            const isApproved = g.status === 'Publicada' || g.status === 'Completado';
            const isHidden = g.status === 'Oculta';

            return (
              <div
                key={g.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#c1c8c2]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full relative bg-[#efeee9] overflow-hidden">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#012d1d] text-white">
                        {g.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isHidden
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : isApproved
                          ? 'bg-[#b0f1cc] text-[#002113]'
                          : 'bg-[#ffdcc1] text-[#934b00]'
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {isHidden ? 'visibility_off' : isApproved ? 'check_circle' : 'pending'}
                        </span>
                        <span>{g.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#012d1d] truncate">
                        Por: {g.authorName || 'Cliente Particular'}
                      </span>
                      <span className="text-[#717973] text-[10px]">{g.listingType}</span>
                    </div>

                    <h3 className="font-headline font-bold text-base text-[#012d1d] line-clamp-1">
                      {g.title}
                    </h3>

                    <p className="text-xs text-[#414844] line-clamp-2 leading-relaxed">
                      {g.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#efeee9]">
                      <span className="text-[#717973]">Presupuesto / Valor</span>
                      <span className="font-bold text-[#012d1d]">
                        ${g.budget?.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="p-4 bg-[#faf9f4] border-t border-[#c1c8c2]/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* View full details */}
                    <button
                      onClick={() => setSelectedGarmentForDetail(g)}
                      className="p-1.5 rounded-xl hover:bg-[#efeee9] text-[#012d1d] transition-colors"
                      title="Ver ficha técnica completa"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setGarmentToDelete(g)}
                      className="p-1.5 rounded-xl hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"
                      title="Eliminar publicación"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Hide / Unhide */}
                    {onToggleHideGarment && (
                      <button
                        onClick={() => onToggleHideGarment(g.id, isHidden)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#414844] hover:bg-[#efeee9] rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isHidden ? 'visibility' : 'visibility_off'}
                        </span>
                        <span>{isHidden ? 'Mostrar' : 'Ocultar'}</span>
                      </button>
                    )}

                    {/* Approve */}
                    {!isApproved && onApproveGarment && (
                      <button
                        onClick={() => onApproveGarment(g.id)}
                        className="px-3 py-1 bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Aprobar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedGarmentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#efeee9] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                Ficha Técnica de Moderación
              </h3>
              <button
                onClick={() => setSelectedGarmentForDetail(null)}
                className="p-1 rounded-full text-[#717973] hover:text-[#012d1d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="h-64 w-full rounded-2xl overflow-hidden bg-[#efeee9]">
              <img
                src={selectedGarmentForDetail.imageUrl}
                alt={selectedGarmentForDetail.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full bg-[#012d1d] text-white font-bold text-[10px]">
                  {selectedGarmentForDetail.category}
                </span>
                <span className="font-bold text-[#012d1d]">
                  ${selectedGarmentForDetail.budget?.toLocaleString('es-CO')} COP
                </span>
              </div>

              <h4 className="font-headline font-bold text-base text-[#012d1d]">
                {selectedGarmentForDetail.title}
              </h4>

              <p className="text-[#414844] leading-relaxed">
                {selectedGarmentForDetail.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#faf9f4] p-3 rounded-xl border border-[#efeee9] mt-3">
                <div>
                  <span className="text-[#717973] block text-[10px]">Autor</span>
                  <span className="font-bold text-[#012d1d]">{selectedGarmentForDetail.authorName}</span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px]">Modalidad</span>
                  <span className="font-bold text-[#012d1d]">{selectedGarmentForDetail.listingType}</span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px]">Condición</span>
                  <span className="font-bold text-[#012d1d]">{selectedGarmentForDetail.condition}</span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px]">Talla</span>
                  <span className="font-bold text-[#012d1d]">{selectedGarmentForDetail.size}</span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px]">Color</span>
                  <span className="font-bold text-[#012d1d]">{selectedGarmentForDetail.color}</span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px]">Estado</span>
                  <span className="font-bold text-[#012d1d]">{selectedGarmentForDetail.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#efeee9]">
              <button
                onClick={() => setSelectedGarmentForDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {garmentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#ba1a1a]">
                  Eliminar Publicación
                </h3>
                <p className="text-[11px] text-[#717973]">Acción de moderación</p>
              </div>
            </div>
            <p className="text-xs text-[#414844] leading-relaxed">
              ¿Confirmas la eliminación definitiva de la prenda <strong>"{garmentToDelete.title}"</strong> publicada por {garmentToDelete.authorName}?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setGarmentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteGarment) onDeleteGarment(garmentToDelete.id);
                  setGarmentToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ba1a1a] text-white hover:bg-[#93000a]"
              >
                Sí, Eliminar Publicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
