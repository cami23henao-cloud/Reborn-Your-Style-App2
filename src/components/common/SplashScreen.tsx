import React, { useEffect, useState } from 'react';
import { BrandLogo } from '../BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number; // default 1250ms (between 1.0s and 1.5s)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1250,
}) => {
  const [cutProgress, setCutProgress] = useState(0); // 0 to 100
  const [isOpeningFabric, setIsOpeningFabric] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  useEffect(() => {
    // 1. Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsUnmounted(true);
      onFinish?.();
      return;
    }

    const startTime = performance.now();
    const animFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(100, (elapsed / (durationMs * 0.65)) * 100);
      setCutProgress(progress);

      if (progress >= 60 && !isOpeningFabric) {
        setIsOpeningFabric(true);
      }

      if (elapsed < durationMs) {
        requestAnimationFrame(animFrame);
      } else {
        // Cut complete - start curtain fade-out / slide-up
        setIsExiting(true);
        setTimeout(() => {
          setIsUnmounted(true);
          onFinish?.();
        }, 320); // Quick, elegant exit
      }
    };

    const handle = requestAnimationFrame(animFrame);
    return () => cancelAnimationFrame(handle);
  }, [durationMs, onFinish, isOpeningFabric]);

  if (isUnmounted) return null;

  // Scissors blade snip angle oscillation based on progress
  const snipAngle = Math.sin(cutProgress * 0.4) * 14;

  return (
    <div
      role="status"
      aria-label="Cargando Reborn Your Style"
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#012d1d] select-none transition-all duration-350 ease-out ${
        isExiting
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-[#0a4d33]/50 via-[#012d1d] to-[#00170e] pointer-events-none" />

      {/* ===================================================================== */}
      {/* REVEALED LOGO & SLOGAN (Center content revealed as fabric parts)      */}
      {/* ===================================================================== */}
      <div
        className={`relative z-10 flex flex-col items-center px-6 max-w-sm text-center transition-all duration-500 ease-out ${
          isOpeningFabric
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-3'
        }`}
      >
        {/* Glowing Emblem */}
        <div className="relative mb-4">
          <div className="absolute -inset-3 bg-[#b0f1cc]/25 rounded-full blur-xl animate-pulse pointer-events-none" />
          <div className="relative p-3.5 bg-white/10 rounded-2xl border border-[#b0f1cc]/40 backdrop-blur-md shadow-2xl">
            <BrandLogo size="lg" variant="emblem" />
          </div>
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 drop-shadow-md">
          Reborn Your Style
        </h1>
        <p className="text-xs sm:text-sm text-[#b0f1cc] font-medium tracking-wide drop-shadow-xs">
          Transforma tus prendas. Reimagina tu estilo.
        </p>

        {/* Subtle loading pulse */}
        <div className="mt-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b0f1cc] animate-ping" />
          <span className="text-[11px] font-mono text-white/70 tracking-wider uppercase">
            Ingresando al inicio...
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FABRIC HALF 1 (Top / Left drape)                                      */}
      {/* ===================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-transform duration-600 ease-out origin-top-left ${
          isOpeningFabric
            ? '-translate-x-full -translate-y-12 rotate-[-4deg] opacity-70'
            : 'translate-x-0 translate-y-0 opacity-100'
        }`}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
          backgroundColor: '#033824',
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 4px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)
          `,
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Diagonal Hem & Stitches on edge */}
        <div className="absolute inset-0 border-b-2 border-dashed border-[#b0f1cc]/40" />
      </div>

      {/* ===================================================================== */}
      {/* FABRIC HALF 2 (Bottom / Right drape)                                  */}
      {/* ===================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-transform duration-600 ease-out origin-bottom-right ${
          isOpeningFabric
            ? 'translate-x-full translate-y-12 rotate-[4deg] opacity-70'
            : 'translate-x-0 translate-y-0 opacity-100'
        }`}
        style={{
          clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)',
          backgroundColor: '#022417',
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 4px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 4px)
          `,
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Diagonal Hem & Stitches on edge */}
        <div className="absolute inset-0 border-t-2 border-dashed border-[#b0f1cc]/40" />
      </div>

      {/* ===================================================================== */}
      {/* SCISSORS CUTTING ACROSS THE DIAGONAL SEAM                             */}
      {/* ===================================================================== */}
      {!isExiting && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 ease-linear"
          style={{
            left: `${cutProgress * 0.95}%`,
            top: `${(100 - cutProgress * 0.95)}%`,
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            opacity: cutProgress >= 95 ? 0 : 1,
          }}
        >
          {/* Animated Snipping Scissors SVG */}
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            viewBox="0 0 64 64"
            fill="none"
          >
            {/* Upper Blade */}
            <g style={{ transformOrigin: '32px 32px', transform: `rotate(${-snipAngle}deg)` }}>
              <path
                d="M32 32 L56 22 C58 21 60 23 58 25 L36 34 Z"
                fill="url(#bladeGradient)"
                stroke="#c1c8c2"
                strokeWidth="0.8"
              />
              {/* Finger Ring Top */}
              <circle cx="16" cy="22" r="8" stroke="#d4af37" strokeWidth="3" fill="none" />
              <path d="M22 26 L32 32" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Lower Blade */}
            <g style={{ transformOrigin: '32px 32px', transform: `rotate(${snipAngle}deg)` }}>
              <path
                d="M32 32 L56 42 C58 43 60 41 58 39 L36 30 Z"
                fill="url(#bladeGradient)"
                stroke="#c1c8c2"
                strokeWidth="0.8"
              />
              {/* Finger Ring Bottom */}
              <circle cx="16" cy="42" r="8" stroke="#d4af37" strokeWidth="3" fill="none" />
              <path d="M22 38 L32 32" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Pivot Screw */}
            <circle cx="32" cy="32" r="2.5" fill="#f5f4ef" stroke="#1b1c19" strokeWidth="1" />

            {/* Cutting Sparkles / Textile Thread Snips */}
            <circle cx="48" cy="32" r="1.5" fill="#b0f1cc" className="animate-ping" />

            <defs>
              <linearGradient id="bladeGradient" x1="32" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Dotted Cut Line indicator ahead of scissors */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
        <line
          x1="0"
          y1="100%"
          x2="100%"
          y2="0"
          stroke="#b0f1cc"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeOpacity={cutProgress < 85 ? 0.35 : 0}
        />
      </svg>

      {/* Skip button in corner */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsUnmounted(true);
            onFinish?.();
          }, 150);
        }}
        type="button"
        className="absolute bottom-4 right-4 z-40 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white text-xs border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
      >
        Omitir ✕
      </button>
    </div>
  );
};
