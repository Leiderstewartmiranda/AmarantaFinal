import React from "react";
import { productos } from "../../utils/ListaProductos";

const FormularioAgregar = ({
  show,
  setShow,
  onSubmit,
  clienteRef,
  direccionRef,
  totalRef,
  productosRef,
  encontrarProducto,
  productosAgregados,
  totalCalculado,
  eliminarProducto,
  cambiarCantidad,
  limpiarProductos,
  correoRef,
  estadoRef,
  abonosRef,
  estadosDisponibles,
  titulo = "Agregar Nuevo Pedido",
  formatearMoneda,
  // Nuevas props para manejo de clientes
  clientes = [],
  clienteSeleccionado,
  onClienteChange
}) => {
  
  // Función para manejar el cambio de cliente
  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    const cliente = clientes.find(c => c.Id_Cliente.toString() === clienteId);
    
    if (cliente && onClienteChange) {
      onClienteChange(cliente);
      // Auto-llenar el correo si está disponible
      if (correoRef.current) {
        correoRef.current.value = cliente.Correo || '';
      }
    } else if (onClienteChange) {
      onClienteChange(null);
      if (correoRef.current) {
        correoRef.current.value = '';
      }
    }
  };

  return (
    <>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-md p-6 w-full max-w-2xl mx-4 overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{titulo}</h2>
            <form
              onSubmit={onSubmit}
              className="bg-white shadow-md rounded p-4"
            >
              
              {/* Cliente y Correo en la misma fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Cliente */}
                <div>
                  <label className="block text-gray-700 font-medium">Cliente *</label>
                  <select
                    ref={clienteRef}
                    onChange={handleClienteChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none bg-white"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.Id_Cliente} value={cliente.Id_Cliente}>
                        {cliente.Nombre} {cliente.Apellido} - {cliente.Documento}
                      </option>
                    ))}
                  </select>
                  {clientes.length === 0 && (
                    <small className="text-red-500 text-sm mt-1 block">
                      No hay clientes disponibles. Primero debes agregar clientes en la sección de Clientes.
                    </small>
                  )}
                </div>

                {/* Correo (auto-llenado) */}
                <div>
                  <label className="block text-gray-700 font-medium">Correo *</label>
                  <input
                    type="email"
                    ref={correoRef}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none bg-gray-50"
                    placeholder="Se auto-completa al seleccionar cliente"
                    required
                    readOnly
                  />
                  <small className="text-gray-500 text-sm">
                    Auto-completado
                  </small>
                </div>
              </div>

              {/* Información del cliente seleccionado */}
              {clienteSeleccionado && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800 mb-2">Contacto del cliente :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Teléfono:</strong> {clienteSeleccionado.Telefono}</div>
                  </div>
                </div>
              )}

              {/* Dirección */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Dirección de Entrega *</label>
                <textarea
                  ref={direccionRef}
                  className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Dirección completa de entrega"
                  required
                />
              </div>

              {/* Productos */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Productos *</label>
                <div className="flex gap-2 mb-3">
                  <select
                    ref={productosRef}
                    className="flex-1 border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none bg-white"
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((P) => (
                      <option key={P.id_producto} value={P.id_producto}>
                        {P.nombre} - {formatearMoneda ? formatearMoneda(P.precio) : P.precio}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={encontrarProducto}
                    className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
                  >
                    Agregar
                  </button>
                </div>

                {/* Lista de productos agregados */}
                {productosAgregados.length > 0 && (
                  <div className="border border-gray-300 rounded p-3 bg-gray-50 max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">Productos en el pedido:</h4>
                      <button
                        type="button"
                        onClick={limpiarProductos}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Limpiar todo
                      </button>
                    </div>
                    <div className="space-y-2">
                      {productosAgregados.map((producto) => (
                        <div
                          key={producto.id_producto}
                          className="flex items-center justify-between bg-white p-2 rounded border"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{producto.nombre}</div>
                            <div className="text-xs text-gray-600">
                              {formatearMoneda ? formatearMoneda(producto.precio) : producto.precio} c/u
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => cambiarCantidad(producto.id_producto, producto.cantidad - 1)}
                              className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {producto.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => cambiarCantidad(producto.id_producto, producto.cantidad + 1)}
                              className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <div className="ml-3 text-sm font-medium w-20 text-right">
                            {formatearMoneda ? formatearMoneda(producto.subtotal) : producto.subtotal}
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarProducto(producto.id_producto)}
                            className="ml-2 text-red-600 hover:text-red-800 w-6 h-6 flex items-center justify-center"
                            title="Eliminar producto"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Total */}
                    <div className="mt-3 pt-2 border-t border-gray-300">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">
                          {formatearMoneda ? formatearMoneda(totalCalculado) : totalCalculado}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">Estado *</label>
                  <select
                    ref={estadoRef}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none bg-white"
                    required
                  >
                    <option value="">Seleccionar estado</option>
                    {estadosDisponibles.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Abonos */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">Abonos</label>
                  <input
                    type="number"
                    ref={abonosRef}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none"
                    placeholder="Valor abonado (opcional)"
                    min="0"
                    step="100"
                    defaultValue="0"
                  />
                  <small className="text-gray-500">Si no hay abonos, dejar en 0</small>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-evenly gap-3 mt-6">
                <button
                  type="submit"
                  disabled={productosAgregados.length === 0 || !clienteSeleccionado}
                  className={`font-bold py-2 px-4 rounded transition duration-300 flex-1 ${
                    productosAgregados.length === 0 || !clienteSeleccionado
                      ? 'bg-[var(--naranjado)] text-white cursor-not-allowed'
                      : 'bg-[var(--naranjado)] text-white hover:bg-orange-600'
                  }`}
                >
                  Agregar Pedido
                </button>
                <button
                  onClick={() => setShow(false)}
                  type="button"
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FormularioAgregar;