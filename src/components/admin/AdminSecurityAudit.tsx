import React, { useState } from 'react';
import { AdminAuditLogEntry, PlatformConfig } from '../../types';
import {
  adminChangePassword,
  adminRecoverPasswordWithMasterKey,
  adminUpdatePlatformConfig,
} from '../../services/adminService';

interface AdminSecurityAuditProps {
  adminEmail: string;
  auditLogs: AdminAuditLogEntry[];
  platformConfig: PlatformConfig;
  onRefreshConfig: () => void;
  onShowNotice: (msg: string) => void;
}

export const AdminSecurityAudit: React.FC<AdminSecurityAuditProps> = ({
  adminEmail,
  auditLogs,
  platformConfig,
  onRefreshConfig,
  onShowNotice,
}) => {
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  // Master recovery key
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Platform config
  const [systemStatus, setSystemStatus] = useState(platformConfig.systemStatus);
  const [allowRegistrations, setAllowRegistrations] = useState(platformConfig.allowNewRegistrations);
  const [announcement, setAnnouncement] = useState(platformConfig.announcement);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(platformConfig.isAnnouncementActive);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setPassError('La nueva contraseña debe contener mínimo 8 caracteres.');
      return;
    }

    setIsChangingPass(true);
    const result = await adminChangePassword(adminEmail, currentPassword, newPassword);
    setIsChangingPass(false);

    if (result.success) {
      onShowNotice('Contraseña administrativa actualizada exitosamente con digest SHA-256.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(result.error || 'Error al actualizar contraseña.');
    }
  };

  const handleMasterRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    const res = await adminRecoverPasswordWithMasterKey(recoveryKey, recoveryNewPassword);
    if (res.success) {
      onShowNotice('Contraseña restablecida exitosamente con clave maestra institucional.');
      setShowRecoveryModal(false);
      setRecoveryKey('');
      setRecoveryNewPassword('');
    } else {
      setRecoveryError(res.error || 'Clave maestra inválida.');
    }
  };

  const handleSavePlatformConfig = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdatePlatformConfig(adminEmail, {
      systemStatus,
      allowNewRegistrations: allowRegistrations,
      announcement,
      isAnnouncementActive,
    });
    onRefreshConfig();
    onShowNotice('Parámetros globales de la plataforma actualizados.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#012d1d]">security</span>
            <span>Seguridad Institucional, Parámetros y Auditoría</span>
          </h2>
          <p className="text-xs text-[#717973]">
            Cifrado de credenciales, control de acceso perimetral y trazabilidad de operaciones.
          </p>
        </div>

        <button
          onClick={() => setShowRecoveryModal(true)}
          className="px-4 py-2 rounded-xl bg-[#faf9f4] border border-[#c1c8c2] text-xs font-bold text-[#012d1d] hover:bg-[#efeee9] flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">key</span>
          <span>Clave Maestra de Respaldo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Management */}
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#b0f1cc] text-[#012d1d] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">password</span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#012d1d]">
              Cambio de Contraseña Administrativa
            </h3>
          </div>

          <p className="text-xs text-[#717973]">
            La nueva clave se almacena mediante hash SHA-256 aislado de las cuentas públicas.
          </p>

          {passError && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[#012d1d] block mb-1">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
              />
            </div>

            <div>
              <label className="font-bold text-[#012d1d] block mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
              />
            </div>

            <div>
              <label className="font-bold text-[#012d1d] block mb-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none focus:bg-white focus:border-[#012d1d]"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-xs hover:bg-[#1b4332] transition-colors disabled:opacity-50"
            >
              {isChangingPass ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

        {/* Global Platform Controls */}
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">tune</span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#012d1d]">
              Parámetros Globales del Sistema
            </h3>
          </div>

          <form onSubmit={handleSavePlatformConfig} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#012d1d] block mb-1">Estado de Operación</label>
              <select
                value={systemStatus}
                onChange={(e) => setSystemStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
              >
                <option value="operativo">Operativo (Normal)</option>
                <option value="mantenimiento">Modo Mantenimiento Programado</option>
                <option value="restringido">Acceso Restringido</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f4] border border-[#efeee9]">
              <div>
                <span className="font-bold text-[#012d1d] block">Permitir Nuevos Registros</span>
                <span className="text-[11px] text-[#717973]">
                  Habilita o pausa el formulario de registro de nuevos clientes y talleres
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowRegistrations}
                onChange={(e) => setAllowRegistrations(e.target.checked)}
                className="w-4 h-4 accent-[#012d1d]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#012d1d]">Anuncio Global en Cabecera</label>
                <label className="flex items-center gap-1.5 text-[11px] text-[#717973] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                    className="accent-[#012d1d]"
                  />
                  <span>Mostrar Anuncio</span>
                </label>
              </div>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Mensaje institucional para todos los usuarios..."
                className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2b694d] text-white font-bold text-xs hover:bg-[#012d1d] transition-colors"
            >
              Guardar Configuración Global
            </button>
          </form>
        </div>
      </div>

      {/* Complete Audit Trail */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#012d1d]">
              Bitácora de Auditoría Forense (Audit Trail)
            </h3>
          </div>
          <span className="text-xs text-[#717973]">{auditLogs.length} eventos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f4] text-[#717973] uppercase text-[10px] border-b border-[#efeee9]">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad Objetivo</th>
                <th className="px-4 py-3">Detalles</th>
                <th className="px-4 py-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeee9]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#faf9f4]/60">
                  <td className="px-4 py-3 whitespace-nowrap text-[#717973]">
                    {new Date(log.timestamp).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-bold text-[#012d1d] bg-[#f5f4ef] px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1b1c19]">{log.targetName}</td>
                  <td className="px-4 py-3 text-[#414844] max-w-md truncate">{log.details}</td>
                  <td className="px-4 py-3 text-[#717973] text-[11px]">{log.adminEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleMasterRecoverySubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#c1c8c2]/50 shadow-2xl">
            <h3 className="font-headline font-bold text-lg text-[#012d1d]">
              Recuperación Maestra Institucional
            </h3>
            <p className="text-xs text-[#717973]">
              Permite regenerar las credenciales en caso de emergencia mediante la clave maestra institucional.
            </p>

            {recoveryError && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded-xl">
                {recoveryError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Clave Maestra Institucional</label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="REBORN-SECURE-KEY-2026"
                  required
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={recoveryNewPassword}
                  onChange={(e) => setRecoveryNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full p-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#717973] hover:bg-[#efeee9]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#012d1d] text-white hover:bg-[#1b4332]"
              >
                Restablecer Contraseña
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
