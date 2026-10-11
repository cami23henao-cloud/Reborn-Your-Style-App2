import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { BrandLogo } from '../BrandLogo';
import { UserAvatar } from '../common/UserAvatar';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

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
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
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
      name: name.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
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
      <div className="bg-[#faf9f4] dark:bg-[#0e241c] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c1c8c2]/30 dark:border-[#2b694d]/30 flex items-center justify-between bg-white dark:bg-[#002113]/50">
          <div className="flex items-center gap-3">
            <BrandLogo size="xs" variant="emblem" />
            <div>
              <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                {isEn ? 'Edit Profile' : 'Editar Perfil'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#c1c8c2]">
                {isEn ? 'Update your personal name, photo and contact details' : 'Actualiza tus datos personales de contacto'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#717973] dark:text-[#a0a5a1] hover:text-[#012d1d] hover:bg-[#efeee9] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {saveSuccess && (
            <div className="p-3 bg-[#b0f1cc] text-[#002113] rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{isEn ? 'Changes saved successfully!' : '¡Cambios guardados con éxito! Los datos permanecen actualizados.'}</span>
            </div>
          )}

          {/* Avatar Section */}
          <div className="bg-white dark:bg-[#002113]/40 p-5 rounded-xl border border-[#c1c8c2]/40 dark:border-[#2b694d]/30 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#012d1d] dark:text-white">
                {isEn ? 'Profile Photo' : 'Foto de Perfil'}
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-semibold text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>{isEn ? 'Remove photo (Neutral avatar)' : 'Quitar foto (Dejar neutro)'}</span>
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
                  <span className="text-[10px] font-semibold">{isEn ? 'Change' : 'Cambiar'}</span>
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
                    <span>{isEn ? 'Upload from device' : 'Subir desde dispositivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {isUploading && (
                    <span className="text-xs text-[#2b694d] dark:text-[#b0f1cc] font-semibold animate-pulse self-center">
                      {isEn ? 'Loading image...' : 'Cargando imagen...'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#717973] dark:text-[#a0a5a1]">
                  {isEn ? 'Recommended formats: JPG, PNG or WebP.' : 'Formatos recomendados: JPG, PNG o WebP.'}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Personal Info Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d] dark:text-white">
                {isEn ? 'Full Name *' : 'Nombre Completo *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#0e241c] text-sm text-[#1b1c19] dark:text-white focus:border-[#012d1d] outline-none"
                placeholder={isEn ? 'E.g. Alex Moreno' : 'Ej. Álex Moreno'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d] dark:text-white">
                {isEn ? 'Phone / WhatsApp Contact' : 'Teléfono / WhatsApp de Contacto'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#0e241c] text-sm text-[#1b1c19] dark:text-white focus:border-[#012d1d] outline-none"
                placeholder="+57 312 456 7890"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d] dark:text-white">
                {isEn ? 'Bio / Presentation' : 'Biografía / Presentación'}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#0e241c] text-sm text-[#1b1c19] dark:text-white focus:border-[#012d1d] outline-none resize-none"
                placeholder={isEn ? 'Tell the community about yourself...' : 'Cuéntale a la comunidad sobre ti...'}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#c1c8c2]/30 dark:border-[#2b694d]/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#414844] dark:text-[#c1c8c2] hover:bg-[#efeee9] dark:hover:bg-[#2b694d]/30 transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#012d1d] text-white hover:bg-[#2b694d] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>{isEn ? 'Save Changes' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
