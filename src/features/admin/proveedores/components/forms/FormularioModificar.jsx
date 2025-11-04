import React, { useEffect, useState } from "react";
import { PutProveedor } from "../../../../../services/proveedorService";
import ModalBase from "../../../../../compartidos/modal/modalbase";

const FormularioModificarProveedor = ({
  show,
  close,
  formData: initialData,
  onProveedorActualizado,
  titulo = "Modificar Proveedor",
  proveedores = [] // 👈 Nuevo prop para la lista de proveedores
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
        telefono: initialData.telefono || "",
        estado: initialData.estado ? "Activo" : "Inactivo"
      });
      setErrorServidor(""); // Limpiar errores al abrir
      setErrores({}); // Limpiar errores de validación
    }
  }, [show, initialData]);

  // 🔹 Función para validar duplicados
  const validarDuplicados = () => {
    if (!Array.isArray(proveedores)) return false;

    // Verificar si existe otro proveedor con el mismo documento
    const documentoDuplicado = proveedores.some(
      (p) =>
        p.representante?.toLowerCase() === formData.representante?.toLowerCase() &&
        p.idProveedor !== initialData?.idProveedor // Excluir el proveedor actual
    );

    // Verificar si existe otro proveedor con el mismo correo
    const correoDuplicado = proveedores.some(
      (p) =>
        p.correo?.toLowerCase() === formData.correo?.toLowerCase() &&
        p.idProveedor !== initialData?.idProveedor // Excluir el proveedor actual
    );

    return { documentoDuplicado, correoDuplicado };
  };

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
    const { documentoDuplicado, correoDuplicado } = validarDuplicados();

    // Validar tipo de documento
    if (!formData.nit) {
      nuevosErrores.nit = "El tipo de documento es obligatorio";
    }

    // Validar número de documento
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
        case "CC":
          if (!/^\d{7,10}$/.test(formData.representante.trim())) {
            nuevosErrores.representante = "La cédula debe tener entre 7 y 10 dígitos";
          }
          break;
        default:
          break;
      }
    }

    // Validar duplicado de documento
    if (documentoDuplicado) {
      nuevosErrores.representante = "Ya existe un proveedor con este documento";
    }

    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;

    // Validar nombre
    if (!formData.nombreEmpresa.trim()) {
      nuevosErrores.nombreEmpresa = "El nombre es obligatorio";
    } else if (!regexLetras.test(formData.nombreEmpresa.trim())) {
      nuevosErrores.nombreEmpresa = "El nombre solo puede contener letras"; 
    }

    // Validar correo
    if (!formData.correo.trim()) {
      nuevosErrores.correo = "El contacto es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = "El formato del email no es válido";
    }

    // Validar duplicado de correo
    if (correoDuplicado) {
      nuevosErrores.correo = "Ya existe un proveedor con este correo electrónico";
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{7,15}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = "El teléfono debe contener entre 7 y 15 dígitos";
    }

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
        telefono: formData.telefono,
        estado: formData.estado === "Activo"
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

  const handleClose = () => {
    setErrorServidor("");
    setErrores({});
    close();
  };

  // Footer buttons para el ModalBase
  const footerButtons = (
    <div className="flex justify-evenly gap-3 w-full">
      <button
        type="submit"
        form="form-modificar-proveedor"
        disabled={cargando}
        className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1 disabled:bg-orange-400 disabled:cursor-not-allowed"
      >
        {cargando ? "Actualizando..." : "Actualizar Proveedor"}
      </button>
      <button
        onClick={handleClose}
        type="button"
        disabled={cargando}
        className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>
    </div>
  );

  return (
    <ModalBase 
      show={show} 
      title={titulo} 
      onClose={handleClose}
      footerButtons={footerButtons}
    >
      {/* Mostrar error del servidor */}
      {errorServidor && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorServidor}
        </div>
      )}
      
      <form id="form-modificar-proveedor" onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo Documento y Documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </form>
    </ModalBase>
  );
};

export default FormularioModificarProveedor;