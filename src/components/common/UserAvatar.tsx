import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  borderClassName?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  hero: 'w-24 h-24 text-3xl',
};

/**
 * UserAvatar:
 * Strictly adheres to privacy and authenticity requirements:
 * - Never invents profile pictures or shows stock human portraits.
 * - If the user has not uploaded a photo, displays a clean, elegant neutral placeholder.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = '',
  borderClassName = 'border border-[#c1c8c2]/50',
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  const hasPhoto = Boolean(src && src.trim() && !imgError);

  if (hasPhoto) {
    return (
      <img
        src={src!}
        alt={name || 'Foto de perfil'}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${borderClassName} ${className}`}
      />
    );
  }

  // Clean neutral space without portrait invention
  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : '';

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#e9ece9] text-[#2b4c38] font-bold flex items-center justify-center shrink-0 select-none ${borderClassName} ${className}`}
      title={name ? `${name} (Sin foto)` : 'Sin foto de perfil'}
    >
      {initial ? (
        <span>{initial}</span>
      ) : (
        <span className="material-symbols-outlined text-[1.1em] text-[#717973]">person</span>
      )}
    </div>
  );
};
