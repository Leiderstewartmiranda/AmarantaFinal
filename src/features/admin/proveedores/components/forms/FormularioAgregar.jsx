import React, { useState } from "react";
import { PostProveedor } from "../../../../../services/proveedorService";
import Swal from "sweetalert2";
import ModalBase from "../../../../../compartidos/modal/modalbase";

const FormularioAgregar = ({
  show,
  setShow,
  onSubmit,
  titulo = "Agregar Nuevo Proveedor",
}) => {
  const [formData, setFormData] = useState({
    nombreEmpresa: "",      
    correo: "",             
    telefono: "",
    Nit: "",                
    Representante: ""      
    // estado: true
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

    if (!formData.Nit) {
      nuevosErrores.Nit = "Seleccione un tipo de documento";
    }

    if (!formData.Representante.trim()) {
      nuevosErrores.Representante = "El documento es obligatorio";
    } else if (!/^\d{7,11}$/.test(formData.Representante.trim())) {
      nuevosErrores.Representante = "El documento debe contener entre 7 y 11 dígitos";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validarFormulario()) {
      try {
        await PostProveedor(formData); // ✅ Llamada al backend
        Swal.fire({
          icon: "success",
          title: "Proveedor creado correctamente",
          confirmButtonColor: "#b45309",
        });

        // Limpiar formulario y cerrar modal
        setFormData({
          nombreEmpresa: "",
          correo: "",
          telefono: "",
          Nit: "",
          Representante: ""
        });
        setShow(false);

      } catch (error) {
        // Manejo de error desde backend (documento duplicado, etc.)
        Swal.fire({
          icon: "error",
          title: "Error al crear proveedor",
          text: error.message || "No se permite documento duplicado.",
          confirmButtonColor: "#b45309",
        });
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    // Opcional: Limpiar errores al cerrar
    setErrores({});
  };

  // Footer buttons para el ModalBase
  const footerButtons = (
    <div className="flex justify-evenly gap-3 w-full">
      <button
        type="submit"
        form="form-agregar-proveedor" // ID del formulario
        className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300 flex-1"
      >
        Guardar Proveedor
      </button>
      <button
        onClick={handleClose}
        type="button"
        className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 flex-1"
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
      <form id="form-agregar-proveedor" onSubmit={handleSubmit} className="space-y-4">
        {/* Grid de 2 columnas con 3 campos cada una */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna izquierda */}
          <div className="space-y-5">
            {/* Nombre del Proveedor */}
            <div>
              <label className="block text-gray-700 font-medium">Nombre de la Empresa *</label>
              <input
                type="text"
                name="nombreEmpresa"
                value={formData.nombreEmpresa}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                  errores.nombreEmpresa ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nombre de la empresa proveedora"
              />
              {errores.nombreEmpresa && (
                <span className="text-red-500 text-sm mt-1 block">{errores.nombreEmpresa}</span>
              )}
            </div>

            {/* Correo de Contacto */}
            <div>
              <label className="block text-gray-700 font-medium">Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                  errores.correo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="correo@empresa.com"
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
                name="Nit"
                value={formData.Nit}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                  errores.Nit ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="NIT">NIT</option>
                <option value="RUT">RUT</option>
                <option value="DNI">DNI</option>
              </select>
              {errores.Nit && (
                <span className="text-red-500 text-sm mt-1 block">{errores.Nit}</span>
              )}
            </div>

            {/* Número de Documento */}
            <div>
              <label className="block text-gray-700 font-medium">Número de Documento *</label>
              <input
                type="text"
                name="Representante"
                value={formData.Representante}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                  errores.Representante ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Número de documento"
              />
              {errores.Representante && (
                <span className="text-red-500 text-sm mt-1 block">{errores.Representante}</span>
              )}
            </div>

            {/* Estado (Checkbox) - Descomentar si lo necesitas
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                name="estado"
                checked={formData.estado}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-gray-700 font-medium">Proveedor Activo</label>
            </div> */}
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioAgregar;