import React, { useEffect } from "react";
import ModalBase from "../../../.././../compartidos/modal/modalbase";

const FormularioModificarRol = ({ show, close, rol, onSubmit, nombreRef }) => {
  useEffect(() => {
    if (rol && nombreRef.current) {
      nombreRef.current.value = rol.nombreRol || "";
    }
  }, [rol, nombreRef]);

  const footerButtons = (
    <div className="flex justify-end gap-3 w-full">
      <button
        type="button"
        onClick={close}
        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="form-modificar-rol"
        className="px-4 py-2 text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors font-medium"
      >
        Guardar Cambios
      </button>
    </div>
  );

  return (
    <ModalBase
      show={show}
      title="Modificar Rol"
      icon="mdi:account-edit"
      onClose={close}
      footerButtons={footerButtons}
    >
      <form id="form-modificar-rol" onSubmit={onSubmit} className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            <strong>ID del Rol:</strong> {rol?.idRol || "N/A"}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="nombreRolEdit" className="block text-sm font-medium text-gray-700">
            Nombre del Rol *
          </label>
          <input
            ref={nombreRef}
            id="nombreRolEdit"
            type="text"
            placeholder="Ej: Administrador, Vendedor, Cliente"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
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

export default FormularioModificarRol;