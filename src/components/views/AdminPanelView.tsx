import React, { useState, useEffect } from 'react';
import { GarmentProject, ServiceItem, UserProfile } from '../../types';
import { verifyAdminCredentials, EXCLUSIVE_ADMIN_EMAIL } from '../../services/securityService';
import {
  getUsersDatabase,
  StoredUserAccount,
  setActiveSession,
} from '../../services/userStore';
import {
  getAdminAuditLogs,
  getAdminReports,
  adminResolveReport,
  getPlatformConfig,
  adminBlockUser,
  adminUnblockUser,
  adminBanUser,
  adminUnbanUser,
  adminDeleteUser,
  adminSendWarning,
  adminUpdateUserInfo,
  adminToggleWorkshopVerification,
  getSupportTickets,
  replySupportTicket,
  updateSupportTicketStatus,
} from '../../services/adminService';

// Subcomponents
import { AdminDashboardOverview } from '../admin/AdminDashboardOverview';
import { AdminUsersManagement } from '../admin/AdminUsersManagement';
import { AdminBansManagement } from '../admin/AdminBansManagement';
import { AdminPostsManagement } from '../admin/AdminPostsManagement';
import { AdminProsManagement } from '../admin/AdminProsManagement';
import { AdminReportsManagement } from '../admin/AdminReportsManagement';
import { AdminSupportManagement } from '../admin/AdminSupportManagement';
import { AdminSecurityAudit } from '../admin/AdminSecurityAudit';

export type AdminTab =
  | 'dashboard'
  | 'usuarios'
  | 'baneos'
  | 'publicaciones'
  | 'costureros'
  | 'reportes'
  | 'soporte'
  | 'seguridad';

