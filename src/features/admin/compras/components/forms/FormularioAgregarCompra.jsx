import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useRef, useEffect } from "react";

const FormularioAgregarCompra = ({
  show,
  setShow,
  onSubmit,
  fechaRef,
  proveedorRef,
  totalRef,
  estadoRef,
  idClienteRef,
  listaClientes,
  listaProveedores // Nuevo prop para la lista de proveedores
}) => {
  if (!show) return null;

  // Estados para las búsquedas
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [mostrarOpcionesCliente, setMostrarOpcionesCliente] = useState(false);
  const [mostrarOpcionesProveedor, setMostrarOpcionesProveedor] = useState(false);

  // Referencias para los inputs de búsqueda
  const clienteSearchRef = useRef();
  const proveedorSearchRef = useRef();

  // Filtrar clientes basado en la búsqueda
  const clientesFiltrados = listaClientes.filter(cliente =>
    cliente.Nombre.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  // Filtrar proveedores basado en la búsqueda
  const proveedoresFiltrados = listaProveedores.filter(proveedor =>
    proveedor.Nombre.toLowerCase().includes(busquedaProveedor.toLowerCase())
  );

  // Manejar selección de cliente
  const seleccionarCliente = (cliente) => {
    idClienteRef.current.value = cliente.Id_Cliente;
    setBusquedaCliente(cliente.Nombre);
    setMostrarOpcionesCliente(false);
  };

  // Manejar selección de proveedor
  const seleccionarProveedor = (proveedor) => {
    proveedorRef.current.value = proveedor.Nombre;
    setBusquedaProveedor(proveedor.Nombre);
    setMostrarOpcionesProveedor(false);
  };

  // Efecto para resetear los campos cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setBusquedaCliente("");
      setBusquedaProveedor("");
      setMostrarOpcionesCliente(false);
      setMostrarOpcionesProveedor(false);
    }
  }, [show]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Registrar Nueva Compra</h3>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="material-symbols:close" width="24" height="24" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Compra
            </label>
            <input
              type="date"
              ref={fechaRef}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <input
              type="text"
              ref={proveedorSearchRef}
              value={busquedaProveedor}
              onChange={(e) => {
                setBusquedaProveedor(e.target.value);
                setMostrarOpcionesProveedor(true);
              }}
              onFocus={() => setMostrarOpcionesProveedor(true)}
              onBlur={() => setTimeout(() => setMostrarOpcionesProveedor(false), 200)}
              placeholder="Buscar proveedor..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="hidden"
              ref={proveedorRef}
              required
            />
            {mostrarOpcionesProveedor && proveedoresFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {proveedoresFiltrados.map(proveedor => (
                  <div
                    key={proveedor.Id_Proveedor}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => seleccionarProveedor(proveedor)}
                  >
                    {proveedor.Nombre}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total de la Compra
            </label>
            <input
              type="number"
              step="0.01"
              ref={totalRef}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              ref={estadoRef}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar estado</option>
              <option value="Completado">Completado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente Asociado
            </label>
            <input
              type="text"
              ref={clienteSearchRef}
              value={busquedaCliente}
              onChange={(e) => {
                setBusquedaCliente(e.target.value);
                setMostrarOpcionesCliente(true);
              }}
              onFocus={() => setMostrarOpcionesCliente(true)}
              onBlur={() => setTimeout(() => setMostrarOpcionesCliente(false), 200)}
              placeholder="Buscar cliente..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="hidden"
              ref={idClienteRef}
              required
            />
            {mostrarOpcionesCliente && clientesFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.Id_Cliente}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => seleccionarCliente(cliente)}
                  >
                    {cliente.Nombre}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Registrar Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAgregarCompra;