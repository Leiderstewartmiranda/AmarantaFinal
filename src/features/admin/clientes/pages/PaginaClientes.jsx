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
  const [filtroTipoDoc, setFiltroTipoDoc] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5;

  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({
    columna: null,
    direccion: 'asc' // 'asc' o 'desc'
  });

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

  // 🔹 Función para ordenar
  const handleOrdenar = (columna) => {
    setOrdenamiento(prev => {
      if (prev.columna === columna) {
        return {
          columna,
          direccion: prev.direccion === 'asc' ? 'desc' : 'asc'
        };
      } else {
        return {
          columna,
          direccion: 'asc'
        };
      }
    });
  };

  // 🔹 Función para aplicar filtros
  const aplicarFiltros = () => {
    setPaginaActual(1); // Resetear a primera página al aplicar filtros
  };

  // 🔹 Filtrar y ordenar clientes
  const clientesFiltrados = useMemo(() => {
    let filtrados = listaClientes;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(
        (c) =>
          c.NombreCompleto.toLowerCase().includes(termino) ||
          c.Documento.toLowerCase().includes(termino) ||
          c.Correo.toLowerCase().includes(termino) ||
          c.Telefono.toLowerCase().includes(termino)
      );
    }

    // Aplicar filtro de tipo de documento
    if (filtroTipoDoc) {
      filtrados = filtrados.filter(c => c.TipoDocumento === "CC" || "Cedula de Ciudadania" ? filtroTipoDoc === "CC" : filtroTipoDoc === "CE");
    }

    // Aplicar filtro de estado
    if (filtroEstado) {
      filtrados = filtrados.filter(c => c.Estado === filtroEstado);
    }

    // Aplicar ordenamiento
    if (ordenamiento.columna) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue = a[ordenamiento.columna];
        let bValue = b[ordenamiento.columna];

        // Para columnas específicas
        if (ordenamiento.columna === 'Documento' || ordenamiento.columna === 'Telefono') {
          aValue = parseInt(aValue?.replace(/\D/g, '')) || 0;
          bValue = parseInt(bValue?.replace(/\D/g, '')) || 0;
        }

        if (ordenamiento.columna === 'NombreCompleto') {
          aValue = a.NombreCompleto;
          bValue = b.NombreCompleto;
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (ordenamiento.direccion === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtrados;
  }, [listaClientes, terminoBusqueda, filtroTipoDoc, filtroEstado, ordenamiento]);

  // Paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(
    indiceInicio,
    indiceInicio + clientesPorPagina
  );

  // 🔹 CORRECCIÓN: Asegurar que la página actual no exceda el total de páginas
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    } else if (paginaActual < 1 && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

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

  // 🔹 Función para obtener el icono de ordenamiento
  const getSortIcon = (columna) => {
    if (ordenamiento.columna !== columna) {
      return <i className="fa-solid fa-sort ml-1 text-xs opacity-70"></i>;
    }
    return ordenamiento.direccion === 'asc'
      ? <i className="fa-solid fa-sort-up ml-1 text-xs opacity-70"></i>
      : <i className="fa-solid fa-sort-down ml-1 text-xs opacity-70"></i>;
  };

  // 🔹 Configuración de las columnas con ordenamiento
  const columnasConOrdenamiento = [
    {
      titulo: "Nombre completo",
      onClick: () => handleOrdenar('NombreCompleto'),
      icono: getSortIcon('NombreCompleto')
    },
    {
      titulo: "Tipo Doc.",
      onClick: () => handleOrdenar('TipoDocumento'),
      icono: getSortIcon('TipoDocumento')
    },
    {
      titulo: "Documento",
      onClick: () => handleOrdenar('Documento'),
      icono: getSortIcon('Documento')
    },
    {
      titulo: "Correo",
      onClick: () => handleOrdenar('Correo'),
      icono: getSortIcon('Correo')
    },
    {
      titulo: "Teléfono",
      onClick: () => handleOrdenar('Telefono'),
      icono: getSortIcon('Telefono')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('Estado'),
      icono: getSortIcon('Estado')
    },
    "Acciones"
  ];

  return (
    <div className="flex flex-col gap-6">
      <TituloSeccion titulo="Clientes" />

      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
        {/* 🔹 Sección de Filtros - Similar al HTML de referencia */}
        <div className="filtros flex items-center gap-4 mb-1">
          <select
            value={filtroTipoDoc}
            onChange={(e) => {
              setFiltroTipoDoc(e.target.value);
              setPaginaActual(1); // Resetear página al cambiar filtro
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Tipo documento</option>
            <option value="CC">Cédula</option>
            <option value="CE">Cédula Extranjería</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPaginaActual(1); // Resetear página al cambiar filtro
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          {/* <button 
            onClick={aplicarFiltros}
            className="btn-filtrar px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-amber-700 transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fa-solid fa-filter"></i>
            Filtrar
          </button> */}
        </div>
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
          <TablaAdmin listaCabecera={columnasConOrdenamiento}>
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
                      className={`px-2 py-1 rounded-full text-xs font-medium ${c.Estado === "Activo"
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
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => mostrarDetalles(c.IdCliente)}
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="22"
                      className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                      onClick={() => mostrarEditar(c.IdCliente)}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="22"
                      className="text-red-700 cursor-pointer hover:text-red-900 transition-colors"
                      onClick={() => confirmarEliminacion(c)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No hay clientes que coincidan con los filtros aplicados
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* 🔹 CORRECCIÓN: Mostrar paginación solo si hay más de una página */}
      {totalPaginas > 1 && (
        <div className="col-span-2 mt-4">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            handleCambioPagina={handleCambioPagina}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            Página {paginaActual} de {totalPaginas} - {clientesFiltrados.length} clientes encontrados
          </p>
        </div>
      )}

      {/* 🔹 Mostrar info cuando hay filtros pero solo una página */}
      {totalPaginas === 1 && clientesFiltrados.length > 0 && (
        <div className="col-span-2 mt-4">
          <p className="text-sm text-gray-600 text-center">
            Mostrando {clientesFiltrados.length} clientes
            {(filtroTipoDoc || filtroEstado || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
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

      {/* Agregar Font Awesome para los iconos */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
};

export default PaginaClientes;