import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  variant?: 'full' | 'emblem' | 'horizontal';
  className?: string;
  onClick?: () => void;
}

/**
 * BrandLogo component for Reborn Your Style.
 * Renders the exact provided original brand logo without modifying design,
 * colors, typography, or proportions, while allowing responsive sizing and positioning.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'full',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-9 h-9',
    sm: 'w-13 h-13',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
    hero: 'w-52 h-52',
  }[size] || 'w-20 h-20';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src="/logo.svg"
        alt="Reborn Your Style"
        className={`${sizeClasses} object-contain transition-transform duration-200 hover:scale-105`}
        loading="eager"
      />
    </div>
  );
};
