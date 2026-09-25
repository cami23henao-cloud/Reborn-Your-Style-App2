import React, { useState } from 'react';
import { StoredUserAccount } from '../../services/userStore';
import { GarmentProject, ServiceItem } from '../../types';

interface AdminUsersManagementProps {
  users: StoredUserAccount[];
  garments: GarmentProject[];
  services: ServiceItem[];
  adminEmail: string;
  onRefreshUsers: () => void;
  onBlockUser: (userId: string, reason: string, days?: number) => void;
  onUnblockUser: (userId: string) => void;
  onBanUser: (userId: string, reason: string) => void;
  onUnbanUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onSendWarning: (userId: string, level: 'leve' | 'moderada' | 'grave', reason: string, details?: string) => void;
  onUpdateUser: (userId: string, updates: { name?: string; email?: string; bio?: string; phone?: string; location?: string; role?: 'cliente' | 'profesional' }) => void;
}

export const AdminUsersManagement: React.FC<AdminUsersManagementProps> = ({
  users,
  garments,
  services,
  adminEmail,
  onRefreshUsers,
  onBlockUser,
  onUnblockUser,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
  onSendWarning,
  onUpdateUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | 'cliente' | 'profesional'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'bloqueado' | 'baneado'>('todos');

  // Modals state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<StoredUserAccount | null>(null);
  const [userToEdit, setUserToEdit] = useState<StoredUserAccount | null>(null);
  const [userToWarn, setUserToWarn] = useState<StoredUserAccount | null>(null);
  const [userToBlock, setUserToBlock] = useState<StoredUserAccount | null>(null);
  const [userToBan, setUserToBan] = useState<StoredUserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<StoredUserAccount | null>(null);

  // Form states
  const [warningLevel, setWarningLevel] = useState<'leve' | 'moderada' | 'grave'>('leve');
  const [warningReason, setWarningReason] = useState('');
  const [warningDetails, setWarningDetails] = useState('');

  const [blockReason, setBlockReason] = useState('');
  const [blockDays, setBlockDays] = useState<number>(7);

  const [banReason, setBanReason] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'cliente' | 'profesional'>('cliente');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBio, setEditBio] = useState('');

  // Filtering
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.profile.phone && u.profile.phone.toLowerCase().includes(q)) ||
      (u.profile.location && u.profile.location.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;

    const userStatus = u.profile.accountStatus || 'activo';
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'activo' && userStatus === 'activo') ||
      (statusFilter === 'bloqueado' && (userStatus === 'bloqueado' || userStatus === 'suspendido')) ||
      (statusFilter === 'baneado' && userStatus === 'baneado');

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenEdit = (user: StoredUserAccount) => {
    setUserToEdit(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role === 'profesional' ? 'profesional' : 'cliente');
    setEditPhone(user.profile.phone || '');
    setEditLocation(user.profile.location || '');
    setEditBio(user.profile.bio || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    onUpdateUser(userToEdit.id, {
      name: editName,
      email: editEmail,
      role: editRole,
      phone: editPhone,
      location: editLocation,
      bio: editBio,
    });
    setUserToEdit(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div>
            <h2 className="font-headline font-bold text-xl text-[#012d1d]">
              Directorio y Gestión de Usuarios
            </h2>
            <p className="text-xs text-[#717973]">
              Administra cuentas, roles, advertencias y sanciones de forma centralizada y segura.
            </p>
          </div>

          <span className="text-xs font-bold text-[#2b694d] bg-[#f5fbf7] border border-[#2b694d]/30 px-3 py-1.5 rounded-xl self-start md:self-auto">
            {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, correo, ciudad o teléfono..."
              className="w-full bg-[#f5f4ef] border border-[#c1c8c2]/70 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#1b1c19] outline-none focus:bg-white focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] transition-all"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full bg-[#f5f4ef] border border-[#c1c8c2]/70 rounded-xl px-3 py-2.5 text-xs text-[#1b1c19] outline-none focus:bg-white focus:border-[#012d1d] cursor-pointer"
            >
              <option value="todos">Todos los roles</option>
              <option value="cliente">Clientes particulares</option>
              <option value="profesional">Costureros & Modistas</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#f5f4ef] border border-[#c1c8c2]/70 rounded-xl px-3 py-2.5 text-xs text-[#1b1c19] outline-none focus:bg-white focus:border-[#012d1d] cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo Activos</option>
              <option value="bloqueado">Solo Bloqueados</option>
              <option value="baneado">Solo Baneados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f4] border-b border-[#efeee9] text-[#717973] uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol & Tipo</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Publicaciones</th>
                <th className="px-6 py-4">Advertencias</th>
                <th className="px-6 py-4 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeee9]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#717973]">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCosturero = u.role === 'profesional';
                  const userGarments = garments.filter((g) => g.authorName === u.name);
                  const userServices = services.filter((s) => s.artisanName === u.name);
                  const status = u.profile.accountStatus || 'activo';
                  const warnings = u.profile.warnings || [];

                  return (
                    <tr key={u.id} className="hover:bg-[#faf9f4]/60 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center font-bold shrink-0">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#012d1d] truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.profile.isVerifiedWorkshop && (
                                <span className="material-symbols-outlined text-xs text-[#2b694d]" title="Taller Verificado">
                                  verified
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#717973] truncate">{u.email}</p>
                            {u.profile.location && (
                              <p className="text-[10px] text-[#717973]">{u.profile.location}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isCosturero
                            ? 'bg-[#b0f1cc] text-[#002113]'
                            : 'bg-[#f5f4ef] text-[#414844]'
                        }`}>
                          <span className="material-symbols-outlined text-xs">
                            {isCosturero ? 'handyman' : 'person'}
                          </span>
                          <span>{isCosturero ? 'Costurero / Modista' : 'Cliente'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          status === 'baneado'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : status === 'bloqueado' || status === 'suspendido'
                            ? 'bg-[#ffdcc1] text-[#934b00]'
                            : 'bg-[#b0f1cc]/70 text-[#002113]'
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      </td>

                      {/* Garments / Services Count */}
                      <td className="px-6 py-4 whitespace-nowrap text-[#414844]">
                        {isCosturero ? (
                          <span>{userServices.length} servicios en taller</span>
                        ) : (
                          <span>{userGarments.length} prendas</span>
                        )}
                      </td>

                      {/* Warnings */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {warnings.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#ffdcc1] text-[#934b00] font-bold text-[10px]">
                            {warnings.length} advertencia(s)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#717973]">Sin infracciones</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-1">
                        {/* Detail */}
                        <button
                          onClick={() => setSelectedUserForDetail(u)}
                          className="p-1.5 rounded-lg text-[#012d1d] hover:bg-[#efeee9] transition-colors inline-block"
                          title="Ver perfil completo y actividad"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-[#2b694d] hover:bg-[#b0f1cc]/30 transition-colors inline-block"
                          title="Editar información del usuario"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>

                        {/* Warning */}
                        <button
                          onClick={() => {
                            setUserToWarn(u);
                            setWarningReason('');
                            setWarningDetails('');
                          }}
                          className="p-1.5 rounded-lg text-[#934b00] hover:bg-[#ffdcc1] transition-colors inline-block"
                          title="Enviar advertencia formal"
                        >
                          <span className="material-symbols-outlined text-base">warning</span>
                        </button>

                        {/* Block / Unblock */}
                        {status === 'bloqueado' || status === 'suspendido' ? (
                          <button
                            onClick={() => onUnblockUser(u.id)}
                            className="p-1.5 rounded-lg text-[#2b694d] hover:bg-[#b0f1cc]/30 transition-colors inline-block"
                            title="Desbloquear usuario"
                          >
                            <span className="material-symbols-outlined text-base">lock_open</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUserToBlock(u);
                              setBlockReason('');
                            }}
                            className="p-1.5 rounded-lg text-[#934b00] hover:bg-[#ffdcc1] transition-colors inline-block"
                            title="Bloquear temporalmente"
                          >
                            <span className="material-symbols-outlined text-base">lock</span>
                          </button>
                        )}

                        {/* Ban / Unban */}
                        {status === 'baneado' ? (
                          <button
                            onClick={() => onUnbanUser(u.id)}
                            className="p-1.5 rounded-lg text-[#2b694d] hover:bg-[#b0f1cc]/30 transition-colors inline-block"
                            title="Desbanear usuario"
                          >
                            <span className="material-symbols-outlined text-base">person_check</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUserToBan(u);
                              setBanReason('');
                            }}
                            className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors inline-block"
                            title="Banear permanentemente"
                          >
                            <span className="material-symbols-outlined text-base">gavel</span>
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors inline-block"
                          title="Eliminar cuenta de la plataforma"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: DETALLE COMPLETO DEL USUARIO --- */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#efeee9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center font-bold text-lg">
                  {selectedUserForDetail.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-[#012d1d]">
                    {selectedUserForDetail.name}
                  </h3>
                  <p className="text-xs text-[#717973]">{selectedUserForDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="p-1.5 rounded-full text-[#717973] hover:text-[#012d1d] hover:bg-[#efeee9]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-[#faf9f4] p-4 rounded-2xl border border-[#efeee9]">
              <div>
                <span className="text-[#717973] block">Rol</span>
                <span className="font-bold text-[#012d1d] capitalize">{selectedUserForDetail.role}</span>
              </div>
              <div>
                <span className="text-[#717973] block">Estado</span>
                <span className="font-bold text-[#ba1a1a] capitalize">
                  {selectedUserForDetail.profile.accountStatus || 'activo'}
                </span>
              </div>
              <div>
                <span className="text-[#717973] block">Ubicación</span>
                <span className="font-bold text-[#012d1d]">
                  {selectedUserForDetail.profile.location || 'No especificada'}
                </span>
              </div>
              <div>
                <span className="text-[#717973] block">Teléfono</span>
                <span className="font-bold text-[#012d1d]">
                  {selectedUserForDetail.profile.phone || 'No registrado'}
                </span>
              </div>
              <div>
                <span className="text-[#717973] block">Fecha de Registro</span>
                <span className="font-bold text-[#012d1d]">
                  {selectedUserForDetail.createdAt ? new Date(selectedUserForDetail.createdAt).toLocaleDateString() : 'Activa'}
                </span>
              </div>
              <div>
                <span className="text-[#717973] block">Taller Verificado</span>
                <span className="font-bold text-[#012d1d]">
                  {selectedUserForDetail.profile.isVerifiedWorkshop ? 'Sí (Verificado)' : 'No'}
                </span>
              </div>
            </div>

            {/* User Bio */}
            {selectedUserForDetail.profile.bio && (
              <div className="text-xs space-y-1">
                <span className="text-[#717973] font-bold uppercase tracking-wider text-[10px]">Biografía</span>
                <p className="text-[#414844] bg-[#faf9f4] p-3 rounded-xl border border-[#efeee9]">
                  {selectedUserForDetail.profile.bio}
                </p>
              </div>
            )}

            {/* User Moderation History */}
            <div className="space-y-3">
              <h4 className="font-headline font-bold text-sm text-[#012d1d]">
                Historial de Advertencias y Moderación
              </h4>
              {(selectedUserForDetail.profile.moderationHistory || []).length === 0 &&
               (selectedUserForDetail.profile.warnings || []).length === 0 ? (
                <p className="text-xs text-[#717973] bg-[#faf9f4] p-3 rounded-xl">
                  Esta cuenta no registra advertencias ni sanciones previas.
                </p>
              ) : (
                <div className="space-y-2">
                  {(selectedUserForDetail.profile.warnings || []).map((w) => (
                    <div key={w.id} className="p-3 bg-[#ffdcc1]/50 border border-[#ffdcc1] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#934b00]">
                        <span>Advertencia [{w.level.toUpperCase()}]</span>
                        <span>{new Date(w.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#414844]">{w.reason}</p>
                      {w.details && <p className="text-[#717973] text-[11px]">{w.details}</p>}
                    </div>
                  ))}
                  {(selectedUserForDetail.profile.moderationHistory || []).map((m) => (
                    <div key={m.id} className="p-3 bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#ba1a1a]">
                        <span className="capitalize">{m.action}</span>
                        <span>{new Date(m.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#414844]">{m.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#efeee9] flex justify-end">
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332]"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDITAR INFORMACIÓN DE USUARIO --- */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <h3 className="font-headline font-bold text-lg text-[#012d1d]">
              Editar Información de Usuario
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Rol</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                >
                  <option value="cliente">Cliente Particular</option>
                  <option value="profesional">Costurero / Modista (Taller)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Ubicación / Ciudad</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Biografía</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#012d1d] text-white hover:bg-[#1b4332]"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 3: ENVIAR ADVERTENCIA --- */}
      {userToWarn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center gap-3 text-[#934b00]">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                Enviar Advertencia Formal
              </h3>
            </div>
            <p className="text-xs text-[#717973]">
              Emitir llamado de atención oficial para <strong>{userToWarn.name}</strong>. Quedará registrado en su expediente.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Nivel de Gravedad</label>
                <div className="flex gap-2">
                  {(['leve', 'moderada', 'grave'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setWarningLevel(lvl)}
                      className={`flex-1 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                        warningLevel === lvl
                          ? lvl === 'grave'
                            ? 'bg-[#ba1a1a] text-white'
                            : lvl === 'moderada'
                            ? 'bg-[#934b00] text-white'
                            : 'bg-[#2b694d] text-white'
                          : 'bg-[#f5f4ef] text-[#414844]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Motivo de la Advertencia</label>
                <input
                  type="text"
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="Ej: Publicación con fotos engañosas o lenguaje inadecuado"
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Detalles Adicionales</label>
                <textarea
                  value={warningDetails}
                  onChange={(e) => setWarningDetails(e.target.value)}
                  placeholder="Indicaciones para subsanar la falta..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setUserToWarn(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!warningReason.trim()}
                onClick={() => {
                  onSendWarning(userToWarn.id, warningLevel, warningReason, warningDetails);
                  setUserToWarn(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#934b00] text-white hover:bg-[#733b00] disabled:opacity-50"
              >
                Emitir Advertencia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: BLOQUEAR USUARIO --- */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center gap-3 text-[#934b00]">
              <span className="material-symbols-outlined text-2xl">lock</span>
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                Bloqueo Temporal de Cuenta
              </h3>
            </div>
            <p className="text-xs text-[#717973]">
              El usuario <strong>{userToBlock.name}</strong> no podrá iniciar sesión ni interactuar durante el periodo establecido.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Duración del Bloqueo</label>
                <select
                  value={blockDays}
                  onChange={(e) => setBlockDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                >
                  <option value={3}>3 días</option>
                  <option value={7}>7 días (1 semana)</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días (1 mes)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Motivo del Bloqueo</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Explica la causa del bloqueo temporal..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setUserToBlock(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!blockReason.trim()}
                onClick={() => {
                  onBlockUser(userToBlock.id, blockReason, blockDays);
                  setUserToBlock(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#934b00] text-white hover:bg-[#733b00] disabled:opacity-50"
              >
                Confirmar Bloqueo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: CONFIRMAR BANEO PERMANENTE --- */}
      {userToBan && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">gavel</span>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#ba1a1a]">
                  Banear Cuenta Permanentemente
                </h3>
                <p className="text-[11px] text-[#717973]">Acción de máxima severidad</p>
              </div>
            </div>
            <p className="text-xs text-[#414844] leading-relaxed">
              ¿Estás seguro de banear permanentemente a <strong>{userToBan.name}</strong> ({userToBan.email})? Se le revocará todo acceso a la plataforma.
            </p>
            <div>
              <label className="font-bold text-xs text-[#012d1d] block mb-1">
                Motivo del Baneo Definitivo
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Indica la infracción grave a las normas comunitarias..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] text-xs outline-none focus:bg-white focus:border-[#ba1a1a]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setUserToBan(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!banReason.trim()}
                onClick={() => {
                  onBanUser(userToBan.id, banReason);
                  setUserToBan(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ba1a1a] text-white hover:bg-[#93000a] disabled:opacity-50"
              >
                Sí, Banear Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: CONFIRMAR ELIMINACIÓN DE CUENTA --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#ba1a1a]">
                  Eliminar Cuenta Definitivamente
                </h3>
                <p className="text-[11px] text-[#717973]">Acción irreversible</p>
              </div>
            </div>
            <p className="text-xs text-[#414844] leading-relaxed">
              ¿Confirmas la eliminación total de la cuenta de <strong>{userToDelete.name}</strong> ({userToDelete.email})? Sus prendas, servicios y registros serán borrados permanentemente.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ba1a1a] text-white hover:bg-[#93000a]"
              >
                Sí, Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
