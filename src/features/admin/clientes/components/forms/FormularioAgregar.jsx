import React, { useState } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase"; // 👈 ajusta ruta

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
    estado: "Activo",
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;

    // ... tus mismas validaciones
    if (!formData.tipoDocumento)
      nuevosErrores.tipoDocumento = "El tipo de documento es obligatorio";
    if (!formData.documento.trim())
      nuevosErrores.documento = "El documento es obligatorio";
    if (!formData.nombre.trim())
      nuevosErrores.nombre = "El nombre es obligatorio";
    else if (!regexLetras.test(formData.nombre.trim()))
      nuevosErrores.nombre = "Solo se permiten letras";
    if (!formData.apellido.trim())
      nuevosErrores.apellido = "El apellido es obligatorio";
    if (!formData.correo.trim())
      nuevosErrores.correo = "El correo es obligatorio";
    if (!formData.telefono.trim())
      nuevosErrores.telefono = "El teléfono es obligatorio";
    if (!formData.clave.trim())
      nuevosErrores.clave = "La contraseña es obligatoria";
    if (!formData.direccion.trim())
      nuevosErrores.direccion = "La dirección es obligatoria";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSubmit(formData);
      setFormData({
        tipoDocumento: "",
        documento: "",
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        clave: "",
        estado: "Activo",
      });
      setShow(false);
    }
  };

  const getDocumentoPlaceholder = () => {
    switch (formData.tipoDocumento) {
      case "CC": return "Ej: 1234567890";
      case "CE": return "Ej: AB123456";
      case "TI": return "Ej: 1012345678";
      case "PAS": return "Ej: AB123456";
      case "NIT": return "Ej: 900123456-1";
      default: return "Seleccione tipo de documento primero";
    }
  };

  return (
    <ModalBase show={show} setShow={setShow}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
        <button
          onClick={() => setShow(false)}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo Documento */}
          <div>
            <label className="block text-gray-700 font-medium">Tipo Documento *</label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.tipoDocumento ? "border-red-500" : "border-gray-300"
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
              <p className="text-red-500 text-sm">{errores.tipoDocumento}</p>
            )}
          </div>

          {/* Documento */}
          <div>
            <label className="block text-gray-700 font-medium">Documento *</label>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              placeholder={getDocumentoPlaceholder()}
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.documento ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.documento && (
              <p className="text-red-500 text-sm">{errores.documento}</p>
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
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.nombre ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.nombre && (
              <p className="text-red-500 text-sm">{errores.nombre}</p>
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
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.apellido ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.apellido && (
              <p className="text-red-500 text-sm">{errores.apellido}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-gray-700 font-medium">Correo *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.correo ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.correo && (
              <p className="text-red-500 text-sm">{errores.correo}</p>
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
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.telefono ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.telefono && (
              <p className="text-red-500 text-sm">{errores.telefono}</p>
            )}
          </div>
        </div>

        {/* Dirección y Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium">Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.direccion ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.direccion && (
              <p className="text-red-500 text-sm">{errores.direccion}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Contraseña *</label>
            <input
              type="password"
              name="clave"
              value={formData.clave}
              onChange={handleChange}
              className={`w-full border rounded p-2 focus:border-orange-500 focus:outline-none ${
                errores.clave ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.clave && (
              <p className="text-red-500 text-sm">{errores.clave}</p>
            )}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-gray-700 font-medium">Estado *</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full md:w-1/2 border rounded p-2 focus:border-orange-500 focus:outline-none"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="submit"
            className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
          >
            Agregar Cliente
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
    </ModalBase>
  );
};

export default FormularioAgregar;
