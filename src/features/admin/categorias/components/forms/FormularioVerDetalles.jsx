import React from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase"; // 👈 ajusta la ruta según tu estructura

const FormularioVerDetalles = ({ show, close, categoria }) => {
  return (
    <ModalBase
      show={show}
      title="Detalles de la Categoría"
      icon="mdi:eye-outline"
      onClose={close}
      footerButtons={
        <button className="btn" onClick={close}>
          Cerrar
        </button>
      }
    >
      {categoria ? (
        <div className="detalle-categoria">
          {/* <div className="detalle-item">
            <span className="detalle-label">ID:</span>
            <span className="detalle-valor">{categoria.id}</span>
          </div> */}

          <div className="detalle-item">
            <span className="detalle-label">Nombre:</span>
            <span className="detalle-valor">{categoria.nombreCategoria}</span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Descripción:</span>
            <span className="detalle-valor">{categoria.descripcion}</span>
          </div>

          <div className="detalle-item">
            <span className="detalle-label">Estado:</span>
            <span
              className={`estado-badge ${
                categoria.estado ? "activo" : "inactivo"
              }`}
            >
              {categoria.estado ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* <div className="detalle-item">
            <span className="detalle-label">Fecha de Creación:</span>
            <span className="detalle-valor">{categoria.fechaCreacion}</span>
          </div> */}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No hay datos disponibles para esta categoría.
        </p>
      )}
    </ModalBase>
  );
};

export default FormularioVerDetalles;
