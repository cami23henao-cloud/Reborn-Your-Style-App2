import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../../data/educationalContent';
import { AppView, UserProfile } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificateName, setCertificateName] = useState(userProfile?.name || 'Creador Sostenible');
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [certCode] = useState<string>(() => `RYS-CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${new Date().getFullYear()}`);

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const selectedAnswerId = selectedAnswers[currentQ.id];
  const isAnswered = Boolean(selectedAnswerId);

  const handleSelectOption = (optionId: string) => {
    if (showExplanation) return; // Prevent changing after revealing explanation
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setElapsedSeconds(Math.round((Date.now() - startTime) / 1000));
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setShowExplanation(false);
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  // Calculate results
  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswerId
  ).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = scorePercent >= 70;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#faf9f4] dark:bg-[#071510] text-[#1b1c19] dark:text-[#f1f3ee] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('tutoriales')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{isEn ? 'Back to Tutorials & Training' : 'Volver a Tutoriales y Guías'}</span>
          </button>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#012d1d]/10 dark:bg-[#b0f1cc]/15 text-[#012d1d] dark:text-[#b0f1cc] border border-[#012d1d]/20 dark:border-[#b0f1cc]/30 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>{isEn ? 'Digital Certification Center' : 'Centro de Certificación Digital'}</span>
          </span>
        </div>

        {!isCompleted ? (
          /* =============================================================== */
          /* PANTALLA ACTIVA DEL CUESTIONARIO (QUIZ)                         */
          /* =============================================================== */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card with Progress */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc] block mb-1">
                    {currentQ.topicLabel}
                  </span>
                  <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#012d1d] dark:text-white">
                    {isEn ? 'Knowledge Assessment' : 'Evaluación de Conocimientos'}
                  </h1>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-bold text-[#717973] dark:text-[#a7b8ae]">
                    {isEn ? 'Question' : 'Pregunta'} {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c1c8c2]" />
                  <span className="text-xs font-extrabold text-[#012d1d] dark:text-[#b0f1cc]">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#f2f1ec] dark:bg-[#16382c] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2b694d] to-[#012d1d] dark:from-[#4ade80] dark:to-[#b0f1cc] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-8 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#faf9f4] dark:bg-[#112920] text-[#717973] dark:text-[#a7b8ae] border border-[#efeee9] dark:border-[#2b694d]/30">
                  #{currentQ.id} • {currentQ.topicLabel}
                </span>
                <h2 className="font-headline text-base sm:text-lg font-bold text-[#012d1d] dark:text-white leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const isSelected = selectedAnswerId === option.id;
                  const isCorrect = option.id === currentQ.correctAnswerId;

                  let cardStyle = 'border-[#c1c8c2]/50 dark:border-[#2b694d]/40 bg-[#faf9f4] dark:bg-[#112920] hover:border-[#012d1d] dark:hover:border-[#b0f1cc] text-[#1b1c19] dark:text-white';

                  if (showExplanation) {
                    if (isCorrect) {
                      cardStyle = 'border-[#15803d] bg-[#f0fdf4] dark:bg-[#143d26] text-[#14532d] dark:text-[#bbf7d0] ring-1 ring-[#15803d]';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'border-[#ba1a1a] bg-[#fef2f2] dark:bg-[#3d1414] text-[#7f1d1d] dark:text-[#fecaca] ring-1 ring-[#ba1a1a]';
                    }
                  } else if (isSelected) {
                    cardStyle = 'border-[#012d1d] dark:border-[#b0f1cc] bg-[#f2f8f4] dark:bg-[#173a2d] ring-1 ring-[#012d1d] dark:ring-[#b0f1cc]';
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer active:scale-99 ${cardStyle}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 transition-colors ${
                          showExplanation && isCorrect
                            ? 'bg-[#15803d] text-white'
                            : showExplanation && isSelected && !isCorrect
                            ? 'bg-[#ba1a1a] text-white'
                            : isSelected
                            ? 'bg-[#012d1d] dark:bg-[#b0f1cc] text-white dark:text-[#012d1d]'
                            : 'bg-white dark:bg-[#071510] text-[#717973] border border-[#c1c8c2]/40'
                        }`}
                      >
                        {showExplanation && isCorrect ? (
                          <span className="material-symbols-outlined text-sm">check</span>
                        ) : showExplanation && isSelected && !isCorrect ? (
                          <span className="material-symbols-outlined text-sm">close</span>
                        ) : (
                          option.id
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanatory Feedback Banner */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${
                      selectedAnswerId === currentQ.correctAnswerId
                        ? 'bg-[#f0fdf4] dark:bg-[#143d26] border-[#86efac] text-[#14532d] dark:text-[#bbf7d0]'
                        : 'bg-[#fef2f2] dark:bg-[#3d1414] border-[#fca5a5] text-[#7f1d1d] dark:text-[#fecaca]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-base">
                        {selectedAnswerId === currentQ.correctAnswerId ? 'check_circle' : 'info'}
                      </span>
                      <span>
                        {selectedAnswerId === currentQ.correctAnswerId
                          ? isEn ? 'Correct answer!' : '¡Respuesta correcta!'
                          : isEn ? 'Not quite right' : 'Explicación técnica:'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-95">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#c1c8c2]/60 dark:border-[#2b694d]/40 text-[#414844] dark:text-[#a7b8ae] text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#faf9f4] dark:hover:bg-[#112920] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>{isEn ? 'Previous' : 'Anterior'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] dark:bg-[#b0f1cc] dark:hover:bg-[#86efac] text-white dark:text-[#002113] text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 active:scale-98"
                >
                  <span>
                    {currentQuestionIndex === totalQuestions - 1
                      ? isEn ? 'Finish and View Results' : 'Finalizar y Ver Resultados'
                      : isEn ? 'Next Question' : 'Siguiente Pregunta'}
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =============================================================== */
          /* PANTALLA DE RESULTADOS & CERTIFICADO SIMBÓLICO                   */
          /* =============================================================== */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Score Summary Card */}
            <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 sm:p-10 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-[#f2f8f4] dark:bg-[#173a2d] text-[#2b694d] dark:text-[#b0f1cc] border border-[#b0f1cc] flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-4xl">
                  {isPassed ? 'workspace_premium' : 'psychology'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold tracking-wider uppercase text-[#2b694d] dark:text-[#b0f1cc]">
                  {isPassed
                    ? isEn ? 'Assessment Passed with Honors' : 'Evaluación Aprobada con Distinción'
                    : isEn ? 'Keep Learning and Improving' : 'Continúa Practicando'}
                </span>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#012d1d] dark:text-white">
                  {scorePercent}% {isEn ? 'Final Score' : 'de Aciertos'}
                </h2>
                <p className="text-xs sm:text-sm text-[#717973] dark:text-[#a7b8ae] max-w-md mx-auto leading-relaxed">
                  {isPassed
                    ? isEn
                      ? `Congratulations! You answered ${correctCount} out of ${totalQuestions} questions correctly. You have earned your certificate in textile upcycling and digital content.`
                      : `¡Excelente trabajo! Has respondido correctamente ${correctCount} de ${totalQuestions} preguntas. Has desbloqueado tu insignia y certificado simbólico oficial.`
                    : isEn
                      ? `You answered ${correctCount} of ${totalQuestions} correctly. You need at least 70% to receive the certificate. Review the tutorials and try again!`
                      : `Respondiste correctamente ${correctCount} de ${totalQuestions}. Necesitas al menos 70% para obtener tu certificación. Te recomendamos repasar las guías y reintentar.`}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                <div className="p-3 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-center">
                  <span className="text-[10px] text-[#717973] block uppercase font-bold">Aciertos</span>
                  <span className="font-headline font-black text-lg text-[#15803d] dark:text-[#4ade80]">
                    {correctCount} / {totalQuestions}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-center">
                  <span className="text-[10px] text-[#717973] block uppercase font-bold">Efectividad</span>
                  <span className="font-headline font-black text-lg text-[#012d1d] dark:text-[#b0f1cc]">
                    {scorePercent}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-center">
                  <span className="text-[10px] text-[#717973] block uppercase font-bold">Tiempo</span>
                  <span className="font-headline font-black text-lg text-[#717973]">
                    {elapsedSeconds > 0 ? `${elapsedSeconds}s` : '1m'}
                  </span>
                </div>
              </div>
            </div>

            {/* CERTIFICADO DIGITAL SIMBÓLICO (Aprobado) */}
            {isPassed && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl text-[#2b694d]">military_tech</span>
                    <span>{isEn ? 'Official Digital Certificate' : 'Certificado Digital Simbólico'}</span>
                  </h3>

                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-4 py-2 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    <span>{isEn ? 'Print / Save Certificate' : 'Imprimir / Guardar Certificado'}</span>
                  </button>
                </div>

                {/* Personalize Certificate Name */}
                <div className="bg-[#faf9f4] dark:bg-[#112920] p-4 rounded-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-xs font-bold text-[#414844] dark:text-[#a7b8ae] shrink-0">
                    {isEn ? 'Name on certificate:' : 'Nombre que aparecerá en el certificado:'}
                  </label>
                  <input
                    type="text"
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#071510] border border-[#c1c8c2] dark:border-[#2b694d] rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#012d1d] dark:text-white outline-none focus:border-[#012d1d]"
                    placeholder="Tu nombre completo o de tu taller"
                  />
                </div>

                {/* VISUAL CERTIFICATE CANVAS */}
                <div
                  id="certificate-print-area"
                  className="relative p-8 sm:p-14 rounded-3xl bg-white dark:bg-[#091b14] border-4 border-[#012d1d] dark:border-[#2b694d] shadow-xl overflow-hidden text-center space-y-6"
                >
                  {/* Decorative corners */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#2b694d]" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#2b694d]" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#2b694d]" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#2b694d]" />

                  {/* Header */}
                  <div className="space-y-1">
                    <span className="text-xs font-black tracking-[4px] uppercase text-[#2b694d] dark:text-[#b0f1cc]">
                      REBORN YOUR STYLE • ACADEMY
                    </span>
                    <h2 className="font-headline font-black text-2xl sm:text-4xl text-[#012d1d] dark:text-white uppercase tracking-tight">
                      Certificado de Aprovechamiento
                    </h2>
                    <p className="text-xs text-[#717973] dark:text-[#a7b8ae] font-medium tracking-wider uppercase">
                      Supra-Reciclaje Textil y Contenidos Digitales Sostenibles
                    </p>
                  </div>

                  <div className="py-2">
                    <p className="text-xs text-[#717973] dark:text-[#a7b8ae] italic">
                      Se certifica con distinción que:
                    </p>
                    <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-[#b0f1cc] mt-2 underline decoration-[#2b694d] decoration-2 underline-offset-8">
                      {certificateName || 'Creador de Moda Circular'}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#414844] dark:text-[#a7b8ae] max-w-xl mx-auto leading-relaxed">
                    Ha completado satisfactoriamente la evaluación sobre buenas prácticas de modificación de prendas, diagnóstico textil, elaboración de fichas técnicas y creación de contenidos visuales para modistería circular con un puntaje de <strong className="text-[#012d1d] dark:text-white">{scorePercent}%</strong>.
                  </p>

                  {/* Badges and Signatures */}
                  <div className="pt-6 border-t border-[#c1c8c2]/40 dark:border-[#2b694d]/40 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="text-left text-[11px] text-[#717973] dark:text-[#a7b8ae]">
                      <span className="block font-bold text-[#012d1d] dark:text-white">Código de Verificación:</span>
                      <span className="font-mono text-xs text-[#2b694d] dark:text-[#b0f1cc] font-bold">{certCode}</span>
                      <span className="block text-[10px] mt-0.5">Válido en la red comunitaria Reborn</span>
                    </div>

                    {/* Golden / Green Medal Stamp */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#012d1d] to-[#2b694d] text-[#b0f1cc] flex items-center justify-center shadow-lg border-2 border-[#b0f1cc]">
                        <span className="material-symbols-outlined text-3xl">verified</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#012d1d] dark:text-[#b0f1cc] mt-1.5 tracking-wider">
                        Certificación Oficial
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-[#717973] dark:text-[#a7b8ae]">
                      <span className="block font-bold text-[#012d1d] dark:text-white">Fecha de Emisión:</span>
                      <span>{new Date().toLocaleDateString(isEn ? 'en-US' : 'es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="block text-[10px] text-[#2b694d] dark:text-[#b0f1cc] font-semibold mt-0.5">Comité Reborn Your Style</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 rounded-xl bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] dark:hover:bg-[#16382c] border border-[#c1c8c2] dark:border-[#2b694d] text-[#012d1d] dark:text-[#b0f1cc] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>{isEn ? 'Retake Assessment' : 'Reintentar Evaluación'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tutoriales')}
                className="px-6 py-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-base">school</span>
                <span>{isEn ? 'Explore More Tutorials' : 'Explorar Más Tutoriales'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('costureros')}
                className="px-6 py-3 rounded-xl bg-[#f2f8f4] hover:bg-[#e8f5ed] border border-[#b0f1cc] text-[#012d1d] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">architecture</span>
                <span>{isEn ? 'Find a Tailor' : 'Encuentra a tu Costurero'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
