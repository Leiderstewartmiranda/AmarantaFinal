import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVerDetalles from "../components/forms/FormularioVerDetalles";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import {
  GetClientes,
  CrearCliente,
  EditarCliente,
  DeleteCliente,
} from "../../../../services/clienteService";

const PaginaClientes = () => {
  const [listaClientes, setListaClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5;

  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    IdCliente: null,
    TipoDocumento: "",
    Documento: "",
    Nombre: "",
    Apellido: "",
    Correo: "",
    Telefono: "",
    Direccion: "",
  });

  const busquedaRef = useRef();

  // 🔹 Cargar clientes desde API
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await GetClientes();

        const adaptados = data.map((c) => ({
          IdCliente: c.idCliente,
          Nombre: c.nombre,
          Apellido: c.apellido,
          NombreCompleto: `${c.nombre} ${c.apellido}`,
          TipoDocumento: c.tipoDocumento,
          Documento: c.documento,
          Correo: c.correo,
          Telefono: c.telefono,
          Direccion: c.direccion,
          Estado: c.idRol === 2 ? "Activo" : "Inactivo",
        }));

        setListaClientes(adaptados);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // 🔹 Agregar cliente
  const handleAgregarCliente = async (datosFormulario) => {
    console.log("📝 Datos recibidos del formulario:", datosFormulario);
    console.log("🔍 TipoDocumento value:", datosFormulario.tipoDocumento);
    console.log("🔍 Tipo de dato:", typeof datosFormulario.tipoDocumento);

    // Validar que tipoDocumento tenga valor
    if (!datosFormulario.tipoDocumento) {
      console.error("❌ ERROR: tipoDocumento está vacío");
      alert("Por favor selecciona un tipo de documento");
      return;
    }

    const nuevoCliente = {
      TipoDocumento: datosFormulario.tipoDocumento,
      Documento: datosFormulario.documento,
      Nombre: datosFormulario.nombre,
      Apellido: datosFormulario.apellido,
      Correo: datosFormulario.correo,
      Clave: datosFormulario.clave || "123456",
      Telefono: datosFormulario.telefono,
      Direccion: datosFormulario.direccion,
      IdRol: 2, // Rol fijo para Cliente
    };
    console.log("🚀 DATOS a enviar a la API:", nuevoCliente);

    try {
      const creado = await CrearCliente(nuevoCliente);
        console.log("✅ RESPUESTA COMPLETA de la API:", creado);
        console.log("🔍 TipoDocumento en respuesta:", creado.TipoDocumento);
        console.log("🔍 TODAS las propiedades del objeto:", Object.keys(creado));

      const adaptado = {
        IdCliente: creado.idCliente,
        Nombre: creado.nombre,
        Apellido: creado.apellido,
        NombreCompleto: `${creado.nombre} ${creado.apellido}`.trim(),
        TipoDocumento: creado.tipoDocumento || nuevoCliente.TipoDocumento,
        Documento: creado.documento,
        Correo: creado.correo,
        Telefono: creado.telefono,
        Direccion: creado.direccion,
      };

      setListaClientes((prev) => [...prev, adaptado]);
    } catch (error) {
      console.error("Error agregando cliente:", error);
    }
  };

  // 🔹 Editar cliente
  const handleEditarSubmit = async (datosFormulario) => {

    const actualizado = {
      IdCliente: datosFormulario.IdCliente,
      TipoDocumento: datosFormulario.TipoDocumento,
      Documento: datosFormulario.Documento,
      Nombre: datosFormulario.Nombre,
      Apellido: datosFormulario.Apellido,
      Correo: datosFormulario.Correo,
      Telefono: datosFormulario.Telefono,
      Direccion: datosFormulario.Direccion,
      IdRol: 2,
    };

    try {
      await EditarCliente(datosFormulario.IdCliente, actualizado);

      setListaClientes((prev) =>
        prev.map((c) =>
          c.IdCliente === datosFormulario.IdCliente
            ? {
                ...c,
                ...actualizado,
                NombreCompleto: `${actualizado.Nombre} ${actualizado.Apellido}`.trim(),
                Estado: "Activo",
              }
            : c
        )
      );

      closeModal();
    } catch (error) {
      console.error("Error editando cliente:", error);
    }
  };

  // 🔹 Eliminar cliente
  const confirmarEliminacion = async () => {
    if (!clienteAEliminar) return;
    try {
      await DeleteCliente(clienteAEliminar.IdCliente);
      setListaClientes((prev) =>
        prev.filter((c) => c.IdCliente !== clienteAEliminar.IdCliente)
      );
    } catch (error) {
      console.error("Error eliminando cliente:", error);
    } finally {
      setClienteAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  // 🔹 Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return listaClientes;
    const termino = terminoBusqueda.toLowerCase();
    return listaClientes.filter(
      (c) =>
        c.NombreCompleto.toLowerCase().includes(termino) ||
        c.Documento.toLowerCase().includes(termino) ||
        c.Correo.toLowerCase().includes(termino) ||
        c.Telefono.toLowerCase().includes(termino)
    );
  }, [listaClientes, terminoBusqueda]);

  // Paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(
    indiceInicio,
    indiceInicio + clientesPorPagina
  );

  const handleCambioPagina = (nuevaPagina) => setPaginaActual(nuevaPagina);

  const mostrarEditar = (id) => {
    const cliente = listaClientes.find((c) => c.IdCliente === id);
    if (cliente) {
      setFormData(cliente);
      setShowEditar(true);
    }
  };

  const mostrarDetalles = (id) => {
    const cliente = listaClientes.find((c) => c.IdCliente === id);
    if (cliente) {
      setClienteSeleccionado(cliente);
      setShowDetalles(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setFormData({
      IdCliente: null,
      TipoDocumento: "",
      Documento: "",
      Nombre: "",
      Apellido: "",
      Correo: "",
      Telefono: "",
      Direccion: "",
    });
  };

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Clientes</h2>
      </section>

      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar cliente"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {clientesFiltrados.length} de {listaClientes.length} clientes
            </p>
          )}
        </div>
      </section>

      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin
            listaCabecera={[
              "Nombre Completo",
              "Tipo Doc.",
              "Documento",
              "Correo",
              "Teléfono",
              "Estado",
              "Acciones",
            ]}
          >
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6">Cargando...</td>
              </tr>
            ) : clientesPaginados.length > 0 ? (
              clientesPaginados.map((c) => (
                <tr key={c.IdCliente} className="hover:bg-gray-100">
                  <td className="py-2 px-4">{c.NombreCompleto}</td>
                  <td className="py-2 px-4">{c.TipoDocumento}</td>
                  <td className="py-2 px-4">{c.Documento}</td>
                  <td className="py-2 px-4">{c.Correo}</td>
                  <td className="py-2 px-4">{c.Telefono}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.Estado === "Activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.Estado}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      className="text-green-700 cursor-pointer"
                      onClick={() => mostrarDetalles(c.IdCliente)}
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      className="text-blue-700 cursor-pointer"
                      onClick={() => mostrarEditar(c.IdCliente)}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      className="text-red-700 cursor-pointer"
                      onClick={() => {
                        setClienteAEliminar(c);
                        setShowConfirmacion(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  No hay clientes disponibles
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleCambioPagina={handleCambioPagina}
        />
      )}

      <FormularioAgregar
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarCliente}
        titulo="Agregar Nuevo Cliente"
      />

      <FormularioModificar
        show={showEditar}
        close={closeModal}
        formData={formData}
        onSubmit={handleEditarSubmit}
      />

      <FormularioVerDetalles
        show={showDetalles}
        close={() => setShowDetalles(false)}
        cliente={clienteSeleccionado}
      />

      <ModalConfirmacion
        show={showConfirmacion}
        onClose={() => setShowConfirmacion(false)}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Cliente"
        mensaje="¿Estás seguro de que deseas eliminar este cliente?"
      />
    </>
  );
};

export default PaginaClientes;
