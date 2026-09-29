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
 * Renders the official brand logo with responsive sizing, accurate proportions,
 * crisp vector graphics, and support for horizontal, emblem, and full variants.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'full',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 sm:w-9 sm:h-9',
    sm: 'w-11 h-11 sm:w-12 sm:h-12',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-36 h-36 sm:w-40 sm:h-40',
    hero: 'w-48 h-48 sm:w-52 sm:h-52',
  }[size] || 'w-16 h-16 sm:w-20 sm:h-20';

  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 select-none group ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        <div className={`${sizeClasses} shrink-0 aspect-square flex items-center justify-center`}>
          <img
            src="/logo.svg"
            alt="Reborn Your Style Emblem"
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
            loading="eager"
          />
        </div>
        {showText && (
          <div className="flex flex-col text-left leading-none justify-center">
            <span className="font-headline font-black text-base sm:text-lg tracking-tight text-[#012d1d] whitespace-nowrap">
              Reborn
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.22em] uppercase font-bold text-[#2b694d] whitespace-nowrap mt-0.5">
              Your Style
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <img
        src="/logo.svg"
        alt="Reborn Your Style"
        className={`${sizeClasses} aspect-square object-contain transition-transform duration-200 hover:scale-105`}
        loading="eager"
      />
    </div>
  );
};

