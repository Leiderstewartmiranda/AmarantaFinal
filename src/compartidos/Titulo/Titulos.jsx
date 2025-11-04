import React from "react";
import "./titulo.css";

export default function TituloSeccion({ titulo}) {
  return (
    <div className="titulo-contenedor">
      <h2 className="section-title-ad">{titulo}</h2>
    </div>
  );
}
