import React, { useEffect, useState } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import { UbicacionService } from "../../../../../services/ubicacionService";

export default function FormularioModificar({ show, close, formData, onSubmit }) {
  const [form, setForm] = useState({
    IdUsuario: "",
    TipoDocumento: "",
    Documento: "",
    Nombre: "",
    Apellido: "",
    Correo: "",
    Telefono: "",
    Direccion: "",
    Departamento: "",
    Municipio: "",
    Estado: "",
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  // Cargar departamentos al montar
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        const deps = await UbicacionService.obtenerDepartamentos();
        setDepartamentos(deps);
      } catch (error) {
        console.error("Error cargando departamentos", error);
      }
    };
    cargarDepartamentos();
  }, []);

  // Cargar municipios cuando cambia departamento
  useEffect(() => {
    const cargarMunicipios = async () => {
      if (form.Departamento) {
        try {
          const muns = await UbicacionService.obtenerMunicipios(form.Departamento);
          setMunicipios(muns);
        } catch (error) {
          console.error("Error cargando municipios", error);
          setMunicipios([]);
        }
      } else {
        setMunicipios([]);
      }
    };
    cargarMunicipios();
  }, [form.Departamento]);

  // 👇 Cuando se abre el modal, se llenan los campos con los datos actuales del cliente
  useEffect(() => {
    if (formData) {
      setForm({
        IdUsuario: formData.IdUsuario || formData.IdCliente || "",
        TipoDocumento: formData.TipoDocumento || "",
        Documento: formData.Documento || "",
        Nombre: formData.Nombre || "",
        Apellido: formData.Apellido || "",
        Correo: formData.Correo || "",
        Telefono: formData.Telefono || "",
        Direccion: formData.Direccion || "",
        Departamento: formData.Departamento || "",
        Municipio: formData.Municipio || "",
        // formData.Estado viene como "Activo"/"Inactivo" desde PaginaClientes
        Estado: formData.Estado || "Activo",
      });
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Si cambia departamento, limpiar municipio
      ...(name === "Departamento" ? { Municipio: "" } : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalBase show={show} setShow={close} title="Modificar Cliente" onClose={close}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FILA 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700">Tipo Documento</label>
            <select
              name="TipoDocumento"
              value={form.TipoDocumento}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Seleccione...</option>
              <option value="CC">Cédula</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PAS">Pasaporte</option>
              <option value="NIT">NIT</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700">Número Documento</label>
            <input
              type="text"
              name="Documento"
              value={form.Documento}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>
        </div>

        {/* FILA 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700">Nombre</label>
            <input
              type="text"
              name="Nombre"
              value={form.Nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Apellido</label>
            <input
              type="text"
              name="Apellido"
              value={form.Apellido}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>
        </div>

        {/* FILA 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              name="Correo"
              value={form.Correo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="Telefono"
              value={form.Telefono}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>
        </div>

        {/* FILA 4 - Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700">Departamento</label>
            <select
              name="Departamento"
              value={form.Departamento}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccione...</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700">Municipio</label>
            <select
              name="Municipio"
              value={form.Municipio}
              onChange={handleChange}
              disabled={!form.Departamento}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccione...</option>
              {municipios.map((mun) => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FILA 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700">Dirección</label>
            <input
              type="text"
              name="Direccion"
              value={form.Direccion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700">Estado</label>
            <select
              name="Estado"
              value={form.Estado}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Seleccione...</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={close}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
