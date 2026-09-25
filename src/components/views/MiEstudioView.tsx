import React, { useState, useEffect } from 'react';
import { UserRole, ServiceItem, GarmentProject, ServiceRequest, UserProfile, AppView } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { GoogleMapsLocationPicker } from '../common/GoogleMapsLocationPicker';

interface MiEstudioViewProps {
  user?: UserProfile;
  userRole: UserRole;
  services: ServiceItem[];
  garments: GarmentProject[];
  requests: ServiceRequest[];
  onOpenCreateService: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
  onDeleteGarment: (id: string) => void;
  onUpdateRequestStatus: (requestId: string, newStatus: 'Aceptada' | 'Rechazada' | 'En Proceso' | 'Completada') => void;
  onNavigate: (view: AppView) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onDeleteAccount?: (userId: string) => void;
}

export const MiEstudioView: React.FC<MiEstudioViewProps> = ({
  user,
  userRole,
  services,
  garments,
  requests,
  onOpenCreateService,
  onEditService,
  onDeleteService,
  onDeleteGarment,
  onUpdateRequestStatus,
  onNavigate,
  onUpdateProfile,
  onDeleteAccount,
}) => {
  // Default tab depending on user role (Modista/Costurero opens on services, Cliente on prendas)
  const [activeTab, setActiveTab] = useState<'servicios' | 'solicitudes' | 'prendas' | 'perfil'>(
    userRole === 'profesional' ? 'servicios' : 'prendas'
  );

  // Profile Form state initialized with the current logged in user
  const [studioName, setStudioName] = useState(user?.name || '');
  const [studioBio, setStudioBio] = useState(user?.bio || '');
  const [studioLocation, setStudioLocation] = useState(user?.location || '');
  const [studioPhone, setStudioPhone] = useState(user?.phone || '');
  const [studioInstagram, setStudioInstagram] = useState(user?.instagram || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Account Deletion state & verification code (Requirement 9)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [studioAddress, setStudioAddress] = useState(user?.address || '');

  useEffect(() => {
    if (user) {
      setStudioName(user.name || '');
      setStudioBio(user.bio || '');
      setStudioLocation(user.location || '');
      setStudioAddress(user.address || '');
      setStudioPhone(user.phone || '');
      setStudioInstagram(user.instagram || '');
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && onUpdateProfile) {
      onUpdateProfile({
        ...user,
        name: studioName.trim() || user.name,
        bio: studioBio.trim(),
        location: studioLocation.trim(),
        address: studioAddress.trim(),
        phone: studioPhone.trim(),
        instagram: studioInstagram.trim(),
      });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleOpenDeleteModal = () => {
    // Generate a 6-character alphanumeric verification code
    const randomCode = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
    setVerificationCode(randomCode);
    setInputCode('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAccount = () => {
    if (inputCode.trim().toUpperCase() !== verificationCode) {
      setDeleteError('El código de validación ingresado es incorrecto.');
      return;
    }
    if (user && onDeleteAccount) {
      onDeleteAccount(user.id);
    }
    setIsDeleteModalOpen(false);
  };

  const isModista = userRole === 'profesional';
  const isAdmin = userRole === 'admin';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(1,45,29,0.05)] p-6 md:p-8 border border-[#efeee9] mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user?.avatarUrl}
              name={studioName || user?.name}
              size="xl"
              borderClassName="border-2 border-[#b0f1cc] shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline text-2xl font-bold text-[#012d1d]">
                  {studioName || (isModista ? 'Mi Taller' : 'Mi Perfil')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#b0f1cc] text-[#002113]">
                  {isAdmin ? 'Administrador' : isModista ? 'Taller / Modista' : 'Cliente'}
                </span>
              </div>
              <p className="text-xs text-[#717973] flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>{studioLocation || 'Sin ubicación configurada'}</span>
                <span className="mx-1">•</span>
                <span className="material-symbols-outlined text-sm text-[#2b694d]">verified_user</span>
                <span>Cuenta verificada e independiente</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isModista ? (
              <button
                onClick={onOpenCreateService}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#012d1d] hover:bg-[#1b4332] text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Nuevo Servicio de Confección</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('publicar-prenda')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#012d1d] hover:bg-[#1b4332] text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Publicar Prenda para Transformación</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Tabs tailored to role */}
        <div className="flex gap-2 overflow-x-auto border-t border-[#efeee9] mt-6 pt-4 no-scrollbar">
          {isModista ? (
            <>
              <button
                onClick={() => setActiveTab('servicios')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'servicios'
                    ? 'bg-[#012d1d] text-white'
                    : 'text-[#414844] hover:bg-[#f5f4ef]'
                }`}
              >
                <span className="material-symbols-outlined text-base">design_services</span>
                <span>Mis Servicios del Taller</span>
                <span className="ml-1 bg-white/20 text-current px-1.5 py-0.2 rounded-full text-[10px]">
                  {services.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'solicitudes'
                    ? 'bg-[#012d1d] text-white'
                    : 'text-[#414844] hover:bg-[#f5f4ef]'
                }`}
              >
                <span className="material-symbols-outlined text-base">inbox</span>
                <span>Solicitudes Recibidas de Clientes</span>
                <span className="ml-1 bg-[#b0f1cc] text-[#002113] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {requests.length}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('prendas')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'prendas'
                    ? 'bg-[#012d1d] text-white'
                    : 'text-[#414844] hover:bg-[#f5f4ef]'
                }`}
              >
                <span className="material-symbols-outlined text-base">checkroom</span>
                <span>Mis Prendas Publicadas</span>
                <span className="ml-1 bg-white/20 text-current px-1.5 py-0.2 rounded-full text-[10px]">
                  {garments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'solicitudes'
                    ? 'bg-[#012d1d] text-white'
                    : 'text-[#414844] hover:bg-[#f5f4ef]'
                }`}
              >
                <span className="material-symbols-outlined text-base">inbox</span>
                <span>Mis Solicitudes Enviadas</span>
                <span className="ml-1 bg-[#b0f1cc] text-[#002113] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {requests.length}
                </span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('perfil')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'perfil'
                ? 'bg-[#012d1d] text-white'
                : 'text-[#414844] hover:bg-[#f5f4ef]'
            }`}
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span>Configuración de Cuenta</span>
          </button>
        </div>
      </div>

      {/* Tab: Servicios (Modista Exclusive) */}
      {activeTab === 'servicios' && isModista && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline text-xl font-bold text-[#012d1d]">
                Catálogo de Servicios Ofrecidos por tu Taller
              </h2>
              <p className="text-xs text-[#717973]">
                Configura las técnicas de patronaje, confección o teñido y tus tarifas base para los clientes.
              </p>
            </div>
            <button
              onClick={onOpenCreateService}
              className="bg-[#012d1d] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1b4332] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Crear Servicio</span>
            </button>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#efeee9] text-center space-y-4 shadow-[0_4px_16px_rgba(1,45,29,0.03)]">
              <div className="w-16 h-16 rounded-full bg-[#f5f4ef] text-[#2b694d] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">design_services</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                No has registrado servicios de confección todavía
              </h3>
              <p className="text-xs text-[#717973] max-w-md mx-auto">
                Publica tu primer servicio para que los clientes puedan encontrarte y solicitarte cotizaciones personalizadas.
              </p>
              <button
                onClick={onOpenCreateService}
                className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-all shadow-sm inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Crear Primer Servicio</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(1,45,29,0.05)] border border-[#efeee9] flex flex-col justify-between"
                >
                  <div className="h-44 w-full relative bg-[#e3e3de]">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#012d1d]">
                      {service.category}
                    </span>
                    <span className="absolute top-3 right-3 bg-[#012d1d]/80 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      <span>{service.deliveryTime}</span>
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headline font-bold text-base text-[#012d1d] mb-1.5">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#414844] line-clamp-2 mb-4 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {service.techniques.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#f5f4ef] text-[#414844] border border-[#c1c8c2]/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#efeee9] flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-[#717973] uppercase tracking-wider block">
                          Tarifa Base
                        </span>
                        <p className="font-bold text-base text-[#012d1d]">
                          ${service.price.toLocaleString('es-CO')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEditService(service)}
                          className="p-2 text-[#717973] hover:text-[#012d1d] hover:bg-[#f5f4ef] rounded-lg transition-colors"
                          title="Editar servicio"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteService(service.id)}
                          className="p-2 text-[#717973] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                          title="Eliminar servicio"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Prendas (Client Exclusive) */}
      {activeTab === 'prendas' && !isModista && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline text-xl font-bold text-[#012d1d]">
                Mis Prendas en Transformación
              </h2>
              <p className="text-xs text-[#717973]">
                Prendas registradas en tu cuenta para suprareciclaje o arreglo.
              </p>
            </div>
            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="bg-[#012d1d] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#1b4332] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Publicar Prenda</span>
            </button>
          </div>

          {garments.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#efeee9] text-center space-y-4 shadow-[0_4px_16px_rgba(1,45,29,0.03)]">
              <div className="w-16 h-16 rounded-full bg-[#f5f4ef] text-[#2b694d] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">checkroom</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                No tienes prendas publicadas todavía
              </h3>
              <p className="text-xs text-[#717973] max-w-md mx-auto">
                Sube prendas de tu clóset para que modistas y talleres expertos en suprareciclaje puedan ayudarte a transformarlas.
              </p>
              <button
                onClick={() => onNavigate('publicar-prenda')}
                className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-all shadow-sm inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Publicar Mi Primera Prenda</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {garments.map((garment) => (
                <div
                  key={garment.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(1,45,29,0.05)] border border-[#efeee9] flex flex-col justify-between"
                >
                  <div className="h-44 w-full relative bg-[#e3e3de]">
                    <img
                      src={garment.imageUrl}
                      alt={garment.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#012d1d]">
                      {garment.category}
                    </span>
                    <span className="absolute top-3 right-3 bg-[#012d1d] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {garment.status}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headline font-bold text-base text-[#012d1d] mb-1.5">
                      {garment.title}
                    </h3>
                    <p className="text-xs text-[#414844] line-clamp-2 mb-4 leading-relaxed">
                      {garment.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-[#efeee9] flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-[#717973] uppercase tracking-wider block">
                          Presupuesto Estimado
                        </span>
                        <p className="font-bold text-base text-[#012d1d]">
                          ${garment.budget.toLocaleString('es-CO')}
                        </p>
                      </div>

                      <button
                        onClick={() => onDeleteGarment(garment.id)}
                        className="p-2 text-[#717973] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                        title="Eliminar publicación"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Solicitudes (Requirement 10: Clear, well-organized card layout) */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-headline text-xl font-bold text-[#012d1d]">
              {isModista ? 'Solicitudes de Trabajo Recibidas' : 'Mis Solicitudes de Confección'} ({requests.length})
            </h2>
            <p className="text-xs text-[#717973]">
              {isModista
                ? 'Gestiona las solicitudes de clientes, cotizaciones y proyectos en curso.'
                : 'Revisa el estado de tus cotizaciones enviadas a los talleres.'}
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#efeee9] text-center space-y-4 shadow-[0_4px_16px_rgba(1,45,29,0.03)]">
              <div className="w-16 h-16 rounded-full bg-[#f5f4ef] text-[#2b694d] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">inbox</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                No tienes solicitudes activas
              </h3>
              <p className="text-xs text-[#717973] max-w-md mx-auto">
                {isModista
                  ? 'Aquí aparecerán los presupuestos y mensajes enviados por clientes que desean contratar tus servicios.'
                  : 'Explora talleres y costureros para enviarles solicitudes sobre tus prendas.'}
              </p>
              {!isModista && (
                <button
                  onClick={() => onNavigate('costureros')}
                  className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">search</span>
                  <span>Buscar Costureros y Talleres</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {requests.map((req) => {
                const isPending = req.status === 'Pendiente';
                const isInProgress = req.status === 'En Proceso';
                const isCompleted = req.status === 'Completada';
                const isRejected = req.status === 'Rechazada';

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-6 shadow-[0_4px_18px_rgba(1,45,29,0.05)] border border-[#efeee9] flex flex-col justify-between hover:border-[#c1c8c2] transition-all"
                  >
                    <div>
                      {/* Card Header: Badges and Date */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f4ef] text-[#012d1d] border border-[#c1c8c2]/50">
                          {req.serviceCategory}
                        </span>

                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            isPending
                              ? 'bg-[#ffdcc1] text-[#934b00]'
                              : isInProgress
                              ? 'bg-[#b0f1cc] text-[#002113]'
                              : isCompleted
                              ? 'bg-[#d1e7dd] text-[#0f5132]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{req.status}</span>
                        </span>
                      </div>

                      {/* Title and Notes */}
                      <h3 className="font-headline font-bold text-base text-[#012d1d] mb-1.5">
                        {req.garmentTitle}
                      </h3>

                      <p className="text-xs text-[#414844] leading-relaxed mb-4 line-clamp-3 bg-[#faf9f4] p-3 rounded-xl border border-[#efeee9]">
                        "{req.notes || 'Sin observaciones adicionales.'}"
                      </p>

                      {/* Participant & Budget Info */}
                      <div className="space-y-1.5 text-xs text-[#717973] mb-4">
                        <div className="flex items-center justify-between">
                          <span>{isModista ? 'Cliente Solicitante:' : 'Taller Asignado:'}</span>
                          <strong className="text-[#012d1d] font-bold">{req.clientName}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Presupuesto Acordado:</span>
                          <strong className="text-[#012d1d] font-bold text-sm">
                            ${req.budget.toLocaleString('es-CO')} COP
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Fecha de Creación:</span>
                          <span>{new Date(req.createdAt).toLocaleDateString('es-CO')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigate('mensajes')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#012d1d] hover:bg-[#f5f4ef] transition-colors flex items-center gap-1 border border-[#c1c8c2]/50"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>Abrir Chat</span>
                      </button>

                      {isModista && isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateRequestStatus(req.id, 'Rechazada')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => onUpdateRequestStatus(req.id, 'En Proceso')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#012d1d] hover:bg-[#1b4332] text-white shadow-xs transition-colors"
                          >
                            Aceptar
                          </button>
                        </div>
                      )}

                      {isModista && isInProgress && (
                        <button
                          onClick={() => onUpdateRequestStatus(req.id, 'Completada')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#2b694d] hover:bg-[#012d1d] text-white flex items-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm">done_all</span>
                          <span>Finalizar Trabajo</span>
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-xs text-[#2b694d] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          <span>Completada</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="text-xs text-[#ba1a1a] font-bold">
                          Rechazada
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Configuración de Cuenta & Eliminar Cuenta (Requirement 9) */}
      {activeTab === 'perfil' && (
        <div className="space-y-8 max-w-2xl">
          {/* Profile Edit Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)]">
            <h2 className="font-headline text-xl font-bold text-[#012d1d] mb-1">
              Configuración del Perfil
            </h2>
            <p className="text-xs text-[#717973] mb-6">
              Actualiza tus datos de contacto y ubicación para la plataforma.
            </p>

            {profileSaved && (
              <div className="mb-4 p-3 rounded-xl bg-[#b0f1cc] text-[#002113] text-xs font-bold flex items-center gap-2 border border-[#2b694d]/30">
                <span className="material-symbols-outlined text-base text-[#2b694d]">check_circle</span>
                <span>¡Cambios guardados correctamente!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                  Nombre {isModista ? 'del Taller / Modista' : 'Completo'} *
                </label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Nombre o Taller"
                  className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                  Dirección Física (Taller o Domicilio)
                </label>
                <input
                  type="text"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  placeholder="Ej: Carrera 43A # 1-50, Taller 302"
                  className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                />
                <span className="text-[11px] text-[#717973]">
                  Opcional. Si no deseas mostrar dirección física exacta, déjala vacía.
                </span>
              </div>

              <div>
                <GoogleMapsLocationPicker
                  value={studioLocation}
                  onChange={(newLoc) => setStudioLocation(newLoc)}
                  label="Ubicación en Google Maps"
                  placeholder="Busca tu dirección, barrio o ciudad (ej. Chapinero, Bogotá D.C.)"
                  required={false}
                  showMapPreview={true}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                  Teléfono o WhatsApp
                </label>
                <input
                  type="text"
                  value={studioPhone}
                  onChange={(e) => setStudioPhone(e.target.value)}
                  placeholder="Ej: +57 312 456 7890"
                  className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                  Instagram / Redes
                </label>
                <input
                  type="text"
                  value={studioInstagram}
                  onChange={(e) => setStudioInstagram(e.target.value)}
                  placeholder="@usuario"
                  className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                  Biografía / Presentación
                </label>
                <textarea
                  rows={4}
                  value={studioBio}
                  onChange={(e) => setStudioBio(e.target.value)}
                  placeholder="Describe tu experiencia, estilo o proyectos de moda circular..."
                  className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Eliminar Cuenta (Requirement 9) */}
          <div className="bg-[#fffbfa] rounded-2xl p-6 border border-[#ffdad6] shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-base text-[#ba1a1a]">
                  Zona de Riesgo: Eliminar Cuenta
                </h3>
                <p className="text-xs text-[#414844] mt-1 leading-relaxed">
                  Al eliminar tu cuenta, todos tus datos personales, publicaciones de prendas, servicios y mensajes se borrarán permanentemente del sistema.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleOpenDeleteModal}
                    className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                    <span>Eliminar mi Cuenta Definitivamente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Verification Code Modal (Requirement 9) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 border border-[#ffdad6] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>

            <div>
              <h3 className="font-headline font-bold text-lg text-[#ba1a1a]">
                Validación para Eliminar Cuenta
              </h3>
              <p className="text-xs text-[#414844] mt-1 leading-relaxed">
                Para confirmar la eliminación definitiva, introduce el siguiente código de validación de seguridad:
              </p>
            </div>

            {/* Generated Code Display Box */}
            <div className="p-4 rounded-xl bg-[#faf9f4] border-2 border-dashed border-[#c1c8c2] text-center">
              <span className="text-[11px] text-[#717973] uppercase tracking-wider block font-semibold mb-1">
                Código de Confirmación
              </span>
              <span className="font-mono text-xl font-bold tracking-widest text-[#012d1d] select-all">
                {verificationCode}
              </span>
            </div>

            {/* Code Input */}
            <div>
              <label className="block text-xs font-bold text-[#012d1d] mb-1">
                Escribe el código tal como aparece arriba *
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (deleteError) setDeleteError('');
                }}
                placeholder={verificationCode}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] text-xs font-mono tracking-widest text-[#1b1c19] focus:border-[#ba1a1a] outline-none"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-[#ba1a1a] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{deleteError}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#efeee9]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#414844] hover:bg-[#f5f4ef] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={inputCode.trim().toUpperCase() !== verificationCode}
                onClick={handleConfirmDeleteAccount}
                className="px-5 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] disabled:opacity-40 disabled:hover:bg-[#ba1a1a] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                <span>Confirmar y Borrar Cuenta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
