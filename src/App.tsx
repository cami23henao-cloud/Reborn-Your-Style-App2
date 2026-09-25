import React, { useState, useEffect } from 'react';
import {
  AppView,
  UserRole,
  UserProfile,
  Professional,
  GarmentProject,
  ServiceItem,
  ServiceRequest,
  InspirationItem,
  ChatConversation,
  ChatMessage,
  ToastMessage,
} from './types';
import {
  INITIAL_PROFESSIONALS,
  INITIAL_GARMENTS,
  INITIAL_SERVICES,
  INITIAL_REQUESTS,
  INITIAL_INSPIRATIONS,
  INITIAL_CONVERSATIONS,
  GUEST_USER_PROFILE,
} from './data/mockData';
import {
  getActiveSession,
  setActiveSession,
  StoredUserAccount,
  saveUserGarment,
  saveUserServiceRequest,
  saveUserServiceItem,
  saveUserConversation,
  updateUserAccountProfile,
  updateUserGarmentStatus,
  deleteUserAccount,
} from './services/userStore';
import { purgeAllLegacySessionsAndGoogleData } from './services/securityService';
import { ProtectedAreaGuard } from './components/common/ProtectedAreaGuard';
import { TopNavBar } from './components/TopNavBar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { FloatingChatWindow } from './components/common/FloatingChatWindow';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from './components/modals/AuthModal';
import { InfoModals } from './components/modals/InfoModals';
import { SearchModal } from './components/modals/SearchModal';
import { ServiceRequestModal } from './components/modals/ServiceRequestModal';
import { CreateServiceModal } from './components/modals/CreateServiceModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { GarmentDetailModal } from './components/modals/GarmentDetailModal';

