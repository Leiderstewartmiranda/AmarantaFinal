import React from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";;

const FormularioVerDetallesRol = ({ show, close, rol }) => {
  const footerButtons = (
    <div className="flex justify-end w-full">
      <button
        onClick={close}
        className="bg-gray-500 text-white font-bold py-2 px-1 rounded hover:bg-gray-600 transition duration-300 w-30 max-w-xs"
      >
        Cerrar
      </button>
    </div>
  );

  return (
    <ModalBase
      show={show}
      title="Detalles del Rol"
      icon="mdi:account-details"
      onClose={close}
      footerButtons={footerButtons}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID del Rol
            </label>
            <p className="text-lg font-semibold text-gray-900">{rol?.idRol || "N/A"}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Rol
            </label>
            <p className="text-lg font-semibold text-gray-900">{rol?.nombreRol || "N/A"}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-700">
            <strong>Información:</strong> Los roles definen los permisos y acceso a funcionalidades del sistema.
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default FormularioVerDetallesRol;