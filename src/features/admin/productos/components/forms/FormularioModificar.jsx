import { useState } from "react";
import { ActualizarProducto } from "../../../../../services/productoService";

const FormularioModificarProducto = ({
  show,
  close,
  producto,
  setListaProductos,
  categorias = []
}) => {
  const [nombre, setNombre] = useState(producto?.nombreProducto || "");
  const [categoria, setCategoria] = useState(producto?.idCategoria || "");
  const [precio, setPrecio] = useState(producto?.precio || 0);
  const [stock, setStock] = useState(producto?.stock || 0);
  const [estado, setEstado] = useState(producto?.estado || false);
  const [imagen, setImagen] = useState(null);

  if (!show) return null; // no renderizar si está oculto

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productoEditado = {
        NombreProducto: nombre,
        Precio: parseFloat(precio),
        Stock: parseInt(stock),
        IdCategoria: parseInt(categoria),
        Imagen: imagen, // archivo (si seleccionaste uno nuevo)
        Estado: estado
      };

      const actualizado = await ActualizarProducto(producto.codigoProducto, productoEditado);

      // actualizar lista local
      setListaProductos((prev) =>
        prev.map((p) =>
          p.codigoProducto === actualizado.codigoProducto ? actualizado : p
        )
      );

      close();
    } catch (error) {
      console.error("❌ Error editando producto:", error);
      alert("Hubo un error al editar el producto");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Producto</h3>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nombreCategoria}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio *
            </label>
            <input
              type="number"
              min="1"
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
              className="w-full"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={estado}
                onChange={(e) => setEstado(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {estado ? "Activo" : "Inactivo"}
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioModificarProducto;
