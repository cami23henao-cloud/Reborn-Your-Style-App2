import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: ServiceItem | null;
  onSaveService: (service: ServiceItem) => void;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  onSaveService
}) => {
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState<string>('');
  const [priceRange, setPriceRange] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [icon, setIcon] = useState('design_services');

  useEffect(() => {
    if (serviceToEdit) {
      setTitle(serviceToEdit.title);
      setDescription(serviceToEdit.description);
      setStartingPrice(String(serviceToEdit.startingPrice || ''));
      setPriceRange(serviceToEdit.priceRange || '');
      setDeliveryTime(serviceToEdit.deliveryTime || '2 a 3 días hábiles');
      setIcon(serviceToEdit.icon || 'design_services');
    } else {
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setPriceRange('');
      setDeliveryTime('');
      setIcon('design_services');
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startingPrice.trim() || !deliveryTime.trim()) return;

    const numPrice = Number(startingPrice.replace(/[^0-9]/g, '')) || 0;
    const formattedRange = priceRange.trim() || `$${numPrice.toLocaleString('es-CO')} COP`;

    onSaveService({
      id: serviceToEdit ? serviceToEdit.id : `srv-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      startingPrice: numPrice,
      price: numPrice,
      priceRange: formattedRange,
      deliveryTime: deliveryTime.trim(),
      category: serviceToEdit?.category || 'Confección y Arreglos',
      techniques: serviceToEdit?.techniques || ['Arreglos', 'Confección', 'Sostenible'],
      imageUrl:
        serviceToEdit?.imageUrl ||
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
      icon,
    });
    onClose();
  };

  const availableIcons = [
    { name: 'content_cut', label: isEn ? 'Cut / Tailoring' : 'Corte / Sastrería' },
    { name: 'draw', label: isEn ? 'Embroidery' : 'Bordado' },
    { name: 'palette', label: isEn ? 'Paint / Dye' : 'Pintura / Tinte' },
    { name: 'styler', label: 'Upcycling' },
    { name: 'checkroom', label: isEn ? 'Garment' : 'Prenda' },
    { name: 'eco', label: isEn ? 'Sustainable' : 'Sostenible' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0e241c] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#efeee9] dark:border-[#2b694d]/40">
        <div className="p-6 border-b border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between bg-[#faf9f4] dark:bg-[#002113]/50">
          <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
            {serviceToEdit 
              ? (isEn ? 'Edit Service' : 'Editar Servicio') 
              : (isEn ? 'Create New Service' : 'Crear Nuevo Servicio')}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeee9] dark:bg-[#002113] hover:bg-[#e3e3de] text-[#1b1c19] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Service / Modification Name *' : 'Nombre del servicio o arreglo *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'E.g.: Custom Botanical Embroidery or Hemming' : 'Ej: Bordado Botánico Personalizado o Ajuste de Cintura'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl p-2.5 text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#012d1d] dark:text-white mb-1">
                {isEn ? 'Estimated Price / Starting at ($ COP) *' : 'Precio estimado o base ($ COP) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717973] dark:text-[#a0a5a1]">
                  $ COP
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder={isEn ? 'E.g. 25000' : 'Ej. 25000'}
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl pl-16 pr-4 py-2.5 text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#012d1d] dark:text-white mb-1">
                {isEn ? 'Estimated Delivery Time *' : 'Tiempo de entrega estimado *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'E.g. 2 to 3 business days' : 'Ej. 2 a 3 días hábiles'}
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Price range label (optional)' : 'Rango o detalle de precio (opcional)'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'E.g. $25,000 - $40,000 COP depending on complexity' : 'Ej. $25.000 - $40.000 COP según complejidad'}
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl p-2.5 text-xs text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#012d1d] dark:text-white mb-1">
              {isEn ? 'Detailed description *' : 'Descripción detallada del servicio *'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={isEn ? 'Describe what is included, materials used, technique, and care advice...' : 'Describe qué incluye el arreglo, técnicas utilizadas, tipos de telas que aceptas y recomendaciones...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f5f4ef] dark:bg-[#002113]/60 border border-[#c1c8c2] dark:border-[#2b694d]/50 rounded-xl p-2.5 text-sm text-[#1b1c19] dark:text-white focus:bg-white dark:focus:bg-[#002113] focus:border-[#012d1d] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#012d1d] dark:text-white mb-1.5">
              {isEn ? 'Specialty Icon' : 'Icono de Especialidad'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableIcons.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    icon === item.name
                      ? 'border-[#012d1d] bg-[#b0f1cc]/40 text-[#012d1d] font-bold'
                      : 'border-[#c1c8c2]/50 hover:bg-[#f5f4ef] dark:hover:bg-[#002113]/40 text-[#414844] dark:text-[#c1c8c2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.name}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#efeee9] dark:border-[#2b694d]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#414844] dark:text-[#c1c8c2] hover:bg-[#efeee9] dark:hover:bg-[#2b694d]/30 rounded-lg transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-semibold bg-[#012d1d] text-white rounded-lg hover:bg-[#1b4332] transition-colors shadow-sm cursor-pointer"
            >
              {serviceToEdit 
                ? (isEn ? 'Save Changes' : 'Guardar Cambios') 
                : (isEn ? 'Add Service' : 'Añadir Servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
