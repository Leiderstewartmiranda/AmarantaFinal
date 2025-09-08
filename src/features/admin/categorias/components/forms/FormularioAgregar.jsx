// FormularioAgregar.jsx (Categorías - Versión Mejorada con Estado)
const FormularioAgregar = ({
  show, 
  setShow, 
  onSubmit, 
  nombreRef, 
  descripcionRef, 
  estadoRef, // Nueva referencia para el estado
  errores,
  setErrores
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={() => setShow(false)}>
      <div className="bg-white rounded shadow-md p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Agregar Categoría</h2>
          <button 
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nombre *</label>
            <input 
              type="text"
              ref={nombreRef}
              onChange={() => setErrores({...errores, nombre: ''})}
              className={`w-full border ${errores.nombre ? 'border-red-500' : 'border-gray-300'} rounded p-2 focus:border-orange-500 focus:outline-none`}
              placeholder="Nombre de la categoría"
            />
            {errores.nombre && <span className="text-red-500 text-sm mt-1">{errores.nombre}</span>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Descripción *</label>
            <textarea
              ref={descripcionRef}
              onChange={() => setErrores({...errores, descripcion: ''})}
              className={`w-full border ${errores.descripcion ? 'border-red-500' : 'border-gray-300'} rounded p-2 focus:border-orange-500 focus:outline-none resize-none`}
              rows="3"
              placeholder="Descripción de la categoría"
            />
            {errores.descripcion && <span className="text-red-500 text-sm mt-1">{errores.descripcion}</span>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Estado</label>
            <select 
              ref={estadoRef}
              defaultValue={true} // Valor por defecto: Activo
              className="w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none"
            >
              <option value={true}>Activo</option>
              <option value={false}>Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="submit"
              className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
            >
              Agregar
            </button>
            <button 
              type="button" 
              onClick={() => setShow(false)}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
            >
              Cancelar
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
};
export default FormularioAgregar;