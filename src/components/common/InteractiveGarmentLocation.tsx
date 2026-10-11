import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { COLOMBIA_DEPARTMENTS } from '../../data/colombiaData';

export interface LocationChangeData {
  displayLocation: string;
  exactAddress: string;
  department: string;
  municipality: string;
  neighborhood?: string;
  lat: number;
  lng: number;
}

interface InteractiveGarmentLocationProps {
  initialLocation?: string;
  initialAddressDetail?: string;
  onChange: (data: LocationChangeData) => void;
  required?: boolean;
}

// Coordenadas fijas de referencia para las principales ciudades y municipios de Colombia
const CITY_COORDINATES: Record<string, { lat: number; lng: number; dept: string }> = {
  'Medellín': { lat: 6.2442, lng: -75.5812, dept: 'Antioquia' },
  'Bogotá D.C.': { lat: 4.7110, lng: -74.0721, dept: 'Bogotá D.C.' },
  'Cali': { lat: 3.4516, lng: -76.5320, dept: 'Valle del Cauca' },
  'Barranquilla': { lat: 10.9685, lng: -74.7813, dept: 'Atlántico' },
  'Cartagena': { lat: 10.3910, lng: -75.4794, dept: 'Bolívar' },
  'Bucaramanga': { lat: 7.1254, lng: -73.1198, dept: 'Santander' },
  'Pereira': { lat: 4.8133, lng: -75.6961, dept: 'Risaralda' },
  'Manizales': { lat: 5.0689, lng: -75.5174, dept: 'Caldas' },
  'Santa Marta': { lat: 11.2408, lng: -74.1990, dept: 'Magdalena' },
  'Cúcuta': { lat: 7.8939, lng: -72.5078, dept: 'Norte de Santander' },
  'Ibagué': { lat: 4.4389, lng: -75.2322, dept: 'Tolima' },
  'Pasto': { lat: 1.2136, lng: -77.2811, dept: 'Nariño' },
  'Armenia': { lat: 4.5350, lng: -75.6757, dept: 'Quindío' },
  'Neiva': { lat: 2.9273, lng: -75.2819, dept: 'Huila' },
  'Villavicencio': { lat: 4.1420, lng: -73.6266, dept: 'Meta' },
  'Montería': { lat: 8.7479, lng: -75.8814, dept: 'Córdoba' },
  'Valledupar': { lat: 10.4631, lng: -73.2532, dept: 'Cesar' },
  'Popayán': { lat: 2.4448, lng: -76.6147, dept: 'Cauca' },
  'Sincelejo': { lat: 9.3047, lng: -75.3978, dept: 'Sucre' },
  'Tunja': { lat: 5.5353, lng: -73.3678, dept: 'Boyacá' },
  'Riohacha': { lat: 11.5444, lng: -72.9072, dept: 'La Guajira' },
  'Envigado': { lat: 6.1701, lng: -75.5768, dept: 'Antioquia' },
  'Bello': { lat: 6.3373, lng: -75.5579, dept: 'Antioquia' },
  'Itagüí': { lat: 6.1738, lng: -75.6094, dept: 'Antioquia' },
  'Sabaneta': { lat: 6.1514, lng: -75.6166, dept: 'Antioquia' },
  'Rionegro': { lat: 6.1552, lng: -75.3737, dept: 'Antioquia' },
  'Soledad': { lat: 10.9184, lng: -74.7646, dept: 'Atlántico' },
  'Floridablanca': { lat: 7.0622, lng: -73.0864, dept: 'Santander' },
  'Palmira': { lat: 3.5394, lng: -76.3036, dept: 'Valle del Cauca' },
  'Buenaventura': { lat: 3.8801, lng: -77.0312, dept: 'Valle del Cauca' },
  'Dosquebradas': { lat: 4.8389, lng: -75.6797, dept: 'Risaralda' },
  'Apartadó': { lat: 7.8829, lng: -76.6347, dept: 'Antioquia' },
  'San Andrés Islas': { lat: 12.5847, lng: -81.7006, dept: 'San Andrés y Providencia' },
};

