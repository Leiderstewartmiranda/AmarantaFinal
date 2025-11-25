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
  GetUsuarios,
  CrearUsuario,
  EditarUsuario,
  DeleteUsuario,
} from "../../../../services/usuarioService";
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
    IdUsuario: null,
    TipoDocumento: "",
    Documento: "",
    Nombre: "",
    Apellido: "",
    Correo: "",
    Telefono: "",
    Direccion: "",
    Departamento: "",
    Municipio: "",
    Rol: "Usuario",
    Estado: true, // Por defecto true (Activo)
  });

  // 🔹 Cargar clientes (usuarios)
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await GetUsuarios();

        const adaptados = data.map((c) => ({
          IdUsuario: c.idUsuario,
          Nombre: c.nombre,
          Apellido: c.apellido,
          NombreCompleto: `${c.nombre} ${c.apellido}`,
          TipoDocumento: c.tipoDocumento,
          Documento: c.documento,
          Correo: c.correo,
          Telefono: c.telefono,
          Direccion: c.direccion,
          Departamento: c.departamento,
          Municipio: c.municipio,
          // Mapear booleano a string para visualización interna si se prefiere, 
          // o mantener booleano y formatear en render.
          // Aquí lo mapeamos a string "Activo"/"Inactivo" para facilitar filtros y tabla
          Estado: c.estado === false ? "Inactivo" : "Activo",
          EstadoBool: c.estado, // Guardamos el valor real también
          Rol: c.rol
        }));

        setListaClientes(adaptados);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
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

    const nuevoUsuario = {
      TipoDocumento: datosFormulario.tipoDocumento,
      Documento: datosFormulario.documento,
      Nombre: datosFormulario.nombre,
      Apellido: datosFormulario.apellido,
      Correo: datosFormulario.correo,
      Clave: datosFormulario.clave || "123456",
      Telefono: datosFormulario.telefono,
      Direccion: datosFormulario.direccion,
      Departamento: datosFormulario.departamento,
      Municipio: datosFormulario.municipio,
      Rol: "Usuario",
      // Si el backend acepta Estado en creación, lo enviamos. Si no, lo ignorará.
      // Convertimos "Activo" -> true, "Inactivo" -> false
      Estado: datosFormulario.estado === "Activo" ? true : false
    };

    try {
      const creado = await CrearUsuario(nuevoUsuario);

      const usuarioCreado = creado.usuario || creado;

      const adaptado = {
        IdUsuario: usuarioCreado.idUsuario,
        Nombre: usuarioCreado.nombre,
        Apellido: usuarioCreado.apellido,
        NombreCompleto: `${usuarioCreado.nombre} ${usuarioCreado.apellido}`.trim(),
        TipoDocumento: usuarioCreado.tipoDocumento || nuevoUsuario.TipoDocumento,
        Documento: usuarioCreado.documento,
        Correo: usuarioCreado.correo,
        Telefono: usuarioCreado.telefono,
        Direccion: usuarioCreado.direccion,
        Departamento: usuarioCreado.departamento,
        Municipio: usuarioCreado.municipio,
        Estado: (usuarioCreado.estado === false) ? "Inactivo" : "Activo",
        EstadoBool: usuarioCreado.estado,
        Rol: usuarioCreado.rol || "Usuario"
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
        text: error.message || "Ocurrió un error al registrar el cliente.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });
      console.error("Error agregando cliente:", error);
    }
  };

  // 🔹 Editar cliente
  const handleEditarSubmit = async (datosFormulario) => {
    const actualizado = {
      IdUsuario: datosFormulario.IdUsuario,
      TipoDocumento: datosFormulario.TipoDocumento,
      Documento: datosFormulario.Documento,
      Nombre: datosFormulario.Nombre,
      Apellido: datosFormulario.Apellido,
      Correo: datosFormulario.Correo,
      Telefono: datosFormulario.Telefono,
      Direccion: datosFormulario.Direccion,
      Departamento: datosFormulario.Departamento,
      Municipio: datosFormulario.Municipio,
      Rol: "Usuario",
      // Convertir string a bool para el envío
      Estado: datosFormulario.Estado === "Activo" ? true : false
    };

    try {
      await EditarUsuario(datosFormulario.IdUsuario, actualizado);

      setListaClientes((prev) =>
        prev.map((c) =>
          c.IdUsuario === datosFormulario.IdUsuario
            ? {
              ...c,
              ...actualizado,
              NombreCompleto: `${actualizado.Nombre} ${actualizado.Apellido}`.trim(),
              Estado: actualizado.Estado ? "Activo" : "Inactivo",
              EstadoBool: actualizado.Estado
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
        text: error.message || "No fue posible actualizar el cliente.",
        confirmButtonColor: "#d15153",
        background: "#fff8e7",
      });
      console.error("Error editando cliente:", error);
    }
  };

  // 🔹 Cambiar Estado (Toggle)
  const handleCambiarEstado = async (id, nuevoEstadoBool) => {
    const cliente = listaClientes.find(c => c.IdUsuario === id);
    if (!cliente) return;

    const nuevoEstadoStr = nuevoEstadoBool ? "Activo" : "Inactivo";

    Swal.fire({
      icon: "question",
      title: "🔄 Cambiar estado",
      html: `¿Estás seguro de que deseas <strong>${nuevoEstadoBool ? 'activar' : 'desactivar'}</strong> este cliente?<br><br>
             <div class="text-left">
               <p><strong>Cliente:</strong> ${cliente.NombreCompleto}</p>
               <p><strong>Estado actual:</strong> ${cliente.Estado}</p>
               <p><strong>Nuevo estado:</strong> ${nuevoEstadoStr}</p>
             </div>`,
      confirmButtonColor: "#d15153",
      background: "#fff8e7",
      showCancelButton: true,
      cancelButtonColor: "#6b7280",
      confirmButtonText: nuevoEstadoBool ? 'Activar' : 'Desactivar',
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Preparamos el objeto actualizado
          const datosActualizados = {
            IdUsuario: cliente.IdUsuario,
            TipoDocumento: cliente.TipoDocumento,
            Documento: cliente.Documento,
            Nombre: cliente.Nombre,
            Apellido: cliente.Apellido,
            Correo: cliente.Correo,
            Telefono: cliente.Telefono,
            Direccion: cliente.Direccion,
            Departamento: cliente.Departamento,
            Municipio: cliente.Municipio,
            Rol: cliente.Rol,
            Estado: nuevoEstadoBool
          };

          await EditarUsuario(id, datosActualizados);

          setListaClientes((prev) =>
            prev.map((c) =>
              c.IdUsuario === id
                ? { ...c, Estado: nuevoEstadoStr, EstadoBool: nuevoEstadoBool }
                : c
            )
          );

          Swal.fire({
            icon: "success",
            title: "✅ Estado actualizado",
            text: `El cliente ha sido ${nuevoEstadoBool ? 'activado' : 'desactivado'} correctamente`,
            confirmButtonColor: "#d15153",
            background: "#fff8e7",
          });
        } catch (error) {
          console.error("Error cambiando estado:", error);
          Swal.fire({
            icon: "error",
            title: "❌ Error al cambiar estado",
            text: "No se pudo cambiar el estado del cliente",
            confirmButtonColor: "#d15153",
            background: "#fff8e7",
          });
        }
      }
    });
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
          await DeleteUsuario(cliente.IdUsuario);
          setListaClientes((prev) =>
            prev.filter((c) => c.IdUsuario !== cliente.IdUsuario)
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
    const cliente = listaClientes.find((c) => c.IdUsuario === id);
    if (cliente) {
      setFormData(cliente);
      setShowEditar(true);
    }
  };

  const mostrarDetalles = (id) => {
    const cliente = listaClientes.find((c) => c.IdUsuario === id);
    if (cliente) {
      setClienteSeleccionado(cliente);
      setShowDetalles(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setFormData({
      IdUsuario: null,
      TipoDocumento: "",
      Documento: "",
      Nombre: "",
      Apellido: "",
      Correo: "",
      Telefono: "",
      Direccion: "",
      Departamento: "",
      Municipio: "",
      Rol: "Usuario",
      Estado: true
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
      titulo: "Estado",
      onClick: () => handleOrdenar('Estado'),
      icono: getSortIcon('Estado')
    },
    "Acciones"
  ];

  const getEstadoColor = (estadoBool) => {
    return estadoBool ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300";
  };

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
                <td colSpan="6" className="text-center py-5">
                  Cargando...
                </td>
              </tr>
            ) : clientesPaginados.length > 0 ? (
              clientesPaginados.map((c) => (
                <tr key={c.IdUsuario} className="hover:bg-gray-100 border-t-2 border-gray-300">
                  <td className="py-2 px-4 font-medium text-black">{c.NombreCompleto}</td>
                  <td className="py-2 px-4 text-sm text-black">{c.TipoDocumento}</td>
                  <td className="py-2 px-4 text-sm text-black">{c.Documento}</td>
                  <td className="py-2 px-4 text-sm text-black max-w-xs truncate">{c.Correo}</td>
                  <td className="py-1 px-4">
                    <select
                      value={c.EstadoBool ? "Activo" : "Inactivo"}
                      onChange={(e) => handleCambiarEstado(c.IdUsuario, e.target.value === "Activo")}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${getEstadoColor(c.EstadoBool)} cursor-pointer hover:shadow-sm`}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="material-symbols:visibility-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-800"
                      onClick={() => mostrarDetalles(c.IdUsuario)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-800"
                      onClick={() => mostrarEditar(c.IdUsuario)}
                      title="Editar cliente"
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 cursor-pointer hover:text-red-800"
                      onClick={() => confirmarEliminacion(c)}
                      title="Eliminar cliente"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
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