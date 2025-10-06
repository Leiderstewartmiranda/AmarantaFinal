// components/forms/FormularioVerCompra.jsx
import React, { useState, useEffect } from "react";
import { GetDetallesByCompra } from "../../../../../services/compraService";
import { GetProveedores } from "../../../../../services/compraService";

const FormularioVerCompra = ({
  show,
  close,
  compra,
  formatoMoneda,
  descargarFactura,
  proveedores = []
}) => {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && compra) {
      cargarDetalles();
    }
  }, [show, compra]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const detallesData = await GetDetallesByCompra(compra.codigoCompra);
      setDetalles(detallesData);
    } catch (error) {
      console.error("Error cargando detalles:", error);
      setDetalles([]);
    } finally {
      setLoading(false);
    }
  };

  

  const getProveedorNombre = () => {
    const proveedor = proveedores.find(p => p.idProveedor === compra.idProveedor);
    return proveedor?.nombreEmpresa;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Detalles de la Compra #{compra.codigoCompra}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => descargarFactura(compra)}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Descargar PDF
            </button>
            <button
              onClick={close}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg border-b pb-2">Información General</h4>
            <div>
              <span className="font-medium">Código:</span> #{compra.codigoCompra}
            </div>
            <div>
              <span className="font-medium">Fecha:</span> {new Date(compra.fechaCompra).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Proveedor:</span> {getProveedorNombre()}
            </div>
            <div>
              <span className="font-medium">Estado:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                compra.estado === "Anulada" 
                  ? "bg-red-100 text-red-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {compra.estado}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg border-b pb-2">Información de Pago</h4>
            <div>
              <span className="font-medium">Total:</span> {formatoMoneda(compra.precioTotal)}
            </div>
            <div>
              <span className="font-medium">ID Usuario:</span> {compra.idUsuario || "N/A"}
            </div>
          </div>
        </div>

        {/* Detalles de productos */}
        <div>
          <h4 className="font-semibold text-lg border-b pb-2 mb-4">Productos Comprados</h4>
          {loading ? (
            <div className="text-center py-4">Cargando detalles...</div>
          ) : detalles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detalles.map((detalle, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detalle.nombreProducto || `Producto ${detalle.codigoProducto}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detalle.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatoMoneda(detalle.precioUnitario)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {formatoMoneda(detalle.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatoMoneda(compra.precioTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No hay detalles disponibles para esta compra
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioVerCompra;