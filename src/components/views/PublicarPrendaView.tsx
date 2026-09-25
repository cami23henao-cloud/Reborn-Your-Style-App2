import React, { useState, useRef } from 'react';
import { GarmentProject, AppView, UserProfile } from '../../types';
import { EXPANDED_CATEGORIES } from '../../data/categoriesData';
import { BrandLogo } from '../BrandLogo';
import { GoogleMapsLocationPicker } from '../common/GoogleMapsLocationPicker';
import { UserAvatar } from '../common/UserAvatar';
import { WordColorPalettePicker } from '../common/WordColorPalettePicker';

interface PublicarPrendaViewProps {
  onPublishProject: (project: GarmentProject) => void;
  onSaveDraft: (project: Partial<GarmentProject>) => void;
  onNavigate: (view: AppView) => void;
  user: UserProfile;
  onOpenEditProfile: () => void;
  initialDraft?: Partial<GarmentProject> | null;
}

const COLOR_OPTIONS = [
  { name: 'Azul Índigo', hex: '#254a6e' },
  { name: 'Negro Profundo', hex: '#1b1b1b' },
  { name: 'Blanco Crudo', hex: '#f4f3ec' },
  { name: 'Verde Oliva / Salvia', hex: '#587b6d' },
  { name: 'Beige / Lino Natural', hex: '#d6cbb2' },
  { name: 'Terracota / Ladrillo', hex: '#b35d38' },
  { name: 'Mostaza / Ocre', hex: '#cca43b' },
  { name: 'Rosa Palo', hex: '#d8a4a4' },
  { name: 'Gris Jaspe', hex: '#7a8288' },
  { name: 'Café / Marrón', hex: '#5c4033' },
  { name: 'Vino Tinto / Burdeos', hex: '#671a2b' },
  { name: 'Azul Cielo / Celeste', hex: '#87ceeb' },
  { name: 'Multicolor / Estampado', hex: 'linear-gradient(135deg, #e57373, #81c784, #64b5f6)' }
];

const SIZE_OPTIONS = [
  'Talla Única',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '28',
  '30',
  '32',
  '34',
  '36',
  '38'
];

const CONDITION_OPTIONS = [
  'Nuevo con etiquetas',
  'Como nuevo (1-2 usos)',
  'Usado - Buen estado',
  'Desgastado - Con gran potencial de reuso',
  'Para reparar o intervenir totalmente'
];

export const PublicarPrendaView: React.FC<PublicarPrendaViewProps> = ({
  onPublishProject,
  onSaveDraft,
  onNavigate,
  user,
  onOpenEditProfile,
  initialDraft
}) => {
  // Form State - Starts clean and empty for new creations (Requirement: manual classification, no defaults)
  const [titulo, setTitulo] = useState(initialDraft?.title || '');
  const [categoria, setCategoria] = useState(initialDraft?.category || '');
  const [formError, setFormError] = useState<string>('');
  const [estado, setEstado] = useState(initialDraft?.condition || 'Como nuevo (1-2 usos)');
  const [descripcion, setDescripcion] = useState(initialDraft?.description || '');
  const [modificacion, setModificacion] = useState(initialDraft?.modifications || '');
  const [talla, setTalla] = useState(initialDraft?.size || 'M');
  const [colorSeleccionado, setColorSeleccionado] = useState(initialDraft?.color || 'Azul Índigo');
  const [colorPaletteMode, setColorPaletteMode] = useState<'estandar' | 'personalizar'>('estandar');
  const [customColorHex, setCustomColorHex] = useState(initialDraft?.colorHex || '#2b694d');
  const [listingType, setListingType] = useState<'Venta' | 'Intercambio' | 'Donación' | 'Transformación'>(
    initialDraft?.listingType || 'Transformación'
  );
  const [allowExchange, setAllowExchange] = useState<boolean>(
    initialDraft?.allowExchange !== undefined ? initialDraft.allowExchange : true
  );
  const [presupuesto, setPresupuesto] = useState<string>(
    initialDraft?.budget ? String(initialDraft.budget) : ''
  );

  // Colombia Location
  const [locationQuery, setLocationQuery] = useState(initialDraft?.location || user.location || '');
  const [imageUrl, setImageUrl] = useState(initialDraft?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setImageUrl(loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria.trim()) {
      setFormError('Por favor selecciona una categoría para clasificar tu prenda manualmente.');
      return;
    }
    if (!imageUrl) {
      setFormError('Por favor sube una fotografía de la prenda.');
      return;
    }
    setFormError('');

    const newProject: GarmentProject = {
      id: `proj-${Date.now()}`,
      title: titulo.trim() || 'Prenda para Upcycling Reborn',
      category: categoria,
      categoryEmoji: '',
      condition: estado,
      description: descripcion,
      modifications: modificacion,
      size: talla,
      color: colorSeleccionado,
      budget: presupuesto ? Number(presupuesto) : 0,
      listingType,
      allowExchange,
      location: locationQuery || user.location,
      imageUrl,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      authorRole: user.role,
      status: 'Publicada',
      createdAt: 'Hace un momento',
      views: 1,
      saves: 0
    };

    onPublishProject(newProject);
  };

  const handleSaveDraftClick = () => {
    onSaveDraft({
      title: titulo,
      category: categoria,
      condition: estado,
      description: descripcion,
      modifications: modificacion,
      size: talla,
      color: colorSeleccionado,
      budget: Number(presupuesto) || 0,
      listingType,
      allowExchange,
      location: locationQuery,
      imageUrl,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-12 animate-in fade-in">
      {/* Title Header with Logo Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-[#c1c8c2]/50 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <BrandLogo size="xs" variant="emblem" />
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#012d1d]">
              Publicar una Prenda
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#414844] max-w-2xl leading-relaxed">
            Conecta con artesanos textiles, publica para venta, intercambio de moda circular o solicita rediseño.
          </p>
        </div>

        {/* User Identity & Profile Photo Card */}
        <div className="flex items-center gap-3 bg-[#faf9f4] p-2.5 pl-3 rounded-2xl border border-[#c1c8c2]/40 shrink-0">
          <UserAvatar
            src={user.avatarUrl}
            name={user.name}
            size="md"
            borderClassName="border-2 border-[#b0f1cc] shadow-xs"
          />
          <div className="text-left pr-2">
            <span className="text-[10px] text-[#717973] uppercase font-bold block">Publicando como</span>
            <span className="text-xs font-bold text-[#012d1d] block">{user.name}</span>
          </div>
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="p-1.5 rounded-lg text-[#2b694d] hover:bg-[#efeee9] transition-colors"
            title="Editar foto y perfil"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Area (8 cols) */}
        <form onSubmit={handlePublish} className="lg:col-span-8 space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-[#ffdad6]/80 border border-[#ba1a1a]/40 text-[#ba1a1a] text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Fotos */}
          <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[#c1c8c2]/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base font-bold text-[#012d1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2b694d]">photo_camera</span>
                <span>1. Fotografía de la prenda *</span>
              </h2>
              <span className="text-xs text-[#717973]">Formatos: JPG, PNG, WebP</span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2b694d]/40 rounded-2xl p-6 flex flex-col items-center justify-center bg-[#faf9f4] hover:bg-[#f2f0e9] transition-colors cursor-pointer text-center group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <span className="material-symbols-outlined text-4xl text-[#2b694d] mb-2 group-hover:scale-110 transition-transform">
                cloud_upload
              </span>
              <p className="font-bold text-xs md:text-sm text-[#012d1d] mb-1">
                Haz clic para subir una foto o arrástrala aquí
              </p>
              <p className="text-[11px] text-[#717973]">
                Recomendamos buena iluminación para que los artesanos aprecien el color y textura real.
              </p>
            </div>

            {/* Uploaded photo preview if available */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#2b694d] aspect-video w-full max-w-sm mx-auto shadow-sm">
                <img src={imageUrl} alt="Vista previa de la prenda" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition-colors"
                  title="Eliminar foto"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}
          </section>

          {/* Section 2: Información Principal */}
          <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[#c1c8c2]/50 space-y-5">
            <h2 className="font-headline text-base font-bold text-[#012d1d] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2b694d]">info</span>
              <span>2. Información de la Prenda</span>
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d]">
                Nombre de la prenda / Título de la publicación *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Chaqueta Denim Levi's vintage con bordado"
                className="w-full px-4 py-3 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none"
              />
            </div>

            {/* Expanded 16 Categories */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#012d1d] flex items-center justify-between">
                <span>Categoría de la Prenda (16 Categorías) *</span>
                <span className="text-[10px] text-[#2b694d] font-normal">Moda circular</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPANDED_CATEGORIES.map((cat) => {
                  const isSelected = categoria.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoria(cat.name)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                          : 'bg-[#faf9f4] text-[#414844] border-[#c1c8c2]/40 hover:bg-[#efeee9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{cat.icon}</span>
                      <span className="text-xs font-bold truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition and Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#012d1d]">
                  Estado de la prenda *
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
                >
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#012d1d]">
                  Talla *
                </label>
                <select
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] outline-none"
                >
                  {SIZE_OPTIONS.map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Word-inspired Color Palette */}
            <WordColorPalettePicker
              selectedColor={colorSeleccionado}
              onChange={(colorName) => setColorSeleccionado(colorName)}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d]">
                Descripción detallada e historia de la prenda *
              </label>
              <textarea
                rows={3}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el tipo de tela, composición, historia o detalles especiales..."
                className="w-full px-4 py-3 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none resize-none"
              />
            </div>

            {/* Modifications */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#012d1d]">
                Idea de transformación / Modificaciones deseadas
              </label>
              <textarea
                rows={2}
                value={modificacion}
                onChange={(e) => setModificacion(e.target.value)}
                placeholder="¿Qué te gustaría hacerle? Ej. Bordados florales, convertir en falda, teñir..."
                className="w-full px-4 py-3 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none resize-none"
              />
            </div>
          </section>

          {/* Section 3: Ubicación y Modalidad */}
          <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[#c1c8c2]/50 space-y-5">
            <h2 className="font-headline text-base font-bold text-[#012d1d] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2b694d]">share_location</span>
              <span>3. Modalidad, Precio y Ubicación en Colombia</span>
            </h2>

            {/* Modality Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Transformación', label: 'Transformación', icon: 'styler' },
                { id: 'Venta', label: 'Venta ($ COP)', icon: 'payments' },
                { id: 'Intercambio', label: 'Intercambio / Trueque', icon: 'swap_horiz' },
                { id: 'Donación', label: 'Donación / Gratis', icon: 'volunteer_activism' }
              ].map((mod) => {
                const isSelected = listingType === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setListingType(mod.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                        : 'bg-[#faf9f4] text-[#414844] border-[#c1c8c2]/40 hover:bg-[#efeee9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{mod.icon}</span>
                    <span className="text-xs font-bold">{mod.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Price / Budget (Requirement 5: sin 0 por defecto, sin flechas) */}
            {listingType !== 'Donación' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#012d1d]">
                  {listingType === 'Transformación'
                    ? 'Presupuesto estimado para confección ($ COP)'
                    : 'Precio de la prenda ($ COP)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717973]">
                    $ COP
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Escribe el valor (ej. 45000)"
                    className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-[#c1c8c2] bg-white text-sm text-[#1b1c19] focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Google Maps Location (Requirement 6) */}
            <GoogleMapsLocationPicker
              value={locationQuery}
              onChange={(newLoc) => setLocationQuery(newLoc)}
              label="Ubicación de la prenda en Colombia (Google Maps)"
              placeholder="Indica municipio, barrio o ciudad donde se encuentra la prenda"
              required={true}
              showMapPreview={true}
            />

            {/* Option Exchange / Reuse Toggle */}
            <div className="p-4 rounded-2xl bg-[#faf9f4] border border-[#c1c8c2]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#b0f1cc]/40 text-[#012d1d] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">sync_alt</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#012d1d]">
                    Aceptar opciones de Intercambio o Reutilización
                  </h4>
                  <p className="text-[11px] text-[#717973]">
                    Permite que otros usuarios o artesanos te propongan trueques o retazos textiles.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowExchange}
                onChange={(e) => setAllowExchange(e.target.checked)}
                className="w-5 h-5 accent-[#012d1d] rounded cursor-pointer"
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveDraftClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#414844] hover:bg-[#efeee9] transition-colors"
            >
              Guardar Borrador
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">publish</span>
              <span>Publicar Prenda en Reborn</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-[#c1c8c2]/50 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#efeee9] pb-3">
                <span className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#2b694d]">visibility</span>
                  <span>Vista Previa en Vivo</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#b0f1cc] text-[#002113]">
                  {listingType}
                </span>
              </div>

              {/* Garment Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-[#f5f4ef]">
                <img
                  src={imageUrl}
                  alt={titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">
                    {EXPANDED_CATEGORIES.find(c => c.name.toLowerCase() === categoria.toLowerCase())?.icon || 'apparel'}
                  </span>
                  <span>{categoria}</span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[#012d1d] text-[10px] font-bold shadow-xs">
                  Talla {talla}
                </div>
              </div>

              {/* Garment Details */}
              <div className="space-y-2">
                <h3 className="font-headline font-bold text-base text-[#012d1d] leading-snug">
                  {titulo || 'Nombre de la prenda'}
                </h3>
                <p className="text-xs text-[#414844] line-clamp-2">
                  {descripcion || 'Descripción del proyecto...'}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#efeee9]">
                  <div className="flex items-center gap-1.5 text-[#717973]">
                    <span className="material-symbols-outlined text-xs text-[#2b694d]">location_on</span>
                    <span className="truncate max-w-[140px]">{locationQuery.split(',')[0]}</span>
                  </div>
                  <span className="font-black text-[#012d1d]">
                    {listingType === 'Donación'
                      ? 'Gratis'
                      : listingType === 'Intercambio'
                      ? 'Intercambio'
                      : presupuesto && Number(presupuesto) > 0
                      ? `$${Number(presupuesto).toLocaleString()} COP`
                      : 'Precio por acordar'}
                  </span>
                </div>
              </div>

              {/* Author Footer */}
              <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="sm"
                    borderClassName="border border-[#b0f1cc]"
                  />
                  <span className="text-xs font-semibold text-[#012d1d]">{user.name}</span>
                </div>
                <BrandLogo size="xs" variant="emblem" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
