import React, { useState, useEffect } from 'react';
import { Professional, GarmentProject } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  garments: GarmentProject[];
  onSubmitRequest: (details: {
    professionalId: string;
    professionalName: string;
    garmentTitle: string;
    serviceType: string;
    budget: number;
    description: string;
  }) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  professional,
  garments,
  onSubmitRequest
}) => {
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  const [selectedGarmentOption, setSelectedGarmentOption] = useState<string>('__otra_prenda__');
  const [customGarmentText, setCustomGarmentText] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Upcycling Creativo y Transformación');
  const [budget, setBudget] = useState<number>(50000);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Whenever modal opens, reset all fields cleanly - Requirement 7:
  useEffect(() => {
    if (isOpen) {
      if (garments.length > 0) {
        setSelectedGarmentOption(garments[0].title);
      } else {
        setSelectedGarmentOption('__otra_prenda__');
      }
      setCustomGarmentText('');
      setNotes('');
      setErrorMessage('');
      if (professional?.startingPrice) {
        setBudget(professional.startingPrice);
      } else {
        setBudget(50000);
      }
    }
  }, [isOpen, garments, professional]);

  if (!isOpen || !professional) return null;

  const isCustomGarment = selectedGarmentOption === '__otra_prenda__';

  const handleGarmentOptionChange = (value: string) => {
    setSelectedGarmentOption(value);
    setErrorMessage('');
    if (value === '__otra_prenda__') {
      // Clean from scratch
      setCustomGarmentText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let finalGarmentTitle = selectedGarmentOption;
    if (isCustomGarment) {
      if (!customGarmentText.trim()) {
        setErrorMessage(isEn ? 'Please describe what garment you want to create or transform.' : 'Por favor escribe qué prenda deseas crear o transformar.');
        return;
      }
      finalGarmentTitle = customGarmentText.trim();
    }

    if (!budget || budget <= 0) {
      setErrorMessage(isEn ? 'Please enter a valid budget.' : 'Por favor ingresa un presupuesto válido.');
      return;
    }

    onSubmitRequest({
      professionalId: professional.id,
      professionalName: professional.name,
      garmentTitle: finalGarmentTitle,
      serviceType,
      budget,
      description: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0e241c] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#efeee9] dark:border-[#2b694d]/40 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between bg-[#faf9f4] dark:bg-[#002113]/50">
          <div className="flex items-center gap-3">
            <img
              src={professional.imageUrl}
              alt={professional.name}
              className="w-11 h-11 rounded-full object-cover border border-[#c1c8c2]/50"
            />
            <div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white">
                {isEn ? `Request Quote from ${professional.name}` : `Solicitar Cotización a ${professional.name}`}
              </h3>
              <p className="text-xs text-[#717973] dark:text-[#a0a5a1]">{professional.specialty} • {professional.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeee9] dark:bg-[#002113] hover:bg-[#e3e3de] text-[#1b1c19] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Garment Selection / "Otra prenda nueva" */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Garment for tailoring' : 'Prenda para el trabajo'}
            </label>
            <select
              value={selectedGarmentOption}
              onChange={(e) => handleGarmentOptionChange(e.target.value)}
              className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl p-2.5 text-xs sm:text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
            >
              {garments.map((g) => (
                <option key={g.id} value={g.title}>
                  {g.title} ({g.condition})
                </option>
              ))}
              <option value="__otra_prenda__">{isEn ? '+ Another new garment' : '+ Otra prenda nueva'}</option>
            </select>
          </div>

          {/* Dedicated Text Box for "Otra prenda nueva" - Requirement 7 */}
          {isCustomGarment && (
            <div className="p-4 rounded-xl bg-[#f5f4ef] dark:bg-[#002113]/40 border-2 border-dashed border-[#2b694d]/40 space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#2b694d] dark:text-[#b0f1cc]">edit_note</span>
                <span>{isEn ? 'Describe from scratch what garment or design you want to create *' : 'Escribe desde cero qué prenda o diseño quieres crear *'}</span>
              </label>
              <textarea
                rows={3}
                required
                value={customGarmentText}
                onChange={(e) => {
                  setCustomGarmentText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={isEn ? 'E.g.: I want to transform this shirt into an asymmetrical skirt with embroidery.' : 'Ej: Quiero transformar esta camisa en una falda.'}
                className="w-full bg-white dark:bg-[#0e241c] border border-[#c1c8c2] dark:border-[#2b694d]/40 rounded-lg p-3 text-xs sm:text-sm text-[#1b1c19] dark:text-white focus:border-[#012d1d] outline-none resize-none placeholder:text-[#8e9690]"
              />
              <p className="text-[11px] text-[#717973] dark:text-[#a0a5a1]">
                {isEn ? 'Describe your idea freely. The designer will respond with technical advice and pattern-making proposal.' : 'Escribe tu idea con total libertad. El diseñador responderá con su propuesta técnica y patronaje.'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Type of service required' : 'Tipo de servicio requerido'}
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl p-2.5 text-xs sm:text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
            >
              <option value="Upcycling Creativo y Transformación">{isEn ? 'Creative Upcycling & Transformation' : 'Upcycling Creativo y Transformación'}</option>
              <option value="Ajuste, Entalle y Modistería">{isEn ? 'Alterations, Fitting & Tailoring' : 'Ajuste, Entalle y Modistería'}</option>
              <option value="Bordado Artesanal Personalizado">{isEn ? 'Custom Hand Embroidery' : 'Bordado Artesanal Personalizado'}</option>
              <option value="Teñido Natural con Tintes Botánicos">{isEn ? 'Natural Botanical Dyeing' : 'Teñido Natural con Tintes Botánicos'}</option>
              <option value="Confección y Patronaje desde Cero">{isEn ? 'Custom Garment & Pattern Making from Scratch' : 'Confección y Patronaje desde Cero'}</option>
              <option value="Reparación Visible y Zurcido (Sashiko)">{isEn ? 'Visible Mending & Sashiko Darning' : 'Reparación Visible y Zurcido (Sashiko)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Proposed budget ($ COP) *' : 'Presupuesto propuesto ($ COP) *'}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717973] text-sm">
                payments
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={10000}
                step={5000}
                required
                className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
              />
            </div>
            <p className="text-[11px] text-[#717973] dark:text-[#a0a5a1] mt-1">
              {isEn ? `Suggested starting fee for this workshop: From $${(professional.startingPrice).toLocaleString('es-CO')}` : `Tarifa base sugerida para este taller: Desde $${(professional.startingPrice).toLocaleString('es-CO')}`}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Additional details & project notes (Optional)' : 'Detalles adicionales y notas del proyecto (Opcional)'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isEn ? 'Measurements, preferred colors, specific details you want added...' : 'Medidas, colores que prefieres, detalles que te gustaría añadir...'}
              className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl p-2.5 text-xs sm:text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none resize-none placeholder:text-[#8e9690]"
            />
          </div>

          <div className="bg-[#b0f1cc]/30 dark:bg-[#002113]/60 p-3 rounded-xl border border-[#2b694d]/20 dark:border-[#2b694d]/40 text-xs text-[#012d1d] dark:text-[#b0f1cc] flex items-start gap-2">
            <span className="material-symbols-outlined text-[#2b694d] dark:text-[#b0f1cc] text-base shrink-0 mt-0.5">verified</span>
            <p className="text-[11px] leading-relaxed">
              {isEn ? 'When you submit your request, the workshop will receive your proposal and reply directly with tailoring details.' : 'Al enviar tu solicitud, el taller recibirá tu propuesta y te responderá directamente con los detalles de confección.'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#efeee9] dark:border-[#2b694d]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#414844] dark:text-[#c1c8c2] hover:bg-[#efeee9] dark:hover:bg-[#2b694d]/30 rounded-xl transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-[#012d1d] hover:bg-[#1b4332] text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{isEn ? 'Send Request' : 'Enviar Solicitud'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
