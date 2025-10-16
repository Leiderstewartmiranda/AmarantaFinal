// FormularioModificar.jsx - Versión conectada a API
import React, { useEffect, useState } from "react";
import { PutProveedor } from "../../../../../services/proveedorService"; // Ajusta la ruta según tu estructura

const FormularioModificarProveedor = ({
  show,
  close,
  formData: initialData,
  onProveedorActualizado, // Cambiamos el nombre para mayor claridad
  titulo = "Modificar Proveedor",
}) => {
  const [formData, setFormData] = useState({
    nit: "",
    representante: "",
    nombreEmpresa: "",
    correo: "",
    telefono: "",
    estado: "Activo"
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  // Actualizar los valores de los campos cuando cambie initialData
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        nit: initialData.nit || "",
        representante: initialData.representante || "",
        nombreEmpresa: initialData.nombreEmpresa || "",
        correo: initialData.correo || "",
        telefono: initialData.telefono || ""
        // estado: initialData.estado ? "Activo" : "Inactivo"
      });
      setErrorServidor(""); // Limpiar errores al abrir
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
    
    // Limpiar error del servidor cuando el usuario empiece a escribir
    if (errorServidor) {
      setErrorServidor("");
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nit) {
      nuevosErrores.nit = "El tipo de documento es obligatorio";
    }

    if (!formData.representante.trim()) {
      nuevosErrores.representante = "El documento es obligatorio";
    } else {
      // Validaciones específicas según el tipo de documento
      switch(formData.nit) {
        case "NIT":
          if (!/^\d{9,10}-\d$/.test(formData.representante.trim())) {
            nuevosErrores.representante = "El NIT debe tener el formato: 123456789-1";
          }
          break;
        case "Cédula":
          if (!/^\d{7,10}$/.test(formData.representante.trim())) {
            nuevosErrores.representante = "La cédula debe tener entre 7 y 10 dígitos";
          }
          break;
        default:
          break;
      }
    }

    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;

    if (!formData.nombreEmpresa.trim()) {
      nuevosErrores.nombreEmpresa = "El nombre es obligatorio";
    } else if (!regexLetras.test(formData.nombreEmpresa.trim())) {
      nuevosErrores.nombreEmpresa = "El nombre solo puede contener letras"; 
    }

    if (!formData.correo.trim()) {
      nuevosErrores.correo = "El contacto es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = "El formato del email no es válido";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{7,15}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = "El teléfono debe contener entre 7 y 15 dígitos";
    }

    // if (!formData.Representante.trim()) {
    //   nuevosErrores.Representante = "El documento es obligatorio";
    // }else if (!/^\d{7,11}$/.test(formData.Representante.trim())) {
    //   nuevosErrores.Representante = "El documento debe contener entre 7 y 11 dígitos";
    // }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setErrorServidor("");

    try {
      // Preparar datos para la API
      const datosProveedor = {
        idProveedor: initialData.idProveedor,
        nit: formData.nit,
        representante: formData.representante,
        nombreEmpresa: formData.nombreEmpresa,
        correo: formData.correo,
        telefono: formData.telefono
        // estado: formData.estado === "Activo"
      };

      // Llamar a la API
      await PutProveedor(initialData.idProveedor, datosProveedor);

      // Notificar al componente padre que la actualización fue exitosa
      if (onProveedorActualizado) {
        onProveedorActualizado();
      }

      // Cerrar el modal
      close();

    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      setErrorServidor(error.message || "Error al actualizar el proveedor. Intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const getDocumentoPlaceholder = () => {
    switch(formData.nit) {
      case "NIT": return "Ej: 900123456-1";
      case "CC": return "Ej: 1234567890";
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
            disabled={cargando}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mostrar error del servidor */}
        {errorServidor && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorServidor}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4">
          {/* Tipo Documento y Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Tipo Documento *</label>
              <select
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.nit ? 'border-red-500' : 'border-gray-300'}`}
                required
                disabled={cargando}
              >
                <option value="">Seleccionar tipo</option>
                <option value="NIT">NIT</option>
                <option value="CC">CC</option>
              </select>
              {errores.nit && <p className="text-red-500 text-xs mt-1">{errores.nit}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Número de Documento *</label>
              <input
                type="text"
                name="representante"
                value={formData.representante}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.representante ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={getDocumentoPlaceholder()}
                required
                disabled={cargando}
              />
              {errores.representante && <p className="text-red-500 text-xs mt-1">{errores.representante}</p>}
            </div>
          </div>

          {/* Nombre y Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Nombre *</label>
              <input
                type="text"
                name="nombreEmpresa"
                value={formData.nombreEmpresa}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.nombreEmpresa ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nombre del proveedor"
                required
                disabled={cargando}
              />
              {errores.nombreEmpresa && <p className="text-red-500 text-xs mt-1">{errores.nombreEmpresa}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Contacto (Email) *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${errores.correo ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="contacto@proveedor.com"
                required
                disabled={cargando}
              />
              {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
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
                disabled={cargando}
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
                disabled={cargando}
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
              disabled={cargando}
              className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1 disabled:bg-orange-400 disabled:cursor-not-allowed"
            >
              {cargando ? "Actualizando..." : "Actualizar Proveedor"}
            </button>
            <button
              onClick={close}
              type="button"
              disabled={cargando}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
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