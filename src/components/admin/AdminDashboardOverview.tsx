import React from 'react';
import { GarmentProject, ServiceItem, AdminAuditLogEntry } from '../../types';
import { StoredUserAccount } from '../../services/userStore';

interface AdminDashboardOverviewProps {
  users: StoredUserAccount[];
  garments: GarmentProject[];
  services: ServiceItem[];
  auditLogs: AdminAuditLogEntry[];
  onSelectTab: (tab: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  users,
  garments,
  services,
  auditLogs,
  onSelectTab,
}) => {
  // Compute platform metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) => !u.profile.accountStatus || u.profile.accountStatus === 'activo'
  ).length;
  const blockedUsers = users.filter((u) => u.profile.accountStatus === 'bloqueado' || u.profile.accountStatus === 'suspendido').length;
  const bannedUsers = users.filter((u) => u.profile.accountStatus === 'baneado').length;

  const totalGarments = garments.length;
  const activeGarments = garments.filter((g) => g.status === 'Publicada' || g.status === 'Completado').length;
  const underReviewGarments = garments.filter((g) => g.status === 'En revisión').length;

  const costurerosCount = users.filter((u) => u.role === 'profesional').length;
  const customizersCount = services.length;

  // Recent users (last 7 days or newest 5)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Recent garments
  const recentGarments = [...garments].slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div 
          onClick={() => onSelectTab('usuarios')}
          className="bg-white rounded-2xl p-5 border border-[#c1c8c2]/50 shadow-xs hover:border-[#012d1d] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#717973] uppercase tracking-wider">
              Total Usuarios
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-[#012d1d]">{totalUsers}</span>
            <span className="text-[11px] font-semibold text-[#2b694d] bg-[#b0f1cc]/40 px-2 py-0.5 rounded-full">
              {activeUsers} activos
            </span>
          </div>
        </div>

        {/* Metric 2: Blocked & Banned */}
        <div 
          onClick={() => onSelectTab('baneos')}
          className="bg-white rounded-2xl p-5 border border-[#c1c8c2]/50 shadow-xs hover:border-[#ba1a1a] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#717973] uppercase tracking-wider">
              Bloqueados & Baneados
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">gavel</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-[#ba1a1a]">
              {blockedUsers + bannedUsers}
            </span>
            <div className="flex gap-1 text-[10px] font-bold">
              <span className="bg-[#ffdcc1] text-[#934b00] px-1.5 py-0.5 rounded">
                {blockedUsers} bloq.
              </span>
              <span className="bg-[#ffdad6] text-[#ba1a1a] px-1.5 py-0.5 rounded">
                {bannedUsers} ban.
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Garments */}
        <div 
          onClick={() => onSelectTab('publicaciones')}
          className="bg-white rounded-2xl p-5 border border-[#c1c8c2]/50 shadow-xs hover:border-[#012d1d] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#717973] uppercase tracking-wider">
              Publicaciones & Prendas
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#f5fbf7] text-[#012d1d] border border-[#2b694d]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">apparel</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-[#012d1d]">{totalGarments}</span>
            <span className="text-[11px] font-semibold text-[#002113] bg-[#b0f1cc]/60 px-2 py-0.5 rounded-full">
              {underReviewGarments > 0 ? `${underReviewGarments} en revisión` : 'Al día'}
            </span>
          </div>
        </div>

        {/* Metric 4: Costureros & Modificadores */}
        <div 
          onClick={() => onSelectTab('costureros')}
          className="bg-white rounded-2xl p-5 border border-[#c1c8c2]/50 shadow-xs hover:border-[#012d1d] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#717973] uppercase tracking-wider">
              Costureros & Talleres
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#2b694d] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">handyman</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-headline text-[#012d1d]">{costurerosCount}</span>
            <span className="text-[11px] font-semibold text-[#2b694d] bg-[#f5fbf7] px-2 py-0.5 rounded-full border border-[#2b694d]/30">
              {customizersCount} servicios
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Users & Recent Publications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#b0f1cc] text-[#012d1d] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">person_add</span>
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d]">
                Nuevos Usuarios Registrados
              </h3>
            </div>
            <button 
              onClick={() => onSelectTab('usuarios')}
              className="text-xs text-[#2b694d] hover:text-[#012d1d] font-bold"
            >
              Ver todos →
            </button>
          </div>

          <div className="divide-y divide-[#efeee9]">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-[#717973] py-4 text-center">No hay registros de usuarios aún.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#012d1d] truncate">{u.name}</p>
                      <p className="text-[11px] text-[#717973] truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f4ef] text-[#414844]">
                      {u.role === 'profesional' ? 'Taller' : 'Cliente'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.profile.accountStatus === 'baneado'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : u.profile.accountStatus === 'bloqueado'
                        ? 'bg-[#ffdcc1] text-[#934b00]'
                        : 'bg-[#b0f1cc] text-[#002113]'
                    }`}>
                      {u.profile.accountStatus || 'activo'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Garments */}
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#b0f1cc] text-[#012d1d] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">post_add</span>
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d]">
                Nuevas Publicaciones de Prendas
              </h3>
            </div>
            <button 
              onClick={() => onSelectTab('publicaciones')}
              className="text-xs text-[#2b694d] hover:text-[#012d1d] font-bold"
            >
              Gestionar →
            </button>
          </div>

          <div className="divide-y divide-[#efeee9]">
            {recentGarments.length === 0 ? (
              <p className="text-xs text-[#717973] py-4 text-center">No hay prendas registradas.</p>
            ) : (
              recentGarments.map((g) => (
                <div key={g.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={g.imageUrl} 
                      alt={g.title} 
                      className="w-10 h-10 rounded-xl object-cover bg-[#efeee9] shrink-0" 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#012d1d] truncate">{g.title}</p>
                      <p className="text-[11px] text-[#717973] truncate">
                        {g.category} • Por: {g.authorName || 'Cliente'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    g.status === 'Publicada' || g.status === 'Completado'
                      ? 'bg-[#b0f1cc] text-[#002113]'
                      : 'bg-[#ffdcc1] text-[#934b00]'
                  }`}>
                    {g.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Platform Activity Log */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">history</span>
            </div>
            <h3 className="font-headline font-bold text-base text-[#012d1d]">
              Actividad Reciente del Sistema
            </h3>
          </div>
          <span className="text-xs text-[#717973]">Auditoría administrativa</span>
        </div>

        <div className="divide-y divide-[#efeee9]">
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#012d1d] bg-[#f5f4ef] px-2 py-0.5 rounded">
                    {log.action.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-[#1b1c19]">{log.targetName}</span>
                </div>
                <p className="text-xs text-[#414844]">{log.details}</p>
              </div>
              <span className="text-[10px] text-[#717973] whitespace-nowrap shrink-0">
                {new Date(log.timestamp).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
