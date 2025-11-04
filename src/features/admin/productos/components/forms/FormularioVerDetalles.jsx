import React from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase"; // 👈 ajusta la ruta según tu estructura
import { Icon } from "@iconify/react";

const FormularioVerDetallesProducto = ({ show, close, producto, categorias = [] }) => {
  if (!producto) return null;

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const getStockClass = (stock) => {
    if (stock <= 5) return "text-red-600 font-semibold";
    if (stock <= 15) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const nombreCategoria =
    categorias.find(
      (cat) => Number(cat.idCategoria) === Number(producto?.idCategoria)
    )?.nombreCategoria || "Sin categoría";

  return (
    <ModalBase show={show} setShow={close} titulo="Detalles del Producto">
      <div className="space-y-5">
        {/* Imagen del producto */}
        {producto.imagen ? (
          <div className="flex justify-center">
            <img
              src={producto.imagen}
              alt={producto.nombreProducto}
              className="w-48 h-48 object-cover rounded-lg shadow-md border border-gray-200"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 text-gray-400">
              <Icon icon="mdi:image-off-outline" className="text-5xl" />
            </div>
          </div>
        )}

        {/* Información del producto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          <div>
            <span className="block text-gray-500 font-medium">Nombre</span>
            <p className="text-gray-800">{producto?.nombreProducto}</p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Categoría</span>
            <p className="text-gray-800">{nombreCategoria}</p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Precio</span>
            <p className="text-gray-800 font-semibold">
              {formatearPrecio(producto?.precio)}
            </p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Stock</span>
            <p className={getStockClass(producto?.stock)}>
              {producto?.stock} unidades
            </p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Estado</span>
            <p
              className={
                producto?.estado
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {producto?.estado ? "Activo" : "Inactivo"}
            </p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Descripción</span>
            <p className="text-gray-800">
              {producto?.descripcion || "Sin descripción"}
            </p>
          </div>
        </div>

        {/* Botón de cierre */}
        <div className="flex justify-end pt-4">
          <button
            onClick={close}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition duration-200"
          >
            <Icon icon="mdi:close" className="text-lg" />
            Cerrar
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

export default FormularioVerDetallesProducto;
