import React from "react";

const FormularioVer = ({
  show,
  close,
  formData,
  titulo = "Detalles del Pedido",
  formatearMoneda
}) => {
  if (!show) return null;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const saldoPendiente = (formData?.Total || 0) - (formData?.Abonos || 0);

  return (
    <>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-md p-6 w-full max-w-4xl mx-4 overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{titulo}</h2>
              <span className="text-sm text-gray-500">
                ID: #{formData?.Id_Pedido}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información del Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Información del Cliente
                </h3>
                
                {/* Cliente */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Cliente
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {formData?.Cliente || "N/A"}
                  </p>
                </div>

                {/* Correo */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Correo Electrónico
                  </label>
                  <p className="text-gray-800">
                    <a 
                      href={`mailto:${formData?.Correo}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {formData?.Correo || "N/A"}
                    </a>
                  </p>
                </div>

                {/* Dirección */}
                <div className="border-l-4 border-green-500 pl-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Dirección de Entrega
                  </label>
                  <p className="text-gray-800 leading-relaxed">
                    {formData?.Direccion || "N/A"}
                  </p>
                </div>

                {/* Estado */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Estado del Pedido
                  </label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(formData?.Estado)}`}>
                    {formData?.Estado || "N/A"}
                  </span>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Información Financiera
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Total del Pedido
                      </label>
                      <p className="text-lg font-bold text-green-600">
                        {formatearMoneda ? formatearMoneda(formData?.Total || 0) : `${formData?.Total || 0}`}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Total Abonado
                      </label>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatearMoneda ? formatearMoneda(formData?.Abonos || 0) : `${formData?.Abonos || 0}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <label className="block text-sm font-medium text-gray-600">
                      Saldo Pendiente
                    </label>
                    <p className={`text-lg font-bold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatearMoneda ? formatearMoneda(saldoPendiente) : `${saldoPendiente}`}
                    </p>
                    {saldoPendiente === 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Pedido completamente pagado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Productos del Pedido */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                Productos del Pedido
              </h3>
              
              {formData?.Productos && formData.Productos.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.Productos.map((producto, index) => (
                      <div
                        key={producto.id_producto || index}
                        className="flex items-center justify-between bg-white p-3 rounded border shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {producto.nombre}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatearMoneda ? formatearMoneda(producto.precio) : `${producto.precio}`} c/u
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <span className="text-sm text-gray-500 block">Cantidad</span>
                            <span className="font-semibold text-gray-800">
                              {producto.cantidad}
                            </span>
                          </div>
                          
                          <div className="text-right min-w-[80px]">
                            <span className="text-sm text-gray-500 block">Subtotal</span>
                            <span className="font-bold text-green-600">
                              {formatearMoneda ? formatearMoneda(producto.subtotal || (producto.precio * producto.cantidad)) : `${producto.subtotal || (producto.precio * producto.cantidad)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total de productos */}
                  <div className="mt-4 pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Total de productos: {formData.Productos.reduce((acc, prod) => acc + prod.cantidad, 0)}
                      </span>
                      <span className="font-bold text-lg text-green-600">
                        {formatearMoneda ? formatearMoneda(formData.Total) : `${formData.Total}`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500 italic">
                    No hay productos registrados para este pedido
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6 pt-4 border-t">
              <button
                onClick={close}
                type="button"
                className="bg-gray-500 text-white font-bold py-2 px-6 rounded hover:bg-gray-600 transition duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormularioVer;