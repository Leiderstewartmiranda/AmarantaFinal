import { useRef, useState } from "react";

const FormularioAgregarProducto = ({
  show,
  setShow,
  onSubmit,
  nombreRef,
  categoriaRef,
  precioRef,
  stockRef,
  descripcionRef,
  proveedorRef,
  categorias,
  proveedores
}) => {
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [mostrarOpcionesProveedor, setMostrarOpcionesProveedor] = useState(false);
  
  if (!show) return null;

  // Filtrar proveedores según búsqueda
  const proveedoresFiltrados = proveedores.filter(proveedor =>
    proveedor.toLowerCase().includes(busquedaProveedor.toLowerCase())
  );

  const seleccionarProveedor = (proveedor) => {
    proveedorRef.current.value = proveedor;
    setBusquedaProveedor(proveedor);
    setMostrarOpcionesProveedor(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Agregar Producto</h3>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              ref={nombreRef}
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del producto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              ref={categoriaRef}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio *
            </label>
            <input
              ref={precioRef}
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Precio"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock *
            </label>
            <input
              ref={stockRef}
              type="number"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cantidad en stock"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              ref={descripcionRef}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del producto"
            ></textarea>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <input
              ref={proveedorRef}
              type="text"
              value={busquedaProveedor}
              onChange={(e) => {
                setBusquedaProveedor(e.target.value);
                setMostrarOpcionesProveedor(true);
              }}
              onFocus={() => setMostrarOpcionesProveedor(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar o ingresar proveedor"
            />
            
            {mostrarOpcionesProveedor && proveedoresFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {proveedoresFiltrados.map((proveedor, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => seleccionarProveedor(proveedor)}
                  >
                    {proveedor}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAgregarProducto;