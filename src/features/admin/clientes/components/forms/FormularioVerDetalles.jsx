import React from "react";

const FormularioVerDetalles = ({
  show,
  close,
  cliente,
  titulo = "Detalles del Cliente",
}) => {
  if (!cliente) return null;

  return (
    <>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-md p-6 w-full max-w-2xl mx-4 overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{titulo}</h2>
            
            <div className="bg-white shadow-md rounded p-4">
              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium">Tipo Documento</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                    {cliente.TipoDocumento}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium">Número de Documento</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                    {cliente.Documento}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Nombre Completo</label>
                <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                  {cliente.NombreCompleto}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium">Correo Electrónico</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                    {cliente.Correo}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium">Teléfono</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                    {cliente.Telefono}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Dirección</label>
                <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                  {cliente.Direccion || "No especificada"}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Estado</label>
                <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cliente.Estado === "Activo" ? "bg-green-100 text-green-800" :
                    cliente.Estado === "Inactivo" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {cliente.Estado}
                  </span>
                </p>
              </div>

              {/* Botón de cerrar */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={close}
                  type="button"
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full max-w-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormularioVerDetalles;