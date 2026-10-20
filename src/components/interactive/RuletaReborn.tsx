import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export interface RuletaQuestion {
  slot: number;
  question: string;
  options: { id: 'a' | 'b' | 'c'; text: string }[];
  correctAnswerId: 'a' | 'b' | 'c';
  explanation: string;
  color: string;
  icon: string;
}

export const RULETA_QUESTIONS: RuletaQuestion[] = [
  {
    slot: 1,
    question: '¿Cuál es el objetivo principal de Reborn Your Style?',
    options: [
      { id: 'a', text: 'A) Vender ropa nueva por internet.' },
      { id: 'b', text: 'B) Promover la reutilización de ropa mediante ideas de transformación y servicios de costura.' },
      { id: 'c', text: 'C) Crear una tienda de accesorios.' },
    ],
    correctAnswerId: 'b',
    explanation: 'El propósito principal es promover la moda circular y la reutilización de ropa conectando ideas de transformación con servicios de costura local.',
    color: '#012d1d',
    icon: 'target',
  },
  {
    slot: 2,
    question: '¿Qué problema busca solucionar el proyecto?',
    options: [
      { id: 'a', text: 'A) La falta de tiendas de ropa.' },
      { id: 'b', text: 'B) La dificultad para encontrar zapatos económicos.' },
      { id: 'c', text: 'C) El desaprovechamiento de la ropa que ya no se utiliza.' },
    ],
    correctAnswerId: 'c',
    explanation: 'Reborn combate el desaprovechamiento textil y rescata las prendas que permanecen olvidadas en el armario para alargar su ciclo de vida.',
    color: '#e37b5e',
    icon: 'recycling',
  },
  {
    slot: 3,
    question: '¿A quién va dirigido el proyecto?',
    options: [
      { id: 'a', text: 'A) A personas de 18 a 50 años interesadas en renovar su ropa y ofrecer servicios de costura.' },
      { id: 'b', text: 'B) Únicamente a empresas de moda.' },
      { id: 'c', text: 'C) Solo a estudiantes.' },
    ],
    correctAnswerId: 'a',
    explanation: 'Está dirigido a personas de 18 a 50 años que quieren renovar sus prendas y a la comunidad de modistas y costureros que ofrecen sus servicios.',
    color: '#0284c7',
    icon: 'groups',
  },
  {
    slot: 4,
    question: '¿Qué servicios ofrece la página?',
    options: [
      { id: 'a', text: 'A) Venta de ropa nueva.' },
      { id: 'b', text: 'B) Ideas para transformar prendas y contacto con servicios de costura.' },
      { id: 'c', text: 'C) Alquiler de vestidos.' },
    ],
    correctAnswerId: 'b',
    explanation: 'La plataforma ofrece tutoriales, ideas creativas de upcycling y contacto directo con costureros calificados.',
    color: '#10b981',
    icon: 'design_services',
  },
  {
    slot: 5,
    question: '¿Reborn Your Style vende ropa directamente?',
    options: [
      { id: 'a', text: 'A) Sí, vende ropa nueva y usada.' },
      { id: 'b', text: 'B) Sí, pero solo por encargo.' },
      { id: 'c', text: 'C) No, facilita ideas y el contacto con personas que ofrecen servicios de costura.' },
    ],
    correctAnswerId: 'c',
    explanation: 'Reborn Your Style no es un intermediario comercial tradicional: no vende ropa directamente, sino que conecta a clientes con costureros y modistas.',
    color: '#f59e0b',
    icon: 'storefront',
  },
  {
    slot: 6,
    question: '¿Qué significa el nombre Reborn Your Style?',
    options: [
      { id: 'a', text: 'A) Renueva tu estilo.' },
      { id: 'b', text: 'B) Compra tu ropa.' },
      { id: 'c', text: 'C) Rediseña tu estilo.' },
    ],
    correctAnswerId: 'a',
    explanation: '"Reborn Your Style" significa literalmente "Renueva tu estilo", simbolizando el renacimiento de cada prenda mediante la creatividad textil.',
    color: '#8b5cf6',
    icon: 'auto_awesome',
  },
  {
    slot: 7,
    question: '¿Cómo ayuda el proyecto al medio ambiente?',
    options: [
      { id: 'a', text: 'A) Promoviendo la compra de más ropa.' },
      { id: 'b', text: 'B) Fomentando la reutilización y transformación de prendas.' },
      { id: 'c', text: 'C) Reemplazando la ropa vieja por ropa nueva.' },
    ],
    correctAnswerId: 'b',
    explanation: 'Ayuda al planeta fomentando la reutilización y evitando que toneladas de prendas en desuso terminen en botaderos y vertederos.',
    color: '#ec4899',
    icon: 'eco',
  },
  {
    slot: 8,
    question: '¿Qué diferencia a Reborn Your Style de una tienda virtual?',
    options: [
      { id: 'a', text: 'A) Promueve la transformación de ropa y conecta a clientes con costureras, sin vender prendas directamente.' },
      { id: 'b', text: 'B) Vende más ropa que otras tiendas.' },
      { id: 'c', text: 'C) Solo vende ropa nueva.' },
    ],
    correctAnswerId: 'a',
    explanation: 'A diferencia de tiendas fast-fashion que venden ropa nueva, Reborn impulsa la artesanía local y la transformación de lo que ya tienes en casa.',
    color: '#06b6d4',
    icon: 'handshake',
  },
];

