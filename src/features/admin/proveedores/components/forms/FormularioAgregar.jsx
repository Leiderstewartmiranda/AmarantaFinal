import React, { useState } from "react";

const FormularioAgregar = ({
  show,
  setShow,
  onSubmit,
  titulo = "Agregar Nuevo Proveedor",
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    tipoDocumento: "",
    documento: "",
    estado: true
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!formData.contacto.trim()) {
      nuevosErrores.contacto = "El contacto es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto)) {
      nuevosErrores.contacto = "El formato del email no es válido";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{7,15}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = "El teléfono debe contener entre 7 y 15 dígitos";
    }

    if (!formData.tipoDocumento) {
      nuevosErrores.tipoDocumento = "Seleccione un tipo de documento";
    }

    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSubmit(formData);
      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        tipoDocumento: "",
        documento: "",
        estado: true
      });
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-full max-w-3xl mx-4 overflow-auto max-h-[85vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={() => setShow(false)}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid de 2 columnas con 3 campos cada una */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna izquierda */}
            <div className="space-y-5">
              {/* Nombre del Proveedor */}
              <div>
                <label className="block text-gray-700 font-medium">Nombre del Proveedor *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nombre completo del proveedor"
                />
                {errores.nombre && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.nombre}</span>
                )}
              </div>

              {/* Correo de Contacto */}
              <div>
                <label className="block text-gray-700 font-medium">Correo de Contacto *</label>
                <input
                  type="email"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.contacto ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {errores.contacto && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.contacto}</span>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-gray-700 font-medium">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.telefono ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Número de teléfono"
                />
                {errores.telefono && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.telefono}</span>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-5">
              {/* Tipo de Documento */}
              <div>
                <label className="block text-gray-700 font-medium">Tipo de Documento *</label>
                <select
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.tipoDocumento ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccionar</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="RUT">RUT</option>
                  <option value="DNI">DNI</option>
                </select>
                {errores.tipoDocumento && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.tipoDocumento}</span>
                )}
              </div>

              {/* Número de Documento */}
              <div>
                <label className="block text-gray-700 font-medium">Número de Documento *</label>
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.documento ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Número de documento"
                />
                {errores.documento && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.documento}</span>
                )}
              </div>

              {/* Estado (Checkbox) */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700 font-medium">Proveedor Activo</label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-evenly gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1"
            >
              Guardar Proveedor
            </button>
            <button
              onClick={() => setShow(false)}
              type="button"
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 flex-1"
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