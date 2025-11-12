// FormularioVerProveedor.jsx
import React from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";

const FormularioVerProveedor = ({ show, close, formData, titulo }) => {
  // Si no hay formData o está vacío, no renderizar el contenido
  if (!formData) {
    return (
      <ModalBase 
        show={show} 
        title={titulo || "Ver Información"} 
        onClose={close}
        footerButtons={
          <button
            onClick={close}
            className="bg-gray-500 text-white font-bold py-2 px-1 rounded hover:bg-gray-600 transition duration-300 w-30 max-w-xs"
          >
            Cerrar
          </button>
        }
      >
        <div className="text-center py-8 text-gray-500">
          No hay información disponible para mostrar
        </div>
      </ModalBase>
    );
  }

  return (
    <ModalBase 
      show={show} 
      title={titulo || "Ver Proveedor"} 
      onClose={close}
      footerButtons={
        <button
          onClick={close}
          className="bg-gray-500 text-white font-bold py-2 px-1 rounded hover:bg-gray-600 transition duration-300 w-30 max-w-xs"
        >
          Cerrar
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.nombreEmpresa || "No especificado"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.nit || "No especificado"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.representante || "No especificado"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto (Email)
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.correo || "No especificado"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.telefono || "No especificado"}
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default FormularioVerProveedor;