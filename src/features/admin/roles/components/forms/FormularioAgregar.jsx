import React, { useState } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";

const FormularioAgregarRol = ({ show, setShow, onSubmit, permisosDisponibles = [] }) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [estado, setEstado] = useState(true); // Default Activo
  const [nombreRol, setNombreRol] = useState("");

  const handleClose = () => {
    setShow(false);
    setPermisosSeleccionados([]);
    setEstado(true);
    setNombreRol("");
  };

  const handlePermisoChange = (permisoId) => {
    setPermisosSeleccionados(prev => {
      if (prev.includes(permisoId)) {
        return prev.filter(id => id !== permisoId);
      } else {
        return [...prev, permisoId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombreRol,
      permisos: permisosSeleccionados,
      estado
    });
    // Reset form handled by parent or on close
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
      <form id="form-agregar-rol" onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del Rol */}
        <div className="space-y-2">
          <label htmlFor="nombreRol" className="block text-sm font-medium text-gray-700">
            Nombre del Rol *
          </label>
          <input
            id="nombreRol"
            type="text"
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
            placeholder="Ej: Administrador, Vendedor, Cliente"
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            required
            maxLength={50}
          />
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!estado ? "font-bold text-gray-700" : "text-gray-500"}`}>Inactivo</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={estado}
                onChange={() => setEstado(!estado)}
              />
              <div className={`w-11 h-6 rounded-full peer ${estado ? "bg-green-500" : "bg-gray-300"} peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors`}>
                <div className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${estado ? "transform translate-x-5" : ""}`}></div>
              </div>
            </label>
            <span className={`text-sm ${estado ? "font-bold text-green-700" : "text-gray-500"}`}>Activo</span>
          </div>
        </div>

        {/* Permisos */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Permisos del Rol
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
            {permisosDisponibles.map((permiso) => (
              <label key={permiso.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={permisosSeleccionados.includes(permiso.id)}
                  onChange={() => handlePermisoChange(permiso.id)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{permiso.nombre}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">Selecciona los módulos a los que tendrá acceso este rol.</p>
        </div>

        <div className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
          <p>• El nombre debe tener entre 2 y 50 caracteres</p>
          <p>• Solo se permiten letras y espacios</p>
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioAgregarRol;