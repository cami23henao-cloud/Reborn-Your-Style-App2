import React, { useState, useRef, useEffect } from 'react';

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  category: 'Cálidos' | 'Fríos' | 'Tierras y Verdes' | 'Neutros';
  shades?: { name: string; hex: string }[];
}

export const GARMENT_COLORS: GarmentColor[] = [
  // 1. Rojo y variantes
  {
    id: 'rojo',
    name: 'Rojo',
    hex: '#e53935',
    category: 'Cálidos',
    shades: [
      { name: 'Rojo claro', hex: '#ef5350' },
      { name: 'Rojo intenso', hex: '#e53935' },
      { name: 'Rojo escarlata', hex: '#d32f2f' }
    ]
  },
  // 2. Vinotinto
  {
    id: 'vinotinto',
    name: 'Vinotinto',
    hex: '#5f091c',
    category: 'Cálidos',
    shades: [
      { name: 'Vinotinto clásico', hex: '#5f091c' },
      { name: 'Burdeos', hex: '#671a2b' },
      { name: 'Borggoña oscuro', hex: '#4a0715' }
    ]
  },
  // 3. Fucsia
  {
    id: 'fucsia',
    name: 'Fucsia',
    hex: '#e91e63',
    category: 'Cálidos',
    shades: [
      { name: 'Fucsia brillante', hex: '#e91e63' },
      { name: 'Magenta', hex: '#d81b60' },
      { name: 'Frambuesa', hex: '#c2185b' }
    ]
  },
  // 4. Rosado
  {
    id: 'rosado',
    name: 'Rosado',
    hex: '#f48fb1',
    category: 'Cálidos',
    shades: [
      { name: 'Rosa pastel', hex: '#f8bbd0' },
      { name: 'Rosado', hex: '#f48fb1' },
      { name: 'Rosa palo', hex: '#d8a4a4' }
    ]
  },
  // 5. Naranja y Terracota
  {
    id: 'naranja',
    name: 'Naranja',
    hex: '#fb8c00',
    category: 'Cálidos',
    shades: [
      { name: 'Naranja mandarina', hex: '#ffa726' },
      { name: 'Naranja', hex: '#fb8c00' },
      { name: 'Terracota / Ladrillo', hex: '#b35d38' }
    ]
  },
  // 6. Amarillo y Mostaza
  {
    id: 'amarillo',
    name: 'Amarillo',
    hex: '#fdd835',
    category: 'Cálidos',
    shades: [
      { name: 'Amarillo pastel', hex: '#fff59d' },
      { name: 'Amarillo', hex: '#fdd835' },
      { name: 'Mostaza / Ocre', hex: '#cca43b' }
    ]
  },
  // 7. Verde claro
  {
    id: 'verde-claro',
    name: 'Verde claro',
    hex: '#81c784',
    category: 'Tierras y Verdes',
    shades: [
      { name: 'Verde menta', hex: '#a5d6a7' },
      { name: 'Verde claro', hex: '#81c784' },
      { name: 'Verde lima', hex: '#cddc39' }
    ]
  },
  // 8. Verde
  {
    id: 'verde',
    name: 'Verde',
    hex: '#2e7d32',
    category: 'Tierras y Verdes',
    shades: [
      { name: 'Verde esmeralda', hex: '#388e3c' },
      { name: 'Verde', hex: '#2e7d32' },
      { name: 'Verde oliva / Salvia', hex: '#587b6d' }
    ]
  },
  // 9. Verde oscuro
  {
    id: 'verde-oscuro',
    name: 'Verde oscuro',
    hex: '#1b4332',
    category: 'Tierras y Verdes',
    shades: [
      { name: 'Verde bosque', hex: '#245a44' },
      { name: 'Verde militar', hex: '#4b5320' },
      { name: 'Verde muy oscuro', hex: '#012d1d' }
    ]
  },
  // 10. Azul claro
  {
    id: 'azul-claro',
    name: 'Azul claro',
    hex: '#4fc3f7',
    category: 'Fríos',
    shades: [
      { name: 'Azul cielo', hex: '#81d4fa' },
      { name: 'Azul claro', hex: '#4fc3f7' },
      { name: 'Turquesa / Celeste', hex: '#26c6da' }
    ]
  },
  // 11. Azul
  {
    id: 'azul',
    name: 'Azul',
    hex: '#1976d2',
    category: 'Fríos',
    shades: [
      { name: 'Azul rey', hex: '#1e88e5' },
      { name: 'Azul', hex: '#1976d2' },
      { name: 'Azul índigo', hex: '#254a6e' }
    ]
  },
  // 12. Azul oscuro
  {
    id: 'azul-oscuro',
    name: 'Azul oscuro',
    hex: '#0d47a1',
    category: 'Fríos',
    shades: [
      { name: 'Azul marino', hex: '#1565c0' },
      { name: 'Azul oscuro', hex: '#0d47a1' },
      { name: 'Azul petróleo / noche', hex: '#0a192f' }
    ]
  },
  // 13. Morado
  {
    id: 'morado',
    name: 'Morado',
    hex: '#7b1fa2',
    category: 'Fríos',
    shades: [
      { name: 'Morado medio', hex: '#8e24aa' },
      { name: 'Morado', hex: '#7b1fa2' },
      { name: 'Morado oscuro / Berenjena', hex: '#4a148c' }
    ]
  },
  // 14. Lila
  {
    id: 'lila',
    name: 'Lila',
    hex: '#ba68c8',
    category: 'Fríos',
    shades: [
      { name: 'Lila suave', hex: '#ce93d8' },
      { name: 'Lila', hex: '#ba68c8' },
      { name: 'Lavanda', hex: '#ab47bc' }
    ]
  },
  // 15. Café
  {
    id: 'cafe',
    name: 'Café',
    hex: '#6d4c41',
    category: 'Tierras y Verdes',
    shades: [
      { name: 'Café claro / Caramelo', hex: '#8d6e63' },
      { name: 'Café / Marrón', hex: '#6d4c41' },
      { name: 'Café chocolate oscuro', hex: '#4e342e' }
    ]
  },
  // 16. Beige
  {
    id: 'beige',
    name: 'Beige',
    hex: '#d7ccc8',
    category: 'Neutros',
    shades: [
      { name: 'Beige arena', hex: '#efebe9' },
      { name: 'Beige natural', hex: '#d7ccc8' },
      { name: 'Lino tostado', hex: '#bcaaa4' }
    ]
  },
  // 17. Crema
  {
    id: 'crema',
    name: 'Crema',
    hex: '#fffdd0',
    category: 'Neutros',
    shades: [
      { name: 'Marfil', hex: '#fffff0' },
      { name: 'Crema', hex: '#fffdd0' },
      { name: 'Blanco crudo', hex: '#f4f3ec' }
    ]
  },
  // 18. Blanco
  {
    id: 'blanco',
    name: 'Blanco',
    hex: '#ffffff',
    category: 'Neutros',
    shades: [
      { name: 'Blanco puro', hex: '#ffffff' },
      { name: 'Blanco tiza', hex: '#fafafa' },
      { name: 'Blanco perla', hex: '#f5f5f5' }
    ]
  },
  // 19. Gris
  {
    id: 'gris',
    name: 'Gris',
    hex: '#9e9e9e',
    category: 'Neutros',
    shades: [
      { name: 'Gris claro', hex: '#e0e0e0' },
      { name: 'Gris perla', hex: '#bdbdbd' },
      { name: 'Gris jaspe', hex: '#7a8288' },
      { name: 'Gris plomo / carbón', hex: '#424242' }
    ]
  },
  // 20. Negro
  {
    id: 'negro',
    name: 'Negro',
    hex: '#1b1b1b',
    category: 'Neutros',
    shades: [
      { name: 'Negro azabache', hex: '#1b1b1b' },
      { name: 'Negro profundo', hex: '#111111' },
      { name: 'Negro humo', hex: '#212121' }
    ]
  }
];

