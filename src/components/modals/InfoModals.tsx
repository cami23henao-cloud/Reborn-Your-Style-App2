import React, { useState } from 'react';

interface InfoModalProps {
  type: 'privacidad' | 'terminos' | 'contacto' | 'sostenibilidad' | null;
  onClose: () => void;
  onSendMessage?: (name: string, email: string, message: string) => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({
  type,
  onClose,
  onSendMessage
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!type) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSendMessage) {
      onSendMessage(contactName, contactEmail, contactMsg);
    }
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-[#efeee9]">
        {/* Header */}
        <div className="p-6 border-b border-[#efeee9] flex items-center justify-between bg-[#faf9f4]">
          <h2 className="font-headline text-xl font-bold text-[#012d1d] flex items-center gap-2">
            {type === 'privacidad' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">security</span>
                <span>Política de Privacidad</span>
              </>
            )}
            {type === 'terminos' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">gavel</span>
                <span>Términos y Condiciones</span>
              </>
            )}
            {type === 'contacto' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">mail</span>
                <span>Contáctanos</span>
              </>
            )}
            {type === 'sostenibilidad' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">nature_people</span>
                <span>Impacto y Sostenibilidad</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeee9] hover:bg-[#e3e3de] text-[#1b1c19] flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#414844] leading-relaxed">
          {type === 'privacidad' && (
            <>
              <div className="bg-[#b0f1cc]/25 p-4 rounded-xl border border-[#2b694d]/20 mb-3 space-y-1">
                <p className="font-bold text-[#012d1d] text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#2b694d]">verified_user</span>
                  <span>Compromiso de Privacidad Estricta y Confidencialidad</span>
                </p>
                <p className="text-xs text-[#012d1d]/85">
                  Garantizamos que ningún visitante externo o usuario no autorizado que navegue por la plataforma pública pueda identificar quién ha iniciado sesión ni visualizar información personal vinculada a cuentas activas.
                </p>
              </div>

              <h4 className="font-bold text-[#012d1d] text-base pt-1">1. Interfaz de Acceso Neutral y Sobria</h4>
              <p>
                Nuestra pantalla de inicio de sesión no retiene ni expone nombres, avatares, correos electrónicos ni rastros visuales de los usuarios activos recientemente en el dispositivo, protegiendo tu identidad frente a terceros o computadores compartidos.
              </p>

              <h4 className="font-bold text-[#012d1d] text-base pt-2">2. Sincronización Automatizada de Avatares Oficiales</h4>
              <p>
                Al registrarse o iniciar sesión mediante Google Identity Services, el sistema importa de forma segura la foto de perfil oficial asociada a dicha cuenta para mostrarla exclusivamente dentro del panel privado del usuario autenticado. Ninguna imagen de perfil se expone públicamente sin autorización expresa.
              </p>

              <h4 className="font-bold text-[#012d1d] text-base pt-2">3. Protección y Encriptación de Datos</h4>
              <p>
                Los datos personales, credenciales e información de sesión permanecen estrictamente confidenciales y protegidos bajo estándares TLS 1.3 y cifrado AES-256 en reposo, en pleno cumplimiento de las normativas de protección de datos (Ley 1581 de 2012 y GDPR), evitando cualquier tipo de exhibición pública, fuga o almacenamiento vulnerable.
              </p>

              <h4 className="font-bold text-[#012d1d] text-base pt-2">4. Sesiones Efímeras e Inviolabilidad de Cuentas</h4>
              <p>
                Al cerrar sesión, la información privada se purga de la memoria del navegador inmediatamente. El acceso a mensajes, solicitudes y proyectos requiere una autenticación verificada en cada sesión.
              </p>
            </>
          )}

          {type === 'terminos' && (
            <>
              <p>
                Bienvenido a <strong>Reborn Your Style</strong>. Al utilizar nuestra plataforma, aceptas los siguientes términos de servicio:
              </p>
              <h4 className="font-bold text-[#012d1d] text-base pt-2">1. Naturaleza del Servicio</h4>
              <p>
                Reborn Your Style es un mercado y comunidad que conecta a propietarios de prendas con talleres, modistas y diseñadores de suprareciclaje textil.
              </p>
              <h4 className="font-bold text-[#012d1d] text-base pt-2">2. Acuerdos y Presupuestos</h4>
              <p>
                Los precios y alcances de cada proyecto son acordados directamente entre el cliente y el profesional. Recomendamos detallar siempre el estado del material y requerimientos específicos antes de comenzar la confección.
              </p>
              <h4 className="font-bold text-[#012d1d] text-base pt-2">3. Calidad y Compromiso Sostenible</h4>
              <p>
                Todos los participantes se comprometen a fomentar prácticas justas, éticas y respetuosas con el medio ambiente y los oficios manuales locales.
              </p>
            </>
          )}

          {type === 'sostenibilidad' && (
            <>
              <div className="bg-[#b0f1cc]/30 p-4 rounded-xl border border-[#2b694d]/20 mb-4">
                <h3 className="font-headline font-bold text-[#012d1d] text-lg mb-1">
                  Nuestra Misión Circular
                </h3>
                <p className="text-xs text-[#1b1c19]">
                  Reducimos la huella de carbono de la industria de la moda rescatando prendas existentes mediante técnicas artesanales de alto valor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="bg-[#f5f4ef] p-4 rounded-xl text-center">
                  <span className="material-symbols-outlined text-[#2b694d] text-3xl mb-1">water_drop</span>
                  <h5 className="font-bold text-[#012d1d] text-xl">2,700 L</h5>
                  <p className="text-xs text-[#717973]">Agua ahorrada por cada chaqueta rescatada</p>
                </div>
                <div className="bg-[#f5f4ef] p-4 rounded-xl text-center">
                  <span className="material-symbols-outlined text-[#2b694d] text-3xl mb-1">co2</span>
                  <h5 className="font-bold text-[#012d1d] text-xl">-14.5 kg</h5>
                  <p className="text-xs text-[#717973]">CO2 evitado por prenda retransformada</p>
                </div>
                <div className="bg-[#f5f4ef] p-4 rounded-xl text-center">
                  <span className="material-symbols-outlined text-[#2b694d] text-3xl mb-1">handshake</span>
                  <h5 className="font-bold text-[#012d1d] text-xl">100%</h5>
                  <p className="text-xs text-[#717973]">Apoyo a sastres y artesanos locales</p>
                </div>
              </div>

              <p>
                La industria textil global es una de las más contaminantes del planeta. A través del upcycling, transformamos desechos textiles en piezas de diseño de alto impacto estético y mínimo impacto ambiental.
              </p>
            </>
          )}

          {type === 'contacto' && (
            <>
              {sentSuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-[#b0f1cc] text-[#002113] flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-3xl">check</span>
                  </div>
                  <h3 className="font-headline font-bold text-[#012d1d] text-lg mb-1">
                    ¡Mensaje enviado con éxito!
                  </h3>
                  <p className="text-xs text-[#414844]">
                    Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <p className="text-xs text-[#414844]">
                    ¿Tienes dudas, sugerencias o deseas unirte a nuestra red de talleres? Escríbenos directamente:
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#012d1d] mb-1">
                      Mensaje
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="¿En qué te podemos ayudar?"
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full bg-[#f5f4ef] border border-[#c1c8c2] rounded-lg p-2.5 text-sm focus:bg-white focus:border-[#012d1d] outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-[#414844] hover:bg-[#efeee9] rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-xs font-semibold bg-[#012d1d] text-white rounded-lg hover:bg-[#1b4332] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>Enviar mensaje</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer actions for static modals */}
        {type !== 'contacto' && (
          <div className="p-4 border-t border-[#efeee9] bg-[#faf9f4] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-[#012d1d] text-white rounded-lg hover:bg-[#1b4332] transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
