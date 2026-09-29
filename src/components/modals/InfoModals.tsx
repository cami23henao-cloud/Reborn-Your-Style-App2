import React, { useState } from 'react';

interface InfoModalProps {
  type:
    | 'privacidad'
    | 'terminos'
    | 'contacto'
    | 'sostenibilidad'
    | 'quienes-somos'
    | 'mision'
    | 'vision'
    | 'tutoriales'
    | null;
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
            {type === 'quienes-somos' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">groups</span>
                <span>Quiénes Somos - Reborn Your Style</span>
              </>
            )}
            {type === 'mision' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">target</span>
                <span>Nuestra Misión Circular</span>
              </>
            )}
            {type === 'vision' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">visibility</span>
                <span>Nuestra Visión Sostenible</span>
              </>
            )}
            {type === 'tutoriales' && (
              <>
                <span className="material-symbols-outlined text-[#2b694d]">school</span>
                <span>Tutoriales y Técnicas de Suprareciclaje</span>
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

          {type === 'quienes-somos' && (
            <>
              <div className="bg-[#b0f1cc]/30 p-4 rounded-xl border border-[#2b694d]/20 mb-3 space-y-1">
                <h4 className="font-headline font-bold text-[#012d1d] text-base">
                  Reborn Your Style: Moda Circular y Talento Colombiano
                </h4>
                <p className="text-xs text-[#1b1c19] leading-relaxed">
                  Somos una comunidad colaborativa nacida en Colombia para redefinir nuestra relación con la ropa. Conectamos prendas en desuso con talentosos modistas, artesanos y sastres locales.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <p>
                  En Colombia se desechan anualmente toneladas de textiles en perfecto estado. Nuestra plataforma ofrece una alternativa consciente al <em>fast fashion</em>, promoviendo el suprareciclaje (upcycling) como una forma de arte, expresión personal y economía justa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#f5f4ef] p-3.5 rounded-xl border border-[#c1c8c2]/40">
                    <p className="font-bold text-[#012d1d] text-xs flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-sm text-[#2b694d]">handshake</span>
                      <span>Dignificación Artesanal</span>
                    </p>
                    <p className="text-xs text-[#414844]">
                      Visibilizamos el oficio de modistas y costureros de barrio, conectándolos directamente con clientes sin comisiones abusivas.
                    </p>
                  </div>
                  <div className="bg-[#f5f4ef] p-3.5 rounded-xl border border-[#c1c8c2]/40">
                    <p className="font-bold text-[#012d1d] text-xs flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-sm text-[#2b694d]">eco</span>
                      <span>Huella Regenerativa</span>
                    </p>
                    <p className="text-xs text-[#414844]">
                      Extendemos la vida útil de cada prenda, reduciendo drásticamente el consumo de agua dulce y las emisiones de gases de efecto invernadero.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'mision' && (
            <>
              <div className="bg-[#b0f1cc]/30 p-4 rounded-xl border border-[#2b694d]/20 mb-3">
                <h4 className="font-headline font-bold text-[#012d1d] text-base mb-1">
                  Nuestra Misión
                </h4>
                <p className="text-xs text-[#1b1c19] leading-relaxed">
                  Transformar la industria textil en Colombia impulsando la moda circular y el suprareciclaje colaborativo, dignificando el talento de costureros y artesanos locales mientras reducimos el impacto ambiental del desperdicio textil.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <h5 className="font-bold text-[#012d1d] text-sm pt-1">Pilares de Nuestra Misión:</h5>
                <ul className="space-y-2 text-xs text-[#414844]">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-base text-[#2b694d] shrink-0">check_circle</span>
                    <span><strong>Conexión directa:</strong> Facilitar un canal ágil, seguro y transparente entre quienes tienen prendas en su clóset y quienes tienen el talento de coser y rediseñar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-base text-[#2b694d] shrink-0">check_circle</span>
                    <span><strong>Sostenibilidad real:</strong> Evitar que prendas terminadas lleguen a rellenos sanitarios o fuentes hídricas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-base text-[#2b694d] shrink-0">check_circle</span>
                    <span><strong>Comercio justo:</strong> Remuneración equitativa y reconocimiento al valor creativo del patronaje, bordado y confección.</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {type === 'vision' && (
            <>
              <div className="bg-[#b0f1cc]/30 p-4 rounded-xl border border-[#2b694d]/20 mb-3">
                <h4 className="font-headline font-bold text-[#012d1d] text-base mb-1">
                  Nuestra Visión
                </h4>
                <p className="text-xs text-[#1b1c19] leading-relaxed">
                  Ser la plataforma líder y referente de suprareciclaje textil en América Latina, logrando que el rescate y personalización de prendas sea la primera opción de vestuario para las nuevas generaciones.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-xs text-[#414844] leading-relaxed">
                  Visualizamos un futuro donde ningún guardarropa sea desechable, donde cada ciudad de Colombia cuente con una red viva de talleres de confección circular, y donde cada prenda cuente una historia de diseño regenerativo y orgullo local.
                </p>
                <div className="bg-[#faf9f4] p-3.5 rounded-xl border border-[#efeee9] text-xs text-[#012d1d] font-medium">
                  🌱 <em>"El mejor residuo textil es aquel que se convierte en tu prenda favorita."</em>
                </div>
              </div>
            </>
          )}

          {type === 'tutoriales' && (
            <>
              <div className="bg-[#b0f1cc]/30 p-4 rounded-xl border border-[#2b694d]/20 mb-3">
                <h4 className="font-headline font-bold text-[#012d1d] text-base mb-1">
                  Guías y Tutoriales de Suprareciclaje
                </h4>
                <p className="text-xs text-[#1b1c19]">
                  Aprende técnicas sencillas y profesionales para intervenir, reparar y transformar tus prendas.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#f5f4ef] rounded-xl border border-[#c1c8c2]/40 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">content_cut</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#012d1d] text-sm">Sashiko y Zurcido Visible</h5>
                    <p className="text-[#717973] mt-0.5">Técnica japonesa para reparar desgarros en denim con puntadas geométricas decorativas que refuerzan la tela.</p>
                  </div>
                </div>

                <div className="p-3 bg-[#f5f4ef] rounded-xl border border-[#c1c8c2]/40 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">palette</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#012d1d] text-sm">Teñido Botánico y Natural</h5>
                    <p className="text-[#717973] mt-0.5">Cómo devolver color y vida a camisas de algodón y lino usando huesos de aguacate, cáscaras de cebolla y cúrcuma.</p>
                  </div>
                </div>

                <div className="p-3 bg-[#f5f4ef] rounded-xl border border-[#c1c8c2]/40 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">style</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#012d1d] text-sm">Patchwork Upcycling</h5>
                    <p className="text-[#717973] mt-0.5">Unión de retazos y piezas de distintas prendas para crear chaquetas, chalecos o bolsos de alta resistencia y diseño único.</p>
                  </div>
                </div>
              </div>
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