interface AdminPanelViewProps {
  user: UserProfile;
  garments: GarmentProject[];
  services: ServiceItem[];
  onApproveGarment?: (id: string) => void;
  onDeleteGarment?: (id: string) => void;
  onApproveService?: (id: string) => void;
  onDeleteService?: (id: string) => void;
  onNavigate: (view: any) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  user,
  garments,
  services,
  onApproveGarment,
  onDeleteGarment,
  onApproveService,
  onDeleteService,
  onNavigate,
}) => {
  // Authentication & Session State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (user.role === 'admin') return true;
    const saved = sessionStorage.getItem('reborn_admin_auth_v7');
    return !!saved;
  });

  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Database Data States
  const [usersDb, setUsersDb] = useState<StoredUserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [platformConfig, setPlatformConfig] = useState<any>(getPlatformConfig());

  // Reload local states
  const refreshAllData = () => {
    try {
      setUsersDb(getUsersDatabase());
      setAuditLogs(getAdminAuditLogs(EXCLUSIVE_ADMIN_EMAIL));
      setReports(getAdminReports(EXCLUSIVE_ADMIN_EMAIL));
      setSupportTickets(getSupportTickets());
      setPlatformConfig(getPlatformConfig());
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [isAdminAuthenticated]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!adminEmailInput.trim()) {
      setAuthError('Por favor ingresa el correo administrativo institucional.');
      return;
    }
    if (!passwordInput) {
      setAuthError('Por favor introduce la contraseña de administrador.');
      return;
    }

    setIsVerifying(true);
    const check = await verifyAdminCredentials(adminEmailInput, passwordInput);
    setIsVerifying(false);

    if (check.success) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('reborn_admin_auth_v7', 'true');
      setPasswordInput('');
      setAdminEmailInput('');
      refreshAllData();
    } else {
      setAuthError(check.error || 'Credenciales administrativas no autorizadas.');
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('reborn_admin_auth_v7');
    onNavigate('inicio');
  };

  // --- 1. GATEWAY SCREEN: PROTECTED PASSWORD ACCESS ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#faf9f4]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#c1c8c2]/50 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-2xl">shield_lock</span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#012d1d]">
              Acceso Administrativo Exclusivo
            </h1>
            <p className="text-xs text-[#414844] leading-relaxed max-w-xs mx-auto">
              Panel reservado para la moderación, soporte y supervisión de la plataforma Reborn Your Style.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase tracking-wider mb-1.5">
                Correo Administrativo
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => {
                  setAdminEmailInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="admin@rebornyourstyle.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] text-xs text-[#012d1d] focus:bg-white focus:border-[#012d1d] outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase tracking-wider mb-1.5">
                Contraseña Administrativa
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Introduce la contraseña asignada..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#c1c8c2] bg-[#faf9f4] text-xs text-[#012d1d] focus:bg-white focus:border-[#012d1d] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#012d1d] text-xs"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">key</span>
              <span>{isVerifying ? 'Verificando con SHA-256...' : 'Ingresar al Panel de Control'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#efeee9]">
            <button
              type="button"
              onClick={() => onNavigate('inicio')}
              className="text-xs text-[#717973] hover:text-[#012d1d] font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Regresar al portal principal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED COMPLETE ADMIN DASHBOARD ---
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      {/* Top Banner with Admin Identity */}
      <div className="bg-[#012d1d] rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm border border-white/15 text-[#b0f1cc]">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Panel de Administración Centralizado</span>
          </div>

          <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
            Administración General Reborn Your Style
          </h1>

          <p className="text-xs text-white/80 max-w-xl">
            Gestión de usuarios, moderación de prendas, fiscalización de talleres, resolución de disputas y auditoría forense.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={handleLogoutAdmin}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#ba1a1a] hover:text-white border border-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Cerrar Sesión Administrador</span>
          </button>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2b694d]/40 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-[#ffdcc1] border border-[#934b00]/30 text-[#934b00] text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">info</span>
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs hover:underline text-[#934b00]"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 md:p-3 border border-[#c1c8c2]/50 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>Dashboard / Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'usuarios'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">group</span>
            <span>Usuarios ({usersDb.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('baneos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'baneos'
                ? 'bg-[#ba1a1a] text-white shadow-xs'
                : 'text-[#ba1a1a] hover:bg-[#ffdad6]/40'
            }`}
          >
            <span className="material-symbols-outlined text-sm">gavel</span>
            <span>Baneos y Bloqueos</span>
          </button>

          <button
            onClick={() => setActiveTab('publicaciones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'publicaciones'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">apparel</span>
            <span>Publicaciones ({garments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('costureros')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'costureros'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">handyman</span>
            <span>Costureros & Modistas</span>
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reportes'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">report_problem</span>
            <span>Reportes ({reports.filter((r) => r.status === 'pendiente').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('soporte')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'soporte'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span>Soporte ({supportTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('seguridad')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'seguridad'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#faf9f4]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">security</span>
            <span>Seguridad & Parámetros</span>
          </button>
        </div>
      </div>

      {/* --- TAB CONTENTS --- */}

      {/* 1. Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <AdminDashboardOverview
          users={usersDb}
          garments={garments}
          services={services}
          auditLogs={auditLogs}
          onSelectTab={(tab) => setActiveTab(tab as AdminTab)}
        />
      )}

      {/* 2. Users Management */}
      {activeTab === 'usuarios' && (
        <AdminUsersManagement
          users={usersDb}
          garments={garments}
          services={services}
          adminEmail={EXCLUSIVE_ADMIN_EMAIL}
          onRefreshUsers={refreshAllData}
          onBlockUser={(userId, reason, days) => {
            adminBlockUser(EXCLUSIVE_ADMIN_EMAIL, userId, reason);
            refreshAllData();
            setActionNotice('Usuario bloqueado exitosamente.');
          }}
          onUnblockUser={(userId) => {
            adminUnblockUser(EXCLUSIVE_ADMIN_EMAIL, userId);
            refreshAllData();
            setActionNotice('Usuario desbloqueado exitosamente.');
          }}
          onBanUser={(userId, reason) => {
            adminBanUser(EXCLUSIVE_ADMIN_EMAIL, userId, reason);
            refreshAllData();
            setActionNotice('Usuario BANEADO permanentemente.');
          }}
          onUnbanUser={(userId) => {
            adminUnbanUser(EXCLUSIVE_ADMIN_EMAIL, userId);
            refreshAllData();
            setActionNotice('Baneo revocado. Usuario restaurado.');
          }}
          onDeleteUser={(userId) => {
            adminDeleteUser(EXCLUSIVE_ADMIN_EMAIL, userId);
            refreshAllData();
            setActionNotice('Cuenta eliminada de la plataforma.');
          }}
          onSendWarning={(userId, level, reason, details) => {
            adminSendWarning(EXCLUSIVE_ADMIN_EMAIL, userId, { level, reason, details });
            refreshAllData();
            setActionNotice(`Advertencia formal enviada al usuario [${level.toUpperCase()}].`);
          }}
          onUpdateUser={(userId, updates) => {
            adminUpdateUserInfo(EXCLUSIVE_ADMIN_EMAIL, userId, updates);
            refreshAllData();
            setActionNotice('Información de usuario actualizada.');
          }}
        />
      )}

      {/* 3. Bans & Blocks Management */}
      {activeTab === 'baneos' && (
        <AdminBansManagement
          users={usersDb}
          onUnblockUser={(userId) => {
            adminUnblockUser(EXCLUSIVE_ADMIN_EMAIL, userId);
            refreshAllData();
            setActionNotice('Cuenta desbloqueada con éxito.');
          }}
          onUnbanUser={(userId) => {
            adminUnbanUser(EXCLUSIVE_ADMIN_EMAIL, userId);
            refreshAllData();
            setActionNotice('Baneo revocado con éxito.');
          }}
          onBlockUser={(userId, reason, days) => {
            adminBlockUser(EXCLUSIVE_ADMIN_EMAIL, userId, reason);
            refreshAllData();
            setActionNotice('Cuenta bloqueada temporalmente.');
          }}
          onBanUser={(userId, reason) => {
            adminBanUser(EXCLUSIVE_ADMIN_EMAIL, userId, reason);
            refreshAllData();
            setActionNotice('Cuenta BANEADA permanentemente.');
          }}
        />
      )}

      {/* 4. Publications Management */}
      {activeTab === 'publicaciones' && (
        <AdminPostsManagement
          garments={garments}
          onApproveGarment={onApproveGarment}
          onDeleteGarment={onDeleteGarment}
          onToggleHideGarment={(id, currentlyHidden) => {
            if (currentlyHidden && onApproveGarment) {
              onApproveGarment(id);
              setActionNotice('Prenda ahora visible en la plataforma.');
            } else {
              setActionNotice('Prenda ocultada del catálogo.');
            }
          }}
        />
      )}

      {/* 5. Costureros & Modificadores Management */}
      {activeTab === 'costureros' && (
        <AdminProsManagement
          users={usersDb}
          services={services}
          onToggleVerification={(userId, currentStatus) => {
            adminToggleWorkshopVerification(EXCLUSIVE_ADMIN_EMAIL, userId, !currentStatus);
            refreshAllData();
            setActionNotice(
              !currentStatus
                ? 'Taller verificado oficialmente con insignia Reborn.'
                : 'Insignia de verificación de taller retirada.'
            );
          }}
          onApproveService={onApproveService}
          onDeleteService={onDeleteService}
        />
      )}

      {/* 6. Reports Management */}
      {activeTab === 'reportes' && (
        <AdminReportsManagement
          reports={reports}
          onResolveReport={(reportId, action, notes) => {
            adminResolveReport(EXCLUSIVE_ADMIN_EMAIL, reportId, { action, notes });
            refreshAllData();
            setActionNotice('Reporte resuelto conforme al dictamen.');
          }}
        />
      )}

      {/* 7. Support & Tickets */}
      {activeTab === 'soporte' && (
        <AdminSupportManagement
          tickets={supportTickets}
          onReplyTicket={(ticketId, message) => {
            replySupportTicket(ticketId, message, 'Administrador Reborn');
            refreshAllData();
            setActionNotice('Respuesta oficial enviada al usuario.');
          }}
          onUpdateStatus={(ticketId, status) => {
            updateSupportTicketStatus(ticketId, status);
            refreshAllData();
            setActionNotice(`Estado de ticket actualizado a: ${status}`);
          }}
        />
      )}

      {/* 8. Security & Platform Controls */}
      {activeTab === 'seguridad' && (
        <AdminSecurityAudit
          adminEmail={EXCLUSIVE_ADMIN_EMAIL}
          auditLogs={auditLogs}
          platformConfig={platformConfig}
          onRefreshConfig={refreshAllData}
          onShowNotice={(msg) => setActionNotice(msg)}
        />
      )}
    </div>
  );
};
