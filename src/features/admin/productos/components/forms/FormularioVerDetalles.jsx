const FormularioVerDetallesProducto = ({ show, close, producto, categorias = [] }) => {
  if (!show) return null;

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const getStockClass = (stock) => {
    if (stock <= 5) return 'text-red-600 font-semibold';
    if (stock <= 15) return 'text-yellow-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const nombreCategoria = categorias.find(cat => Number(cat.idCategoria) === Number(producto?.idCategoria))?.nombreCategoria || "Sin categoría";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Detalles del Producto</h3>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Nombre:</span>
            <span>{producto?.nombreProducto}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Categoría:</span>
            <span>{nombreCategoria}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Precio:</span>
            <span className="font-semibold">{formatearPrecio(producto?.precio)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Stock:</span>
            <span className={getStockClass(producto?.stock)}>
              {producto?.stock} unidades
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Estado:</span>
            <span className={producto?.estado ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {producto?.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
        
          
          
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={close}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioVerDetallesProducto;