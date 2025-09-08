import React, { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const BarraBusqueda = ({ 
  ref, 
  placeholder = "Buscar...", 
  onSearch, 
  onClear,
  debounceMs = 300,
  searchOnType = false,
  // Propiedades para compatibilidad con implementación actual
  value,
  onChange
}) => {
  const [valor, setValor] = useState(value || "");
  const [isSearching, setIsSearching] = useState(false);

  // Sincronizar con prop value (para compatibilidad con implementación actual)
  React.useEffect(() => {
    if (value !== undefined) {
      setValor(value);
    }
  }, [value]);

  // Debounce para búsqueda automática
  React.useEffect(() => {
    if (!searchOnType || !onSearch) return;

    const timeoutId = setTimeout(() => {
      if (valor.trim()) {
        setIsSearching(true);
        onSearch(valor.trim()).finally(() => setIsSearching(false));
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [valor, onSearch, searchOnType, debounceMs]);

  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    setValor(nuevoValor);
    
    // Si hay un onChange prop (para compatibilidad), usarlo
    if (onChange) {
      onChange(e);
    }
    
    // Si no hay valor y se está buscando automáticamente, limpiar resultados
    if (!nuevoValor.trim() && searchOnType && onClear) {
      onClear();
    }
  };

  const realizarBusqueda = async () => {
    if (!valor.trim() || !onSearch) return;

    setIsSearching(true);
    try {
      await onSearch(valor.trim());
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const limpiarBusqueda = () => {
    setValor("");
    if (ref && ref.current) {
      ref.current.focus();
    }
    if (onClear) {
      onClear();
    }
    // Si hay onChange (para compatibilidad), simular evento de cambio
    if (onChange) {
      const fakeEvent = { target: { value: "" } };
      onChange(fakeEvent);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      realizarBusqueda();
    }
  };

  return (
    <div className="relative w-64 max-w-sm">
      {/* Icono de búsqueda o loading */}
      {isSearching ? (
        <Icon 
          icon="eos-icons:loading" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--naranjado)] text-xl animate-spin"
        />
      ) : (
        <Icon 
          icon="material-symbols:search" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl cursor-pointer hover:text-[var(--naranjado)] transition-colors"
          onClick={realizarBusqueda}
        />
      )}
      
      <input
        type="text"
        ref={ref}
        value={valor}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isSearching}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--naranjado)] transition duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-[var(--blanco)]"
      />
      
      {/* Botón de limpiar */}
      {valor && (
        <button
          onClick={limpiarBusqueda}
          disabled={isSearching}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
        >
          <Icon icon="material-symbols:close" className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default BarraBusqueda;