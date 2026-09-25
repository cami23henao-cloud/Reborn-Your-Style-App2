import React, { useState } from 'react';
import { AppView } from '../../types';

interface ComoFuncionaViewProps {
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
  onNavigateToDesigners?: () => void;
}

export const ComoFuncionaView: React.FC<ComoFuncionaViewProps> = ({
  onNavigate,
  onOpenAuth,
  onNavigateToDesigners,
}) => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'talleres'>('clientes');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
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
        <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d]">Guía Paso a Paso</span>
        <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#012d1d] mt-2 mb-4">
          Cómo Funciona Reborn Your Style
        </h1>
        <p className="text-sm md:text-base text-[#414844] leading-relaxed">
          Nuestra misión es hacer del suprareciclaje textil un proceso fácil, seguro y gratificante para todos.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex bg-[#f5f4ef] rounded-xl p-1 mt-6 border border-[#efeee9]">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`py-2 px-6 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'clientes'
                ? 'bg-white shadow-[0_4px_16px_rgba(1,45,29,0.05)] text-[#012d1d]'
                : 'text-[#414844] hover:text-[#012d1d]'
            }`}
          >
            Para Propietarios de Prendas
          </button>
          <button
            onClick={() => setActiveTab('talleres')}
            className={`py-2 px-6 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'talleres'
                ? 'bg-white shadow-[0_4px_16px_rgba(1,45,29,0.05)] text-[#012d1d]'
                : 'text-[#414844] hover:text-[#012d1d]'
            }`}
          >
            Para Diseñadores y Talleres
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {activeTab === 'clientes' ? (
          <>
            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Publica tu Prenda</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Sube fotos de tu prenda y describe qué cambios, bordados o ajustes te gustaría realizar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Elige al Creador</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Explora los perfiles de los artesanos en tu barrio o recibe propuestas directas para tu proyecto.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Acuerda y Entrega</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Define el presupuesto final por mensajería y entrega la prenda en el taller convenido.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Estrena con Orgullo</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Recibe una pieza única, hecha a mano, personalizada y 100% libre de culpa ambiental.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Crea tu Estudio</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Registra tu taller, añade tu bio, tus fotos de trabajos anteriores y tu zona de atención.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Publica tus Servicios</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Define tus técnicas favoritas (bordado, teñido, sastrería) y fija precios base claros.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Recibe Solicitudes</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Clientes locales te contactarán con prendas reales para solicitar presupuestos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#efeee9] shadow-[0_4px_16px_rgba(1,45,29,0.05)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-headline font-bold text-base text-[#012d1d] mb-2">Haz Crecer tu Marca</h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Gana reputación con valoraciones de 5 estrellas y apoya la economía textil circular.
              </p>
            </div>
          </>
        )}
      </div>

      {/* CTA Box */}
      <div className="bg-[#012d1d] text-white rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-2">
            ¿Listo para darle una nueva vida a tu ropa?
          </h2>
          <p className="text-sm text-[#faf9f4]/80 max-w-xl leading-relaxed">
            Únete a la comunidad de más de 400 personas que están transformando la moda en su ciudad.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="bg-[#b0f1cc] text-[#002113] hover:bg-[#8ee4b4] px-6 py-3 rounded-full font-bold text-xs md:text-sm transition-colors"
          >
            Publicar mi prenda
          </button>
          <button
            onClick={onNavigateToDesigners || (() => onNavigate('explora'))}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-semibold text-xs md:text-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">design_services</span>
            <span>Ir a los diseñadores</span>
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-headline text-2xl font-bold text-[#012d1d] text-center mb-8">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#efeee9] shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center gap-4 hover:bg-[#faf9f4] transition-colors"
                >
                  <span className="font-semibold text-xs md:text-sm text-[#012d1d]">{faq.q}</span>
                  <span className={`material-symbols-outlined text-sm text-[#717973] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#414844] leading-relaxed border-t border-[#efeee9]/50">
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
