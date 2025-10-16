import React, { useState } from "react";

const FormularioAgregar = ({
  show,
  setShow,
  onSubmit,
  titulo = "Agregar Nuevo Cliente",
}) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    clave: "",
    estado: "Activo"
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.tipoDocumento) {
      nuevosErrores.tipoDocumento = "El tipo de documento es obligatorio";
    }

    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio";
    } else {
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

    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (!regexLetras.test(formData.nombre.trim())) {
      nuevosErrores.nombre = "El nombre solo puede contener letras";
    }

    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio";
    } else if (!regexLetras.test(formData.apellido.trim())) {
      nuevosErrores.apellido = "El apellido solo puede contener letras";
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

    if (!formData.clave.trim()) {
      nuevosErrores.clave = "La contraseña es obligatoria";
    } else if (formData.clave.length < 6) {
      nuevosErrores.clave = "La contraseña debe tener al menos 6 caracteres";
    } else if (formData.clave.length > 30) {
      nuevosErrores.clave = "La contraseña no debe exceder los 30 caracteres";
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria";
    } else if (formData.direccion.trim().length < 5) {
      nuevosErrores.direccion = "La dirección debe tener al menos 5 caracteres";
    } else if (formData.direccion.trim().length > 100) {
      nuevosErrores.direccion = "La dirección no debe exceder los 100 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validarFormulario()) {
      const clienteFinal = {
        tipoDocumento: formData.tipoDocumento,
        documento: formData.documento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        idRol: 2, // Rol fijo de cliente
        estado: formData.estado
      };

      onSubmit(clienteFinal);

      // Resetear formulario
      setFormData({
        tipoDocumento: "",
        documento: "",
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        clave: "",
        estado: "Activo"
      });

      setShow(false);
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
      <div className="bg-white rounded shadow-md p-6 w-full max-w-3xl mx-4 overflow-auto max-h-[85vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-5">
              {/* Tipo Documento */}
              <div>
                <label className="block text-gray-700 font-medium">Tipo Documento *</label>
                <select
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.tipoDocumento ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="TI">TI</option>
                  <option value="PAS">PAS</option>
                  <option value="NIT">NIT</option>
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
                    errores.documento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getDocumentoPlaceholder()}
                  disabled={!formData.tipoDocumento}
                />
                {errores.documento && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.documento}</span>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-gray-700 font-medium">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre"
                />
                {errores.nombre && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.nombre}</span>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-gray-700 font-medium">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.apellido ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Apellido"
                />
                {errores.apellido && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.apellido}</span>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-5">
              {/* Correo */}
              <div>
                <label className="block text-gray-700 font-medium">Correo *</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                    errores.correo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {errores.correo && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.correo}</span>
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
                    errores.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Número de teléfono"
                />
                {errores.telefono && (
                  <span className="text-red-500 text-sm mt-1 block">{errores.telefono}</span>
                )}
              </div>

              {/* Dirección */}
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
              {/*Clave*/}
              <div>
                <label className="block text-gray-700 font-medium">Contraseña</label>
                <input
                  type="password"
                  name="clave"
                  value={formData.clave}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-orange-500 focus:outline-none"
                  placeholder="Contraseña"
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="pt-4">
            <label className="block text-gray-700 font-medium">Estado *</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={`mt-1 block w-full md:w-1/2 border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.estado ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
            {errores.estado && (
              <span className="text-red-500 text-sm mt-1 block">{errores.estado}</span>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-evenly gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1"
            >
              Agregar Cliente
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