interface RuletaRebornProps {
  onBackToMenu: () => void;
  userName?: string;
}

export const RuletaReborn: React.FC<RuletaRebornProps> = ({ onBackToMenu, userName = 'Creador Sostenible' }) => {
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  // Rotation and game state
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<RuletaQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | 'c' | null>(null);
  const [answeredSlots, setAnsweredSlots] = useState<Record<number, { selected: 'a' | 'b' | 'c'; isCorrect: boolean }>>({});
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);

  // Wheel configuration
  const SLICE_ANGLE = 360 / 8; // 45 degrees
  const WHEEL_SIZE = 360;
  const CENTER = WHEEL_SIZE / 2;
  const RADIUS = 160;

  // Sound/Haptic feedback simulation
  const lastSelectedSlotRef = useRef<number | null>(null);

  // Spin handler
  const handleSpin = () => {
    if (isSpinning) return;

    // Pick a slot. If some are unanswered, prefer an unanswered one for maximum gamification
    const unanswered = RULETA_QUESTIONS.map((q) => q.slot).filter((s) => !answeredSlots[s]);
    let targetSlot: number;
    if (unanswered.length > 0) {
      targetSlot = unanswered[Math.floor(Math.random() * unanswered.length)];
    } else {
      targetSlot = Math.floor(Math.random() * 8) + 1;
    }
    lastSelectedSlotRef.current = targetSlot;

    setIsSpinning(true);
    setActiveQuestion(null);
    setSelectedOption(null);

    // Calculate rotation:
    // Slot 1: [0° .. 45°], center at 22.5°
    // Pointer is at the TOP (12 o'clock, which is -90° in standard math, or top of wheel).
    // In SVG, 12 o'clock is angle -90° (or 270°).
    // To align Slot N under the top indicator:
    // Slot index k (0 to 7) has slice center at: (k * 45 + 22.5) degrees.
    // When wheel rotates by R degrees, the slice at top is the one where (angle + R) % 360 = 270.
    // Therefore: R = 270 - (k * 45 + 22.5) = 247.5 - (k * 45).
    const slotIndex = targetSlot - 1;
    const targetAngleAtTop = 270 - (slotIndex * 45 + 22.5);

    // Add 6 to 9 full spins (2160° to 3240°)
    const fullSpins = (6 + Math.floor(Math.random() * 3)) * 360;
    const currentBase = Math.floor(rotation / 360) * 360;
    const newRotation = currentBase + fullSpins + ((targetAngleAtTop % 360) + 360) % 360;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setCurrentSlot(targetSlot);
      const q = RULETA_QUESTIONS.find((item) => item.slot === targetSlot) || null;
      setActiveQuestion(q);
    }, 4000);
  };

  const handleSelectAnswer = (optionId: 'a' | 'b' | 'c') => {
    if (!activeQuestion || selectedOption) return;
    const isCorrect = optionId === activeQuestion.correctAnswerId;
    setSelectedOption(optionId);
    setAnsweredSlots((prev) => {
      const next = { ...prev, [activeQuestion.slot]: { selected: optionId, isCorrect } };
      // Check if all 8 slots have been answered
      if (Object.keys(next).length === 8) {
        setTimeout(() => setShowBadgeCelebration(true), 1200);
      }
      return next;
    });
  };

  const correctAnswersCount = Object.values(answeredSlots).filter(
    (s: { selected: 'a' | 'b' | 'c'; isCorrect: boolean }) => s.isCorrect
  ).length;
  const totalAnsweredCount = Object.keys(answeredSlots).length;
  const progressPercent = Math.round((totalAnsweredCount / 8) * 100);

  // Generate SVG slice paths
  const renderSlices = () => {
    return RULETA_QUESTIONS.map((q, idx) => {
      const startAngle = idx * SLICE_ANGLE;
      const endAngle = (idx + 1) * SLICE_ANGLE;
      const midAngle = startAngle + SLICE_ANGLE / 2;

      // Polar to cartesian
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const x1 = CENTER + RADIUS * Math.cos(toRad(startAngle));
      const y1 = CENTER + RADIUS * Math.sin(toRad(startAngle));
      const x2 = CENTER + RADIUS * Math.cos(toRad(endAngle));
      const y2 = CENTER + RADIUS * Math.sin(toRad(endAngle));

      const pathData = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;

      // Text position along midAngle
      const textRadius = RADIUS * 0.68;
      const tx = CENTER + textRadius * Math.cos(toRad(midAngle));
      const ty = CENTER + textRadius * Math.sin(toRad(midAngle));

      const isAnswered = answeredSlots[q.slot] !== undefined;
      const isSlotCorrect = answeredSlots[q.slot]?.isCorrect;

      return (
        <g key={q.slot} className="select-none cursor-pointer">
          <path
            d={pathData}
            fill={q.color}
            stroke="#faf9f4"
            strokeWidth="2.5"
            className="transition-opacity hover:opacity-95"
          />

          {/* Number & Slot label */}
          <g transform={`translate(${tx}, ${ty}) rotate(${midAngle + 90})`}>
            <circle r="14" fill="#ffffff" opacity="0.95" />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="900"
              fill={q.color}
              fontFamily="Montserrat, sans-serif"
            >
              {q.slot}
            </text>
            {isAnswered && (
              <circle
                cx="10"
                cy="-10"
                r="6"
                fill={isSlotCorrect ? '#10b981' : '#ef4444'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            )}
          </g>
        </g>
      );
    });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6">
      {/* Top Bar with Navigation and Score */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0e241c] p-4 rounded-2xl border border-[#c1c8c2]/50 shadow-xs">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] hover:underline cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>{isEn ? 'Back to Games Menu' : 'Volver al Menú de Juegos'}</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#717973] dark:text-[#a7b8ae]">
              {isEn ? 'Correct Answers:' : 'Aciertos:'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#012d1d] dark:text-[#b0f1cc] font-black text-xs">
              {correctAnswersCount} / 8
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-24 bg-[#efeee9] dark:bg-[#16382c] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#012d1d] dark:bg-[#b0f1cc] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#717973]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The Roulette Wheel */}
        <div className="lg:col-span-6 flex flex-col items-center bg-white dark:bg-[#0e241c] p-6 sm:p-8 rounded-3xl border border-[#c1c8c2]/50 shadow-sm relative">
          <div className="text-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[#e37b5e]/15 text-[#e37b5e] font-black text-[10px] uppercase tracking-wider">
              {isEn ? 'Interactive Circular Challenge' : 'Desafío Circular de 8 Casillas'}
            </span>
            <h2 className="font-headline text-2xl font-black text-[#012d1d] dark:text-white mt-1">
              🎡 La Ruleta Reborn
            </h2>
            <p className="text-xs text-[#717973] dark:text-[#a7b8ae] max-w-sm mx-auto mt-0.5">
              Gira la ruleta para detenerte aleatoriamente en una de las 8 casillas oficiales del proyecto.
            </p>
          </div>

          {/* Wheel Container with Pointer */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Top Indicator Arrow */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-md">
              <div className="w-6 h-8 bg-gradient-to-b from-[#f59e0b] to-[#b45309] rounded-b-md clip-pointer shadow-lg flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white shadow-inner mb-2"></span>
              </div>
            </div>

            {/* Spinning SVG Wheel */}
            <div
              className="rounded-full shadow-2xl p-1 bg-gradient-to-br from-[#faf9f4] via-[#efeee9] to-[#c1c8c2] border-4 border-[#012d1d] dark:border-[#b0f1cc]/40"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4000ms cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
              }}
            >
              <svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                {renderSlices()}

                {/* Central Hub */}
                <circle cx={CENTER} cy={CENTER} r="38" fill="#faf9f4" stroke="#012d1d" strokeWidth="4" />
                <circle cx={CENTER} cy={CENTER} r="32" fill="#012d1d" />
                <text
                  x={CENTER}
                  y={CENTER - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9"
                  fontWeight="900"
                  fill="#b0f1cc"
                  letterSpacing="1.5"
                  fontFamily="Montserrat, sans-serif"
                >
                  REBORN
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="7"
                  fontWeight="700"
                  fill="#ffffff"
                  letterSpacing="1"
                >
                  STYLE
                </text>
              </svg>
            </div>
          </div>

          {/* Spin Action Button */}
          <div className="mt-5 w-full max-w-xs">
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-3.5 px-6 rounded-2xl font-headline font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                isSpinning
                  ? 'bg-[#c1c8c2] text-[#414844] cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-[#012d1d] via-[#1b4332] to-[#2b694d] text-white hover:shadow-xl hover:scale-102 ring-2 ring-[#b0f1cc]/40'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isSpinning ? 'rotate_right' : 'casino'}
              </span>
              <span>{isSpinning ? (isEn ? 'Spinning...' : 'Girando la Ruleta...') : '🎯 Girar Ruleta'}</span>
            </button>
          </div>

          {/* Casillas Progress Strip */}
          <div className="mt-6 w-full pt-4 border-t border-[#efeee9] dark:border-[#173328]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#717973] block mb-2 text-center">
              Casillas respondidas:
            </span>
            <div className="grid grid-cols-8 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                const ans = answeredSlots[s];
                const isCurrent = currentSlot === s;
                return (
                  <div
                    key={s}
                    className={`py-1.5 rounded-lg text-center font-bold text-xs border transition-all ${
                      ans?.isCorrect
                        ? 'bg-[#10b981] text-white border-[#059669]'
                        : ans && !ans.isCorrect
                        ? 'bg-[#ef4444] text-white border-[#dc2626]'
                        : isCurrent
                        ? 'bg-[#012d1d] text-[#b0f1cc] border-[#b0f1cc] animate-pulse'
                        : 'bg-[#f5f4ef] dark:bg-[#112920] text-[#717973] border-[#efeee9]'
                    }`}
                  >
                    #{s}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Question Card & Validation */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            {activeQuestion ? (
              <motion.div
                key={activeQuestion.slot}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-[#0e241c] p-6 sm:p-8 rounded-3xl border-2 border-[#012d1d] dark:border-[#b0f1cc]/40 shadow-xl space-y-6"
              >
                {/* Header Tag of Question */}
                <div className="flex items-center justify-between pb-3 border-b border-[#efeee9] dark:border-[#173328]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
                      style={{ backgroundColor: activeQuestion.color }}
                    >
                      {activeQuestion.slot}
                    </span>
                    <div>
                      <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white">
                        Casilla #{activeQuestion.slot}
                      </h3>
                      <p className="text-[11px] text-[#717973] dark:text-[#a7b8ae]">
                        Ruleta Reborn Your Style
                      </p>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-2xl text-[#2b694d] dark:text-[#b0f1cc]">
                    {activeQuestion.icon}
                  </span>
                </div>

                {/* Question Text */}
                <h4 className="font-headline text-lg sm:text-xl font-bold text-[#012d1d] dark:text-white leading-snug">
                  {activeQuestion.question}
                </h4>

                {/* 3 Options */}
                <div className="space-y-3">
                  {activeQuestion.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isThisCorrect = opt.id === activeQuestion.correctAnswerId;
                    const showFeedback = selectedOption !== null;

                    let btnClass = 'border-[#c1c8c2]/50 hover:border-[#012d1d] bg-[#faf9f4] dark:bg-[#112920] text-[#1b1c19] dark:text-white';
                    if (showFeedback) {
                      if (isThisCorrect) {
                        btnClass = 'bg-[#10b981]/15 border-2 border-[#10b981] text-[#065f46] dark:text-[#6ee7b7] font-bold shadow-sm';
                      } else if (isSelected && !isThisCorrect) {
                        btnClass = 'bg-[#ef4444]/15 border-2 border-[#ef4444] text-[#991b1b] dark:text-[#fca5a5] font-semibold';
                      } else {
                        btnClass = 'opacity-40 border-[#efeee9] bg-gray-50';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAnswer(opt.id)}
                        disabled={showFeedback}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 text-xs sm:text-sm leading-relaxed cursor-pointer ${btnClass}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            showFeedback && isThisCorrect
                              ? 'bg-[#10b981] text-white'
                              : showFeedback && isSelected
                              ? 'bg-[#ef4444] text-white'
                              : 'bg-white dark:bg-[#071510] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2]/60'
                          }`}
                        >
                          {opt.id.toUpperCase()}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {showFeedback && isThisCorrect && (
                          <span className="material-symbols-outlined text-green-600 font-bold shrink-0">
                            check_circle
                          </span>
                        )}
                        {showFeedback && isSelected && !isThisCorrect && (
                          <span className="material-symbols-outlined text-red-500 font-bold shrink-0">
                            cancel
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                      selectedOption === activeQuestion.correctAnswerId
                        ? 'bg-[#e8f5ed] border border-[#10b981]/40 text-[#002113]'
                        : 'bg-[#fef2f2] border border-[#ef4444]/40 text-[#7f1d1d]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-base">
                        {selectedOption === activeQuestion.correctAnswerId ? 'verified' : 'info'}
                      </span>
                      <span>
                        {selectedOption === activeQuestion.correctAnswerId
                          ? '¡Respuesta Correcta!'
                          : 'Respuesta Incorrecta'}
                      </span>
                    </div>
                    <p className="leading-relaxed opacity-90">{activeQuestion.explanation}</p>
                  </motion.div>
                )}

                {/* Spin Again CTA */}
                {selectedOption && (
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#717973]">
                      {Object.keys(answeredSlots).length < 8
                        ? `Faltan ${8 - Object.keys(answeredSlots).length} casillas por completar.`
                        : '¡Has completado todas las casillas!'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSpin}
                      disabled={isSpinning}
                      className="py-2.5 px-5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">rotate_right</span>
                      <span>Girar siguiente casilla</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-[#0e241c] p-8 rounded-3xl border border-[#c1c8c2]/50 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2]/40 flex items-center justify-center mx-auto shadow-xs">
                  <span className="material-symbols-outlined text-3xl">touch_app</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                  Presiona [ 🎯 Girar Ruleta ] para comenzar
                </h3>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae] max-w-sm mx-auto leading-relaxed">
                  Cada giro se detendrá aleatoriamente en una de las 8 casillas con preguntas oficiales sobre Reborn Your Style.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="py-3 px-6 rounded-xl bg-[#012d1d] text-white font-bold text-xs hover:bg-[#2b694d] transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>Girar la Ruleta Ahora</span>
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Celebration Modal when 8 questions answered */}
      <AnimatePresence>
        {showBadgeCelebration && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#0e241c] max-w-md w-full p-8 rounded-3xl text-center space-y-5 border-2 border-[#10b981] shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#012d1d] to-[#10b981] text-[#b0f1cc] mx-auto flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-4xl">workspace_premium</span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#10b981] block">
                  ¡Desafío Ruleta Completado!
                </span>
                <h3 className="font-headline text-2xl font-black text-[#012d1d] dark:text-white mt-1">
                  Insignia Digital Reborn
                </h3>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae] mt-2 leading-relaxed">
                  ¡Felicitaciones, <strong>{userName}</strong>! Has respondido las 8 casillas oficiales de la Ruleta Reborn obteniendo <strong>{correctAnswersCount} / 8 aciertos</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-xs font-semibold text-[#012d1d] dark:text-[#b0f1cc]">
                🎖️ Insignia: &quot;Maestro de la Moda Circular Reborn&quot;
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBadgeCelebration(false)}
                  className="flex-1 py-3 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d] transition-colors cursor-pointer"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnsweredSlots({});
                    setShowBadgeCelebration(false);
                    handleSpin();
                  }}
                  className="px-4 py-3 rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#012d1d] dark:text-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Reiniciar Ruleta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
