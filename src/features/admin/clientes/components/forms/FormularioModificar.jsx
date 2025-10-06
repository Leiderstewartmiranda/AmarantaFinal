import React, { useEffect, useState } from "react";

const FormularioModificar = ({
  show,
  close,
  formData: initialData,
  onSubmit,
  titulo = "Modificar Cliente",
}) => {
  const [formData, setFormData] = useState({
    TipoDocumento: "",
    Documento: "",
    Nombre: "",
    Apellido: "",
    Correo: "",
    Telefono: "",
    Direccion: "",
    Estado: "Activo",
  });

  const [errores, setErrores] = useState({});

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        IdCliente: initialData.IdCliente ?? null,
        TipoDocumento: initialData.TipoDocumento ?? "",
        Documento: initialData.Documento ?? "",
        Nombre: initialData.Nombre ?? "",
        Apellido: initialData.Apellido ?? "",
        Correo: initialData.Correo ?? "",
        Telefono: initialData.Telefono ?? "",
        Direccion: initialData.Direccion ?? "",
        Estado: initialData.Estado ?? "Activo",
      });
    }
  }, [show, initialData]);

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

    if (!formData.TipoDocumento) {
      nuevosErrores.TipoDocumento = "El tipo de documento es obligatorio";
    }

    if (!formData.Documento.trim()) {
      nuevosErrores.Documento = "El documento es obligatorio";
    }

    if (!formData.Nombre.trim()) {
      nuevosErrores.Nombre = "El nombre es obligatorio";
    }

    if (!formData.Apellido.trim()) {
      nuevosErrores.Apellido = "El apellido es obligatorio";
    }

    if (!formData.Correo.trim()) {
      nuevosErrores.Correo = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Correo)) {
      nuevosErrores.Correo = "El formato del email no es válido";
    }

    if (!formData.Telefono.trim()) {
      nuevosErrores.Telefono = "El teléfono es obligatorio";
    }

    if (!formData.Estado) {
      nuevosErrores.Estado = "El estado es obligatorio";
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-md p-6 w-full max-w-2xl mx-4 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button onClick={close} className="text-gray-500 hover:text-gray-700">
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
                name="TipoDocumento"
                value={formData.TipoDocumento}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 ${errores.TipoDocumento ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Seleccionar tipo</option>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="PAS">PAS</option>
                <option value="NIT">NIT</option>
              </select>
              {errores.TipoDocumento && <p className="text-red-500 text-xs mt-1">{errores.TipoDocumento}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Número de Documento *</label>
              <input
                type="text"
                name="Documento"
                value={formData.Documento}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 ${errores.Documento ? "border-red-500" : "border-gray-300"}`}
                required
              />
              {errores.Documento && <p className="text-red-500 text-xs mt-1">{errores.Documento}</p>}
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Nombre *</label>
              <input
                type="text"
                name="Nombre"
                value={formData.Nombre}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 ${errores.Nombre ? "border-red-500" : "border-gray-300"}`}
                placeholder="Nombre"
              />
              {errores.Nombre && <p className="text-red-500 text-xs mt-1">{errores.Nombre}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Apellido *</label>
              <input
                type="text"
                name="Apellido"
                value={formData.Apellido}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 ${errores.Apellido ? "border-red-500" : "border-gray-300"}`}
                placeholder="Apellido"
              />
              {errores.Apellido && <p className="text-red-500 text-xs mt-1">{errores.Apellido}</p>}
            </div>
          </div>

          {/* Correo y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium">Correo *</label>
              <input
                type="email"
                name="Correo"
                value={formData.Correo}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 ${errores.Correo ? "border-red-500" : "border-gray-300"}`}
                placeholder="correo@ejemplo.com"
              />
              {errores.Correo && <p className="text-red-500 text-xs mt-1">{errores.Correo}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Teléfono *</label>
              <input
                type="tel"
                name="Telefono"
                value={formData.Telefono}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded p-2 ${errores.Telefono ? "border-red-500" : "border-gray-300"}`}
                placeholder="Número de teléfono"
              />
              {errores.Telefono && <p className="text-red-500 text-xs mt-1">{errores.Telefono}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Dirección</label>
            <input
              type="text"
              name="Direccion"
              value={formData.Direccion}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              placeholder="Dirección del cliente"
            />
          </div>

          {/* Estado */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Estado *</label>
            <select
              name="Estado"
              value={formData.Estado}
              onChange={handleChange}
              className="mt-1 block w-full border rounded p-2"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
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
