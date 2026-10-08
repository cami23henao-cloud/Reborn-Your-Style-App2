import React, { useEffect, useState } from 'react';
import { BrandLogo } from '../BrandLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  isAppReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  isAppReady = true,
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

    let isCancelled = false;
    let targetProgress = 15; // Initial mounting progress

    // Track real page loading stages
    const updateProgress = (addPercent: number) => {
      if (isCancelled) return;
      targetProgress = Math.min(100, targetProgress + addPercent);
    };

    // Stage 1: Document readiness
    if (document.readyState === 'complete') {
      updateProgress(25);
    } else if (document.readyState === 'interactive') {
      updateProgress(15);
      const onLoad = () => updateProgress(20);
      window.addEventListener('load', onLoad, { once: true });
    } else {
      const onDomReady = () => updateProgress(15);
      const onLoad = () => updateProgress(20);
      document.addEventListener('DOMContentLoaded', onDomReady, { once: true });
      window.addEventListener('load', onLoad, { once: true });
    }

    // Stage 2: Web Fonts readiness (Google Fonts: Montserrat, Inter, Material Symbols)
    if ('fonts' in document && (document as any).fonts?.ready) {
      (document as any).fonts.ready
        .then(() => {
          updateProgress(25);
        })
        .catch(() => {
          updateProgress(15);
        });
    } else {
      updateProgress(20);
    }

    // Stage 3: Backend API connectivity and critical assets
    fetch('/api/health')
      .then((res) => {
        if (res.ok) updateProgress(25);
        else updateProgress(15);
      })
      .catch(() => {
        updateProgress(15);
      });

    // Stage 4: Critical images / assets verification
    const images = Array.from(document.images);
    if (images.length === 0) {
      updateProgress(15);
    } else {
      let loadedCount = 0;
      const totalImages = Math.min(images.length, 10);
      images.slice(0, totalImages).forEach((img) => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.addEventListener('load', () => {
            loadedCount++;
            if (loadedCount >= totalImages) updateProgress(15);
          }, { once: true });
          img.addEventListener('error', () => {
            loadedCount++;
            if (loadedCount >= totalImages) updateProgress(15);
          }, { once: true });
        }
      });
      if (loadedCount >= totalImages) {
        updateProgress(15);
      }
    }

    // Safety ceiling: prevent staying stuck indefinitely if an external secondary resource stalls
    const safetyTimer = setTimeout(() => {
      targetProgress = 100;
    }, 3800);

    // Animation frame loop that drives smooth cutting progress matching real page load
    let currentProgress = 0;
    let exitTriggered = false;
    let animId: number;

    const tick = () => {
      if (isCancelled) return;

      // Smooth step towards targetProgress
      const diff = targetProgress - currentProgress;
      if (diff > 0.2) {
        // Dynamic speed: faster when further away, smooth as it nears target
        const step = Math.max(0.6, diff * 0.08);
        currentProgress = Math.min(100, currentProgress + step);
      } else if (targetProgress >= 100) {
        currentProgress = 100;
      }

      setCutProgress(currentProgress);

      // Part the fabric as scissors cross the halfway mark
      if (currentProgress >= 45) {
        setIsOpeningFabric(true);
      }

      // When the page is 100% loaded and the animation has completed the cut:
      if (currentProgress >= 100 && targetProgress >= 100 && !exitTriggered) {
        exitTriggered = true;
        // Hold the completed emblem briefly before graceful exit
        setTimeout(() => {
          if (isCancelled) return;
          setIsExiting(true);
          setTimeout(() => {
            if (isCancelled) return;
            setIsUnmounted(true);
            onFinish?.();
          }, 500);
        }, 350);
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animId);
    };
  }, [onFinish, isAppReady]);

  if (isUnmounted) return null;

  // Golden scissors blade snip oscillation based on cutting progress
  const snipAngle = Math.sin(cutProgress * 0.42) * 16;

  let isEn = false;
  try {
    isEn = typeof window !== 'undefined' && localStorage.getItem('reborn_lang') === 'en';
  } catch {}

  return (
    <div
      role="status"
      aria-label={isEn ? 'Loading Reborn Your Style' : 'Cargando Reborn Your Style'}
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#012d1d] select-none transition-all duration-500 ease-out ${
        isExiting
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Ambient background textile atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#0a4d33]/60 via-[#012d1d] to-[#00140c] pointer-events-none" />

      {/* Subtle background textile grain */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)
          `,
        }}
      />

      {/* ===================================================================== */}
      {/* REVEALED LOGO & SLOGAN (Center stage revealed as fabric separates)   */}
      {/* ===================================================================== */}
      <div
        className={`relative z-10 flex flex-col items-center px-6 max-w-sm sm:max-w-md text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpeningFabric
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-85 translate-y-4'
        }`}
      >
        {/* Glowing Emblem with Shimmer Light Sweep */}
        <div className="relative mb-5">
          {/* Ambient Glow Aura */}
          <div className="absolute -inset-4 bg-[#b0f1cc]/30 rounded-3xl blur-2xl animate-pulse pointer-events-none" />
          
          <div className="relative p-4 sm:p-5 bg-white/10 rounded-2xl border border-[#b0f1cc]/50 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            <BrandLogo size="lg" variant="emblem" />
            
            {/* Shimmer Light Reflection Sweep */}
            <div className="absolute inset-0 -top-8 -bottom-8 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-shimmer-sweep" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-headline text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 drop-shadow-lg">
          Reborn Your Style
        </h1>
        
        {/* Tagline */}
        <p className="text-xs sm:text-sm text-[#b0f1cc] font-medium tracking-wide drop-shadow-sm max-w-xs mx-auto">
          {isEn ? 'Transform your garments. Reimagine your style.' : 'Transforma tus prendas. Reimagina tu estilo.'}
        </p>

        {/* Minimalist thread/costura progress indicator */}
        <div className="mt-7 w-64 max-w-full flex flex-col items-center gap-2">
          {/* Thread seam track */}
          <div className="relative w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-[#b0f1cc]/30">
            <div
              className="h-full bg-gradient-to-r from-[#2b694d] via-[#b0f1cc] to-[#ffffff] rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_#b0f1cc]"
              style={{ width: `${cutProgress}%` }}
            />
          </div>

          {/* Stitch status label */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#b0f1cc]/80 tracking-widest uppercase">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0f1cc] animate-ping" />
              <span>{isEn ? 'Crafting your experience' : 'Confeccionando inicio'}</span>
            </span>
            <span className="font-bold text-white">{Math.round(cutProgress)}%</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FABRIC HALF 1 (Top-Left Textile Drape)                                 */}
      {/* ===================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-left ${
          isOpeningFabric
            ? '-translate-x-full -translate-y-16 rotate-[-5deg] opacity-60'
            : 'translate-x-0 translate-y-0 opacity-100'
        }`}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
          backgroundColor: '#033824',
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 5px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 5px)
          `,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6)',
        }}
      >
        {/* Diagonal Hem & Stitches on edge */}
        <div className="absolute inset-0 border-b-2 border-dashed border-[#d4af37]/60" />
      </div>

      {/* ===================================================================== */}
      {/* FABRIC HALF 2 (Bottom-Right Textile Drape)                             */}
      {/* ===================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          isOpeningFabric
            ? 'translate-x-full translate-y-16 rotate-[5deg] opacity-60'
            : 'translate-x-0 translate-y-0 opacity-100'
        }`}
        style={{
          clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)',
          backgroundColor: '#012417',
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 5px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)
          `,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.7)',
        }}
      >
        {/* Diagonal Hem & Stitches on edge */}
        <div className="absolute inset-0 border-t-2 border-dashed border-[#d4af37]/60" />
      </div>

      {/* ===================================================================== */}
      {/* STYLIZED GOLDEN TAILORING SCISSORS CUTTING ACROSS THE SEAM            */}
      {/* ===================================================================== */}
      {!isExiting && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 ease-linear"
          style={{
            left: `${cutProgress * 0.95}%`,
            top: `${100 - cutProgress * 0.95}%`,
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            opacity: cutProgress >= 96 ? 0 : 1,
          }}
        >
          {/* Vector Golden Precision Tailoring Shears */}
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)]"
            viewBox="0 0 72 72"
            fill="none"
          >
            <defs>
              {/* Premium Gold Blade Gradient */}
              <linearGradient id="goldBladeGradient" x1="36" y1="36" x2="68" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#eab308" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              {/* Steel Cutting Edge Highlight */}
              <linearGradient id="steelHighlight" x1="36" y1="36" x2="66" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fef9c3" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>

              {/* Handle Brass Finish */}
              <linearGradient id="brassHandle" x1="12" y1="12" x2="36" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            {/* Upper Blade & Top Ergonomic Handle */}
            <g style={{ transformOrigin: '36px 36px', transform: `rotate(${-snipAngle}deg)` }}>
              {/* Blade */}
              <path
                d="M36 36 L64 24 C66 23 68 25 66 27 L41 38 Z"
                fill="url(#goldBladeGradient)"
                stroke="#fef08a"
                strokeWidth="0.7"
              />
              <path
                d="M37 36 L63 24.5"
                stroke="url(#steelHighlight)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Handle Ring Top */}
              <circle cx="18" cy="24" r="9" stroke="url(#brassHandle)" strokeWidth="3.5" fill="none" />
              <path d="M25 28 L36 36" stroke="url(#brassHandle)" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Lower Blade & Bottom Ergonomic Handle */}
            <g style={{ transformOrigin: '36px 36px', transform: `rotate(${snipAngle}deg)` }}>
              {/* Blade */}
              <path
                d="M36 36 L64 48 C66 49 68 47 66 45 L41 34 Z"
                fill="url(#goldBladeGradient)"
                stroke="#fef08a"
                strokeWidth="0.7"
              />
              <path
                d="M37 36 L63 47.5"
                stroke="url(#steelHighlight)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Handle Ring Bottom */}
              <circle cx="18" cy="48" r="9" stroke="url(#brassHandle)" strokeWidth="3.5" fill="none" />
              <path d="M25 44 L36 36" stroke="url(#brassHandle)" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Central Pivot Screw */}
            <circle cx="36" cy="36" r="3" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
            <circle cx="36" cy="36" r="1.2" fill="#78350f" />

            {/* Cutting Golden Sparkle */}
            <circle cx="54" cy="36" r="2" fill="#fef08a" className="animate-ping" />
          </svg>
        </div>
      )}

      {/* Dotted Golden Cut Line along the diagonal seam */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
        <line
          x1="0"
          y1="100%"
          x2="100%"
          y2="0"
          stroke="#fef08a"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeOpacity={cutProgress < 88 ? 0.45 : 0}
        />
      </svg>

      {/* Skip button in bottom-right corner */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsUnmounted(true);
            onFinish?.();
          }, 150);
        }}
        type="button"
        className="absolute bottom-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white text-xs border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-95"
      >
        Omitir ✕
      </button>
    </div>
  );
};
