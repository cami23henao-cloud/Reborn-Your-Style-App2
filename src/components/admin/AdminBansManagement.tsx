import React, { useState } from 'react';
import { StoredUserAccount } from '../../services/userStore';

interface AdminBansManagementProps {
  users: StoredUserAccount[];
  onUnblockUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  onBlockUser: (userId: string, reason: string, days?: number) => void;
  onBanUser: (userId: string, reason: string) => void;
}

export const AdminBansManagement: React.FC<AdminBansManagementProps> = ({
  users,
  onUnblockUser,
  onUnbanUser,
  onBlockUser,
  onBanUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'todos' | 'bloqueados' | 'baneados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for new sanction
  const [selectedUserToSanction, setSelectedUserToSanction] = useState<StoredUserAccount | null>(null);
  const [sanctionType, setSanctionType] = useState<'bloqueo' | 'baneo'>('bloqueo');
  const [sanctionReason, setSanctionReason] = useState('');
  const [sanctionDays, setSanctionDays] = useState<number>(7);

  // Detail / history modal
  const [userForHistory, setUserForHistory] = useState<StoredUserAccount | null>(null);

  // Sanctioned users
  const sanctionedUsers = users.filter((u) => {
    const status = u.profile.accountStatus;
    const isSanctioned = status === 'bloqueado' || status === 'suspendido' || status === 'baneado';
    if (!isSanctioned) return false;

    if (activeSubTab === 'bloqueados') {
      return status === 'bloqueado' || status === 'suspendido';
    }
    if (activeSubTab === 'baneados') {
      return status === 'baneado';
    }
    return true;
  }).filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  // Non-sanctioned users for "Aplicar Nueva Sanción" selector
  const activeEligibleUsers = users.filter((u) => {
    const status = u.profile.accountStatus;
    return u.role !== 'admin' && (!status || status === 'activo');
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with New Sanction Trigger */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a]">gavel</span>
            <span>Sistema de Baneos y Bloqueos de Cuentas</span>
          </h2>
          <p className="text-xs text-[#717973]">
            Monitoreo y administración de usuarios suspendidos temporalmente o vetados permanentemente.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeEligibleUsers.length > 0) {
              setSelectedUserToSanction(activeEligibleUsers[0]);
              setSanctionReason('');
            }
          }}
          disabled={activeEligibleUsers.length === 0}
          className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">person_off</span>
          <span>Aplicar Nueva Sanción</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-[#f5f4ef] p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'todos'
                ? 'bg-white text-[#012d1d] shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d]'
            }`}
          >
            Todos Sancionados ({users.filter((u) => u.profile.accountStatus === 'bloqueado' || u.profile.accountStatus === 'suspendido' || u.profile.accountStatus === 'baneado').length})
          </button>
          <button
            onClick={() => setActiveSubTab('bloqueados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'bloqueados'
                ? 'bg-white text-[#934b00] shadow-xs'
                : 'text-[#414844] hover:text-[#934b00]'
            }`}
          >
            Bloqueos Temporales ({users.filter((u) => u.profile.accountStatus === 'bloqueado' || u.profile.accountStatus === 'suspendido').length})
          </button>
          <button
            onClick={() => setActiveSubTab('baneados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'baneados'
                ? 'bg-white text-[#ba1a1a] shadow-xs'
                : 'text-[#414844] hover:text-[#ba1a1a]'
            }`}
          >
            Baneados Permanentes ({users.filter((u) => u.profile.accountStatus === 'baneado').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nombre o correo..."
            className="w-full bg-white border border-[#c1c8c2]/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1b1c19] outline-none focus:border-[#012d1d]"
          />
        </div>
      </div>

      {/* Sanctions List */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/50 shadow-xs overflow-hidden">
        {sanctionedUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f5fbf7] text-[#2b694d] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#012d1d]">
              No hay cuentas sancionadas en esta sección
            </h3>
            <p className="text-xs text-[#717973] max-w-sm mx-auto">
              La comunidad mantiene un alto estándar de cumplimiento normativo y respeto mutuo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#efeee9]">
            {sanctionedUsers.map((u) => {
              const isBanned = u.profile.accountStatus === 'baneado';
              const reason = isBanned ? u.profile.banReason : (u.profile.blockReason || u.profile.suspensionReason);
              const history = u.profile.moderationHistory || [];

              return (
                <div key={u.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#faf9f4]/60 transition-colors">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#012d1d]">{u.name}</span>
                      <span className="text-xs text-[#717973]">({u.email})</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isBanned ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#ffdcc1] text-[#934b00]'
                      }`}>
                        {isBanned ? 'Baneo Permanente' : 'Bloqueo Temporal'}
                      </span>
                    </div>

                    <p className="text-xs text-[#414844] flex items-center gap-1">
                      <span className="font-bold text-[#012d1d]">Motivo registrado:</span>
                      <span>{reason || 'Infracción de normas de convivencia y comercio textil'}</span>
                    </p>

                    {u.profile.suspendedUntil && (
                      <p className="text-[11px] text-[#934b00]">
                        Expira el: {new Date(u.profile.suspendedUntil).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {/* View History */}
                    <button
                      onClick={() => setUserForHistory(u)}
                      className="px-3 py-1.5 rounded-xl border border-[#c1c8c2] hover:bg-[#efeee9] text-xs font-semibold text-[#012d1d] transition-colors"
                    >
                      Historial ({history.length})
                    </button>

                    {/* Unblock / Unban */}
                    {isBanned ? (
                      <button
                        onClick={() => onUnbanUser(u.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#2b694d] hover:bg-[#012d1d] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">person_check</span>
                        <span>Desbanear Cuenta</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnblockUser(u.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#2b694d] hover:bg-[#012d1d] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                        <span>Desbloquear Cuenta</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: APLICAR NUEVA SANCIÓN */}
      {selectedUserToSanction && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <h3 className="font-headline font-bold text-lg text-[#012d1d]">
              Aplicar Sanción a Usuario
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Seleccionar Usuario</label>
                <select
                  value={selectedUserToSanction.id}
                  onChange={(e) => {
                    const found = users.find((u) => u.id === e.target.value);
                    if (found) setSelectedUserToSanction(found);
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                >
                  {activeEligibleUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Tipo de Medida</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSanctionType('bloqueo')}
                    className={`py-2 rounded-xl font-bold transition-colors ${
                      sanctionType === 'bloqueo'
                        ? 'bg-[#934b00] text-white'
                        : 'bg-[#f5f4ef] text-[#414844]'
                    }`}
                  >
                    Bloqueo Temporal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSanctionType('baneo')}
                    className={`py-2 rounded-xl font-bold transition-colors ${
                      sanctionType === 'baneo'
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#f5f4ef] text-[#414844]'
                    }`}
                  >
                    Baneo Permanente
                  </button>
                </div>
              </div>

              {sanctionType === 'bloqueo' && (
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Duración del Bloqueo</label>
                  <select
                    value={sanctionDays}
                    onChange={(e) => setSanctionDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
                  >
                    <option value={3}>3 días</option>
                    <option value={7}>7 días (1 semana)</option>
                    <option value={15}>15 días</option>
                    <option value={30}>30 días (1 mes)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Motivo Justificado</label>
                <textarea
                  value={sanctionReason}
                  onChange={(e) => setSanctionReason(e.target.value)}
                  placeholder="Describe la razón detallada de la sanción..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setSelectedUserToSanction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!sanctionReason.trim()}
                onClick={() => {
                  if (sanctionType === 'bloqueo') {
                    onBlockUser(selectedUserToSanction.id, sanctionReason, sanctionDays);
                  } else {
                    onBanUser(selectedUserToSanction.id, sanctionReason);
                  }
                  setSelectedUserToSanction(null);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 ${
                  sanctionType === 'baneo' ? 'bg-[#ba1a1a] hover:bg-[#93000a]' : 'bg-[#934b00] hover:bg-[#733b00]'
                }`}
              >
                Confirmar Sanción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIAL DE MODERACIÓN */}
      {userForHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <h3 className="font-headline font-bold text-lg text-[#012d1d]">
              Historial de Moderación: {userForHistory.name}
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(userForHistory.profile.moderationHistory || []).length === 0 ? (
                <p className="text-xs text-[#717973] p-4 text-center">
                  No hay registros en el historial de moderación.
                </p>
              ) : (
                (userForHistory.profile.moderationHistory || []).map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#faf9f4] border border-[#efeee9] text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#012d1d]">
                      <span className="capitalize">{m.action}</span>
                      <span className="text-[10px] text-[#717973]">{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[#414844]">{m.reason}</p>
                    <p className="text-[10px] text-[#717973]">Por: {m.adminName}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setUserForHistory(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#012d1d] text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
