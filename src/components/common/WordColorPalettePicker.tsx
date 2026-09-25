import React, { useState } from 'react';

export interface ColorOption {
  name: string;
  hex: string;
  category: 'Verdes' | 'Azules' | 'Rojos' | 'Naranjas y amarillos' | 'Morados' | 'Neutros' | 'Personalizado';
}

interface WordColorPalettePickerProps {
  selectedColor: string; // color name or hex
  onChange: (colorName: string, colorHex?: string) => void;
  className?: string;
}

// Word-style theme columns definition matching user's exact specification
export const WORD_COLOR_COLUMNS: {
  category: 'Verdes' | 'Azules' | 'Rojos' | 'Naranjas y amarillos' | 'Morados' | 'Neutros';
  mainColor: ColorOption;
  shades: ColorOption[];
}[] = [
  {
    category: 'Verdes',
    mainColor: { name: 'Verde', hex: '#2b694d', category: 'Verdes' },
    shades: [
      { name: 'Verde muy claro', hex: '#e8f5e9', category: 'Verdes' },
      { name: 'Verde claro', hex: '#81c784', category: 'Verdes' },
      { name: 'Verde', hex: '#2b694d', category: 'Verdes' },
      { name: 'Verde oscuro', hex: '#1b4332', category: 'Verdes' },
      { name: 'Verde muy oscuro', hex: '#012d1d', category: 'Verdes' },
    ],
  },
  {
    category: 'Azules',
    mainColor: { name: 'Azul', hex: '#1976d2', category: 'Azules' },
    shades: [
      { name: 'Azul muy claro', hex: '#e3f2fd', category: 'Azules' },
      { name: 'Azul claro', hex: '#64b5f6', category: 'Azules' },
      { name: 'Azul', hex: '#1976d2', category: 'Azules' },
      { name: 'Azul oscuro', hex: '#0d47a1', category: 'Azules' },
      { name: 'Azul muy oscuro', hex: '#0a2540', category: 'Azules' },
    ],
  },
  {
    category: 'Rojos',
    mainColor: { name: 'Rojo', hex: '#d32f2f', category: 'Rojos' },
    shades: [
      { name: 'Rojo muy claro', hex: '#ffebee', category: 'Rojos' },
      { name: 'Rosa', hex: '#f06292', category: 'Rojos' },
      { name: 'Rojo', hex: '#d32f2f', category: 'Rojos' },
      { name: 'Rojo oscuro', hex: '#b71c1c', category: 'Rojos' },
      { name: 'Vinotinto', hex: '#5f091c', category: 'Rojos' },
    ],
  },
  {
    category: 'Naranjas y amarillos',
    mainColor: { name: 'Naranja', hex: '#ef6c00', category: 'Naranjas y amarillos' },
    shades: [
      { name: 'Amarillo claro', hex: '#fff9c4', category: 'Naranjas y amarillos' },
      { name: 'Amarillo', hex: '#fdd835', category: 'Naranjas y amarillos' },
      { name: 'Dorado', hex: '#d4af37', category: 'Naranjas y amarillos' },
      { name: 'Naranja', hex: '#ef6c00', category: 'Naranjas y amarillos' },
      { name: 'Naranja oscuro', hex: '#b23b00', category: 'Naranjas y amarillos' },
    ],
  },
  {
    category: 'Morados',
    mainColor: { name: 'Morado', hex: '#7b1fa2', category: 'Morados' },
    shades: [
      { name: 'Lila', hex: '#e1bee7', category: 'Morados' },
      { name: 'Morado claro', hex: '#ba68c8', category: 'Morados' },
      { name: 'Morado', hex: '#7b1fa2', category: 'Morados' },
      { name: 'Morado oscuro', hex: '#4a148c', category: 'Morados' },
      { name: 'Ciruela profundo', hex: '#2e0854', category: 'Morados' },
    ],
  },
  {
    category: 'Neutros',
    mainColor: { name: 'Gris', hex: '#757575', category: 'Neutros' },
    shades: [
      { name: 'Blanco', hex: '#ffffff', category: 'Neutros' },
      { name: 'Gris muy claro', hex: '#f5f5f5', category: 'Neutros' },
      { name: 'Gris claro', hex: '#bdbdbd', category: 'Neutros' },
      { name: 'Gris', hex: '#757575', category: 'Neutros' },
      { name: 'Gris oscuro', hex: '#424242', category: 'Neutros' },
      { name: 'Negro', hex: '#111111', category: 'Neutros' },
    ],
  },
];

