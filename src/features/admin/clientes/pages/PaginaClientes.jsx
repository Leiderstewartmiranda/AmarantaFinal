import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVerDetalles from "../components/forms/FormularioVerDetalles";
import {
  GetClientes,
  CrearCliente,
  EditarCliente,
  DeleteCliente,
} from "../../../../services/clienteService";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaClientes = () => {
  const [listaClientes, setListaClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5;

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const busquedaRef = useRef();

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

  // 🔹 Cargar clientes
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
    if (!datosFormulario.tipoDocumento) {
      Swal.fire({
        icon: "warning",
        title: "Falta información",
        text: "Por favor selecciona un tipo de documento.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });
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
      IdRol: 2,
    };

    try {
      const creado = await CrearCliente(nuevoCliente);

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
        Estado: "Activo",
      };

      setListaClientes((prev) => [...prev, adaptado]);

      Swal.fire({
        icon: "success",
        title: "Cliente agregado",
        text: "El cliente ha sido registrado exitosamente.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });
      setShowAgregar(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al agregar cliente",
        text: "Ocurrió un error al registrar el cliente.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });
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
              }
            : c
        )
      );

      Swal.fire({
        icon: "success",
        title: "Cliente actualizado",
        text: "Los datos se han guardado correctamente.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });

      closeModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "No fue posible actualizar el cliente.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });
      console.error("Error editando cliente:", error);
    }
  };

  // 🔹 Eliminar cliente con alerta de confirmación
  const confirmarEliminacion = (cliente) => {
    Swal.fire({
      title: "¿Eliminar cliente?",
      text: `¿Estás seguro de eliminar a ${cliente.NombreCompleto} identificado con el documento ${cliente.TipoDocumento}-${cliente.Documento}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d15153",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#fff8e7",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await DeleteCliente(cliente.IdCliente);
          setListaClientes((prev) =>
            prev.filter((c) => c.IdCliente !== cliente.IdCliente)
          );

          Swal.fire({
            icon: "success",
            title: "Cliente eliminado",
            text: "El cliente fue eliminado correctamente.",
            confirmButtonColor: "#d15153",
            background: "#fff8e7",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error al eliminar",
            text: "No se pudo eliminar el cliente.",
            confirmButtonColor: "#d15153",
            background: "#fff8e7",
          });
          console.error("Error eliminando cliente:", error);
        }
      }
    });
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
      <TituloSeccion titulo="Clientes" />

      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
        <div className="w-80">
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
                <td colSpan="7" className="text-center py-6">
                  Cargando...
                </td>
              </tr>
            ) : clientesPaginados.length > 0 ? (
              clientesPaginados.map((c) => (
                <tr key={c.IdCliente} className="hover:bg-gray-50">
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
                      width="22"
                      className="text-green-700 cursor-pointer"
                      onClick={() => mostrarDetalles(c.IdCliente)}
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="22"
                      className="text-blue-700 cursor-pointer"
                      onClick={() => mostrarEditar(c.IdCliente)}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="22"
                      className="text-red-700 cursor-pointer"
                      onClick={() => confirmarEliminacion(c)}
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
        setShow={setShowDetalles}
        cliente={clienteSeleccionado}
      />
    </>
  );
};

export default PaginaClientes;
