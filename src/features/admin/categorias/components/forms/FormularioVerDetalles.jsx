// FormularioVerDetalles.jsx (Categorías - Versión Mejorada)
const FormularioVerDetalles = ({
  show, 
  close, 
  categoria
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={close}>
      <div className="bg-white rounded shadow-md p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalles de la Categoría</h2>
          <button 
            onClick={close}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {categoria && (
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-700">ID:</span>
              <span className="text-gray-900">{categoria.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-700">Nombre:</span>
              <span className="text-gray-900">{categoria.nombre}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-700">Descripción:</span>
              <span className="text-gray-900">{categoria.descripcion}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-700">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoria.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {categoria.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-700">Fecha de Creación:</span>
              <span className="text-gray-900">{categoria.fechaCreacion}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button 
            onClick={close}
            className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
export default FormularioVerDetalles;