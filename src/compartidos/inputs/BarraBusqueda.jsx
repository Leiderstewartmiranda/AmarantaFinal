import React, { useState } from "react";
import { Icon } from "@iconify/react";
import "./barraBusqueda.css";

const BarraBusqueda = ({
  ref,
  placeholder = "Buscar...",
  onSearch,
  onClear,
  debounceMs = 300,
  searchOnType = false,
  value,
  onChange
}) => {
  const [valor, setValor] = useState(value || "");
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    if (value !== undefined) {
      setValor(value);
    }
  }, [value]);

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

    if (onChange) onChange(e);
    if (!nuevoValor.trim() && searchOnType && onClear) onClear();
  };

  const realizarBusqueda = async () => {
    if (!valor.trim() || !onSearch) return;
    setIsSearching(true);
    try {
      await onSearch(valor.trim());
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const limpiarBusqueda = () => {
    setValor("");
    if (ref && ref.current) ref.current.focus();
    if (onClear) onClear();
    if (onChange) onChange({ target: { value: "" } });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      realizarBusqueda();
    }
  };

  return (
    <div className="search-bar">
      {isSearching ? (
        <Icon icon="eos-icons:loading" className="icon-search icon-loading" />
      ) : (
        <Icon
          icon="material-symbols:search"
          className="icon-search"
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
        className="search-input"
      />

      {valor && (
        <button
          onClick={limpiarBusqueda}
          disabled={isSearching}
          className="icon-clear"
        >
          <Icon icon="material-symbols:close" />
        </button>
      )}
    </div>
  );
};

export default BarraBusqueda;