// Generar lista exhaustiva de todos los municipios de Colombia a partir de COLOMBIA_DEPARTMENTS
function getAllColombianCities(): Array<{ city: string; dept: string }> {
  const result: Array<{ city: string; dept: string }> = [];
  const seen = new Set<string>();

  // Priorizar las principales ciudades con coordenadas definidas
  Object.keys(CITY_COORDINATES).forEach((cityName) => {
    result.push({ city: cityName, dept: CITY_COORDINATES[cityName].dept });
    seen.add(cityName.toLowerCase());
  });

  // Agregar el resto de municipios desde la base de datos de departamentos
  COLOMBIA_DEPARTMENTS.forEach((dept) => {
    dept.municipalities.forEach((muni) => {
      if (!seen.has(muni.toLowerCase())) {
        result.push({ city: muni, dept: dept.name });
        seen.add(muni.toLowerCase());
      }
    });
  });

  return result;
}

const ALL_CITIES = getAllColombianCities();

export const InteractiveGarmentLocation: React.FC<InteractiveGarmentLocationProps> = ({
  initialLocation = 'Medellín, Antioquia',
  initialAddressDetail = '',
  onChange,
  required = true,
}) => {
  // Parsear ciudad inicial
  const parseInitialCity = (loc: string): string => {
    const firstPart = loc.split(',')[0].trim();
    const found = ALL_CITIES.find(
      (c) => c.city.toLowerCase() === firstPart.toLowerCase()
    );
    return found ? found.city : 'Medellín';
  };

  const [selectedCity, setSelectedCity] = useState<string>(() => parseInitialCity(initialLocation));
  const [exactAddress, setExactAddress] = useState<string>(initialAddressDetail);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodedLabel, setGeocodedLabel] = useState<string>('');

  // Coordenadas geográficas centradas en la ciudad seleccionada
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    const known = CITY_COORDINATES[parseInitialCity(initialLocation)];
    return known ? { lat: known.lat, lng: known.lng } : { lat: 6.2442, lng: -75.5812 };
  });

  // Marcador arrastrable (offset fino para ajuste manual)
  const [markerOffset, setMarkerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPin, setIsDraggingPin] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geocodeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Obtener el departamento correspondiente a la ciudad
  const currentDepartment = useMemo(() => {
    const found = ALL_CITIES.find((c) => c.city === selectedCity);
    return found ? found.dept : 'Antioquia';
  }, [selectedCity]);

  // Sincronizar datos hacia el formulario padre
  const notifyChange = useCallback(
    (nextCoords: { lat: number; lng: number }, addr: string, city: string, dept: string) => {
      const display = `${city}, ${dept}`;
      onChange({
        displayLocation: display,
        exactAddress: addr.trim(),
        municipality: city,
        department: dept,
        lat: nextCoords.lat,
        lng: nextCoords.lng,
      });
    },
    [onChange]
  );

  // 1. Al cambiar la Ciudad / Municipio: centrar el mapa inmediatamente en sus coordenadas
  const handleCitySelect = (newCity: string) => {
    setSelectedCity(newCity);
    setMarkerOffset({ x: 0, y: 0 });
    setGeocodedLabel('');

    const found = ALL_CITIES.find((c) => c.city === newCity);
    const dept = found ? found.dept : 'Colombia';

    let nextCoords = { lat: 6.2442, lng: -75.5812 };
    if (CITY_COORDINATES[newCity]) {
      nextCoords = { lat: CITY_COORDINATES[newCity].lat, lng: CITY_COORDINATES[newCity].lng };
    }

    setCoords(nextCoords);
    notifyChange(nextCoords, exactAddress, newCity, dept);

    // Si ya hay una dirección escrita, re-geocodificar en la nueva ciudad
    if (exactAddress.trim().length > 3) {
      triggerGeocoding(exactAddress, newCity, dept);
    }
  };

  // 2. Geocodificación de la dirección exacta
  const triggerGeocoding = (address: string, city: string, dept: string) => {
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    const cleanAddr = address.trim();
    if (cleanAddr.length < 3) {
      setGeocodedLabel('');
      return;
    }

    geocodeTimerRef.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const query = `${cleanAddr}, ${city}, Colombia`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=co&limit=1&addressdetails=1`;

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'es' },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const item = data[0];
            const newLat = parseFloat(item.lat);
            const newLng = parseFloat(item.lon);
            const nextCoords = { lat: newLat, lng: newLng };
            setCoords(nextCoords);
            setMarkerOffset({ x: 0, y: 0 });
            setGeocodedLabel(item.display_name.split(',')[0] || cleanAddr);
            notifyChange(nextCoords, cleanAddr, city, dept);
          }
        }
      } catch (err) {
        console.warn('Geocodificación notice:', err);
      } finally {
        setIsGeocoding(false);
      }
    }, 450);
  };

  // Manejador del input [ Dirección exacta ]
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setExactAddress(val);
    notifyChange(coords, val, selectedCity, currentDepartment);
    triggerGeocoding(val, selectedCity, currentDepartment);
  };

  // 3. Ajuste y arrastre manual del marcador sobre el mapa
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    setIsDraggingPin(true);
    const rect = mapContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const offsetX = Math.max(-100, Math.min(100, e.clientX - rect.left - centerX));
    const offsetY = Math.max(-60, Math.min(60, e.clientY - rect.top - centerY));
    setMarkerOffset({ x: offsetX, y: offsetY });

    const fineCoords = {
      lat: Number((coords.lat - offsetY * 0.00008).toFixed(6)),
      lng: Number((coords.lng + offsetX * 0.00008).toFixed(6)),
    };
    setCoords(fineCoords);
    notifyChange(fineCoords, exactAddress, selectedCity, currentDepartment);
  };

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPin || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const offsetX = Math.max(-120, Math.min(120, e.clientX - rect.left - centerX));
    const offsetY = Math.max(-70, Math.min(70, e.clientY - rect.top - centerY));
    setMarkerOffset({ x: offsetX, y: offsetY });
  };

  const handleMapMouseUp = () => {
    if (isDraggingPin) {
      setIsDraggingPin(false);
      const fineCoords = {
        lat: Number((coords.lat - markerOffset.y * 0.00008).toFixed(6)),
        lng: Number((coords.lng + markerOffset.x * 0.00008).toFixed(6)),
      };
      setCoords(fineCoords);
      notifyChange(fineCoords, exactAddress, selectedCity, currentDepartment);
    }
  };

  // Construcción del mapa interactivo centrado en coordenadas
  const mapEmbedUrl = useMemo(() => {
    const centerQuery = `${coords.lat},${coords.lng}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(centerQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [coords]);

  return (
    <div className="space-y-4">
      {/* 1. SELECCIÓN DE CIUDAD / MUNICIPIO (ÚNICO CAMPO, SIN DEPARTAMENTOS) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] uppercase tracking-wider">
            Ciudad / Municipio {required && <span className="text-[#ba1a1a]">*</span>}
          </label>
          <span className="text-[11px] text-[#717973] dark:text-[#a7b8ae]">
            {currentDepartment}
          </span>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#2b694d] dark:text-[#b0f1cc] pointer-events-none">
            location_city
          </span>
          <select
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#112920] text-sm text-[#1b1c19] dark:text-white font-medium focus:border-[#012d1d] dark:focus:border-[#b0f1cc] focus:ring-1 focus:ring-[#012d1d] outline-none transition-all shadow-xs cursor-pointer appearance-none"
          >
            {ALL_CITIES.map(({ city, dept }) => (
              <option key={city} value={city}>
                {city} ({dept})
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#717973] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Accesos rápidos de ciudades principales */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-[#717973] dark:text-[#a7b8ae]">Frecuentes:</span>
          {['Medellín', 'Bogotá D.C.', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCitySelect(c)}
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border transition-all cursor-pointer ${
                selectedCity === c
                  ? 'bg-[#012d1d] text-[#b0f1cc] border-[#012d1d]'
                  : 'bg-[#faf9f4] dark:bg-[#17382c] text-[#414844] dark:text-[#a7b8ae] hover:bg-[#b0f1cc]/40 border-[#c1c8c2]/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CAMPO DE DIRECCIÓN EXACTA CON GEOCODIFICACIÓN */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] uppercase tracking-wider">
            Dirección exacta
          </label>
          {isGeocoding && (
            <span className="text-[11px] text-[#2b694d] dark:text-[#b0f1cc] flex items-center gap-1 font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 border-2 border-[#2b694d] border-t-transparent rounded-full animate-spin" />
              <span>Geocodificando...</span>
            </span>
          )}
          {!isGeocoding && geocodedLabel && (
            <span className="text-[11px] text-[#2b694d] dark:text-[#b0f1cc] font-medium truncate max-w-[200px]">
              ✓ Ubicado en mapa
            </span>
          )}
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#ba1a1a]">
            pin_drop
          </span>
          <input
            type="text"
            value={exactAddress}
            onChange={handleAddressChange}
            placeholder="Ej: Calle 10 # 43A - 12 / Carrera 7 # 72 - 01"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/50 bg-white dark:bg-[#112920] text-sm text-[#1b1c19] dark:text-white focus:border-[#012d1d] dark:focus:border-[#b0f1cc] focus:ring-1 focus:ring-[#012d1d] outline-none transition-all shadow-xs"
          />
        </div>
        <p className="text-[11px] text-[#717973] dark:text-[#a7b8ae]">
          Escribe tu dirección para colocar automáticamente el marcador o flecha de Google Maps en el punto exacto.
        </p>
      </div>

      {/* 3. MAPA INTERACTIVO DE GOOGLE MAPS CON MARCADOR / FLECHA EXACTA */}
      <div className="rounded-2xl overflow-hidden border border-[#c1c8c2] dark:border-[#2b694d]/50 shadow-xs bg-[#f5f4ef] dark:bg-[#0e241c]">
        {/* Cabecera del mapa */}
        <div className="bg-[#012d1d] dark:bg-[#071610] text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-sm text-[#b0f1cc]">map</span>
            <span className="truncate">
              Google Maps: {selectedCity} {exactAddress ? `• ${exactAddress}` : ''}
            </span>
          </div>
          <span className="text-[10px] text-[#b0f1cc] font-semibold bg-[#b0f1cc]/15 px-2 py-0.5 rounded-full shrink-0 ml-2">
            Pin Activo
          </span>
        </div>

        {/* Contenedor del mapa interactivo (~200px) */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          className="w-full h-[200px] relative bg-[#e5e3df] dark:bg-[#17382c] cursor-crosshair select-none overflow-hidden"
        >
          <iframe
            title={`Google Maps - ${selectedCity}`}
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, pointerEvents: isDraggingPin ? 'none' : 'auto' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Marcador / Flecha precisa sobre el mapa */}
          <div
            style={{
              transform: `translate(calc(-50% + ${markerOffset.x}px), calc(-100% + ${markerOffset.y}px))`,
            }}
            className="absolute left-1/2 top-1/2 pointer-events-none transition-transform duration-75 flex flex-col items-center z-10"
          >
            {/* Etiqueta flotante sobre el marcador */}
            <div className="bg-[#012d1d] text-[#b0f1cc] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg border border-[#b0f1cc]/40 whitespace-nowrap mb-0.5 flex items-center gap-1">
              <span>{exactAddress || selectedCity}</span>
            </div>

            {/* Marcador / Pin con flecha señaladora exacta */}
            <div className="relative flex flex-col items-center">
              <span className="material-symbols-outlined text-3xl text-[#ba1a1a] drop-shadow-md">
                location_on
              </span>
              <div className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full shadow-md -mt-1" />
            </div>
          </div>

          {/* Instrucción y coordenadas en la barra inferior */}
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-[#112920]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs flex items-center justify-between text-[11px] pointer-events-none">
            <div className="flex items-center gap-1.5 truncate text-[#012d1d] dark:text-white font-medium">
              <span className="material-symbols-outlined text-sm text-[#ba1a1a]">explore</span>
              <span className="truncate">
                {selectedCity} {exactAddress ? `• ${exactAddress}` : ''}
              </span>
            </div>
            <span className="text-[10px] text-[#717973] dark:text-[#a7b8ae] shrink-0 ml-2 hidden sm:inline">
              Arrastra o haz clic para ajustar la posición
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
