import React, { useState } from 'react';
import { AppView } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface ComoFuncionaViewProps {
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
  onNavigateToDesigners?: () => void;
}

export const ComoFuncionaView: React.FC<ComoFuncionaViewProps> = ({
  onNavigate,
  onOpenAuth: _onOpenAuth,
  onNavigateToDesigners,
}) => {
  const { language } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<'clientes' | 'talleres'>('clientes');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = language === 'en' ? [
    {
      q: 'What kind of garments can I submit for transformation?',
      a: 'Any! Denim jackets, worn pants, shirts with tears or stains, vintage dresses, or even scrap fabrics. Upcycling makes the most of every texture and material.',
    },
    {
      q: 'How are price and delivery deadlines agreed upon?',
      a: 'Each designer publishes their base reference rates. When you send a request or publish your garment, you can chat directly to refine details, special materials, and estimated delivery dates.',
    },
    {
      q: 'How do I get my garment to the designer?',
      a: 'You can arrange an in-person handover (most workshops are organized by local neighborhoods) or use recommended urban delivery couriers.',
    },
    {
      q: 'What are the requirements to offer my services as a professional?',
      a: 'A passion for sewing, tailoring, embroidery, or customization, along with photos of past projects to build your portfolio.',
    },
  ] : [
    {
      q: '¿Qué tipo de prendas puedo publicar para transformar?',
      a: '¡Cualquiera! Chaquetas vaqueras, pantalones desgastados, camisas con roturas o manchas, vestidos antiguos, o incluso retazos de tela. El suprareciclaje aprovecha cualquier textura y material.',
    },
    {
      q: '¿Cómo se acuerda el precio y el plazo de entrega?',
      a: 'Cada diseñador publica sus tarifas base de referencia. Cuando envías una solicitud o publicas tu prenda, puedes conversar directamente por mensajería para ajustar detalles, materiales especiales y fecha estimada de entrega.',
    },
    {
      q: '¿Cómo hago llegar mi prenda al diseñador?',
      a: 'Puedes coordinar una entrega en persona (la mayoría de talleres están organizados por comunas y barrios locales) o utilizar servicios de mensajería urbana recomendados.',
    },
    {
      q: '¿Qué requisitos necesito para ofrecer mis servicios como profesional?',
      a: 'Tener pasión por la confección, sastrería, bordado o customización, y contar con fotos de trabajos previos para armar tu portafolio.',
    },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-10 md:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
          {language === 'en' ? 'Step-by-Step Guide' : 'Guía Paso a Paso'}
        </span>
        <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#012d1d] dark:text-white mt-2 mb-4 animate-title-entry text-hover-lift">
          {language === 'en' ? 'How Reborn Your Style Works' : 'Cómo Funciona Reborn Your Style'}
        </h1>
        <p className="text-sm md:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed animate-fade-up">
          {language === 'en'
            ? 'Our mission is to make textile upcycling an easy, safe and rewarding process for everyone.'
            : 'Nuestra misión es hacer del suprareciclaje textil un proceso fácil, seguro y gratificante para todos.'}
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex bg-[#f5f4ef] dark:bg-[#112920] rounded-xl p-1 mt-6 border border-[#efeee9] dark:border-[#2b694d]/40">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`py-2 px-6 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'clientes'
                ? 'bg-white dark:bg-[#0e241c] shadow-[0_4px_16px_rgba(1,45,29,0.05)] text-[#012d1d] dark:text-[#b0f1cc]'
                : 'text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d] dark:hover:text-white'
            }`}
          >
            {language === 'en' ? 'For Garment Owners' : 'Para Propietarios de Prendas'}
          </button>
          <button
            onClick={() => setActiveTab('talleres')}
            className={`py-2 px-6 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'talleres'
                ? 'bg-white dark:bg-[#0e241c] shadow-[0_4px_16px_rgba(1,45,29,0.05)] text-[#012d1d] dark:text-[#b0f1cc]'
                : 'text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d] dark:hover:text-white'
            }`}
          >
            {language === 'en' ? 'For Designers & Workshops' : 'Para Diseñadores y Talleres'}
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="scroll-reveal grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {activeTab === 'clientes' ? (
          <>
            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Post Your Garment' : 'Publica tu Prenda'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Upload photos of your garment and describe the redesign, embroidery or repairs you desire.'
                  : 'Sube fotos de tu prenda y describe qué cambios, bordados o ajustes te gustaría realizar.'}
              </p>
            </div>

            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Choose the Creator' : 'Elige al Creador'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Explore artisan profiles in your area or receive direct proposals for your project.'
                  : 'Explora los perfiles de los artesanos en tu barrio o recibe propuestas directas para tu proyecto.'}
              </p>
            </div>

            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Agree & Deliver' : 'Acuerda y Entrega'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Finalize the budget through chat and deliver the garment at the agreed workshop.'
                  : 'Define el presupuesto final por mensajería y entrega la prenda en el taller convenido.'}
              </p>
            </div>

            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Wear with Pride' : 'Estrena con Orgullo'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Receive a unique, handmade, custom piece that is 100% free of environmental guilt.'
                  : 'Recibe una pieza única, hecha a mano, personalizada y 100% libre de culpa ambiental.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Create Your Studio' : 'Crea tu Estudio'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Register your workshop, add your bio, portfolio photos and service area.'
                  : 'Registra tu taller, añade tu bio, tus fotos de trabajos anteriores y tu zona de atención.'}
              </p>
            </div>

            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Publish Your Services' : 'Publica tus Servicios'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Define your signature techniques (embroidery, dyeing, tailoring) and set clear rates.'
                  : 'Define tus técnicas favoritas (bordado, teñido, sastrería) y fija precios base claros.'}
              </p>
            </div>

            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Receive Inquiries' : 'Recibe Solicitudes'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Local clients will contact you with real garments to request redesign quotes.'
                  : 'Clientes locales te contactarán con prendas reales para solicitar presupuestos.'}
              </p>
            </div>

            <div className="hover-elevate bg-white dark:bg-[#0e241c] p-6 rounded-2xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white mb-2 text-hover-lift">
                {language === 'en' ? 'Grow Your Brand' : 'Haz Crecer tu Marca'}
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                {language === 'en'
                  ? 'Earn a stellar reputation with 5-star reviews and champion circular fashion.'
                  : 'Gana reputación con valoraciones de 5 estrellas y apoya la economía textil circular.'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* CTA Box */}
      <div className="bg-[#012d1d] text-white rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-2">
            {language === 'en' ? 'Ready to give a new life to your clothes?' : '¿Listo para darle una nueva vida a tu ropa?'}
          </h2>
          <p className="text-sm text-[#faf9f4]/80 max-w-xl leading-relaxed">
            {language === 'en'
              ? 'Join the community of over 400 people transforming fashion in Colombia.'
              : 'Únete a la comunidad de más de 400 personas que están transformando la moda en su ciudad.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="btn-interactive bg-[#b0f1cc] text-[#002113] hover:bg-[#8ee4b4] px-6 py-3 rounded-full font-bold text-xs md:text-sm transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Post my garment' : 'Publicar mi prenda'}
          </button>
          <button
            onClick={onNavigateToDesigners || (() => onNavigate('costureros'))}
            className="btn-interactive bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-semibold text-xs md:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">design_services</span>
            <span>{language === 'en' ? 'Explore tailors' : 'Ir a los diseñadores'}</span>
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-headline text-2xl font-bold text-[#012d1d] dark:text-white text-center mb-8 animate-title-entry">
          {language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#0e241c] rounded-xl border border-[#efeee9] dark:border-[#2b694d]/40 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center gap-4 hover:bg-[#faf9f4] dark:hover:bg-[#112920] transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-xs md:text-sm text-[#012d1d] dark:text-[#b0f1cc]">{faq.q}</span>
                  <span className={`material-symbols-outlined text-sm text-[#717973] dark:text-[#a7b8ae] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed border-t border-[#efeee9]/50 dark:border-[#2b694d]/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