import { HomeView } from './components/views/HomeView';
import { ExploraView } from './components/views/ExploraView';
import { CatalogosView } from './components/views/CatalogosView';
import { CategoriaView } from './components/views/CategoriaView';
import { CosturerosView } from './components/views/CosturerosView';
import { ProfessionalProfileView } from './components/views/ProfessionalProfileView';
import { PublicarPrendaView } from './components/views/PublicarPrendaView';
import { InspiracionView } from './components/views/InspiracionView';
import { ComoFuncionaView } from './components/views/ComoFuncionaView';
import { MiEstudioView } from './components/views/MiEstudioView';
import { MensajesView } from './components/views/MensajesView';
import { SolicitudResumenView } from './components/views/SolicitudResumenView';
import { AdminPanelView } from './components/views/AdminPanelView';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('inicio');
  const [userRole, setUserRole] = useState<UserRole>('cliente');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserAccount, setCurrentUserAccount] = useState<StoredUserAccount | null>(null);

  // Dedicated Category & Item states
  const [selectedCategory, setSelectedCategory] = useState<string>('Ropa');
  const [selectedGarment, setSelectedGarment] = useState<GarmentProject | null>(null);

  // Filter state for Explora
  const [exploraTab, setExploraTab] = useState<'profesionales' | 'prendas'>('prendas');
  const [exploraCategory, setExploraCategory] = useState<string>('Todas');

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(GUEST_USER_PROFILE);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Application Data States
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(INITIAL_PROFESSIONALS[3]); // Doña Marta default
  
  // Community Garments (catalog visible in Explora)
  const [garments, setGarments] = useState<GarmentProject[]>(INITIAL_GARMENTS);
  
  // User's own registered items (empty by default for new accounts)
  const [userGarments, setUserGarments] = useState<GarmentProject[]>([]);
  const [userServices, setUserServices] = useState<ServiceItem[]>([]);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);

  // Services catalog & inspirations
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [latestRequest, setLatestRequest] = useState<ServiceRequest | null>(null);

  // User Likes Persistence (Requirement 13: no automático, dar y quitar, persistente)
  const [likedInspirationIds, setLikedInspirationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('reborn_user_liked_inspirations_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inspirations, setInspirations] = useState<InspirationItem[]>(() => {
    try {
      const saved = localStorage.getItem('reborn_user_liked_inspirations_v1');
      const liked: string[] = saved ? JSON.parse(saved) : [];
      return INITIAL_INSPIRATIONS.map((ins) => ({
        ...ins,
        isLiked: liked.includes(ins.id),
        likes: liked.includes(ins.id) ? ins.likes + 1 : ins.likes,
      }));
    } catch {
      return INITIAL_INSPIRATIONS.map((ins) => ({ ...ins, isLiked: false }));
    }
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  // Chats start blank by default (Requirement 3: no chat preselected)
  const [activeConvId, setActiveConvId] = useState<string>('');

  // Floating Docked Chat State (Requirement 8: No auto page navigation away, starts empty)
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [floatingChatConvId, setFloatingChatConvId] = useState<string>('');

  // Draft project for publication
  const [draftProject, setDraftProject] = useState<Partial<GarmentProject> | null>(null);

  // Modals & Overlays
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [infoModalType, setInfoModalType] = useState<'privacidad' | 'terminos' | 'contacto' | 'sostenibilidad' | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);

  // Notifications / Toast (Requirement 2: permanecer visibles únicamente 1 segundo)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Account Deletion Handler (Requirement 9)
  const handleDeleteAccount = (userId: string) => {
    deleteUserAccount(userId);
    setActiveSession(null);
    setCurrentUserAccount(null);
    setIsLoggedIn(false);
    setUserProfile(GUEST_USER_PROFILE);
    setUserGarments([]);
    setUserServices([]);
    setUserRequests([]);
    handleNavigate('inicio');
    addToast('Cuenta eliminada', 'Tu cuenta y todos tus datos han sido borrados de la plataforma.', 'info');
  };

  // Admin Moderation Handlers (Requirement 12)
  const handleApproveGarment = (id: string) => {
    setGarments((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'Publicada' } : g))
    );
    setUserGarments((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'Publicada' } : g))
    );
    addToast('Publicación aprobada', 'La prenda ha sido aprobada y ahora es visible en la plataforma.', 'success');
  };

  const handleApproveService = (id: string) => {
    addToast('Servicio aprobado', 'El servicio ha sido verificado y aprobado para el catálogo.', 'success');
  };

  // Check active session on mount
  useEffect(() => {
    const active = getActiveSession();
    if (active) {
      setIsLoggedIn(true);
      setCurrentUserAccount(active);
      setUserProfile(active.profile);
      setUserRole(active.role);
      setUserGarments(active.garments || []);
      setUserServices(active.services || []);
      setUserRequests(active.requests || []);
      setIsAuthModalOpen(false);
      if (active.role === 'admin') {
        setCurrentView('admin');
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUserAccount(null);
      setUserProfile(GUEST_USER_PROFILE);
    }
  }, []);

  // Scroll to top on navigation
  const handleNavigate = (view: AppView) => {
    if (userRole === 'admin' && view !== 'admin') {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation to costureros directory
  const handleNavigateToDesigners = () => {
    handleNavigate('costureros');
  };

  // Navigation to dedicated Category page
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    handleNavigate('categoria');
  };

  // Start chat with garment owner or community user (Requirement 8: empty until user writes, no auto page change)
  const handleStartChatWithUser = (authorName: string, authorAvatar?: string) => {
    const participantId = `user-${authorName.toLowerCase().replace(/\s+/g, '-')}`;
    let targetConvId = '';
    const existingConv = conversations.find(
      (c) => c.participantId === participantId || c.participantName === authorName
    );
    if (existingConv) {
      targetConvId = existingConv.id;
    } else {
      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        participantId,
        participantName: authorName,
        participantRole: 'Comunidad Reborn',
        participantAvatar: authorAvatar || '',
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        messages: [], // Empty by default: no invented messages!
      };
      setConversations((prev) => [newConv, ...prev]);
      if (currentUserAccount) {
        saveUserConversation(currentUserAccount.id, newConv);
      }
      targetConvId = newConv.id;
    }
    setActiveConvId(targetConvId);
    setFloatingChatConvId(targetConvId);
    setIsFloatingChatOpen(true);
    // Keep user on the current view (no forced page jump)
  };

  // Select Professional and go to Profile
  const handleSelectProfessional = (pro: Professional) => {
    setSelectedProfessional(pro);
    handleNavigate('perfil-profesional');
  };

  // Role toggle (Protected: Admin role cannot be altered by normal user operations)
  const handleToggleRole = () => {
    if (userRole === 'admin') return;
    const nextRole = userRole === 'cliente' ? 'profesional' : 'cliente';
    setUserRole(nextRole);
    setUserProfile((prev) => ({ ...prev, role: nextRole }));
    if (currentUserAccount) {
      const updated = { ...currentUserAccount, role: nextRole, profile: { ...currentUserAccount.profile, role: nextRole } };
      setCurrentUserAccount(updated);
      setActiveSession(updated);
    }
    addToast(
      'Modo cambiado',
      `Has cambiado al modo ${nextRole === 'profesional' ? 'Taller / Diseñador' : 'Cliente'}.`,
      'info'
    );
  };

  // Profile Update handler
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    if (currentUserAccount) {
      updateUserAccountProfile(currentUserAccount.id, updatedProfile);
      setCurrentUserAccount((prev) => prev ? { ...prev, profile: updatedProfile } : null);
    }
    addToast('Perfil actualizado', 'Tu foto y datos de perfil se han actualizado con éxito.', 'success');
  };

  // Auth login handler from AuthModal
  const handleLoginAccount = (account: StoredUserAccount) => {
    setCurrentUserAccount(account);
    setUserProfile(account.profile);
    setUserRole(account.role);
    setIsLoggedIn(true);
    setUserGarments(account.garments || []);
    setUserServices(account.services || []);
    setUserRequests(account.requests || []);
    if (account.conversations && account.conversations.length > 0) {
      setConversations(account.conversations);
    }
    setActiveSession(account);
    if (account.role === 'admin') {
      handleNavigate('admin');
      addToast('Sesión administrativa iniciada', 'Bienvenido al panel central de administración.', 'success');
    } else {
      handleNavigate('mi-estudio');
      addToast('Sesión iniciada', `Bienvenido(a), ${account.name}. Tu perfil privado está activo.`, 'success');
    }
  };

  const handleLogout = () => {
    setActiveSession(null);
    setCurrentUserAccount(null);
    setIsLoggedIn(false);
    setUserProfile(GUEST_USER_PROFILE);
    setUserGarments([]);
    setUserServices([]);
    setUserRequests([]);
    handleNavigate('inicio');
    setIsAuthModalOpen(true);
    setAuthModalMode('login');
    addToast('Sesión cerrada', 'Has cerrado sesión de forma segura y confidencial.', 'info');
  };

  // Request Service Flow
  const handleOpenRequestServiceModal = (pro: Professional) => {
    setSelectedProfessional(pro);
    setIsServiceRequestModalOpen(true);
  };

  const handleSubmitServiceRequest = (details: {
    professionalId: string;
    professionalName: string;
    garmentTitle: string;
    serviceType: string;
    budget: number;
    description: string;
  }) => {
    const newReq: ServiceRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: userProfile.name,
      clientAvatar: userProfile.avatarUrl,
      garmentTitle: details.garmentTitle,
      serviceType: details.serviceType,
      budget: details.budget,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      description: details.description,
    };

    setUserRequests((prev) => [newReq, ...prev]);
    setRequests((prev) => [newReq, ...prev]);
    setLatestRequest(newReq);

    if (currentUserAccount) {
      saveUserServiceRequest(currentUserAccount.id, newReq);
    }

    // Also add message to conversation
    const existingConv = conversations.find((c) =>
      c.participantName.toLowerCase().includes(details.professionalName.toLowerCase())
    );

    if (existingConv) {
      existingConv.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: `Hola ${details.professionalName}, te he enviado una solicitud para mi "${details.garmentTitle}": ${details.description}`,
        time: 'Ahora',
      });
      setActiveConvId(existingConv.id);
    }

    addToast(
      '¡Solicitud Enviada!',
      `Tu requerimiento ha sido enviado a ${details.professionalName}.`,
      'success'
    );
    handleNavigate('solicitud-resumen');
  };

  // Start chat with professional (Requirement 8: starts empty, no forced page change)
  const handleStartMessageWithPro = (pro: Professional) => {
    let targetConvId = '';
    const existingConv = conversations.find((c) => c.participantId === pro.id);
    if (existingConv) {
      targetConvId = existingConv.id;
    } else {
      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        participantId: pro.id,
        participantName: pro.name,
        participantRole: pro.specialty,
        participantAvatar: pro.imageUrl || '',
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        messages: [], // Strictly empty: no invented messages!
      };
      setConversations((prev) => [newConv, ...prev]);
      if (currentUserAccount) {
        saveUserConversation(currentUserAccount.id, newConv);
      }
      targetConvId = newConv.id;
    }
    setActiveConvId(targetConvId);
    setFloatingChatConvId(targetConvId);
    setIsFloatingChatOpen(true);
    // User stays on current view smoothly
  };

  // Publish Project from Publication View
  const handlePublishProject = (project: GarmentProject) => {
    const garmentWithOwner = {
      ...project,
      ownerId: userProfile.id,
      ownerName: userProfile.name,
    };

    setUserGarments((prev) => [garmentWithOwner, ...prev]);
    setGarments((prev) => [garmentWithOwner, ...prev]);

    if (currentUserAccount) {
      saveUserGarment(currentUserAccount.id, garmentWithOwner);
    }

    const updatedProf: UserProfile = {
      ...userProfile,
      publishedCount: (userProfile.publishedCount || 0) + 1,
    };
    setUserProfile(updatedProf);
    if (currentUserAccount) {
      updateUserAccountProfile(currentUserAccount.id, updatedProf);
    }

    setDraftProject(null);
    addToast(
      '¡Prenda Publicada!',
      `"${project.title}" ya está visible para la comunidad en Reborn.`,
      'success'
    );
    handleNavigate('explora');
  };

  const handleSaveDraft = (draft: Partial<GarmentProject>) => {
    setDraftProject(draft);
    addToast(
      'Borrador guardado',
      'Tu progreso se guardó localmente. Puedes continuar cuando gustes.',
      'info'
    );
  };

  // Service Management
  const handleSaveService = (serviceData: Omit<ServiceItem, 'id'>, editId?: string) => {
    if (editId) {
      setUserServices((prev) =>
        prev.map((s) => (s.id === editId ? { ...serviceData, id: editId } : s))
      );
      setServices((prev) =>
        prev.map((s) => (s.id === editId ? { ...serviceData, id: editId } : s))
      );
      addToast('Servicio actualizado', 'Los cambios se han guardado con éxito.', 'success');
    } else {
      const newService: ServiceItem = {
        ...serviceData,
        id: `srv-${Date.now()}`,
      };
      setUserServices((prev) => [...prev, newService]);
      setServices((prev) => [...prev, newService]);
      if (currentUserAccount) {
        saveUserServiceItem(currentUserAccount.id, newService);
      }
      addToast('Servicio creado', 'Tu nuevo servicio ya está disponible.', 'success');
    }
    setServiceToEdit(null);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsCreateServiceModalOpen(true);
  };

  const handleDeleteService = (id: string) => {
    setUserServices((prev) => prev.filter((s) => s.id !== id));
    setServices((prev) => prev.filter((s) => s.id !== id));
    addToast('Servicio eliminado', 'El servicio ha sido removido de tu catálogo.', 'info');
  };

  const handleDeleteGarment = (id: string) => {
    setUserGarments((prev) => prev.filter((g) => g.id !== id));
    setGarments((prev) => prev.filter((g) => g.id !== id));
    addToast('Prenda eliminada', 'La publicación ha sido eliminada del catálogo.', 'info');
  };

  const handleUpdateRequestStatus = (
    requestId: string,
    newStatus: 'Aceptada' | 'Rechazada' | 'En Proceso' | 'Completada'
  ) => {
    setUserRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    addToast('Estado actualizado', `La solicitud #${requestId} ahora está ${newStatus}.`, 'success');
  };

  // Like Inspiration (Requirement 13: dar y quitar like, no automático, persistencia)
  const handleLikeInspiration = (id: string) => {
    setLikedInspirationIds((prev) => {
      const isAlreadyLiked = prev.includes(id);
      const nextLiked = isAlreadyLiked ? prev.filter((itemId) => itemId !== id) : [...prev, id];
      try {
        localStorage.setItem('reborn_user_liked_inspirations_v1', JSON.stringify(nextLiked));
      } catch (e) {
        console.error('Error saving likes to localStorage', e);
      }

      setInspirations((currInspirations) =>
        currInspirations.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              isLiked: !isAlreadyLiked,
              likes: isAlreadyLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
            };
          }
          return item;
        })
      );

      if (isAlreadyLiked) {
        addToast('Me gusta retirado', 'Has quitado la publicación de tus favoritos.', 'info');
      } else {
        addToast('¡Te gusta esto!', 'Guardado en tus inspiraciones favoritas.', 'success');
      }

      return nextLiked;
    });
  };

  // Send Message in Chat (Requirement 8: Real messages, persistence, responsive interaction)
  const handleSendMessage = (convId: string, text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Ahora',
    };

    setConversations((prev) => {
      let isFirstMessage = false;
      let participantName = '';

      const updated = prev.map((c) => {
        if (c.id === convId) {
          isFirstMessage = c.messages.length === 0;
          participantName = c.participantName;
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Ahora',
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      });

      if (currentUserAccount) {
        const found = updated.find((c) => c.id === convId);
        if (found) {
          saveUserConversation(currentUserAccount.id, found);
        }
      }

      // If this was the first message, simulate a realistic professional/community reply after 1.2s
      if (isFirstMessage) {
        setTimeout(() => {
          const proReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'other',
            text: `¡Hola! Gracias por comunicarte. Con mucho gusto te asesoro con el ajuste o diseño de tu prenda. ¿Tienes alguna foto o medida para revisar?`,
            time: 'Ahora',
          };
          setConversations((p) => {
            const withReply = p.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    lastMessage: proReply.text,
                    lastMessageTime: 'Ahora',
                    messages: [...c.messages, proReply],
                  }
                : c
            );
            if (currentUserAccount) {
              const matched = withReply.find((c) => c.id === convId);
              if (matched) {
                saveUserConversation(currentUserAccount.id, matched);
              }
            }
            return withReply;
          });
        }, 1200);
      }

      return updated;
    });
  };

  // Share platform
  const handleSharePlatform = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Reborn Your Style | Moda Circular y Upcycling en Colombia',
          text: 'Conoce Reborn, la plataforma de suprareciclaje de ropa y modistas locales en Colombia.',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(
        'Enlace copiado',
        'El link de Reborn Your Style ha sido copiado al portapapeles.',
        'info'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f4] text-[#1b1c19] font-sans antialiased selection:bg-[#b0f1cc] selection:text-[#002113]">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Navigation Bar */}
      <TopNavBar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        userRole={userRole}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        user={userProfile}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {currentView === 'inicio' && (
          <HomeView
            onNavigate={handleNavigate}
            featuredProfessionals={professionals}
            onSelectProfessional={handleSelectProfessional}
            user={userProfile}
            onNavigateToDesigners={handleNavigateToDesigners}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentView === 'catalogos' && (
          <CatalogosView
            onNavigate={handleNavigate}
            onSelectCategory={handleSelectCategory}
            garments={garments}
          />
        )}

        {currentView === 'categoria' && (
          <CategoriaView
            categoryName={selectedCategory}
            garments={garments}
            onBackToCatalogos={() => handleNavigate('catalogos')}
            onSelectCategory={handleSelectCategory}
            onSelectGarment={(g) => setSelectedGarment(g)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'costureros' && (
          <CosturerosView
            professionals={professionals}
            onSelectProfessional={handleSelectProfessional}
            onSendMessage={handleStartMessageWithPro}
            onRequestService={handleOpenRequestServiceModal}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'explora' && (
          <ExploraView
            professionals={professionals}
            garments={garments}
            onSelectProfessional={handleSelectProfessional}
            onNavigate={handleNavigate}
            user={userProfile}
            initialTab={exploraTab}
            initialCategory={exploraCategory}
            onSelectCategory={setExploraCategory}
          />
        )}

        {currentView === 'servicios' && (
          <MiEstudioView
            user={userProfile}
            userRole={userRole}
            services={userServices}
            garments={userGarments}
            requests={userRequests}
            onOpenCreateService={() => {
              setServiceToEdit(null);
              setIsCreateServiceModalOpen(true);
            }}
            onEditService={handleOpenEditService}
            onDeleteService={handleDeleteService}
            onDeleteGarment={handleDeleteGarment}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onNavigate={handleNavigate}
            onUpdateProfile={handleUpdateProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {currentView === 'perfil-profesional' && selectedProfessional && (
          <ProfessionalProfileView
            professional={selectedProfessional}
            onBack={() => handleNavigate('costureros')}
            onRequestService={handleOpenRequestServiceModal}
            onSendMessage={handleStartMessageWithPro}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'publicar-prenda' && (
          isLoggedIn ? (
            userRole === 'profesional' ? (
              <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-[#efeee9] text-center shadow-md space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f5f4ef] text-[#012d1d] mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">handyman</span>
                </div>
                <h2 className="font-headline font-bold text-xl text-[#012d1d]">
                  Función Exclusiva para Clientes
                </h2>
                <p className="text-xs text-[#717973] max-w-md mx-auto leading-relaxed">
                  Tu cuenta está registrada con el rol de <strong>Modista / Costurero</strong>. En este rol ofreces servicios de confección y suprareciclaje en tu taller.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleNavigate('mi-estudio')}
                    className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">design_services</span>
                    <span>Ir a Mi Taller / Gestionar Servicios</span>
                  </button>
                </div>
              </div>
            ) : (
              <PublicarPrendaView
                onPublishProject={handlePublishProject}
                onSaveDraft={handleSaveDraft}
                onNavigate={handleNavigate}
                user={userProfile}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
                initialDraft={draftProject}
              />
            )
          ) : (
            <ProtectedAreaGuard
              title="Publicación de Prendas Protegida"
              description="Para registrar prendas, describir telas o solicitar intervenciones a talleres de costura, debes autenticarte de forma segura."
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigateHome={() => handleNavigate('inicio')}
            />
          )
        )}

        {currentView === 'inspiracion' && (
          <InspiracionView
            inspirations={inspirations}
            professionals={professionals}
            onSelectProfessional={handleSelectProfessional}
            onNavigate={handleNavigate}
            onLikeInspiration={handleLikeInspiration}
          />
        )}

        {currentView === 'como-funciona' && (
          <ComoFuncionaView
            onNavigate={handleNavigate}
            onOpenAuth={() => handleOpenAuth('register')}
            onNavigateToDesigners={handleNavigateToDesigners}
          />
        )}

        {currentView === 'mi-estudio' && (
          isLoggedIn ? (
            <MiEstudioView
              user={userProfile}
              userRole={userRole}
              services={userServices}
              garments={userGarments}
              requests={userRequests}
              onOpenCreateService={() => {
                setServiceToEdit(null);
                setIsCreateServiceModalOpen(true);
              }}
              onEditService={handleOpenEditService}
              onDeleteService={handleDeleteService}
              onDeleteGarment={handleDeleteGarment}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onNavigate={handleNavigate}
              onUpdateProfile={handleUpdateProfile}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : (
            <ProtectedAreaGuard
              title="Panel de Estudio Textil Protegido"
              description="Por estrictas políticas de confidencialidad y protección de datos, debes autenticarte para gestionar tu inventario textil, solicitudes y proyectos."
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigateHome={() => handleNavigate('inicio')}
            />
          )
        )}

        {currentView === 'mensajes' && (
          isLoggedIn ? (
            <MensajesView
              conversations={conversations}
              activeConvId={activeConvId}
              onSelectConversation={setActiveConvId}
              onSendMessage={handleSendMessage}
              onNavigate={handleNavigate}
            />
          ) : (
            <ProtectedAreaGuard
              title="Bandeja de Mensajes Privada y Cifrada"
              description="Las conversaciones directas con diseñadores y cotizaciones están cifradas de extremo a extremo. Inicia sesión para acceder a tu historial seguro."
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigateHome={() => handleNavigate('inicio')}
            />
          )
        )}

        {currentView === 'solicitud-resumen' && (
          <SolicitudResumenView
            request={latestRequest}
            onNavigate={handleNavigate}
            onNavigateToDesigners={handleNavigateToDesigners}
          />
        )}

        {/* Admin Moderation Panel View (Requirement 12) */}
        {currentView === 'admin' && (
          isLoggedIn && userRole === 'admin' ? (
            <AdminPanelView
              user={userProfile}
              garments={garments}
              services={services}
              onApproveGarment={handleApproveGarment}
              onDeleteGarment={handleDeleteGarment}
              onApproveService={handleApproveService}
              onDeleteService={handleDeleteService}
              onNavigate={handleNavigate}
            />
          ) : (
            <ProtectedAreaGuard
              title="Panel de Administración Exclusivo"
              description="Esta sección está restringida únicamente a usuarios con rol de Administrador para moderar publicaciones."
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigateHome={() => handleNavigate('inicio')}
            />
          )
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {userRole === 'admin' ? (
        <footer className="bg-[#012d1d] text-white/70 py-6 border-t border-[#c1c8c2]/30 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-white">Reborn Your Style • Sistema Administrativo Central</span>
            <span>© 2026 Reborn Your Style Inc. Todos los derechos reservados.</span>
          </div>
        </footer>
      ) : (
        <Footer
          onNavigate={handleNavigate}
          onOpenInfoModal={(type) => setInfoModalType(type)}
          onSharePlatform={handleSharePlatform}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Modals & Overlays */}
      <GarmentDetailModal
        garment={selectedGarment}
        onClose={() => setSelectedGarment(null)}
        onStartChat={handleStartChatWithUser}
        onFindCosturero={(g) => {
          setSelectedGarment(null);
          handleNavigate('costureros');
        }}
      />
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={userProfile}
        onSaveProfile={handleUpdateProfile}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginAccount={handleLoginAccount}
      />

      <InfoModals
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
        onSendMessage={(name, email, msg) => {
          addToast('Mensaje de contacto enviado', 'Gracias por contactarnos. Te responderemos a la brevedad.', 'success');
        }}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        professionals={professionals}
        garments={garments}
        inspirations={inspirations}
        services={services}
        onSelectProfessional={handleSelectProfessional}
        onNavigate={handleNavigate}
      />

      <ServiceRequestModal
        isOpen={isServiceRequestModalOpen}
        onClose={() => setIsServiceRequestModalOpen(false)}
        professional={selectedProfessional}
        garments={isLoggedIn ? userGarments : []}
        onSubmitRequest={handleSubmitServiceRequest}
      />

      <CreateServiceModal
        isOpen={isCreateServiceModalOpen}
        onClose={() => {
          setIsCreateServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        serviceToEdit={serviceToEdit}
        onSaveService={handleSaveService}
      />

      {/* Docked Floating Chat Window (Requirement 8 & 2: smooth, persistent, no forced page jump) */}
      {userRole !== 'admin' && (
        <FloatingChatWindow
          conversation={conversations.find((c) => c.id === floatingChatConvId) || null}
          isOpen={isFloatingChatOpen}
          onClose={() => setIsFloatingChatOpen(false)}
          onSendMessage={handleSendMessage}
          onOpenFullScreen={() => {
            setIsFloatingChatOpen(false);
            handleNavigate('mensajes');
          }}
        />
      )}
    </div>
  );
}

export default App;
