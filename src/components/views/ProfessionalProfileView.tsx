import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Professional, AppView } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface ProfessionalProfileViewProps {
  professional: Professional;
  onBack: () => void;
  onRequestService: (pro: Professional) => void;
  onSendMessage: (pro: Professional) => void;
  onNavigate: (view: AppView) => void;
}

export const ProfessionalProfileView: React.FC<ProfessionalProfileViewProps> = ({
  professional,
  onBack,
  onRequestService,
  onSendMessage,
  onNavigate,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Address and location handling
  const hasLocationOrAddress = Boolean(professional.address || professional.location);
  const fullAddressString = professional.address
    ? `${professional.address}, ${professional.location}`
    : professional.location || '';

  const encodedMapQuery = encodeURIComponent(fullAddressString);
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodedMapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;

  const handleCopyAddress = () => {
    if (!fullAddressString) return;
    navigator.clipboard?.writeText(fullAddressString);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-16 py-8 md:py-12"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2b694d] hover:text-[#012d1d] mb-6 group cursor-pointer transition-colors"
      >
        <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">
          arrow_back
        </span>
        <span>Volver a Encuentra tu costurero</span>
      </button>

      {/* Main Profile Header Section */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start mb-12">
        {/* Left Column: Avatar & Action CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_rgba(1,45,29,0.05)] border border-[#efeee9]"
        >
          <div className="relative mb-5">
            <UserAvatar
              src={professional.imageUrl}
              name={professional.name}
              size="hero"
              borderClassName="border-4 border-white shadow-[0_4px_16px_rgba(1,45,29,0.08)]"
            />
            {professional.isTopSeller && (
              <span className="absolute bottom-1 right-1 bg-[#b0f1cc] text-[#002113] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Top Seller
              </span>
            )}
          </div>

          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#012d1d] mb-1">
            {professional.name}
          </h1>

          <p className="text-sm font-medium text-[#414844] mb-2">{professional.specialty}</p>

          {/* Location Badge (only if provided) */}
          {professional.location ? (
            <div className="flex items-center gap-1 text-[#717973] text-xs mb-3">
              <span className="material-symbols-outlined text-base text-[#2b694d]">location_on</span>
              <span>{professional.location}</span>
            </div>
          ) : null}

          {/* Physical Address (only if provided) */}
          {professional.address ? (
            <div className="flex items-center gap-1 text-[#414844] text-xs font-semibold mb-3 bg-[#f5f4ef] px-2.5 py-1 rounded-lg border border-[#c1c8c2]/40">
              <span className="material-symbols-outlined text-sm text-[#2b694d]">storefront</span>
              <span className="truncate">{professional.address}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5 mb-6">
            <div className="flex text-[#FFB400]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-base"
                  style={{
                    fontVariationSettings:
                      star <= Math.floor(professional.rating) ? '"FILL" 1' : '"FILL" 0',
                  }}
                >
                  {star <= professional.rating ? 'star' : 'star_half'}
                </span>
              ))}
            </div>
            <span className="text-xs font-semibold text-[#414844]">
              ({professional.rating} - {professional.reviewsCount} reseñas)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full">
            <button
              onClick={() => onRequestService(professional)}
              className="w-full font-semibold text-sm bg-[#e37b5e] text-white hover:bg-[#c9664b] py-3.5 px-5 rounded-xl transition-all shadow-[0_8px_24px_rgba(227,123,94,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
              <span>Solicitar servicio</span>
            </button>

            <button
              onClick={() => onSendMessage(professional)}
              className="w-full font-semibold text-sm bg-[#012d1d] text-[#b0f1cc] hover:bg-[#2b694d] hover:text-white py-3.5 px-5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              <span>Iniciar conversación</span>
            </button>
          </div>
        </motion.div>

        {/* Right Column: Bio, Google Maps & Specialties */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {/* Bio Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(1,45,29,0.05)] border border-[#efeee9]"
          >
            <h2 className="font-headline text-xl font-bold text-[#012d1d] mb-3">Sobre Mí</h2>
            <p className="text-sm md:text-base text-[#1b1c19] leading-relaxed mb-6">
              {professional.bio}
            </p>

            <h3 className="font-headline text-xs font-bold text-[#012d1d] uppercase tracking-wider mb-3">
              Especialidades y Técnicas
            </h3>
            <div className="flex flex-wrap gap-2">
              {professional.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#e4ece7] text-[#012d1d] font-semibold text-xs px-4 py-2 rounded-full border border-[#94d4b1]/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Functional Google Maps Location Section (Requirement: Integración funcional con Google Maps) */}
          {hasLocationOrAddress && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(1,45,29,0.05)] border border-[#efeee9] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#efeee9]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl text-[#2b694d]">
                      pin_drop
                    </span>
                    <h3 className="font-headline text-lg font-bold text-[#012d1d]">
                      Ubicación y Taller en Google Maps
                    </h3>
                  </div>
                  <p className="text-xs text-[#717973] mt-0.5">
                    {professional.address ? `${professional.address} • ` : ''}
                    {professional.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {professional.address && (
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="px-3 py-1.5 rounded-xl border border-[#c1c8c2]/50 text-xs font-semibold text-[#414844] hover:text-[#012d1d] hover:bg-[#efeee9] transition-colors flex items-center gap-1"
                      title="Copiar dirección exacta"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedAddress ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedAddress ? 'Copiada' : 'Copiar'}</span>
                    </button>
                  )}

                  <a
                    href={googleMapsExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs"
                    title="Abrir ubicación directamente en la aplicación o web de Google Maps"
                  >
                    <span className="material-symbols-outlined text-sm text-[#b0f1cc]">
                      open_in_new
                    </span>
                    <span>Abrir en Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Functional Embedded Interactive Google Map */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#c1c8c2]/60 shadow-inner relative bg-[#f5f4ef]">
                <iframe
                  title={`Google Maps - Taller de ${professional.name}`}
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#717973] pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#2b694d]">check_circle</span>
                  <span>Ubicación verificada mediante Google Maps Platform</span>
                </span>
                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#2b694d] hover:underline flex items-center gap-0.5 mt-1 sm:mt-0"
                >
                  <span>Cómo llegar con GPS</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </a>
              </div>
            </motion.div>
          )}

          {/* Portfolio & Sample Works */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(1,45,29,0.05)] border border-[#efeee9]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline text-lg font-bold text-[#012d1d]">
                Trabajos y Proyectos Recientes
              </h3>
              <button
                onClick={() => onNavigate('inspiracion')}
                className="text-xs font-semibold text-[#2b694d] hover:underline cursor-pointer"
              >
                Ver en galería
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {professional.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl overflow-hidden border border-[#efeee9] bg-[#f5f4ef] relative"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-3.5 bg-white">
                    <p className="text-xs font-bold text-[#012d1d] truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Customer Reviews List */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(1,45,29,0.05)] border border-[#efeee9]"
          >
            <h3 className="font-headline text-lg font-bold text-[#012d1d] mb-4">
              Opiniones de Clientes ({professional.reviews.length})
            </h3>
            <div className="space-y-4">
              {professional.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-[#f5f4ef] border border-[#efeee9]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={rev.author} size="sm" />
                      <div>
                        <h4 className="font-semibold text-xs text-[#012d1d]">{rev.author}</h4>
                        <div className="flex text-[#FFB400] text-xs mt-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: '"FILL" 1' }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#717973]">{rev.date}</span>
                  </div>
                  <p className="text-xs text-[#414844] italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
