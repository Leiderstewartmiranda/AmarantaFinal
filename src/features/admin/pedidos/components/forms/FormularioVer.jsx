import React, { useEffect, useState } from "react";
import { GetPedidoById, GetProductos } from "../../../../../services/pedidoService";

const FormularioVer = ({
  show,
  close,
  codigoPedido,
  titulo = "Detalles del Pedido",
  formatearMoneda
}) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && codigoPedido) {
      cargarDatosPedido(codigoPedido);
    } else if (show) {
      setError("No se proporcionó un ID de pedido válido");
    }
  }, [show, codigoPedido]);

  const cargarDatosPedido = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Cargando pedido ID:", id);
      
      const pedido = await GetPedidoById(id);
      console.log("✅ Pedido obtenido:", pedido);

      // Mapear según la estructura de tu PedidoResponseDTO
      const productosMapeados = (pedido.detalles || pedido.Detalles || []).map((d, index) => {
        const precio = d.precioUnitario || d.PrecioUnitario || 0;
        const cantidad = d.cantidad || d.Cantidad || 0;
        const subtotal = d.subtotal || d.Subtotal || precio * cantidad;
        
        return {
          id_producto: d.codigoProducto || d.CodigoProducto || index,
          nombre: d.nombreProducto || d.NombreProducto || "Producto sin nombre",
          precio: precio,
          cantidad: cantidad,
          subtotal: subtotal
        };
      });

      const totalPedido = productosMapeados.reduce((acc, p) => acc + p.subtotal, 0);

      setFormData({
        Id_Pedido: pedido.codigoPedido || pedido.CodigoPedido,
        Cliente: pedido.nombreCliente || pedido.NombreCliente || "Cliente no disponible",
        Correo: "", // Tu DTO no incluye correo
        Direccion: "Dirección no disponible", // Tu DTO no incluye dirección
        Estado: pedido.estado || pedido.Estado || "Pendiente",
        Total: totalPedido,
        Productos: productosMapeados,
        FechaPedido: pedido.fechaPedido || pedido.FechaPedido
      });

    } catch (error) {
      console.error("❌ Error cargando pedido:", error);
      setError(`Error al cargar el pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En Proceso": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completado": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!show) return null;

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-80 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        Cargando detalles del pedido...
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-80 text-center">
        <div className="text-red-500 text-lg mb-4">❌</div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={close}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  if (!formData) return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-80 text-center">
        <p className="text-gray-700">No se pudieron cargar los datos del pedido</p>
      </div>
    </div>
  );


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-full max-w-4xl mx-4 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">ID: #{formData.Id_Pedido}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(formData.Estado)}`}>
              {formData.Estado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Información del Cliente
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cliente</label>
              <p className="text-lg font-semibold text-gray-800">{formData.Cliente}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha del Pedido</label>
              <p className="text-gray-800">
                {formData.FechaPedido ? new Date(formData.FechaPedido).toLocaleDateString('es-CO') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Información Financiera</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Total del Pedido</label>
                <p className="text-lg font-bold text-green-600">
                  {formatearMoneda ? formatearMoneda(formData.Total) : formData.Total}
                </p>
              </div>
              
            </div>
          </div>
        </div>

        {/* Productos del Pedido */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Productos del Pedido ({formData.Productos?.length || 0})
          </h3>

          {formData.Productos && formData.Productos.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.Productos.map((producto, index) => (
                  <div key={producto.id_producto || index} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{producto.nombre}</div>
                      <div className="text-sm text-gray-600">
                        {formatearMoneda ? formatearMoneda(producto.precio) : producto.precio} c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <span className="text-sm text-gray-500 block">Cantidad</span>
                        <span className="font-semibold text-gray-800">{producto.cantidad}</span>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm text-gray-500 block">Subtotal</span>
                        <span className="font-bold text-green-600">
                          {formatearMoneda ? formatearMoneda(producto.subtotal) : producto.subtotal}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                  Total de productos: {formData.Productos.reduce((acc, prod) => acc + prod.cantidad, 0)}
                </span>
                <span className="font-bold text-lg text-green-600">
                  {formatearMoneda ? formatearMoneda(formData.Total) : formData.Total}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 italic">No hay productos registrados para este pedido</p>
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
  );
};

export default FormularioVer;