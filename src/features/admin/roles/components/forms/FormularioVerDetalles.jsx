import React, { useEffect, useState } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import { GetPermisos } from "../../../../../services/rolService";

const FormularioVerDetallesRol = ({ show, close, rol }) => {
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);

  useEffect(() => {
    const cargarPermisos = async () => {
      try {
        const data = await GetPermisos();
        setPermisosDisponibles(data);
      } catch (error) {
        console.error("Error cargando permisos:", error);
      }
    };

    if (show) {
      cargarPermisos();
    }
  }, [show]);

  const getNombrePermiso = (id) => {
    // Ajustar según si el backend devuelve idPermiso o id
    const permiso = permisosDisponibles.find(p => (p.idPermiso || p.id) === id);
    return permiso ? (permiso.nombrePermiso || permiso.nombre) : `Permiso ID: ${id}`;
  };

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
          {/* ID */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID del Rol
            </label>
            <p className="text-lg font-semibold text-gray-900">{rol?.idRol || "N/A"}</p>
          </div>

          {/* Nombre */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Rol
            </label>
            <p className="text-lg font-semibold text-gray-900">{rol?.nombreRol || "N/A"}</p>
          </div>

          {/* Estado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${rol?.Estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {rol?.Estado ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Permisos */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permisos Asignados
            </label>
            {rol?.Permisos && rol.Permisos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rol.Permisos.map((permisoId, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {getNombrePermiso(permisoId)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Sin permisos asignados</p>
            )}
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