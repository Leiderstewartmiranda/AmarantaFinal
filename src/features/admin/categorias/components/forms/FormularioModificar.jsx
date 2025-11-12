// FormularioModificar.jsx
import React from "react"; 
import ModalBase from "../../../../../compartidos/modal/modalbase"; 

const FormularioModificar = ({ 
  show, 
  close, 
  formData, 
  onSubmit, 
  nombreRef, 
  descripcionRef, 
  errores, 
  setErrores, 
  setFormData,
  categorias, // 👈 Nuevo prop para validar duplicados
  categoriaActual // 👈 Nuevo prop para la categoría actual
}) => { 

  // 🔹 Función para validar nombre duplicado
  const validarNombreDuplicado = (nombre) => {
    if (!Array.isArray(categorias) || !nombre.trim()) return false;

    return categorias.some(
      (c) =>
        c.nombreCategoria?.toLowerCase() === nombre.trim().toLowerCase() &&
        c.idCategoria !== categoriaActual?.idCategoria // 👈 Excluir la categoría actual
    );
  };

  // 🔹 Validación en tiempo real del nombre
  const handleNombreChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, nombreCategoria: value });
    
    // Limpiar error anterior
    const nuevosErrores = { ...errores, nombreCategoria: "" };
    
    // Validaciones
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;
    
    if (!value.trim()) {
      nuevosErrores.nombreCategoria = "El nombre es obligatorio";
    } else if (!regexLetras.test(value.trim())) {
      nuevosErrores.nombreCategoria = "Solo se permiten letras y espacios";
    } else if (value.trim().length < 2) {
      nuevosErrores.nombreCategoria = "Debe tener al menos 2 caracteres";
    } else if (value.trim().length > 50) {
      nuevosErrores.nombreCategoria = "No puede exceder 50 caracteres";
    } else if (validarNombreDuplicado(value)) {
      nuevosErrores.nombreCategoria = "Ya existe una categoría con ese nombre";
    }
    
    setErrores(nuevosErrores);
  };

  return ( 
    <ModalBase show={show} close={close} title={"Editar Categoría"} onClose={close}> 
      <form onSubmit={onSubmit} className="w-full max-w-lg mx-auto"> 
        <div className="space-y-6"> 
          <div className="form-group"> 
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre *</label> 
            <input 
              type="text" 
              ref={nombreRef} 
              value={formData.nombreCategoria} 
              onChange={handleNombreChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                errores.nombreCategoria ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-amber-200"
              }`} 
            /> 
            {errores.nombreCategoria && ( 
              <p className="text-red-500 text-xs italic mt-1">{errores.nombreCategoria}</p> 
            )} 
          </div> 
          <div className="form-group"> 
            <label className="block text-gray-700 text-sm font-bold mb-2">Descripción *</label> 
            <textarea 
              ref={descripcionRef} 
              value={formData.descripcion} 
              onChange={(e) => { 
                setFormData({ ...formData, descripcion: e.target.value }); 
                setErrores({ ...errores, descripcion: "" }); 
              }} 
              rows="3" 
              className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 bg-white text-black ${
                errores.descripcion ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-amber-200"
              }`} 
            /> 
            {errores.descripcion && ( 
              <p className="text-red-500 text-xs italic mt-1">{errores.descripcion}</p> 
            )} 
          </div> 
        </div> 
        <div className="flex justify-end gap-4 mt-6"> 
          <button 
            type="button" 
            onClick={close} 
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          > 
            Cancelar 
          </button> 
          <button 
            type="submit" 
            className="btn"
          > 
            Guardar cambios 
          </button> 
        </div> 
      </form> 
    </ModalBase> 
  ); 
}; 

export default FormularioModificar;