import React, { useState, useMemo, useEffect } from 'react';
import { COLOMBIA_DEPARTMENTS, searchColombiaLocations } from '../../data/colombiaData';

export interface ComprehensiveLocation {
  country: string;
  department: string;
  municipality: string;
  localityOrComuna?: string;
  neighborhoodOrVereda?: string;
  exactAddress?: string;
  displayLocation: string;
  publicLocation: string;
}

interface ColombianLocationSelectorProps {
  initialLocation?: Partial<ComprehensiveLocation>;
  onChange: (loc: ComprehensiveLocation) => void;
  required?: boolean;
}

export const ColombianLocationSelector: React.FC<ColombianLocationSelectorProps> = ({
  initialLocation,
  onChange,
  required = false
}) => {
  const [country, setCountry] = useState(initialLocation?.country || 'Colombia');
  const [department, setDepartment] = useState(initialLocation?.department || 'Antioquia');
  const [municipality, setMunicipality] = useState(initialLocation?.municipality || 'Medellín');
  const [localityOrComuna, setLocalityOrComuna] = useState(initialLocation?.localityOrComuna || '');
  const [neighborhoodOrVereda, setNeighborhoodOrVereda] = useState(initialLocation?.neighborhoodOrVereda || '');
  const [exactAddress, setExactAddress] = useState(initialLocation?.exactAddress || '');

  // Quick search query & autocomplete
  const [quickSearch, setQuickSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mode, setMode] = useState<'structured' | 'quick'>('structured');

  // Municipalities for selected department
  const currentDeptObj = useMemo(() => {
    return COLOMBIA_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === department.toLowerCase() || d.id === department.toLowerCase()
    );
  }, [department]);

  const availableMunicipalities = useMemo(() => {
    return currentDeptObj?.municipalities || [];
  }, [currentDeptObj]);

  // Suggestions for quick search
  const suggestions = useMemo(() => {
    if (!quickSearch || quickSearch.trim().length < 2) return [];
    return searchColombiaLocations(quickSearch);
  }, [quickSearch]);

  // Compute clean display string without coordinates
  const displayLocation = useMemo(() => {
    const parts: string[] = [];
    if (neighborhoodOrVereda.trim()) parts.push(neighborhoodOrVereda.trim());
    if (localityOrComuna.trim()) parts.push(localityOrComuna.trim());
    if (municipality.trim()) parts.push(municipality.trim());
    if (department.trim() && department.toLowerCase() !== municipality.toLowerCase()) {
      parts.push(department.trim());
    }
    if (country.trim()) parts.push(country.trim());

    return parts.length > 0 ? parts.join(', ') : 'Colombia';
  }, [country, department, municipality, localityOrComuna, neighborhoodOrVereda]);

  // Public approximate zone (barrio/ciudad)
  const publicLocation = useMemo(() => {
    const parts: string[] = [];
    if (neighborhoodOrVereda.trim()) parts.push(neighborhoodOrVereda.trim());
    else if (localityOrComuna.trim()) parts.push(localityOrComuna.trim());

    if (municipality.trim()) parts.push(municipality.trim());
    if (department.trim() && department.toLowerCase() !== municipality.toLowerCase()) {
      parts.push(department.trim());
    }

    return parts.length > 0 ? parts.join(', ') : municipality || 'Colombia';
  }, [department, municipality, localityOrComuna, neighborhoodOrVereda]);

  // Notify parent on change
  useEffect(() => {
    onChange({
      country,
      department,
      municipality,
      localityOrComuna,
      neighborhoodOrVereda,
      exactAddress,
      displayLocation,
      publicLocation
    });
  }, [country, department, municipality, localityOrComuna, neighborhoodOrVereda, exactAddress, displayLocation, publicLocation]);

  const handleSelectQuickSuggestion = (item: string) => {
    setQuickSearch('');
    setShowSuggestions(false);

    // Parse parts like "El Poblado, Medellín, Antioquia" or "Chapinero, Bogotá D.C."
    const parts = item.split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      setNeighborhoodOrVereda(parts[0]);
      setMunicipality(parts[1]);
      setDepartment(parts[2]);
    } else if (parts.length === 2) {
      setMunicipality(parts[0]);
      setDepartment(parts[1]);
    } else {
      setMunicipality(parts[0]);
    }
  };

  const mapQuery = encodeURIComponent(displayLocation);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-4">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#efeee9] dark:border-[#2b694d]/30 pb-3">
        <div>
          <label className="block text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#2b694d]">location_on</span>
            <span>Ubicación de la Prenda o Taller *</span>
          </label>
          <p className="text-[11px] text-[#717973] dark:text-[#a7b8ae]">
            Ubicaciones familiares y comprensibles en Colombia (sin coordenadas técnicas).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#f5f4ef] dark:bg-[#112920] p-1 rounded-xl text-xs self-start sm:self-auto border border-[#c1c8c2]/50 dark:border-[#2b694d]/30">
          <button
            type="button"
            onClick={() => setMode('structured')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'structured'
                ? 'bg-[#012d1d] text-white shadow-2xs'
                : 'text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d]'
            }`}
          >
            Selección guiada
          </button>
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'quick'
                ? 'bg-[#012d1d] text-white shadow-2xs'
                : 'text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d]'
            }`}
          >
            Búsqueda rápida
          </button>
        </div>
      </div>

      {/* QUICK SEARCH BAR (When active) */}
      {mode === 'quick' && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2b694d] text-lg">
            search
          </span>
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => {
              setQuickSearch(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Escribe ciudad, barrio o municipio (ej. Envigado, Chapinero, Cali...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-xs sm:text-sm text-[#1b1c19] dark:text-white outline-none focus:border-[#012d1d]"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#0e241c] border border-[#c1c8c2] dark:border-[#2b694d]/40 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto py-1">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickSuggestion(item)}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#1b1c19] dark:text-white hover:bg-[#b0f1cc]/20 flex items-center gap-2 border-b border-[#efeee9] dark:border-[#173328] last:border-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-[#2b694d] shrink-0">pin_drop</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STRUCTURED SELECTION FIELDS: Country, Department, City, Locality/Barrio/Vereda, Exact Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
        {/* 1. PAÍS */}
        <div className="space-y-1">
          <label className="font-bold text-[#012d1d] dark:text-white block">
            País *
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none cursor-pointer"
          >
            <option value="Colombia">Colombia 🇨🇴</option>
          </select>
        </div>

        {/* 2. DEPARTAMENTO */}
        <div className="space-y-1">
          <label className="font-bold text-[#012d1d] dark:text-white block">
            Departamento *
          </label>
          <select
            value={department}
            onChange={(e) => {
              const newDept = e.target.value;
              setDepartment(newDept);
              const found = COLOMBIA_DEPARTMENTS.find((d) => d.name === newDept);
              if (found && found.municipalities.length > 0) {
                setMunicipality(found.municipalities[0]);
              }
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none cursor-pointer"
          >
            {COLOMBIA_DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. CIUDAD / MUNICIPIO */}
        <div className="space-y-1">
          <label className="font-bold text-[#012d1d] dark:text-white block">
            Ciudad / Municipio *
          </label>
          {availableMunicipalities.length > 0 ? (
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none cursor-pointer"
            >
              {availableMunicipalities.map((muni, idx) => (
                <option key={idx} value={muni}>
                  {muni}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="Ej. Medellín, Cali, Bogotá..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none"
            />
          )}
        </div>

        {/* 4. LOCALIDAD / COMUNA */}
        <div className="space-y-1">
          <label className="font-bold text-[#012d1d] dark:text-white block">
            Localidad / Comuna (opcional)
          </label>
          <input
            type="text"
            value={localityOrComuna}
            onChange={(e) => setLocalityOrComuna(e.target.value)}
            placeholder="Ej. Chapinero, Comuna 11 Laureles, Usaquén..."
            className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none"
          />
        </div>

        {/* 5. BARRIO / CORREGIMIENTO / VEREDA */}
        <div className="space-y-1">
          <label className="font-bold text-[#012d1d] dark:text-white block">
            Barrio / Corregimiento / Vereda
          </label>
          <input
            type="text"
            value={neighborhoodOrVereda}
            onChange={(e) => setNeighborhoodOrVereda(e.target.value)}
            placeholder="Ej. El Poblado, San Antonio de Prado, Vereda..."
            className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none"
          />
        </div>

        {/* 6. DIRECCIÓN EXACTA CUANDO CORRESPONDA */}
        <div className="space-y-1">
          <label className="font-bold text-[#012d1d] dark:text-white block">
            Dirección / Dirección exacta (opcional o privada)
          </label>
          <input
            type="text"
            value={exactAddress}
            onChange={(e) => setExactAddress(e.target.value)}
            placeholder="Ej. Calle 10 # 43D-25, Apto 301"
            className="w-full px-3 py-2.5 rounded-xl border border-[#c1c8c2] dark:border-[#2b694d]/40 bg-white dark:bg-[#112920] text-[#1b1c19] dark:text-white font-medium outline-none"
          />
        </div>
      </div>

      {/* HUMAN-READABLE LOCATION SUMMARY (Zero technical coordinates) */}
      <div className="p-3.5 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#2b694d] dark:text-[#b0f1cc]">check_circle</span>
          <div>
            <span className="text-[11px] text-[#717973] dark:text-[#a7b8ae] block font-medium">
              Ubicación visible en la plataforma:
            </span>
            <span className="font-bold text-[#012d1d] dark:text-white text-sm">
              📍 {displayLocation}
            </span>
          </div>
        </div>

        {exactAddress && (
          <span className="text-[11px] text-[#717973] dark:text-[#a7b8ae] bg-white dark:bg-[#0e241c] px-2.5 py-1 rounded-lg border border-[#c1c8c2]/40 shrink-0">
            🔒 Dirección interna guardada
          </span>
        )}
      </div>

      {/* VISUAL EMBEDDED MAP OF THE LOCATION (Centered on the human place name) */}
      <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#c1c8c2]/60 dark:border-[#2b694d]/40 shadow-xs relative">
        <iframe
          title={`Mapa de ${displayLocation}`}
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full pointer-events-none opacity-90"
        />
        <div className="absolute bottom-2.5 left-3 bg-white/95 dark:bg-[#0e241c]/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-sm border border-[#c1c8c2]/50 text-[11px] font-bold text-[#012d1d] dark:text-white flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#ba1a1a]">place</span>
          <span>{displayLocation}</span>
        </div>
      </div>
    </div>
  );
};
