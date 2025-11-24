import React from "react";
import "./titulo.css";

export default function TituloSeccion({ titulo, className = "" }) {
  return (
    <div className="titulo-contenedor">
      <h2 className={`section-title-ad ${className}`}>{titulo}</h2>
    </div>
  );
}