interface ColorWheelPickerProps {
  selectedColorName: string;
  selectedColorHex?: string;
  onChange: (colorName: string, colorHex: string) => void;
  className?: string;
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  selectedColorName,
  selectedColorHex,
  onChange,
  className = ''
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'Todos' | 'Cálidos' | 'Tierras y Verdes' | 'Fríos' | 'Neutros'>('Todos');
  const [hoveredColor, setHoveredColor] = useState<GarmentColor | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);
  const lastAngleRef = useRef<number>(0);

  const colorsCount = GARMENT_COLORS.length;
  const sliceAngle = 360 / colorsCount;

  // Selected object matching props (or undefined if no color selected yet)
  const currentGarmentColor = GARMENT_COLORS.find(
    (c) =>
      c.name.toLowerCase() === (selectedColorName || '').toLowerCase() ||
      (selectedColorHex && c.hex.toLowerCase() === selectedColorHex.toLowerCase()) ||
      c.shades?.some((s) => s.name.toLowerCase() === (selectedColorName || '').toLowerCase() || s.hex.toLowerCase() === (selectedColorHex || '').toLowerCase())
  );

  // Compute SVG Wedge Path
  const getSlicePath = (index: number, innerR: number, outerR: number) => {
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);

    const x1 = 150 + outerR * Math.cos(startAngle);
    const y1 = 150 + outerR * Math.sin(startAngle);
    const x2 = 150 + outerR * Math.cos(endAngle);
    const y2 = 150 + outerR * Math.sin(endAngle);

    const x3 = 150 + innerR * Math.cos(endAngle);
    const y3 = 150 + innerR * Math.sin(endAngle);
    const x4 = 150 + innerR * Math.cos(startAngle);
    const y4 = 150 + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  // Rotation with Mouse Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    lastAngleRef.current = angle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const delta = currentAngle - lastAngleRef.current;
    lastAngleRef.current = currentAngle;
    setRotation((prev) => (prev + delta) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const spinBy = (deg: number) => {
    setRotation((prev) => (prev + deg) % 360);
  };

  const selectColor = (color: GarmentColor, specificShade?: { name: string; hex: string }) => {
    if (specificShade) {
      onChange(specificShade.name, specificShade.hex);
    } else {
      onChange(color.name, color.hex);
    }
  };

  const clearSelection = () => {
    onChange('', '');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Title and Current Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#efeee9] pb-3">
        <div>
          <label className="block text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#2b694d]">palette</span>
            <span>Color de la Prenda (Ruleta de Colores Interactiva) *</span>
          </label>
          <p className="text-[11px] text-[#717973] mt-0.5">
            Gira la ruleta o haz clic sobre cualquier sector para elegir la tonalidad más cercana a la prenda real.
          </p>
        </div>

        {/* Selected Color Badge & Clear Button */}
        {selectedColorName ? (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#faf9f4] p-1.5 pl-3 rounded-full border border-[#c1c8c2]/50 shadow-2xs">
            <span
              className="w-4 h-4 rounded-full border border-black/20 shadow-xs shrink-0"
              style={{ backgroundColor: selectedColorHex || '#1b1b1b' }}
            />
            <span className="text-xs font-bold text-[#012d1d] truncate max-w-[140px]">
              {selectedColorName}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 rounded-full text-[#717973] hover:text-[#ba1a1a] hover:bg-[#efeee9] transition-colors"
              title="Cambiar o deseleccionar color"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-[#717973] bg-[#f5f4ef] px-3 py-1 rounded-full border border-[#c1c8c2]/40 self-start sm:self-auto">
            Ningún color seleccionado
          </span>
        )}
      </div>

      {/* Main Ruleta & Controls Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#faf9f4] p-5 rounded-2xl border border-[#c1c8c2]/40">
        {/* Left / Center: Interactive Circular Wheel (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative select-none">
          {/* Wheel SVG Container */}
          <div
            className="relative w-64 h-64 sm:w-72 sm:h-72 cursor-pointer touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Top Indicator Pointer Triangle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 pointer-events-none drop-shadow-md">
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-[#012d1d]" />
            </div>

            <svg
              ref={wheelRef}
              viewBox="0 0 300 300"
              className="w-full h-full drop-shadow-md transition-transform duration-200 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Outer decorative ring */}
              <circle cx="150" cy="150" r="148" fill="none" stroke="#e0ded6" strokeWidth="2" />

              {/* 20 Color Slices */}
              {GARMENT_COLORS.map((color, idx) => {
                const isSelected =
                  currentGarmentColor?.id === color.id ||
                  selectedColorName.toLowerCase() === color.name.toLowerCase();
                const path = getSlicePath(idx, 78, 142);

                return (
                  <g
                    key={color.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectColor(color);
                    }}
                    onMouseEnter={() => setHoveredColor(color)}
                    onMouseLeave={() => setHoveredColor(null)}
                    className="cursor-pointer group"
                  >
                    <path
                      d={path}
                      fill={color.hex}
                      stroke={isSelected ? '#012d1d' : '#ffffff'}
                      strokeWidth={isSelected ? '3.5' : '1.5'}
                      className="transition-all duration-150 hover:opacity-90"
                      filter={isSelected ? 'drop-shadow(0 0 4px rgba(1, 45, 29, 0.5))' : undefined}
                    />
                  </g>
                );
              })}

              {/* Inner Neutral Core Ring */}
              <circle cx="150" cy="150" r="77" fill="#ffffff" stroke="#c1c8c2" strokeWidth="1.5" />
            </svg>

            {/* Central Wheel Hub (Interactive Feedback or Spin Call-to-Action) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <div className="w-28 h-28 rounded-full bg-white shadow-md border border-[#c1c8c2]/60 flex flex-col items-center justify-center p-2 text-center pointer-events-auto">
                {selectedColorName ? (
                  <div className="flex flex-col items-center">
                    <span
                      className="w-7 h-7 rounded-full border border-black/20 shadow-xs mb-1"
                      style={{ backgroundColor: selectedColorHex || '#1b1b1b' }}
                    />
                    <span className="text-[11px] font-bold text-[#012d1d] leading-tight line-clamp-1">
                      {selectedColorName}
                    </span>
                    <span className="text-[9px] font-mono text-[#717973] uppercase">
                      {selectedColorHex || ''}
                    </span>
                  </div>
                ) : hoveredColor ? (
                  <div className="flex flex-col items-center animate-in fade-in">
                    <span
                      className="w-6 h-6 rounded-full border border-black/20 shadow-xs mb-1"
                      style={{ backgroundColor: hoveredColor.hex }}
                    />
                    <span className="text-[11px] font-bold text-[#012d1d] leading-tight">
                      {hoveredColor.name}
                    </span>
                    <span className="text-[9px] text-[#2b694d] font-semibold">Clic para elegir</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-[#717973]">
                    <span className="material-symbols-outlined text-2xl text-[#2b694d] animate-pulse">
                      touch_app
                    </span>
                    <span className="text-[10px] font-bold text-[#012d1d] mt-0.5">Toca la Ruleta</span>
                    <span className="text-[9px] text-[#717973]">o gírala</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Rotation Buttons */}
          <div className="flex items-center gap-2 mt-3 text-xs text-[#414844]">
            <button
              type="button"
              onClick={() => spinBy(-45)}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#c1c8c2] hover:bg-[#efeee9] text-[#012d1d] text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Girar ruleta 45° a la izquierda"
            >
              <span className="material-symbols-outlined text-xs">rotate_left</span>
              <span>-45°</span>
            </button>
            <button
              type="button"
              onClick={() => spinBy(45)}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#c1c8c2] hover:bg-[#efeee9] text-[#012d1d] text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Girar ruleta 45° a la derecha"
            >
              <span>+45°</span>
              <span className="material-symbols-outlined text-xs">rotate_right</span>
            </button>
            <button
              type="button"
              onClick={() => spinBy(Math.floor(Math.random() * 360))}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#c1c8c2] hover:bg-[#efeee9] text-[#012d1d] text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Girar ruleta al azar"
            >
              <span className="material-symbols-outlined text-xs">casino</span>
              <span>Girar</span>
            </button>
          </div>
        </div>

        {/* Right: Fine-tuning, Tonalities & Category Filters (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Category Tabs */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#717973] block mb-1.5">
              Familias de color
            </span>
            <div className="flex flex-wrap gap-1">
              {(['Todos', 'Cálidos', 'Tierras y Verdes', 'Fríos', 'Neutros'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#012d1d] text-white shadow-2xs'
                      : 'bg-white text-[#414844] border border-[#c1c8c2]/50 hover:bg-[#efeee9]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Swatches Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#717973] block">
              Tonalidades de la ruleta (20 colores + intermedios)
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {GARMENT_COLORS.filter(
                (c) => activeCategory === 'Todos' || c.category === activeCategory
              ).map((color) => {
                const isSelected =
                  currentGarmentColor?.id === color.id ||
                  selectedColorName.toLowerCase() === color.name.toLowerCase();

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => selectColor(color)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? 'border-[#012d1d] bg-[#b0f1cc]/30 shadow-xs ring-1 ring-[#012d1d]'
                        : 'border-[#c1c8c2]/40 bg-white hover:bg-[#f2f0e9]'
                    }`}
                    title={color.name}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/15 shadow-2xs mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] font-medium text-[#1b1c19] truncate w-full">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-tones / Shades for currently selected color */}
          {currentGarmentColor && currentGarmentColor.shades && (
            <div className="p-3 bg-white rounded-xl border border-[#c1c8c2]/50 space-y-2 animate-in fade-in">
              <span className="text-[10px] font-bold text-[#012d1d] flex items-center justify-between">
                <span>Matices de {currentGarmentColor.name}:</span>
                <span className="text-[9px] text-[#717973] font-normal">Tonalidad precisa</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentGarmentColor.shades.map((shade) => {
                  const isShadeSelected =
                    selectedColorName.toLowerCase() === shade.name.toLowerCase() ||
                    (selectedColorHex && selectedColorHex.toLowerCase() === shade.hex.toLowerCase());

                  return (
                    <button
                      key={shade.name}
                      type="button"
                      onClick={() => selectColor(currentGarmentColor, shade)}
                      className={`text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                        isShadeSelected
                          ? 'bg-[#012d1d] text-white border-[#012d1d]'
                          : 'bg-[#faf9f4] text-[#414844] border-[#c1c8c2]/40 hover:bg-[#efeee9]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <span className="font-semibold">{shade.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
