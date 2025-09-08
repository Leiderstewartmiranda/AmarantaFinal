// FormularioModificar.jsx - Versión corregida para proveedores
import React, { useEffect, useState } from "react";

const FormularioModificarProveedor = ({
  show,
  close,
  formData: initialData,
  onSubmit,
  titulo = "Modificar Proveedor",
}) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    contacto: "",
    telefono: "",
    estado: "Activo"
  });

  const [errores, setErrores] = useState({});

  // Actualizar los valores de los campos cuando cambie initialData
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        tipoDocumento: initialData.tipoDocumento || "",
        documento: initialData.documento || "",
        nombre: initialData.nombre || "",
        contacto: initialData.contacto || "",
        telefono: initialData.telefono || "",
        estado: initialData.estado ? "Activo" : "Inactivo"
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
        case "NIT":
          if (!/^\d{9,10}-\d$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "El NIT debe tener el formato: 123456789-1";
          }
          break;
        case "Cédula":
          if (!/^\d{7,10}$/.test(formData.documento.trim())) {
            nuevosErrores.documento = "La cédula debe tener entre 7 y 10 dígitos";
          }
          break;
        default:
          break;
      }
    }

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

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      // Convertir el estado de string a booleano
      const datosProveedor = {
        ...formData,
        estado: formData.estado === "Activo",
        id: initialData.id // Mantener el ID original
      };
      onSubmit(datosProveedor);
    }
  };

  const getDocumentoPlaceholder = () => {
    switch(formData.tipoDocumento) {
      case "NIT": return "Ej: 900123456-1";
      case "Cédula": return "Ej: 1234567890";
      default: return "Ingrese el documento";
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
          {/* Tipo Documento y Documento */}
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
                <option value="NIT">NIT</option>
                <option value="Cédula">Cédula</option>
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
                required
              />
              {errores.documento && <p className="text-red-500 text-xs mt-1">{errores.documento}</p>}
            </div>
          </div>

          {/* Nombre y Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nombre del proveedor"
                required
              />
              {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Contacto (Email) *</label>
              <input
                type="email"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.contacto ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="contacto@proveedor.com"
                required
              />
              {errores.contacto && <p className="text-red-500 text-xs mt-1">{errores.contacto}</p>}
            </div>
          </div>

          {/* Teléfono y Estado */}
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
              </select>
              {errores.estado && <p className="text-red-500 text-xs mt-1">{errores.estado}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-evenly gap-3 mt-6">
            <button
              type="submit"
              className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1"
            >
              Actualizar Proveedor
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

export default FormularioModificarProveedor;