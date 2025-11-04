import React from "react";
import "./agg.css";

const BotonAgregar = ({ action, texto = "AGREGAR", icono = true }) => {
  return (
    <button
      onClick={action}
      className="btn-agregar group"
    >
      {icono && (
        <svg 
          className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      )}
      <span>{texto}</span>
    </button>
  );
};

export default BotonAgregar;