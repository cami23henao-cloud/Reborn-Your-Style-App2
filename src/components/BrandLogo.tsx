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
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'h-8 w-8',
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-28 w-28',
    hero: 'h-44 w-44',
  }[size] || 'h-14 w-14';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src="/logo.svg"
        alt="Reborn Your Style"
        className={`${sizeClasses} object-contain transition-transform`}
        loading="eager"
      />
    </div>
  );
};
