import { useState, useEffect } from "react";
import { ActualizarProducto } from "../../../../../services/productoService";

const FormularioModificarProducto = ({
  show,
  close,
  producto,
  setListaProductos,
  listaProductos,
  categorias = []
}) => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [estado, setEstado] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [errores, setErrores] = useState({});
  const [updateFlag, setUpdateFlag] = useState(false);

  // Cargar datos del producto seleccionado al abrir el modal
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombreProducto || "");
      setCategoria(producto.idCategoria || 0);
      setPrecio(producto.precio || 0);
      setStock(producto.stock || 0);
      setEstado(producto.estado || false);
      setImagen(null); // Imagen nueva opcional
      setErrores({});
    }
  }, [producto]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/; // solo letras y espacios
    let newErrores = {};

    if (!nombre.trim()) newErrores.nombre = "El nombre es obligatorio";
    else if (!regexLetras.test(nombre.trim())) newErrores.nombre = "El nombre contiene caracteres no permitidos";
    else if (nombre.trim().length < 3) newErrores.nombre = "El nombre debe tener al menos 3 caracteres";

    if (!categoria) newErrores.categoria = "Selecciona una categoría";

    if (!precio || precio <= 0) newErrores.precio = "El precio debe ser positivo";
    if (!stock || stock < 0) newErrores.stock = "El stock debe ser igual o mayor a 0";

    if (imagen && !["image/jpeg", "image/png"].includes(imagen.type))
      newErrores.imagen = "La imagen debe ser JPG o PNG";
    if (imagen && imagen.size > 2 * 1024 * 1024)
      newErrores.imagen = "La imagen no debe superar los 2MB";

    if (Object.keys(newErrores).length > 0) {
      setErrores(newErrores);
      return;
    }

    try {
      const productoEditado = {
        NombreProducto: nombre,
        IdCategoria: parseInt(categoria),
        Precio: parseFloat(precio),
        Stock: parseInt(stock),
        Imagen: imagen, // archivo opcional
        Estado: estado
      };

      const actualizado = await ActualizarProducto(producto.codigoProducto, productoEditado);

      setListaProductos(prev =>
        prev.map(p =>
          p.codigoProducto === producto.codigoProducto
            ? { ...p, ...productoEditado }
            : p
        )
      );
      
      setUpdateFlag(!updateFlag); // Forzar re-render si es necesario
      

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
          <button onClick={close} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre || ""}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.nombre && <span className="text-red-500 text-sm mt-1">{errores.nombre}</span>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              value={categoria || ""}
              onChange={(e) => setCategoria(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores.categoria ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombreCategoria}</option>
              ))}
            </select>
            {errores.categoria && <span className="text-red-500 text-sm mt-1">{errores.categoria}</span>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <input
              type="number"
              min="1"
              value={precio || 0}
              onChange={(e) => setPrecio(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores.precio ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.precio && <span className="text-red-500 text-sm mt-1">{errores.precio}</span>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input
              type="number"
              min="0"
              value={stock || 0}
              onChange={(e) => setStock(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores.stock ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.stock && <span className="text-red-500 text-sm mt-1">{errores.stock}</span>}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} className="w-full" />
            {errores.imagen && <span className="text-red-500 text-sm mt-1">{errores.imagen}</span>}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">{estado ? "Activo" : "Inactivo"}</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={close} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioModificarProducto;
