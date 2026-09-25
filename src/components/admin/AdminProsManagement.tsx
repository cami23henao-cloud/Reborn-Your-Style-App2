import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import { StoredUserAccount } from '../../services/userStore';

interface AdminProsManagementProps {
  users: StoredUserAccount[];
  services: ServiceItem[];
  onToggleVerification: (userId: string, currentStatus: boolean) => void;
  onApproveService?: (id: string) => void;
  onDeleteService?: (id: string) => void;
}

export const AdminProsManagement: React.FC<AdminProsManagementProps> = ({
  users,
  services,
  onToggleVerification,
  onApproveService,
  onDeleteService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // Professional users
  const pros = users.filter((u) => u.role === 'profesional').filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2b694d]">handyman</span>
            <span>Gestión de Costureros & Modificadores de Ropa</span>
          </h2>
          <p className="text-xs text-[#717973]">
            Auditoría técnica de talleres, aprobación de servicios de confección y verificación de artesanos.
          </p>
        </div>

        <span className="text-xs font-bold text-[#012d1d] bg-[#b0f1cc]/40 border border-[#2b694d]/20 px-3 py-1.5 rounded-xl">
          {pros.length} talleres registrados • {services.length} servicios ofertados
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar taller por nombre o correo..."
          className="w-full bg-white border border-[#c1c8c2]/70 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1b1c19] outline-none focus:border-[#012d1d]"
        />
      </div>

      {/* Pros Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pros.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50">
            <span className="material-symbols-outlined text-4xl text-[#717973] mb-2">
              handyman
            </span>
            <p className="text-xs text-[#717973]">No hay talleres registrados o coincidentes.</p>
          </div>
        ) : (
          pros.map((p) => {
            const isVerified = !!p.profile.isVerifiedWorkshop;
            const proServices = services.filter((s) => s.artisanName === p.name);

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center font-bold text-base shrink-0">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-sm text-[#012d1d] flex items-center gap-1">
                          <span>{p.name}</span>
                          {isVerified && (
                            <span className="material-symbols-outlined text-sm text-[#2b694d]" title="Taller Verificado">
                              verified
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-[#717973]">{p.email}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isVerified ? 'bg-[#b0f1cc] text-[#002113]' : 'bg-[#f5f4ef] text-[#717973]'
                    }`}>
                      {isVerified ? 'Verificado' : 'Estándar'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 bg-[#faf9f4] p-3 rounded-2xl border border-[#efeee9]">
                    <div className="flex justify-between">
                      <span className="text-[#717973]">Ubicación</span>
                      <span className="font-semibold text-[#012d1d]">
                        {p.profile.location || 'Colombia'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#717973]">Teléfono Taller</span>
                      <span className="font-semibold text-[#012d1d]">
                        {p.profile.phone || 'No registrado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#717973]">Servicios activos</span>
                      <span className="font-bold text-[#2b694d]">{proServices.length} en catálogo</span>
                    </div>
                  </div>

                  {p.profile.bio && (
                    <p className="text-xs text-[#414844] line-clamp-2">
                      {p.profile.bio}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onToggleVerification(p.id, isVerified)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                      isVerified
                        ? 'bg-[#efeee9] text-[#717973] hover:bg-[#ffdad6] hover:text-[#ba1a1a]'
                        : 'bg-[#012d1d] hover:bg-[#2b694d] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isVerified ? 'close' : 'verified'}
                    </span>
                    <span>{isVerified ? 'Revocar Verificación' : 'Verificar Taller Oficial'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Services List for Technical Review */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
        <h3 className="font-headline font-bold text-base text-[#012d1d] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2b694d]">palette</span>
          <span>Catálogo de Servicios y Técnicas de Personalización</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl bg-[#faf9f4] border border-[#efeee9] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={s.imageUrl} alt={s.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#012d1d] truncate">{s.title}</p>
                  <p className="text-[11px] text-[#717973] truncate">Taller: {s.artisanName}</p>
                  <span className="text-[10px] font-bold text-[#2b694d]">${s.price?.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onApproveService && (
                  <button
                    onClick={() => onApproveService(s.id)}
                    className="p-1.5 rounded-lg text-[#2b694d] hover:bg-[#b0f1cc]/40"
                    title="Aprobar servicio"
                  >
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </button>
                )}
                <button
                  onClick={() => setServiceToDelete(s)}
                  className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]"
                  title="Dar de baja servicio"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONFIRM DELETE SERVICE */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">delete</span>
              <h3 className="font-headline font-bold text-lg text-[#ba1a1a]">
                Dar de Baja Servicio
              </h3>
            </div>
            <p className="text-xs text-[#414844]">
              ¿Confirmas dar de baja el servicio <strong>"{serviceToDelete.title}"</strong> de {serviceToDelete.artisanName}?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDeleteService) onDeleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ba1a1a] text-white hover:bg-[#93000a]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
