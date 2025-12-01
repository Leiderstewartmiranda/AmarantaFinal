import React, { useEffect, useState } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import { GetPedidoById } from "../../../../../services/pedidoService";
import { GetClienteById } from "../../../../../services/clienteService";

const FormularioVer = ({ show, close, codigoPedido, titulo, formatearMoneda }) => {
  const [pedido, setPedido] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && codigoPedido) {
      cargarDatosPedido(codigoPedido);
    }
  }, [show, codigoPedido]);

  const cargarDatosPedido = async (id) => {
    try {
      setLoading(true);
      const pedidoData = await GetPedidoById(id);
      setPedido(pedidoData);

      const clienteId = pedidoData?.idCliente || pedidoData?.IdCliente;
      if (clienteId) {
        const clienteData = await GetClienteById(clienteId);
        setCliente(clienteData);
      } else {
        setCliente(null);
      }
    } catch (error) {
      console.error("Error cargando datos del pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <ModalBase show={show} setShow={close} title={titulo} onClose={close}>
      {loading ? (
        <div className="p-6 text-center text-gray-600">Cargando detalles del pedido...</div>
      ) : pedido ? (
        <div className="p-6 space-y-5">
          {/* 🧾 Información del pedido */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Información del Pedido</h3>
            <p><strong>Código:</strong> {pedido.codigoPedido || pedido.CodigoPedido}</p>
            <p><strong>Fecha:</strong> {new Date(pedido.fechaPedido || pedido.FechaPedido).toLocaleDateString("es-CO")}</p>
            <p><strong>Estado:</strong> {pedido.estado || pedido.Estado}</p>
            <p><strong>Total:</strong> {formatearMoneda(pedido.precioTotal || pedido.PrecioTotal)}</p>
          </div>

          {/* 👤 Información del cliente */}
          {cliente ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Información del Cliente</h3>
              <p><strong>Nombre:</strong> {cliente.nombre || cliente.Nombre} {cliente.apellido || cliente.Apellido}</p>
              <p><strong>Documento:</strong> {cliente.documento || cliente.Documento}</p>
              <p><strong>Correo:</strong> {cliente.correo || cliente.Correo}</p>
              <p><strong>Teléfono:</strong> {cliente.telefono || cliente.Telefono}</p>
              <p><strong>Dirección:</strong> {cliente.direccion || cliente.Direccion}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-700">
              No se encontró información del cliente.
            </div>
          )}

          {/* 🧾 Comprobante de Transferencia */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Comprobante de Pago</h3>
            {pedido.factu || pedido.Factu ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={pedido.factu || pedido.Factu}
                  alt="Comprobante de Transferencia"
                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-300"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
                <a
                  href={pedido.factu || pedido.Factu}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                >
                  Ver imagen en tamaño completo
                </a>
              </div>
            ) : (
              <div className="bg-yellow-100 p-3 rounded text-yellow-800 text-sm border border-yellow-200">
                ⚠️ No hay comprobante de transferencia adjunto en este pedido.
              </div>
            )}
          </div>

          {/* 📦 Detalles del pedido */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Productos del Pedido</h3>
            {pedido.detalles && pedido.detalles.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b">
                    <th className="py-2 px-3 text-left">Producto</th>
                    <th className="py-2 px-3 text-center">Cantidad</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles.map((detalle, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{detalle.nombreProducto || detalle.NombreProducto || `Producto #${index + 1}`}</td>
                      <td className="py-2 px-3 text-center">{detalle.cantidad || detalle.Cantidad}</td>
                      <td className="py-2 px-3 text-right">
                        {formatearMoneda(detalle.subtotal || detalle.Subtotal || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No hay productos registrados en este pedido.</p>
            )}
          </div>

          {/* 🔘 Botón cerrar */}
          <div className="flex justify-end pt-4">
            <button
              onClick={close}
              className="bg-gray-500 text-white font-bold py-2 px-1 rounded hover:bg-gray-600 transition duration-300 w-30 max-w-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-600">No se encontró el pedido.</div>
      )}
    </ModalBase>
  );
};

export default FormularioVer;
