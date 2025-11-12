import React from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";

const FormularioAgregarRol = ({ show, setShow, onSubmit, nombreRef }) => {
  const handleClose = () => {
    setShow(false);
  };

  const footerButtons = (
    <div className="flex justify-end gap-3 w-full">
      <button
        type="button"
        onClick={handleClose}
        className="btn btn-secondary"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="form-agregar-rol"
        className="btn"
      >
        Agregar Rol
      </button>
    </div>
  );

  return (
    <ModalBase
      show={show}
      title="Agregar Nuevo Rol"
      icon="mdi:account-key"
      onClose={handleClose}
      footerButtons={footerButtons}
    >
      <form id="form-agregar-rol" onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="nombreRol" className="block text-sm font-medium text-gray-700">
            Nombre del Rol *
          </label>
          <input
            ref={nombreRef}
            id="nombreRol"
            type="text"
            placeholder="Ej: Administrador, Vendedor, Cliente"
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            required
            maxLength={50}
          />
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          <p>• El nombre debe tener entre 2 y 50 caracteres</p>
          <p>• Solo se permiten letras y espacios</p>
          <p>• No se permiten caracteres especiales</p>
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioAgregarRol;