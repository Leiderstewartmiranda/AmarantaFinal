import React, { useEffect, useState } from "react";

const FormularioModificar = ({
  show,
  close,
  formData: initialData,
  onSubmit,
  titulo = "Modificar Cliente",
}) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombreCompleto: "",
    correo: "",
    telefono: "",
    direccion: "",
    estado: "Activo"
  });

  const [errores, setErrores] = useState({});

  // Actualizar los valores de los campos cuando cambie initialData
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        tipoDocumento: initialData.TipoDocumento || "",
        documento: initialData.Documento || "",
        nombreCompleto: initialData.NombreCompleto || "",
        correo: initialData.Correo || "",
        telefono: initialData.Telefono || "",
        direccion: initialData.Direccion || "",
        estado: initialData.Estado || "Activo"
      });
    }
  }, [show, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.tipoDocumento) {
      nuevosErrores.tipoDocumento = "El tipo de documento es obligatorio";
    }

    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio";
    } else {
      // Validaciones específicas según el tipo de documento
      switch(formData.tipoDocumento) {
        case "CC":
          if (!/^\d{7,10}$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "La cédula debe tener entre 7 y 10 dígitos";
          }
          break;
        case "CE":
          if (!/^[a-zA-Z0-9]{5,20}$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "La cédula de extranjería debe tener entre 5 y 20 caracteres alfanuméricos";
          }
          break;
        case "TI":
          if (!/^\d{6,12}$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "La tarjeta de identidad debe tener entre 6 y 12 dígitos";
          }
          break;
        case "PAS":
          if (!/^[a-zA-Z0-9]{6,12}$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos";
          }
          break;
        case "NIT":
          if (!/^\d{9,10}-\d$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "El NIT debe tener el formato: 123456789-1";
          }
          break;
        default:
          break;
      }
    }

    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = "El nombre completo es obligatorio";
    }

    if (!formData.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = "El formato del email no es válido";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{7,15}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = "El teléfono debe contener entre 7 y 15 dígitos";
    }

    if (!formData.estado) {
      nuevosErrores.estado = "El estado es obligatorio";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSubmit(formData);
    }
  };

  const getDocumentoPlaceholder = () => {
    switch(formData.tipoDocumento) {
      case "CC": return "Ej: 1234567890";
      case "CE": return "Ej: AB123456";
      case "TI": return "Ej: 1012345678";
      case "PAS": return "Ej: AB123456";
      case "NIT": return "Ej: 900123456-1";
      default: return "Seleccione tipo de documento primero";
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-full max-w-2xl mx-4 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4">
          {/* Tipo Documento y Documento en la misma fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Tipo Documento *</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.tipoDocumento ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PAS">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
              {errores.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errores.tipoDocumento}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Número de Documento *</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.documento ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={getDocumentoPlaceholder()}
                disabled={!formData.tipoDocumento}
                required
              />
              {errores.documento && <p className="text-red-500 text-xs mt-1">{errores.documento}</p>}
            </div>
          </div>

          {/* Resto del formulario (sin cambios en la estructura pero con validación) */}
          {/* Nombre Completo y Correo en la misma fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Nombre Completo *</label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.nombreCompleto ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nombre completo del cliente"
                required
              />
              {errores.nombreCompleto && <p className="text-red-500 text-xs mt-1">{errores.nombreCompleto}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Correo *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.correo ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
                required
              />
              {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
            </div>
          </div>

          {/* Teléfono y Dirección en la misma fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.telefono ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Número de teléfono"
                required
              />
              {errores.telefono && <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none"
                placeholder="Dirección del cliente"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Estado *</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.estado ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
            {errores.estado && <p className="text-red-500 text-xs mt-1">{errores.estado}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-evenly gap-3 mt-6">
            <button
              type="submit"
              className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1"
            >
              Actualizar Cliente
            </button>
            <button
              onClick={close}
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

export default FormularioModificar;