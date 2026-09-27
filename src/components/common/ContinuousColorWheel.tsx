import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ContinuousColorWheelProps {
  selectedColorName: string;
  selectedColorHex?: string;
  onChange: (colorName: string, colorHex: string) => void;
  className?: string;
}

// Known color dictionary for closest Spanish name matching
const COLOR_NAMES_DICT: { name: string; hex: string; r: number; g: number; b: number }[] = [
  // Rojos y Vinotintos
  { name: 'Vinotinto profundo', hex: '#4a0715', r: 74, g: 7, b: 21 },
  { name: 'Vinotinto', hex: '#5f091c', r: 95, g: 9, b: 28 },
  { name: 'Rojo escarlata', hex: '#b71c1c', r: 183, g: 28, b: 28 },
  { name: 'Rojo intenso', hex: '#d32f2f', r: 211, g: 47, b: 47 },
  { name: 'Rojo carmesí', hex: '#e53935', r: 229, g: 57, b: 53 },
  { name: 'Rojo claro', hex: '#ef5350', r: 239, g: 83, b: 80 },

  // Rosados y Fucsias
  { name: 'Fucsia oscuro', hex: '#c2185b', r: 194, g: 24, b: 91 },
  { name: 'Fucsia', hex: '#e91e63', r: 233, g: 30, b: 99 },
  { name: 'Magenta', hex: '#d81b60', r: 216, g: 27, b: 96 },
  { name: 'Rosado', hex: '#f06292', r: 240, g: 98, b: 146 },
  { name: 'Rosa palo', hex: '#d8a4a4', r: 216, g: 164, b: 164 },
  { name: 'Rosa pastel', hex: '#f8bbd0', r: 248, g: 187, b: 208 },

  // Naranjas y Terracotas
  { name: 'Terracota / Ladrillo', hex: '#b35d38', r: 179, g: 93, b: 56 },
  { name: 'Naranja oscuro', hex: '#e65100', r: 230, g: 81, b: 0 },
  { name: 'Naranja', hex: '#f57c00', r: 245, g: 124, b: 0 },
  { name: 'Naranja claro', hex: '#ffb74d', r: 255, g: 183, b: 77 },
  { name: 'Durazno', hex: '#ffcc80', r: 255, g: 204, b: 128 },

  // Amarillos y Mostazas
  { name: 'Mostaza / Ocre', hex: '#cca43b', r: 204, g: 164, b: 59 },
  { name: 'Amarillo dorado', hex: '#fbc02d', r: 251, g: 192, b: 45 },
  { name: 'Amarillo', hex: '#fdd835', r: 253, g: 216, b: 53 },
  { name: 'Amarillo claro', hex: '#fff59d', r: 255, g: 245, b: 157 },

  // Verdes
  { name: 'Verde oliva / Salvia', hex: '#587b6d', r: 88, g: 123, b: 109 },
  { name: 'Verde militar', hex: '#4b5320', r: 75, g: 83, b: 32 },
  { name: 'Verde muy oscuro', hex: '#012d1d', r: 1, g: 45, b: 29 },
  { name: 'Verde bosque', hex: '#1b4332', r: 27, g: 67, b: 50 },
  { name: 'Verde', hex: '#2e7d32', r: 46, g: 125, b: 50 },
  { name: 'Verde esmeralda', hex: '#388e3c', r: 56, g: 142, b: 60 },
  { name: 'Verde claro', hex: '#81c784', r: 129, g: 199, b: 132 },
  { name: 'Verde menta', hex: '#a5d6a7', r: 165, g: 214, b: 167 },
  { name: 'Verde lima', hex: '#cddc39', r: 205, g: 220, b: 57 },

  // Azules
  { name: 'Azul noche / petróleo', hex: '#0a192f', r: 10, g: 25, b: 47 },
  { name: 'Azul marino', hex: '#0d47a1', r: 13, g: 71, b: 161 },
  { name: 'Azul índigo', hex: '#254a6e', r: 37, g: 74, b: 110 },
  { name: 'Azul rey', hex: '#1565c0', r: 21, g: 101, b: 192 },
  { name: 'Azul', hex: '#1976d2', r: 25, g: 118, b: 210 },
  { name: 'Azul claro', hex: '#4fc3f7', r: 79, g: 195, b: 247 },
  { name: 'Azul cielo / Celeste', hex: '#81d4fa', r: 129, g: 212, b: 250 },
  { name: 'Turquesa', hex: '#00acc1', r: 0, g: 172, b: 193 },

  // Morados y Lilas
  { name: 'Morado berenjena', hex: '#4a148c', r: 74, g: 20, b: 140 },
  { name: 'Morado oscuro', hex: '#6a1b9a', r: 106, g: 27, b: 154 },
  { name: 'Morado', hex: '#7b1fa2', r: 123, g: 31, b: 162 },
  { name: 'Lavanda', hex: '#ab47bc', r: 171, g: 71, b: 188 },
  { name: 'Lila', hex: '#ba68c8', r: 186, g: 104, b: 200 },
  { name: 'Lila suave', hex: '#ce93d8', r: 206, g: 147, b: 216 },

  // Cafés, Beige y Tierras
  { name: 'Café chocolate oscuro', hex: '#3e2723', r: 62, g: 39, b: 35 },
  { name: 'Café / Marrón', hex: '#5d4037', r: 93, g: 64, b: 55 },
  { name: 'Café claro / Caramelo', hex: '#795548', r: 121, g: 85, b: 72 },
  { name: 'Canela', hex: '#8d6e63', r: 141, g: 110, b: 99 },
  { name: 'Lino tostado', hex: '#bcaaa4', r: 188, g: 170, b: 164 },
  { name: 'Beige', hex: '#d7ccc8', r: 215, g: 204, b: 200 },
  { name: 'Crema / Marfil', hex: '#fdfbf7', r: 253, g: 251, b: 247 },

  // Neutros: Blanco, Grises y Negro
  { name: 'Blanco puro', hex: '#ffffff', r: 255, g: 255, b: 255 },
  { name: 'Blanco crudo', hex: '#f5f5f0', r: 245, g: 245, b: 240 },
  { name: 'Gris claro', hex: '#e0e0e0', r: 224, g: 224, b: 224 },
  { name: 'Gris perla', hex: '#bdbdbd', r: 189, g: 189, b: 189 },
  { name: 'Gris jaspe', hex: '#7a8288', r: 122, g: 130, b: 136 },
  { name: 'Gris plomo / Carbón', hex: '#424242', r: 66, g: 66, b: 66 },
  { name: 'Negro grafito', hex: '#262626', r: 38, g: 38, b: 38 },
  { name: 'Negro azabache', hex: '#121212', r: 18, g: 18, b: 18 }
];

