import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { BrandLogo } from '../BrandLogo';
import { GoogleMapsLocationPicker } from '../common/GoogleMapsLocationPicker';
import { UserAvatar } from '../common/UserAvatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave?: (updatedUser: UserProfile) => void;
  onSaveProfile?: (updatedUser: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onSaveProfile,
}) => {
  const [name, setName] = useState(user.name);
  const [selectedRole, setSelectedRole] = useState<'cliente' | 'profesional'>(
    user.role === 'profesional' ? 'profesional' : 'cliente'
  );
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [location, setLocation] = useState(user.location || '');
  const [address, setAddress] = useState(user.address || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setSelectedRole(user.role === 'profesional' ? 'profesional' : 'cliente');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setLocation(user.location || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
      setSaveSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      role: selectedRole,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      location: location.trim(),
      address: address.trim(),
      phone: phone.trim(),
    };

    const saveHandler = onSave || onSaveProfile;
    if (saveHandler) {
      saveHandler(updated);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#faf9f4] border border-[#c1c8c2]/50 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c1c8c2]/30 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <BrandLogo size="xs" variant="emblem" />
            <div>
              <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                Editar Perfil de Usuario
              </h3>
              <p className="text-xs text-[#414844]">
                Actualiza tu foto personal, dirección física y ubicación en Google Maps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#717973] hover:text-[#012d1d] hover:bg-[#efeee9] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {saveSuccess && (
            <div className="p-3 bg-[#b0f1cc] text-[#002113] rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>¡Cambios guardados con éxito! Los datos permanecen actualizados.</span>
            </div>
          )}

          {/* Avatar Section - Strict Privacy: Real photo or neutral space */}
          <div className="bg-white p-5 rounded-xl border border-[#c1c8c2]/40 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#012d1d]">
                Foto de Perfil
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-semibold text-[#ba1a1a] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Quitar foto (Dejar neutro)</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <UserAvatar
                  src={avatarUrl}
                  name={name}
                  size="hero"
                  borderClassName="border-4 border-[#b0f1cc] shadow-md"
                />
                <label className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                  <span className="text-[10px] font-semibold">Cambiar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b694d] text-white text-xs font-semibold hover:bg-[#012d1d] cursor-pointer transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-base">upload</span>
                    <span>Subir desde dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {isUploading && (
                    <span className="text-xs text-[#2b694d] font-semibold animate-pulse self-center">
                      Cargando imagen...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#717973]">
                  Formatos recomendados: JPG, PNG o WebP. Si no subes ninguna foto, tu perfil permanecerá con un avatar neutro sin imágenes inventadas.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d]">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none"
                placeholder="Ej. Álex Moreno"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d]">
                Teléfono / WhatsApp de Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none"
                placeholder="+57 312 456 7890"
              />
            </div>
          </div>

          {/* Account Role Selection */}
          {user.role !== 'admin' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d] uppercase tracking-wider">
                Rol en la plataforma
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('cliente')}
                  className={`p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                    selectedRole === 'cliente'
                      ? 'border-[#012d1d] bg-[#f5fbf7] text-[#012d1d] font-bold ring-1 ring-[#012d1d]'
                      : 'border-[#c1c8c2]/60 text-[#414844] hover:bg-[#faf9f4]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-base text-[#2b694d]">person</span>
                    <span className="font-bold">Usuario / Cliente</span>
                  </div>
                  <p className="text-[11px] font-normal text-[#717973]">Publicar prendas, solicitar arreglos y comprar moda circular.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('profesional')}
                  className={`p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                    selectedRole === 'profesional'
                      ? 'border-[#012d1d] bg-[#f5fbf7] text-[#012d1d] font-bold ring-1 ring-[#012d1d]'
                      : 'border-[#c1c8c2]/60 text-[#414844] hover:bg-[#faf9f4]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-base text-[#2b694d]">handyman</span>
                    <span className="font-bold">Modista / Costurero</span>
                  </div>
                  <p className="text-[11px] font-normal text-[#717973]">Gestionar taller textil, ofrecer servicios de confección y arreglos.</p>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#012d1d]">
              Biografía / Presentación
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none resize-none"
              placeholder="Cuéntale a la comunidad tus gustos en moda circular, estilo o experiencia textil..."
            />
          </div>

          {/* Address field (Requirement 7: Campo para la dirección) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#012d1d]">
              Dirección del Taller o Domicilio (Opcional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none"
              placeholder="Ej. Carrera 15 # 85-30, Taller 204"
            />
            <p className="text-[11px] text-[#717973]">
              Si no deseas compartir dirección exacta, déjala vacía.
            </p>
          </div>

          {/* Google Maps Location Selector (Requirement 7: Selección mediante Google Maps) */}
          <GoogleMapsLocationPicker
            value={location}
            onChange={(newLoc) => setLocation(newLoc)}
            label="Ubicación en Google Maps"
            placeholder="Busca tu dirección, barrio o ciudad (ej. Chapinero, Bogotá D.C.)"
            required={false}
            showMapPreview={true}
          />

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#c1c8c2]/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#414844] hover:bg-[#efeee9] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#012d1d] text-white hover:bg-[#2b694d] transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
