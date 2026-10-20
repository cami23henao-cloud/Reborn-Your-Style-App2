import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  REBORN_TRIVIA_QUESTIONS,
  TRUE_FALSE_QUESTIONS,
  GENERAL_KNOWLEDGE_QUESTIONS,
  QuizQuestion,
  TrueFalseQuestion,
  StageQuestion,
} from '../../data/educationalContent';
import { AppView, UserProfile } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export type GameMode = 'trivia' | 'verdadero_falso' | 'desafio_etapas';

interface EvaluacionViewProps {
  userProfile?: UserProfile;
  onNavigate: (view: AppView) => void;
}

export const EvaluacionView: React.FC<EvaluacionViewProps> = ({
  userProfile,
  onNavigate,
}) => {
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  // Game selection state
  const [selectedGame, setSelectedGame] = useState<GameMode | null>(null);

  // Trivia (Juego 1) State
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaAnswers, setTriviaAnswers] = useState<Record<number, string>>({});
  const [showTriviaExplanation, setShowTriviaExplanation] = useState(false);
  const [isTriviaCompleted, setIsTriviaCompleted] = useState(false);

  // Verdadero / Falso (Juego 2) State
  const [tfIndex, setTfIndex] = useState(0);
  const [tfAnswers, setTfAnswers] = useState<Record<number, boolean>>({});
  const [showTfExplanation, setShowTfExplanation] = useState(false);
  const [isTfCompleted, setIsTfCompleted] = useState(false);

  // Desafío por Etapas (Juego 3) State
  const [stageIndex, setStageIndex] = useState(0);
  const [stageAnswers, setStageAnswers] = useState<Record<number, string>>({});
  const [showStageExplanation, setShowStageExplanation] = useState(false);
  const [isStageCompleted, setIsStageCompleted] = useState(false);

  // Shared Certificate & Time states
  const [certificateName, setCertificateName] = useState(userProfile?.name || 'Creador Sostenible');
  const [certCode] = useState<string>(
    () => `RYS-CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${new Date().getFullYear()}`
  );

  // ---------------------------------------------------------------------------
  // JUEGO 1: TRIVIA "¿QUÉ TANTO SABES DE REBORN?" (8 PREGUNTAS OFICIALES)
  // ---------------------------------------------------------------------------
  const currentTriviaQ: QuizQuestion = REBORN_TRIVIA_QUESTIONS[triviaIndex];
  const totalTrivia = REBORN_TRIVIA_QUESTIONS.length;
  const triviaProgressPercent = Math.round(((triviaIndex + 1) / totalTrivia) * 100);

  const triviaAnswerId = triviaAnswers[currentTriviaQ?.id];
  const isTriviaAnswered = Boolean(triviaAnswerId);

  const triviaCorrectCount = REBORN_TRIVIA_QUESTIONS.filter(
    (q) => triviaAnswers[q.id] === q.correctAnswerId
  ).length;
  const triviaIncorrectCount = Object.keys(triviaAnswers).length - triviaCorrectCount;
  const triviaScorePercent = Math.round((triviaCorrectCount / totalTrivia) * 100);
  const isTriviaPassed = triviaScorePercent >= 70;

  const handleSelectTriviaOption = (optionId: string) => {
    if (showTriviaExplanation) return;
    setTriviaAnswers((prev) => ({ ...prev, [currentTriviaQ.id]: optionId }));
    setShowTriviaExplanation(true);
  };

  const handleNextTrivia = () => {
    setShowTriviaExplanation(false);
    if (triviaIndex < totalTrivia - 1) {
      setTriviaIndex((prev) => prev + 1);
    } else {
      setIsTriviaCompleted(true);
    }
  };

  const handleRestartTrivia = () => {
    setTriviaAnswers({});
    setShowTriviaExplanation(false);
    setTriviaIndex(0);
    setIsTriviaCompleted(false);
  };

  // ---------------------------------------------------------------------------
  // JUEGO 2: "VERDADERO O FALSO" (DESAFÍO DE VELOCIDAD)
  // ---------------------------------------------------------------------------
  const currentTfQ: TrueFalseQuestion = TRUE_FALSE_QUESTIONS[tfIndex];
  const totalTf = TRUE_FALSE_QUESTIONS.length;
  const tfProgressPercent = Math.round(((tfIndex + 1) / totalTf) * 100);

  const tfAnswerVal = tfAnswers[currentTfQ?.id];
  const isTfAnswered = tfAnswerVal !== undefined;

  const tfCorrectCount = TRUE_FALSE_QUESTIONS.filter(
    (q) => tfAnswers[q.id] === q.isTrue
  ).length;
  const tfIncorrectCount = Object.keys(tfAnswers).length - tfCorrectCount;
  const tfScorePercent = Math.round((tfCorrectCount / totalTf) * 100);
  const isTfPassed = tfScorePercent >= 70;

  const handleSelectTfOption = (val: boolean) => {
    if (showTfExplanation) return;
    setTfAnswers((prev) => ({ ...prev, [currentTfQ.id]: val }));
    setShowTfExplanation(true);
  };

  const handleNextTf = () => {
    setShowTfExplanation(false);
    if (tfIndex < totalTf - 1) {
      setTfIndex((prev) => prev + 1);
    } else {
      setIsTfCompleted(true);
    }
  };

  const handleRestartTf = () => {
    setTfAnswers({});
    setShowTfExplanation(false);
    setTfIndex(0);
    setIsTfCompleted(false);
  };

  // ---------------------------------------------------------------------------
  // JUEGO 3: "DESAFÍO DE CONOCIMIENTO GENERAL REBORN" (POR ETAPAS)
  // ---------------------------------------------------------------------------
  const currentStageQ: StageQuestion = GENERAL_KNOWLEDGE_QUESTIONS[stageIndex];
  const totalStage = GENERAL_KNOWLEDGE_QUESTIONS.length;
  const stageProgressPercent = Math.round(((stageIndex + 1) / totalStage) * 100);

  const stageAnswerId = stageAnswers[currentStageQ?.id];
  const isStageAnswered = Boolean(stageAnswerId);

  const stageCorrectCount = GENERAL_KNOWLEDGE_QUESTIONS.filter(
    (q) => stageAnswers[q.id] === q.correctAnswerId
  ).length;
  const stageIncorrectCount = Object.keys(stageAnswers).length - stageCorrectCount;
  const stageScorePercent = Math.round((stageCorrectCount / totalStage) * 100);
  const isStagePassed = stageScorePercent >= 70;

  const handleSelectStageOption = (optionId: string) => {
    if (showStageExplanation) return;
    setStageAnswers((prev) => ({ ...prev, [currentStageQ.id]: optionId }));
    setShowStageExplanation(true);
  };

  const handleNextStage = () => {
    setShowStageExplanation(false);
    if (stageIndex < totalStage - 1) {
      setStageIndex((prev) => prev + 1);
    } else {
      setIsStageCompleted(true);
    }
  };

  const handleRestartStage = () => {
    setStageAnswers({});
    setShowStageExplanation(false);
    setStageIndex(0);
    setIsStageCompleted(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#faf9f4] dark:bg-[#071510] text-[#1b1c19] dark:text-[#f1f3ee] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {selectedGame ? (
              <button
                onClick={() => setSelectedGame(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:underline cursor-pointer bg-white dark:bg-[#0e241c] px-3 py-1.5 rounded-full border border-[#c1c8c2]/50 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">apps</span>
                <span>{isEn ? 'Game Menu' : 'Menú de Juegos'}</span>
              </button>
            ) : null}

            <button
              onClick={() => onNavigate('tutoriales')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#717973] dark:text-[#a7b8ae] hover:text-[#012d1d] hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>{isEn ? 'Back to Tutorials' : 'Volver a Tutoriales'}</span>
            </button>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#012d1d]/10 dark:bg-[#b0f1cc]/15 text-[#012d1d] dark:text-[#b0f1cc] border border-[#012d1d]/20 dark:border-[#b0f1cc]/30 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>{isEn ? 'Digital Certification Center' : 'Centro de Certificación Digital'}</span>
          </span>
        </div>

        {/* ================================================================= */}
        {/* VISTA 1: MENÚ CENTRAL INTERACTIVO DE JUEGOS                      */}
        {/* ================================================================= */}
        {!selectedGame ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero Hub Banner */}
            <div className="bg-gradient-to-br from-[#012d1d] via-[#1b4332] to-[#2b694d] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-sm border border-white/15 text-[#b0f1cc]">
                  <span className="material-symbols-outlined text-sm">sports_esports</span>
                  <span>{isEn ? 'Gamified Digital Assessment' : 'Módulo de Evaluación Gamificada'}</span>
                </div>

                <h1 className="font-headline text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {isEn ? 'Test Your Circular Fashion Knowledge' : 'Evalúa tus Conocimientos en Moda Circular'}
                </h1>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {isEn
                    ? 'Choose an interactive game mode, answer in real time, obtain immediate feedback and unlock your official Reborn Your Style Expert certification.'
                    : 'Selecciona una modalidad interactiva, valida tus respuestas en tiempo real, aprende con explicaciones técnicas y obtén tu Insignia de Experto Reborn Your Style.'}
                </p>
              </div>

              {/* Ambient blur */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#b0f1cc]/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Games Grid (3 Selectable Modes) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* JUEGO 1: ¿QUÉ TANTO SABES DE REBORN? */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedGame('trivia')}
                className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 border-2 border-[#efeee9] dark:border-[#2b694d]/40 hover:border-[#012d1d] dark:hover:border-[#b0f1cc] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f2f8f4] dark:bg-[#173a2d] text-[#2b694d] dark:text-[#b0f1cc] border border-[#b0f1cc] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc] block mb-1">
                      {isEn ? 'Game 1 • Official Trivia' : 'Juego 1 • Trivia Oficial'}
                    </span>
                    <h3 className="font-headline text-lg font-bold text-[#012d1d] dark:text-white leading-tight">
                      ¿Qué tanto sabes de Reborn?
                    </h3>
                  </div>

                  <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                    Trivia de 8 preguntas sobre la misión, servicios, impacto ambiental y modelo colaborativo de Reborn Your Style.
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#717973] dark:text-[#a7b8ae] pt-1">
                    <span className="material-symbols-outlined text-sm text-[#2b694d]">quiz</span>
                    <span>8 Preguntas oficiales</span>
                    <span>•</span>
                    <span>Opciones A, B, C</span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#efeee9] dark:border-[#173328]">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#012d1d] dark:bg-[#b0f1cc] text-white dark:text-[#002113] text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-[#1b4332]"
                  >
                    <span>{isEn ? 'Play Trivia' : 'Jugar Trivia'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </motion.div>

              {/* JUEGO 2: VERDADERO O FALSO */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedGame('verdadero_falso')}
                className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 border-2 border-[#efeee9] dark:border-[#2b694d]/40 hover:border-[#012d1d] dark:hover:border-[#b0f1cc] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f9ff] dark:bg-[#082f49] text-[#0284c7] dark:text-[#38bdf8] border border-[#7dd3fc] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8] block mb-1">
                      {isEn ? 'Game 2 • Speed Challenge' : 'Juego 2 • Desafío de Velocidad'}
                    </span>
                    <h3 className="font-headline text-lg font-bold text-[#012d1d] dark:text-white leading-tight">
                      Verdadero o Falso
                    </h3>
                  </div>

                  <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                    Pon a prueba tus reflejos con afirmaciones rápidas sobre sostenibilidad textil, técnicas de aguja y cuidado de prendas.
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#717973] dark:text-[#a7b8ae] pt-1">
                    <span className="material-symbols-outlined text-sm text-[#0284c7]">timer</span>
                    <span>Desafío de agilidad V/F</span>
                    <span>•</span>
                    <span>Feedback instantáneo</span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#efeee9] dark:border-[#173328]">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isEn ? 'Play True or False' : 'Jugar Verdadero o Falso'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </motion.div>

              {/* JUEGO 3: DESAFÍO DE CONOCIMIENTO GENERAL REBORN */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedGame('desafio_etapas')}
                className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 border-2 border-[#efeee9] dark:border-[#2b694d]/40 hover:border-[#012d1d] dark:hover:border-[#b0f1cc] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#fdf4ff] dark:bg-[#3b0764] text-[#a855f7] dark:text-[#d8b4fe] border border-[#f0abfc] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-3xl">military_tech</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#a855f7] dark:text-[#d8b4fe] block mb-1">
                      {isEn ? 'Game 3 • Structured Stages' : 'Juego 3 • Evaluación por Etapas'}
                    </span>
                    <h3 className="font-headline text-lg font-bold text-[#012d1d] dark:text-white leading-tight">
                      Desafío General Reborn
                    </h3>
                  </div>

                  <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                    Evaluación estructurada por 3 etapas: Modistería, Moda Circular y Plataforma Digital para obtener certificación avanzada.
                  </p>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#717973] dark:text-[#a7b8ae] pt-1">
                    <span className="material-symbols-outlined text-sm text-[#a855f7]">layers</span>
                    <span>3 Etapas progresivas</span>
                    <span>•</span>
                    <span>Certificado completo</span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#efeee9] dark:border-[#173328]">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#7e22ce] hover:bg-[#6b21a8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isEn ? 'Start Challenge' : 'Iniciar Desafío'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}

        {/* ================================================================= */}
        {/* VISTA 2: JUEGO 1 - TRIVIA "¿QUÉ TANTO SABES DE REBORN?"           */}
        {/* ================================================================= */}
        {selectedGame === 'trivia' && !isTriviaCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card with Progress & Live Score Counter */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc] bg-[#f2f8f4] dark:bg-[#173a2d] px-2.5 py-0.5 rounded-full border border-[#b0f1cc]/60">
                      Juego 1: Trivia Reborn
                    </span>
                    <span className="text-xs text-[#717973]">• {currentTriviaQ.topicLabel}</span>
                  </div>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#012d1d] dark:text-white">
                    {isEn ? 'Question' : 'Pregunta'} {triviaIndex + 1} de {totalTrivia}
                  </h2>
                </div>

                {/* Live Hits & Misses Score Counter */}
                <div className="flex items-center gap-3 bg-[#faf9f4] dark:bg-[#112920] px-4 py-2 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/30 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803d] dark:text-[#4ade80]">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{triviaCorrectCount} aciertos</span>
                  </div>
                  <span className="text-[#c1c8c2]">|</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a] dark:text-[#f87171]">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>{triviaIncorrectCount} errores</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#f2f1ec] dark:bg-[#16382c] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2b694d] to-[#012d1d] dark:from-[#4ade80] dark:to-[#b0f1cc] transition-all duration-300 rounded-full"
                  style={{ width: `${triviaProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#faf9f4] dark:bg-[#112920] text-[#717973] dark:text-[#a7b8ae] border border-[#efeee9] dark:border-[#2b694d]/30">
                  Pregunta #{currentTriviaQ.id}
                </span>
                <h3 className="font-headline text-lg sm:text-xl font-bold text-[#012d1d] dark:text-white leading-relaxed">
                  {currentTriviaQ.question}
                </h3>
              </div>

              {/* Options List A, B, C */}
              <div className="space-y-3">
                {currentTriviaQ.options.map((option) => {
                  const isSelected = triviaAnswerId === option.id;
                  const isCorrect = option.id === currentTriviaQ.correctAnswerId;

                  let cardStyle =
                    'border-[#c1c8c2]/50 dark:border-[#2b694d]/40 bg-[#faf9f4] dark:bg-[#112920] hover:border-[#012d1d] dark:hover:border-[#b0f1cc] text-[#1b1c19] dark:text-white';

                  if (showTriviaExplanation) {
                    if (isCorrect) {
                      cardStyle =
                        'border-[#15803d] bg-[#f0fdf4] dark:bg-[#143d26] text-[#14532d] dark:text-[#bbf7d0] ring-2 ring-[#15803d]';
                    } else if (isSelected && !isCorrect) {
                      cardStyle =
                        'border-[#ba1a1a] bg-[#fef2f2] dark:bg-[#3d1414] text-[#7f1d1d] dark:text-[#fecaca] ring-2 ring-[#ba1a1a]';
                    }
                  } else if (isSelected) {
                    cardStyle =
                      'border-[#012d1d] dark:border-[#b0f1cc] bg-[#f2f8f4] dark:bg-[#173a2d] ring-1 ring-[#012d1d]';
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectTriviaOption(option.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer active:scale-99 ${cardStyle}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 transition-colors ${
                          showTriviaExplanation && isCorrect
                            ? 'bg-[#15803d] text-white shadow-xs'
                            : showTriviaExplanation && isSelected && !isCorrect
                            ? 'bg-[#ba1a1a] text-white shadow-xs'
                            : isSelected
                            ? 'bg-[#012d1d] dark:bg-[#b0f1cc] text-white dark:text-[#012d1d]'
                            : 'bg-white dark:bg-[#071510] text-[#717973] border border-[#c1c8c2]/50'
                        }`}
                      >
                        {showTriviaExplanation && isCorrect ? (
                          <span className="material-symbols-outlined text-base">check</span>
                        ) : showTriviaExplanation && isSelected && !isCorrect ? (
                          <span className="material-symbols-outlined text-base">close</span>
                        ) : (
                          option.id.toUpperCase()
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold leading-relaxed pt-1">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Feedback Banner */}
              <AnimatePresence>
                {showTriviaExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${
                      triviaAnswerId === currentTriviaQ.correctAnswerId
                        ? 'bg-[#f0fdf4] dark:bg-[#143d26] border-[#86efac] text-[#14532d] dark:text-[#bbf7d0]'
                        : 'bg-[#fef2f2] dark:bg-[#3d1414] border-[#fca5a5] text-[#7f1d1d] dark:text-[#fecaca]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-base">
                        {triviaAnswerId === currentTriviaQ.correctAnswerId ? 'check_circle' : 'info'}
                      </span>
                      <span>
                        {triviaAnswerId === currentTriviaQ.correctAnswerId
                          ? '¡Respuesta Correcta!'
                          : 'Respuesta Incorrecta — Explicación:'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-95">
                      {currentTriviaQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#c1c8c2]/60 dark:border-[#2b694d]/40 text-[#414844] dark:text-[#a7b8ae] text-xs font-bold hover:bg-[#faf9f4] dark:hover:bg-[#112920] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Cambiar Juego</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextTrivia}
                  disabled={!isTriviaAnswered}
                  className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] dark:bg-[#b0f1cc] dark:hover:bg-[#86efac] text-white dark:text-[#002113] text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 active:scale-98"
                >
                  <span>
                    {triviaIndex === totalTrivia - 1 ? 'Finalizar Trivia' : 'Siguiente Pregunta'}
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ================================================================= */}
        {/* VISTA 3: JUEGO 2 - VERDADERO O FALSO                              */}
        {/* ================================================================= */}
        {selectedGame === 'verdadero_falso' && !isTfCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8] bg-[#f0f9ff] dark:bg-[#082f49] px-2.5 py-0.5 rounded-full border border-[#7dd3fc]/60">
                      Juego 2: Desafío V/F
                    </span>
                    <span className="text-xs text-[#717973]">• {currentTfQ.topic}</span>
                  </div>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#012d1d] dark:text-white">
                    Afirmación {tfIndex + 1} de {totalTf}
                  </h2>
                </div>

                {/* Score Counter */}
                <div className="flex items-center gap-3 bg-[#faf9f4] dark:bg-[#112920] px-4 py-2 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/30 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803d]">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{tfCorrectCount} aciertos</span>
                  </div>
                  <span className="text-[#c1c8c2]">|</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>{tfIncorrectCount} errores</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#f2f1ec] dark:bg-[#16382c] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] transition-all duration-300 rounded-full"
                  style={{ width: `${tfProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm space-y-6">
              <div className="p-6 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-[#0284c7]">help_outline</span>
                <p className="font-headline text-lg sm:text-xl font-bold text-[#012d1d] dark:text-white leading-relaxed">
                  "{currentTfQ.statement}"
                </p>
              </div>

              {/* True or False Big Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* VERDADERO */}
                <button
                  type="button"
                  onClick={() => handleSelectTfOption(true)}
                  className={`p-6 rounded-2xl border-2 font-bold text-sm sm:text-base flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    showTfExplanation
                      ? currentTfQ.isTrue
                        ? 'border-[#15803d] bg-[#f0fdf4] text-[#15803d] ring-2 ring-[#15803d]'
                        : tfAnswerVal === true
                        ? 'border-[#ba1a1a] bg-[#fef2f2] text-[#ba1a1a] ring-2 ring-[#ba1a1a]'
                        : 'border-[#e2e0d8] opacity-50'
                      : tfAnswerVal === true
                      ? 'border-[#15803d] bg-[#f0fdf4] text-[#15803d]'
                      : 'border-[#c1c8c2]/60 hover:border-[#15803d] hover:bg-[#f0fdf4]/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-[#15803d]">check_circle</span>
                  <span>VERDADERO</span>
                </button>

                {/* FALSO */}
                <button
                  type="button"
                  onClick={() => handleSelectTfOption(false)}
                  className={`p-6 rounded-2xl border-2 font-bold text-sm sm:text-base flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    showTfExplanation
                      ? !currentTfQ.isTrue
                        ? 'border-[#15803d] bg-[#f0fdf4] text-[#15803d] ring-2 ring-[#15803d]'
                        : tfAnswerVal === false
                        ? 'border-[#ba1a1a] bg-[#fef2f2] text-[#ba1a1a] ring-2 ring-[#ba1a1a]'
                        : 'border-[#e2e0d8] opacity-50'
                      : tfAnswerVal === false
                      ? 'border-[#ba1a1a] bg-[#fef2f2] text-[#ba1a1a]'
                      : 'border-[#c1c8c2]/60 hover:border-[#ba1a1a] hover:bg-[#fef2f2]/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">cancel</span>
                  <span>FALSO</span>
                </button>
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showTfExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 ${
                      tfAnswerVal === currentTfQ.isTrue
                        ? 'bg-[#f0fdf4] border-[#86efac] text-[#14532d]'
                        : 'bg-[#fef2f2] border-[#fca5a5] text-[#7f1d1d]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-base">
                        {tfAnswerVal === currentTfQ.isTrue ? 'check_circle' : 'info'}
                      </span>
                      <span>
                        {tfAnswerVal === currentTfQ.isTrue
                          ? '¡Acertaste!'
                          : '¡Ups! Respuesta errónea:'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-95">
                      {currentTfQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#c1c8c2]/60 text-xs font-bold hover:bg-[#faf9f4] transition-colors cursor-pointer"
                >
                  Cambiar Juego
                </button>

                <button
                  type="button"
                  onClick={handleNextTf}
                  disabled={!isTfAnswered}
                  className="px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <span>
                    {tfIndex === totalTf - 1 ? 'Ver Resultados' : 'Siguiente Afirmación'}
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ================================================================= */}
        {/* VISTA 4: JUEGO 3 - DESAFÍO POR ETAPAS                             */}
        {/* ================================================================= */}
        {selectedGame === 'desafio_etapas' && !isStageCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#a855f7] bg-[#fdf4ff] dark:bg-[#3b0764] px-2.5 py-0.5 rounded-full border border-[#f0abfc]/60">
                      {currentStageQ.stageName}
                    </span>
                    <span className="text-xs text-[#717973]">• {currentStageQ.topicLabel}</span>
                  </div>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#012d1d] dark:text-white">
                    Pregunta {stageIndex + 1} de {totalStage}
                  </h2>
                </div>

                {/* Score Counter */}
                <div className="flex items-center gap-3 bg-[#faf9f4] dark:bg-[#112920] px-4 py-2 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/30 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803d]">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>{stageCorrectCount} aciertos</span>
                  </div>
                  <span className="text-[#c1c8c2]">|</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>{stageIncorrectCount} errores</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#f2f1ec] dark:bg-[#16382c] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] transition-all duration-300 rounded-full"
                  style={{ width: `${stageProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#faf9f4] text-[#717973] border border-[#efeee9]">
                  {currentStageQ.stageName}
                </span>
                <h3 className="font-headline text-lg sm:text-xl font-bold text-[#012d1d] dark:text-white leading-relaxed">
                  {currentStageQ.question}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {currentStageQ.options.map((option) => {
                  const isSelected = stageAnswerId === option.id;
                  const isCorrect = option.id === currentStageQ.correctAnswerId;

                  let cardStyle =
                    'border-[#c1c8c2]/50 dark:border-[#2b694d]/40 bg-[#faf9f4] dark:bg-[#112920] hover:border-[#7e22ce] text-[#1b1c19] dark:text-white';

                  if (showStageExplanation) {
                    if (isCorrect) {
                      cardStyle =
                        'border-[#15803d] bg-[#f0fdf4] text-[#14532d] ring-2 ring-[#15803d]';
                    } else if (isSelected && !isCorrect) {
                      cardStyle =
                        'border-[#ba1a1a] bg-[#fef2f2] text-[#7f1d1d] ring-2 ring-[#ba1a1a]';
                    }
                  } else if (isSelected) {
                    cardStyle =
                      'border-[#7e22ce] bg-[#fdf4ff] text-[#581c87] ring-1 ring-[#7e22ce]';
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectStageOption(option.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer active:scale-99 ${cardStyle}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 transition-colors ${
                          showStageExplanation && isCorrect
                            ? 'bg-[#15803d] text-white shadow-xs'
                            : showStageExplanation && isSelected && !isCorrect
                            ? 'bg-[#ba1a1a] text-white shadow-xs'
                            : isSelected
                            ? 'bg-[#7e22ce] text-white'
                            : 'bg-white text-[#717973] border border-[#c1c8c2]/50'
                        }`}
                      >
                        {showStageExplanation && isCorrect ? (
                          <span className="material-symbols-outlined text-base">check</span>
                        ) : showStageExplanation && isSelected && !isCorrect ? (
                          <span className="material-symbols-outlined text-base">close</span>
                        ) : (
                          option.id.toUpperCase()
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold leading-relaxed pt-1">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Banner */}
              <AnimatePresence>
                {showStageExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 ${
                      stageAnswerId === currentStageQ.correctAnswerId
                        ? 'bg-[#f0fdf4] border-[#86efac] text-[#14532d]'
                        : 'bg-[#fef2f2] border-[#fca5a5] text-[#7f1d1d]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-base">
                        {stageAnswerId === currentStageQ.correctAnswerId ? 'check_circle' : 'info'}
                      </span>
                      <span>
                        {stageAnswerId === currentStageQ.correctAnswerId
                          ? '¡Correcto!'
                          : 'Retroalimentación de la Etapa:'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-95">
                      {currentStageQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#c1c8c2]/60 text-xs font-bold hover:bg-[#faf9f4] transition-colors cursor-pointer"
                >
                  Cambiar Juego
                </button>

                <button
                  type="button"
                  onClick={handleNextStage}
                  disabled={!isStageAnswered}
                  className="px-6 py-2.5 rounded-xl bg-[#7e22ce] hover:bg-[#6b21a8] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <span>
                    {stageIndex === totalStage - 1 ? 'Completar Desafío' : 'Siguiente Etapa'}
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ================================================================= */}
        {/* VISTA 5: PANTALLA DE RESULTADOS & INSIGNIA DIGITAL DE EXPERTO     */}
        {/* ================================================================= */}
        {(isTriviaCompleted || isTfCompleted || isStageCompleted) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Calculated active metrics */}
            {(() => {
              const activeScore = isTriviaCompleted
                ? triviaScorePercent
                : isTfCompleted
                ? tfScorePercent
                : stageScorePercent;
              const activeCorrect = isTriviaCompleted
                ? triviaCorrectCount
                : isTfCompleted
                ? tfCorrectCount
                : stageCorrectCount;
              const activeTotal = isTriviaCompleted
                ? totalTrivia
                : isTfCompleted
                ? totalTf
                : totalStage;
              const activePassed = activeScore >= 70;
              const gameTitle = isTriviaCompleted
                ? 'Trivia Oficial: "¿Qué tanto sabes de Reborn?"'
                : isTfCompleted
                ? 'Desafío de Velocidad: "Verdadero o Falso"'
                : 'Evaluación Estructurada: "Desafío General Reborn"';

              return (
                <>
                  {/* Score Summary Card */}
                  <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-10 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm text-center space-y-4">
                    {/* Digital Badge Trophy */}
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#012d1d] via-[#1b4332] to-[#2b694d] text-[#b0f1cc] border-4 border-[#b0f1cc] flex items-center justify-center mx-auto shadow-lg relative">
                      <span className="material-symbols-outlined text-5xl">workspace_premium</span>
                      <span className="absolute -bottom-2.5 bg-[#b0f1cc] text-[#002113] text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        {activePassed ? 'Certificado' : 'En Progreso'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-xs font-black tracking-widest uppercase text-[#2b694d] dark:text-[#b0f1cc] block">
                        {gameTitle}
                      </span>
                      <h2 className="font-headline text-3xl sm:text-4xl font-black text-[#012d1d] dark:text-white">
                        {activeScore}% de Aciertos
                      </h2>
                      <p className="text-xs sm:text-sm text-[#717973] dark:text-[#a7b8ae] max-w-lg mx-auto leading-relaxed pt-1">
                        {activePassed
                          ? `¡Felicitaciones! Has respondido correctamente ${activeCorrect} de ${activeTotal} preguntas. Has obtenido la Insignia Digital de "Experto Reborn Your Style" y tu certificado simbólico de aprovechamiento.`
                          : `Has obtenido ${activeCorrect} de ${activeTotal} aciertos (${activeScore}%). Necesitas un mínimo de 70% para obtener la insignia oficial de Experto. ¡Revisa el contenido y vuelve a intentarlo!`}
                      </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                      <div className="p-3 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-center">
                        <span className="text-[10px] text-[#717973] block uppercase font-bold">Aciertos</span>
                        <span className="font-headline font-black text-lg text-[#15803d]">
                          {activeCorrect} / {activeTotal}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-center">
                        <span className="text-[10px] text-[#717973] block uppercase font-bold">Resultado</span>
                        <span className="font-headline font-black text-lg text-[#012d1d] dark:text-[#b0f1cc]">
                          {activePassed ? 'Aprobado' : 'Reintentar'}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-center">
                        <span className="text-[10px] text-[#717973] block uppercase font-bold">Insignia</span>
                        <span className="font-headline font-black text-xs text-[#2b694d] dark:text-[#b0f1cc] flex items-center justify-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">military_tech</span>
                          <span>Experto</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INSIGNIA & CERTIFICADO SIMBÓLICO OFICIAL */}
                  {activePassed ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-xl text-[#2b694d]">military_tech</span>
                          <span>Insignia Digital & Certificado Oficial Reborn Your Style</span>
                        </h3>

                        <button
                          type="button"
                          onClick={handlePrintCertificate}
                          className="px-4 py-2 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <span className="material-symbols-outlined text-base">print</span>
                          <span>{isEn ? 'Print / Save' : 'Imprimir / Guardar'}</span>
                        </button>
                      </div>

                      {/* Customize recipient name */}
                      <div className="bg-[#faf9f4] dark:bg-[#112920] p-4 rounded-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-xs font-bold text-[#414844] dark:text-[#a7b8ae] shrink-0">
                          Nombre que aparecerá en el certificado:
                        </label>
                        <input
                          type="text"
                          value={certificateName}
                          onChange={(e) => setCertificateName(e.target.value)}
                          className="flex-1 bg-white dark:bg-[#071510] border border-[#c1c8c2] dark:border-[#2b694d] rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#012d1d] dark:text-white outline-none focus:border-[#012d1d]"
                          placeholder="Tu nombre completo o de tu taller"
                        />
                      </div>

                      {/* Printable Certificate Canvas */}
                      <div
                        id="certificate-print-area"
                        className="relative p-8 sm:p-14 rounded-3xl bg-white dark:bg-[#091b14] border-4 border-[#012d1d] dark:border-[#2b694d] shadow-xl overflow-hidden text-center space-y-6"
                      >
                        {/* Decorative borders */}
                        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#2b694d]" />
                        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#2b694d]" />
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#2b694d]" />
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#2b694d]" />

                        <div className="space-y-1">
                          <span className="text-xs font-black tracking-[4px] uppercase text-[#2b694d] dark:text-[#b0f1cc]">
                            REBORN YOUR STYLE • ACADEMIA DIGITAL
                          </span>
                          <h2 className="font-headline font-black text-2xl sm:text-4xl text-[#012d1d] dark:text-white uppercase tracking-tight">
                            Insignia de Experto Reborn
                          </h2>
                          <p className="text-xs text-[#717973] font-medium tracking-wider uppercase">
                            Certificado de Dominio en Supra-Reciclaje Textil y Plataforma Circular
                          </p>
                        </div>

                        <div className="py-2">
                          <p className="text-xs text-[#717973] italic">
                            Se otorga con mención de honor a:
                          </p>
                          <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-[#b0f1cc] mt-2 underline decoration-[#2b694d] decoration-2 underline-offset-8">
                            {certificateName || 'Experto Reborn Your Style'}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-[#414844] dark:text-[#a7b8ae] max-w-xl mx-auto leading-relaxed">
                          Por haber acreditado con distinción sus conocimientos en el modelo de transformación de prendas, sustentabilidad textil, conexión con talleres de modistería y economía circular en <strong>{gameTitle}</strong> con un puntaje de <strong>{activeScore}%</strong>.
                        </p>

                        <div className="pt-6 border-t border-[#c1c8c2]/40 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                          <div className="text-left text-[11px] text-[#717973]">
                            <span className="block font-bold text-[#012d1d] dark:text-white">Código de Verificación:</span>
                            <span className="font-mono text-xs text-[#2b694d] dark:text-[#b0f1cc] font-bold">{certCode}</span>
                            <span className="block text-[10px] mt-0.5">Certificación Oficial Verificada</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#012d1d] to-[#2b694d] text-[#b0f1cc] flex items-center justify-center shadow-lg border-2 border-[#b0f1cc]">
                              <span className="material-symbols-outlined text-3xl">verified</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-[#012d1d] dark:text-[#b0f1cc] mt-1.5 tracking-wider">
                              Experto Reborn
                            </span>
                          </div>

                          <div className="text-right text-[11px] text-[#717973]">
                            <span className="block font-bold text-[#012d1d] dark:text-white">Fecha de Emisión:</span>
                            <span>{new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="block text-[10px] text-[#2b694d] dark:text-[#b0f1cc] font-semibold mt-0.5">Comité Reborn Your Style</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Retake and Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (isTriviaCompleted) handleRestartTrivia();
                        if (isTfCompleted) handleRestartTf();
                        if (isStageCompleted) handleRestartStage();
                      }}
                      className="px-6 py-3 rounded-xl bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] border border-[#c1c8c2] text-[#012d1d] dark:text-[#b0f1cc] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">refresh</span>
                      <span>Reintentar este Juego</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsTriviaCompleted(false);
                        setIsTfCompleted(false);
                        setIsStageCompleted(false);
                        setSelectedGame(null);
                      }}
                      className="px-6 py-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">apps</span>
                      <span>Explorar Otros Juegos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('costureros')}
                      className="px-6 py-3 rounded-xl bg-[#f2f8f4] hover:bg-[#e8f5ed] border border-[#b0f1cc] text-[#012d1d] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">architecture</span>
                      <span>Encuentra a tu Costurero</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