function findClosestColorName(r: number, g: number, b: number): { name: string; hex: string } {
  let closest = COLOR_NAMES_DICT[0];
  let minDistance = Infinity;

  for (const c of COLOR_NAMES_DICT) {
    // Weighted Euclidean distance (human eye is more sensitive to green, then red, then blue)
    const dr = r - c.r;
    const dg = g - c.g;
    const db = b - c.b;
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  // Format real RGB into exact hex
  const realHex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  return { name: closest.name, hex: realHex };
}

export const ContinuousColorWheel: React.FC<ContinuousColorWheelProps> = ({
  selectedColorName,
  selectedColorHex,
  onChange,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);

  const WHEEL_SIZE = 260; // Logical pixel size
  const CENTER = WHEEL_SIZE / 2;
  const RADIUS = CENTER - 8;

  // Draw continuous color wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    // 1. Draw continuous rainbow hue & saturation disk
    const imgData = ctx.createImageData(WHEEL_SIZE, WHEEL_SIZE);
    const data = imgData.data;

    for (let y = 0; y < WHEEL_SIZE; y++) {
      for (let x = 0; x < WHEEL_SIZE; x++) {
        const dx = x - CENTER;
        const dy = y - CENTER;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= RADIUS) {
          // Angle in degrees [0, 360)
          let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
          if (angle < 0) angle += 360;

          // Normalized radius [0, 1]
          const normDist = dist / RADIUS;

          let r = 0, g = 0, b = 0;

          // Separate into zones:
          // Center core (normDist < 0.22): Neutral gradient (White -> Beige/Gris -> Negro)
          if (normDist < 0.22) {
            const innerFrac = normDist / 0.22;
            // Angle around center creates different neutrals
            // Top: White, Right: Beige/Crema, Bottom: Black, Left: Gray
            const angleRad = (angle * Math.PI) / 180;
            const nx = Math.cos(angleRad) * innerFrac;
            const ny = Math.sin(angleRad) * innerFrac;

            // Value varies from 255 (top) down to 20 (bottom)
            const v = Math.max(15, Math.min(255, Math.round(135 - ny * 120)));
            // Tint slightly warm towards right (beige)
            const warm = Math.round(nx * 30);
            r = Math.min(255, Math.max(0, v + warm));
            g = Math.min(255, Math.max(0, v + Math.round(warm * 0.7)));
            b = Math.min(255, Math.max(0, v - Math.round(warm * 0.3)));
          } else {
            // Chromatic color ring with light-to-dark value gradient
            const sat = Math.min(1, (normDist - 0.22) / 0.45);
            // Outer edge (normDist > 0.75) shades towards deeper/darker tones (Vinotinto, Azul marino, Verde oscuro)
            let val = 1.0;
            if (normDist > 0.75) {
              val = 1.0 - ((normDist - 0.75) / 0.25) * 0.55; // Darkens near boundary
            }

            // HSV to RGB conversion
            const c = val * sat;
            const hPrime = angle / 60;
            const xVal = c * (1 - Math.abs((hPrime % 2) - 1));
            let r1 = 0, g1 = 0, b1 = 0;

            if (hPrime >= 0 && hPrime < 1) { r1 = c; g1 = xVal; b1 = 0; }
            else if (hPrime >= 1 && hPrime < 2) { r1 = xVal; g1 = c; b1 = 0; }
            else if (hPrime >= 2 && hPrime < 3) { r1 = 0; g1 = c; b1 = xVal; }
            else if (hPrime >= 3 && hPrime < 4) { r1 = 0; g1 = xVal; b1 = c; }
            else if (hPrime >= 4 && hPrime < 5) { r1 = xVal; g1 = 0; b1 = c; }
            else { r1 = c; g1 = 0; b1 = xVal; }

            const m = val - c;
            r = Math.round((r1 + m) * 255);
            g = Math.round((g1 + m) * 255);
            b = Math.round((b1 + m) * 255);
          }

          const pixelIndex = (y * WHEEL_SIZE + x) * 4;
          data[pixelIndex] = r;
          data[pixelIndex + 1] = g;
          data[pixelIndex + 2] = b;
          data[pixelIndex + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw anti-aliased border rings
    ctx.strokeStyle = '#c1c8c2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle inner neutral demarcation ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS * 0.22, 0, Math.PI * 2);
    ctx.stroke();
  }, [WHEEL_SIZE, CENTER, RADIUS]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Read color at (x, y) coordinates on canvas
  const pickColorAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Clamp coordinates to disk
    const dx = x - CENTER;
    const dy = y - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > RADIUS) {
      const angle = Math.atan2(dy, dx);
      x = CENTER + Math.cos(angle) * (RADIUS - 2);
      y = CENTER + Math.sin(angle) * (RADIUS - 2);
    }

    setPointerPos({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const pixel = ctx.getImageData(Math.floor(x * dpr), Math.floor(y * dpr), 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const matched = findClosestColorName(r, g, b);
    onChange(matched.name, matched.hex);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPointerDown(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pickColorAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown) return;
    pickColorAt(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsPointerDown(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  const handleClear = () => {
    setPointerPos(null);
    onChange('', '');
  };

  const handleQuickPreset = (presetHex: string, presetName: string) => {
    onChange(presetName, presetHex);
  };

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#efeee9] pb-3">
        <div>
          <label className="block text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#2b694d]">palette</span>
            <span>Color de la Prenda (Círculo Continuo de Colores) *</span>
          </label>
          <p className="text-[11px] text-[#717973] mt-0.5">
            Haz clic o arrastra el puntero por el círculo para seleccionar la tonalidad exacta de la prenda.
          </p>
        </div>

        {/* Selected badge */}
        {selectedColorName ? (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#faf9f4] p-1.5 pl-3 rounded-full border border-[#c1c8c2]/50 shadow-2xs">
            <span
              className="w-4 h-4 rounded-full border border-black/20 shadow-xs shrink-0"
              style={{ backgroundColor: selectedColorHex || '#1b1b1b' }}
            />
            <span className="text-xs font-bold text-[#012d1d] truncate max-w-[150px]">
              {selectedColorName}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-[#717973] hover:text-[#ba1a1a] hover:bg-[#efeee9] transition-colors"
              title="Borrar selección de color"
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

      {/* Main Wheel Area */}
      <div className="bg-[#faf9f4] p-5 rounded-2xl border border-[#c1c8c2]/40 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Continuous Color Wheel Canvas (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center select-none relative">
          <div
            className="relative cursor-crosshair touch-none"
            style={{ width: `${WHEEL_SIZE}px`, height: `${WHEEL_SIZE}px` }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: `${WHEEL_SIZE}px`, height: `${WHEEL_SIZE}px` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="rounded-full shadow-md transition-shadow hover:shadow-lg"
            />

            {/* Draggable Indicator Pointer Knob */}
            {pointerPos && (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                style={{
                  left: `${pointerPos.x}px`,
                  top: `${pointerPos.y}px`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center ring-1 ring-black/40"
                  style={{ backgroundColor: selectedColorHex || '#ffffff' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-2xs" />
                </div>
              </div>
            )}

            {/* Initial instruction label if not selected */}
            {!selectedColorName && !pointerPos && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#c1c8c2]/60 shadow-xs flex items-center gap-1.5 text-[#012d1d]">
                  <span className="material-symbols-outlined text-sm text-[#2b694d]">touch_app</span>
                  <span className="text-[11px] font-bold">Haz clic en el círculo</span>
                </div>
              </div>
            )}
          </div>

          <span className="text-[10px] text-[#717973] mt-2.5 text-center">
            Incluye gama continua completa: Cálidos, Fríos, Verdes, Tierras y Neutros (Blanco / Negro).
          </span>
        </div>

        {/* Dynamic Preview Box & Quick Tone Shortcuts (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Dynamic Swatch Preview Box */}
          <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2]/60 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#717973] block">
              Muestra del Color Seleccionado
            </span>

            {selectedColorName ? (
              <div className="flex items-center gap-3.5 animate-in fade-in">
                {/* Large Swatch Box */}
                <div
                  className="w-14 h-14 rounded-2xl border-2 border-black/15 shadow-inner shrink-0"
                  style={{ backgroundColor: selectedColorHex || '#1b1b1b' }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#012d1d] truncate leading-snug">
                    {selectedColorName}
                  </h4>
                  <p className="text-[11px] font-mono text-[#2b694d] font-semibold uppercase mt-0.5">
                    {selectedColorHex}
                  </p>
                  <span className="text-[10px] text-[#717973] block mt-0.5">
                    Se guardará en la publicación
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-1 text-[#717973]">
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#c1c8c2] bg-[#faf9f4] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl text-[#a3aca5]">colorize</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#414844]">Ningún color elegido</p>
                  <p className="text-[11px] text-[#717973] mt-0.5">
                    Mueve el cursor o haz clic en cualquier tono del círculo.
                  </p>
                </div>
              </div>
            )}

            {selectedColorName && (
              <div className="pt-2 border-t border-[#efeee9] flex items-center justify-between">
                <span className="text-[11px] text-[#717973]">¿Deseas ajustarlo?</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-bold text-[#ba1a1a] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>Limpiar</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Access Badges for Key Garment Tones */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#717973] block">
              Atajos de Tonalidades Comunes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Negro', hex: '#121212' },
                { name: 'Blanco', hex: '#ffffff' },
                { name: 'Azul índigo', hex: '#254a6e' },
                { name: 'Beige', hex: '#d7ccc8' },
                { name: 'Verde oliva', hex: '#587b6d' },
                { name: 'Vinotinto', hex: '#5f091c' },
                { name: 'Gris jaspe', hex: '#7a8288' },
                { name: 'Terracota', hex: '#b35d38' },
                { name: 'Rosa palo', hex: '#d8a4a4' },
                { name: 'Mostaza', hex: '#cca43b' },
              ].map((pill) => (
                <button
                  key={pill.name}
                  type="button"
                  onClick={() => handleQuickPreset(pill.hex, pill.name)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#c1c8c2]/50 hover:bg-[#efeee9] text-[11px] font-medium text-[#1b1c19] flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: pill.hex }}
                  />
                  <span>{pill.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