export const WordColorPalettePicker: React.FC<WordColorPalettePickerProps> = ({
  selectedColor,
  onChange,
  className = '',
}) => {
  const [hoveredColor, setHoveredColor] = useState<ColorOption | null>(null);
  const [customHex, setCustomHex] = useState('#2b694d');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const isSelected = (color: ColorOption) => {
    if (!selectedColor) return false;
    return (
      selectedColor.toLowerCase() === color.name.toLowerCase() ||
      selectedColor.toLowerCase() === color.hex.toLowerCase()
    );
  };

  const handleSelect = (color: ColorOption) => {
    onChange(color.name, color.hex);
  };

  const handleCustomColorApply = (hex: string) => {
    setCustomHex(hex);
    onChange(`Personalizado (${hex.toUpperCase()})`, hex);
  };

  // Find currently active color details for badge
  const activeOption = WORD_COLOR_COLUMNS.flatMap((col) => col.shades).find(isSelected);

  return (
    <div className={`space-y-3 bg-[#faf9f4] p-4 rounded-2xl border border-[#c1c8c2]/50 ${className}`}>
      {/* Header and status display */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#2b694d]">palette</span>
          <span className="text-xs font-bold text-[#012d1d]">
            Paleta de Colores de la Prenda
          </span>
        </div>

        {/* Hover or Selected preview tag */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#012d1d] min-h-[24px]">
          {hoveredColor ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#c1c8c2]/60 shadow-2xs animate-in fade-in">
              <span
                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: hoveredColor.hex }}
              />
              <span className="text-[11px] text-[#2b694d]">{hoveredColor.name}</span>
            </span>
          ) : selectedColor ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#012d1d] shadow-2xs">
              <span
                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: activeOption?.hex || customHex }}
              />
              <span className="text-[11px] font-bold text-[#012d1d]">{selectedColor}</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[#717973] hover:text-[#ba1a1a] ml-1 text-xs"
                title="Quitar selección"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="text-[11px] text-[#717973] italic">
              Pasa el cursor o selecciona un color
            </span>
          )}
        </div>
      </div>

      {/* Word-style Matrix Container (Horizontal scroll on mobile, structured columns on desktop) */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid grid-cols-6 gap-2 sm:gap-3 min-w-[340px] w-full p-2 bg-white rounded-xl border border-[#c1c8c2]/40 shadow-xs">
          {WORD_COLOR_COLUMNS.map((col) => (
            <div key={col.category} className="flex flex-col items-center space-y-1.5">
              {/* Main color header box */}
              <div
                className="text-[9px] font-bold text-[#717973] text-center w-full truncate pb-1 border-b border-[#efeee9]"
                title={col.category}
              >
                {col.category.split(' ')[0]}
              </div>

              {/* Shades rows */}
              <div className="flex flex-col gap-1.5 w-full items-center">
                {col.shades.map((shade) => {
                  const active = isSelected(shade);
                  const isWhite = shade.hex.toLowerCase() === '#ffffff';

                  return (
                    <button
                      key={shade.name}
                      type="button"
                      onClick={() => handleSelect(shade)}
                      onMouseEnter={() => setHoveredColor(shade)}
                      onMouseLeave={() => setHoveredColor(null)}
                      title={shade.name}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-all duration-150 flex items-center justify-center relative cursor-pointer ${
                        active
                          ? 'ring-2 ring-[#012d1d] ring-offset-2 scale-110 shadow-md z-10'
                          : 'hover:scale-105 hover:shadow-sm'
                      } ${isWhite ? 'border border-[#c1c8c2]' : 'border border-black/10'}`}
                      style={{ backgroundColor: shade.hex }}
                    >
                      {active && (
                        <span
                          className={`material-symbols-outlined text-sm font-black ${
                            ['#ffffff', '#f5f5f5', '#fff9c4', '#e8f5e9', '#e3f2fd', '#ffebee', '#e1bee7'].includes(
                              shade.hex.toLowerCase()
                            )
                              ? 'text-[#012d1d]'
                              : 'text-white'
                          }`}
                        >
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: "Más colores..." custom button and color input */}
      <div className="pt-2 border-t border-[#c1c8c2]/30 flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#efeee9] border border-[#c1c8c2] text-xs font-semibold text-[#012d1d] transition-colors shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-[#2b694d]">colorize</span>
          <span>Más colores…</span>
        </button>

        {showCustomPicker && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#012d1d] shadow-sm animate-in fade-in">
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleCustomColorApply(e.target.value)}
              className="w-6 h-6 rounded border-0 cursor-pointer p-0"
              title="Selector de color personalizado"
            />
            <span className="text-xs font-mono font-bold text-[#012d1d]">
              {customHex.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setShowCustomPicker(false)}
              className="text-[10px] text-[#717973] hover:text-[#012d1d] ml-1"
            >
              Listo
            </button>
          </div>
        )}

        <span className="text-[11px] text-[#717973]">
          Selecciona el tono más cercano al material textil
        </span>
      </div>
    </div>
  );
};
