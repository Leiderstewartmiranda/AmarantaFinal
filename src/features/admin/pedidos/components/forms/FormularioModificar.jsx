import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { productos } from "../../utils/ListaProductos";

const FormularioModificar = ({
  show,
  close,
  formData,
  onSubmit,
  clienteRef,
  direccionRef,
  totalRef,
  correoRef,
  estadoRef,
  abonosRef,
  estadosDisponibles,
  titulo,
  formatearMoneda,
  clientes
}) => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [totalCalculado, setTotalCalculado] = useState(0);

  // Efecto para cargar los datos del pedido cuando se abre el modal
  useEffect(() => {
    if (show && formData) {
      // Encontrar el cliente basado en el nombre completo
      const cliente = clientes.find(c => 
        `${c.Nombre} ${c.Apellido}` === formData.Cliente
      );
      setClienteSeleccionado(cliente);
      
      // Cargar productos del pedido
      if (formData.Productos && formData.Productos.length > 0) {
        setProductosAgregados(formData.Productos);
        calcularTotal(formData.Productos);
      } else {
        setProductosAgregados([]);
        setTotalCalculado(formData.Total || 0);
      }
    }
  }, [show, formData, clientes]);

  // Función para calcular el total
  const calcularTotal = (listaProductos) => {
    const total = listaProductos.reduce((acc, producto) => acc + producto.subtotal, 0);
    setTotalCalculado(total);
  };

  // Función para agregar producto
  const encontrarProducto = (productId) => {
    if (!productId) return;

    const product = productos.find(p => p.id_producto == productId);
    
    if (product) {
      setProductosAgregados(prev => {
        const productoExistente = prev.find(p => p.id_producto === product.id_producto);
        
        if (productoExistente) {
          const nuevaLista = prev.map(p => 
            p.id_producto === product.id_producto 
              ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
              : p
          );
          calcularTotal(nuevaLista);
          return nuevaLista;
        } else {
          const nuevoProducto = { 
            ...product, 
            cantidad: 1, 
            subtotal: product.precio 
          };
          const nuevaLista = [...prev, nuevoProducto];
          calcularTotal(nuevaLista);
          return nuevaLista;
        }
      });
    }
  };

  // Función para eliminar producto
  const eliminarProducto = (productId) => {
    setProductosAgregados(prev => {
      const nuevaLista = prev.filter(p => p.id_producto !== productId);
      calcularTotal(nuevaLista);
      return nuevaLista;
    });
  };

  // Función para cambiar cantidad
  const cambiarCantidad = (productId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productId);
      return;
    }

    setProductosAgregados(prev => {
      const nuevaLista = prev.map(p => 
        p.id_producto === productId 
          ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio }
          : p
      );
      calcularTotal(nuevaLista);
      return nuevaLista;
    });
  };

  // Manejar cambio de cliente
  const handleClienteChange = (e) => {
    const clienteId = parseInt(e.target.value);
    const cliente = clientes.find(c => c.Id_Cliente === clienteId);
    setClienteSeleccionado(cliente);
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!clienteSeleccionado) {
      alert("Por favor selecciona un cliente");
      return;
    }

    // Crear objeto con datos actualizados
    const datosActualizados = {
      ...formData,
      Cliente: `${clienteSeleccionado.Nombre} ${clienteSeleccionado.Apellido}`,
      Id_Cliente: clienteSeleccionado.Id_Cliente,
      Correo: clienteSeleccionado.Correo,
      Direccion: direccionRef.current.value,
      Total: totalCalculado,
      Estado: estadoRef.current.value,
      Abonos: parseFloat(abonosRef.current.value) || 0,
      Productos: productosAgregados
    };

    onSubmit(e, datosActualizados);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <Icon icon="material-symbols:close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                ref={clienteRef}
                value={clienteSeleccionado?.Id_Cliente || ""}
                onChange={handleClienteChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.Id_Cliente} value={cliente.Id_Cliente}>
                    {cliente.Nombre} {cliente.Apellido} - {cliente.Documento}
                  </option>
                ))}
              </select>
            </div>

            {/* Correo (automático) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                ref={correoRef}
                type="email"
                value={clienteSeleccionado?.Correo || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                ref={direccionRef}
                type="text"
                defaultValue={formData.Direccion}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección de entrega"
                required
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                ref={estadoRef}
                defaultValue={formData.Estado}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {estadosDisponibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Abonos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abonos
              </label>
              <input
                ref={abonosRef}
                type="number"
                min="0"
                step="1000"
                defaultValue={formData.Abonos}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Total (calculado automáticamente) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <input
                ref={totalRef}
                type="text"
                value={formatearMoneda(totalCalculado)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>
          </div>

          {/* Sección de productos */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Productos</h3>
            
            {/* Selector de productos */}
            <div className="flex gap-2 mb-4">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => encontrarProducto(e.target.value)}
                defaultValue=""
              >
                <option value="">Seleccionar producto</option>
                {productos.map((producto) => (
                  <option key={producto.id_producto} value={producto.id_producto}>
                    {producto.nombre} - {formatearMoneda(producto.precio)}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de productos agregados */}
            {productosAgregados.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Productos agregados:</h4>
                <div className="space-y-2">
                  {productosAgregados.map((producto) => (
                    <div
                      key={producto.id_producto}
                      className="flex items-center justify-between bg-white p-3 rounded border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatearMoneda(producto.precio)} c/u
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(producto.id_producto, producto.cantidad - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800"
                          >
                            <Icon icon="material-symbols:remove" />
                          </button>
                          
                          <span className="w-12 text-center font-medium">
                            {producto.cantidad}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(producto.id_producto, producto.cantidad + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800"
                          >
                            <Icon icon="material-symbols:add" />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[100px]">
                          <div className="font-medium text-gray-800">
                            {formatearMoneda(producto.subtotal)}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => eliminarProducto(producto.id_producto)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar producto"
                        >
                          <Icon icon="tabler:trash" width="20" height="20" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                    <span>Total:</span>
                    <span>{formatearMoneda(totalCalculado)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioModificar;