// pages/roles/PaginaRoles.js
import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import { GetRoles, PostRole, PutRole, DeleteRole, GetPermisos } from "../../../../services/rolService";
import FormularioAgregarRol from "../components/forms/FormularioAgregar";
import FormularioModificarRol from "../components/forms/FormularioModificar";
import FormularioVerDetallesRol from "../components/forms/FormularioVerDetalles";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaRoles = () => {
  // Estados principales
  const [listaRoles, setListaRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]); // Estado para permisos

  // Estados de UI
  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroID, setFiltroID] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(""); // Nuevo filtro
  const [paginaActual, setPaginaActual] = useState(1);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);

  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({
    columna: null,
    direccion: 'asc'
  });

  // Refs
  const nombreRef = useRef();
  const busquedaRef = useRef();

  const rolesPorPagina = 7;

  // Cargar roles y permisos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        GetRoles(),
        GetPermisos()
      ]);

      // Adaptar datos de roles
      const adaptados = rolesData.map(r => ({
        ...r,
        Estado: r.estado !== undefined ? r.estado : true,
        Permisos: r.permisos || []
      }));

      setListaRoles(adaptados);

      // Mapear permisos si es necesario (dependiendo de cómo vengan del back)
      // Asumimos que vienen como { idPermiso, nombrePermiso }
      const permisosFormateados = permisosData.map(p => ({
        id: p.idPermiso,
        nombre: p.nombrePermiso
      }));
      setPermisosDisponibles(permisosFormateados);

    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cargar",
        text: "No se pudieron cargar los roles o permisos",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para recargar solo roles (usada después de crear/editar)
  const cargarRoles = async () => {
    try {
      const data = await GetRoles();
      const adaptados = data.map(r => ({
        ...r,
        Estado: r.estado !== undefined ? r.estado : true,
        Permisos: r.permisos || []
      }));
      setListaRoles(adaptados);
    } catch (error) {
      console.error("Error recargando roles:", error);
    }
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
    setPaginaActual(1);
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
      titulo: "ID",
      onClick: () => handleOrdenar('idRol'),
      icono: getSortIcon('idRol')
    },
    {
      titulo: "Nombre del Rol",
      onClick: () => handleOrdenar('nombreRol'),
      icono: getSortIcon('nombreRol')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('Estado'),
      icono: getSortIcon('Estado')
    },
    "Acciones"
  ];

  // 🔹 Filtrar y ordenar roles
  const rolesFiltrados = useMemo(() => {
    let filtrados = listaRoles;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((rol) => {
        const nombre = rol.nombreRol?.toLowerCase() || '';
        const id = rol.idRol?.toString() || '';

        return (
          nombre.includes(termino) ||
          id.includes(termino)
        );
      });
    }

    // Aplicar filtro por ID
    if (filtroID) {
      filtrados = filtrados.filter(rol => {
        const idRol = rol.idRol?.toString() || '';
        return idRol.includes(filtroID);
      });
    }

    // Aplicar filtro de Estado
    if (filtroEstado !== "") {
      const estadoBool = filtroEstado === "Activo";
      filtrados = filtrados.filter(rol => rol.Estado === estadoBool);
    }

    // Aplicar ordenamiento
    if (ordenamiento.columna) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue = a[ordenamiento.columna];
        let bValue = b[ordenamiento.columna];

        // Para columnas numéricas (ID)
        if (ordenamiento.columna === 'idRol') {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
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
  }, [listaRoles, terminoBusqueda, filtroID, filtroEstado, ordenamiento]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);
  const indiceInicio = (paginaActual - 1) * rolesPorPagina;
  const rolesPaginados = rolesFiltrados.slice(indiceInicio, indiceInicio + rolesPorPagina);

  // Ajustar página actual si es necesario
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    } else if (paginaActual < 1 && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Validaciones
  const validarRol = (rol) => {
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;

    if (!rol.nombreRol || rol.nombreRol.trim() === '') {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Campo requerido",
        text: "El nombre del rol es obligatorio",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return false;
    }

    if (!regexLetras.test(rol.nombreRol.trim())) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Caracteres no permitidos",
        text: "El nombre del rol contiene caracteres no permitidos",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return false;
    }

    if (rol.nombreRol.trim().length < 2) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Nombre muy corto",
        text: "El nombre del rol debe tener al menos 2 caracteres",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return false;
    }

    if (rol.nombreRol.trim().length > 50) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Nombre muy largo",
        text: "El nombre del rol no puede exceder 50 caracteres",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return false;
    }

    return true;
  };

  // AGREGAR rol
  const handleAgregarSubmit = async (datosFormulario) => {
    // datosFormulario viene del componente hijo con { nombreRol, permisos, estado }

    const nuevoRol = {
      NombreRol: datosFormulario.nombreRol.trim(),
      Permisos: datosFormulario.permisos || [],
      Estado: datosFormulario.estado !== undefined ? datosFormulario.estado : true
    };

    // Verificar si ya existe un rol con el mismo nombre
    const existeDuplicado = listaRoles.some(
      (r) => r.nombreRol?.toLowerCase() === nuevoRol.NombreRol.toLowerCase()
    );

    if (existeDuplicado) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Rol duplicado",
        text: "Ya existe un rol con ese nombre",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    if (!validarRol({ nombreRol: nuevoRol.NombreRol })) {
      return;
    }

    try {
      await PostRole(nuevoRol);
      await cargarRoles();
      setShowAgregar(false);

      Swal.fire({
        icon: "success",
        title: "✅ Rol agregado",
        text: "El rol se ha agregado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error al agregar rol:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al agregar",
        text: "No se pudo agregar el rol",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  // EDITAR rol
  const handleEditarSubmit = async (datosFormulario) => {
    // datosFormulario viene del componente hijo con { nombreRol, permisos, estado }

    const rolActualizado = {
      NombreRol: datosFormulario.nombreRol.trim(),
      Permisos: datosFormulario.permisos || [],
      Estado: datosFormulario.estado
    };

    // Verificar si ya existe otro rol con el mismo nombre (excluyendo el actual)
    const existeDuplicado = listaRoles.some(
      (r) =>
        r.nombreRol?.toLowerCase() === rolActualizado.NombreRol.toLowerCase() &&
        r.idRol !== rolSeleccionado.idRol
    );

    if (existeDuplicado) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Rol duplicado",
        text: "Ya existe un rol con ese nombre",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    if (!validarRol({ nombreRol: rolActualizado.NombreRol })) {
      return;
    }

    try {
      await PutRole(rolSeleccionado.idRol, rolActualizado);
      await cargarRoles();
      closeModal();

      Swal.fire({
        icon: "success",
        title: "✅ Rol actualizado",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error al editar rol:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al actualizar",
        text: "No se pudo actualizar el rol",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  // 🔹 Cambiar Estado (Toggle)
  const handleCambiarEstado = async (rol, nuevoEstado) => {
    // 🔥 PROTECCIÓN DE ROL ADMIN
    if (rol.nombreRol.toLowerCase() === "admin" || rol.nombreRol.toLowerCase() === "administrador") {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Acción no permitida",
        text: "El rol de Administrador no puede ser desactivado",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    const nuevoEstadoStr = nuevoEstado ? "Activo" : "Inactivo";

    Swal.fire({
      icon: "question",
      title: "🔄 Cambiar estado",
      html: `¿Estás seguro de que deseas <strong>${nuevoEstado ? 'activar' : 'desactivar'}</strong> este rol?<br><br>
             <div class="text-left">
               <p><strong>Rol:</strong> ${rol.nombreRol}</p>
               <p><strong>Estado actual:</strong> ${rol.Estado ? "Activo" : "Inactivo"}</p>
               <p><strong>Nuevo estado:</strong> ${nuevoEstadoStr}</p>
             </div>`,
      confirmButtonColor: "#d15153",
      background: "#fff8e7",
      showCancelButton: true,
      cancelButtonColor: "#6b7280",
      confirmButtonText: nuevoEstado ? 'Activar' : 'Desactivar',
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Mantener los datos existentes y solo cambiar el estado
          const rolActualizado = {
            NombreRol: rol.nombreRol,
            Permisos: rol.Permisos || [],
            Estado: nuevoEstado
          };

          await PutRole(rol.idRol, rolActualizado);

          // Actualizar estado localmente para reflejo inmediato
          setListaRoles(prev =>
            prev.map(r => r.idRol === rol.idRol ? { ...r, Estado: nuevoEstado } : r)
          );

          Swal.fire({
            icon: "success",
            title: "✅ Estado actualizado",
            text: `El rol ha sido ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
            confirmButtonColor: "#d15153",
            background: "#fff8e7",
          });
        } catch (error) {
          console.error("Error cambiando estado:", error);
          Swal.fire({
            icon: "error",
            title: "❌ Error al cambiar estado",
            text: "No se pudo cambiar el estado del rol",
            confirmButtonColor: "#d15153",
            background: "#fff8e7",
          });
        }
      }
    });
  };

  // ELIMINAR rol
  const handleEliminar = (rol) => {
    if (rol) {
      // 🔥 PROTECCIÓN DE ROL ADMIN
      if (rol.nombreRol.toLowerCase() === "admin" || rol.nombreRol.toLowerCase() === "administrador") {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Acción no permitida",
          text: "El rol de Administrador no puede ser eliminado",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        return;
      }

      Swal.fire({
        icon: "warning",
        title: "⚠️ Confirmar eliminación",
        html: `¿Estás seguro de eliminar este rol?<br><br>
               <div class="text-left">
                 <p><strong>Nombre:</strong> ${rol.nombreRol}</p>
                 <p><strong>ID:</strong> ${rol.idRol}</p>
               </div>`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await DeleteRole(rol.idRol);
            await cargarRoles();

            Swal.fire({
              icon: "success",
              title: "✅ Rol eliminado",
              text: "El rol se ha eliminado correctamente",
              confirmButtonColor: "#b45309",
              background: "#fff8e7",
            });
          } catch (error) {
            console.error("Error eliminando rol:", error);

            // Manejar específicamente el error de integridad referencial
            if (error.message.includes("REFERENCE constraint") ||
              error.message.includes("FK_") ||
              error.message.includes("Error 500")) {

              Swal.fire({
                icon: "error",
                title: "❌ No se puede eliminar",
                html: `No se puede eliminar el rol <strong>"${rol.nombreRol}"</strong> porque tiene usuarios asociados.<br><br>Primero debes reasignar los usuarios de este rol.`,
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "❌ Error al eliminar",
                text: "Ocurrió un error al eliminar el rol",
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            }
          }
        }
      });
    }
  };

  // MOSTRAR formularios
  const mostrarEditar = (id) => {
    const rol = listaRoles.find((r) => r.idRol === id);
    if (rol) {
      setRolSeleccionado(rol);
      setShowEditar(true);
    }
  };

  const mostrarDetalles = (id) => {
    const rol = listaRoles.find((r) => r.idRol === id);
    if (rol) {
      setRolSeleccionado(rol);
      setShowDetalles(true);
    }
  };

  // CERRAR modales
  const closeModal = () => {
    setShowEditar(false);
    setRolSeleccionado(null);
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setRolSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando roles...</div>
      </div>
    );
  }

  return (
    <>
      <TituloSeccion titulo="Roles" />

      {/* Sección de botón y búsqueda */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-4">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPaginaActual(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div className="flex-shrink-0 w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar rol"
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {rolesFiltrados.length} de {listaRoles.length} roles
            </p>
          )}
        </div>
      </section>

      {/* Tabla de roles */}
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin listaCabecera={columnasConOrdenamiento}>
            {rolesPaginados.length > 0 ? (
              rolesPaginados.map((element) => (
                <tr
                  key={element.idRol}
                  className="hover:bg-gray-100 border-t-2 border-gray-300"
                >
                  <td className="py-2 px-4 font-medium">{element.idRol}</td>
                  <td className="py-2 px-4">{element.nombreRol}</td>
                  <td className="py-1 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={element.Estado || false}
                        onChange={() => handleCambiarEstado(element, !element.Estado)}
                        disabled={element.nombreRol.toLowerCase() === "admin" || element.nombreRol.toLowerCase() === "administrador"}
                      />
                      <div
                        className={`w-11 h-6 rounded-full peer ${element.Estado ? "bg-green-500" : "bg-gray-300"
                          } peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${element.Estado ? "transform translate-x-5" : ""
                            }`}
                        ></div>
                      </div>
                    </label>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => mostrarDetalles(element.idRol)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                      onClick={() => mostrarEditar(element.idRol)}
                      title="Editar rol"
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 hover:text-red-900 cursor-pointer transition-colors"
                      onClick={() => handleEliminar(element)}
                      title="Eliminar rol"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda || filtroID || filtroEstado ?
                    `No se encontraron roles que coincidan con los filtros aplicados` :
                    "No hay roles disponibles"
                  }
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* 🔹 Paginación con información de resultados */}
      {totalPaginas > 1 && (
        <div className="col-span-2 mt-1">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            handleCambioPagina={handleCambioPagina}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            Página {paginaActual} de {totalPaginas} - {rolesFiltrados.length} roles encontrados
            {(filtroID || terminoBusqueda || filtroEstado) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* 🔹 Mostrar info cuando hay filtros pero solo una página */}
      {totalPaginas === 1 && rolesFiltrados.length > 0 && (
        <div className="col-span-2 mt-1">
          <p className="text-sm text-gray-600 text-center">
            Mostrando {rolesFiltrados.length} roles
            {(filtroID || terminoBusqueda || filtroEstado) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* Modales */}
      <FormularioAgregarRol
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        permisosDisponibles={permisosDisponibles}
      />

      <FormularioModificarRol
        show={showEditar}
        close={closeModal}
        rol={rolSeleccionado}
        onSubmit={handleEditarSubmit}
        permisosDisponibles={permisosDisponibles}
      />

      <FormularioVerDetallesRol
        show={showDetalles}
        close={closeDetalles}
        rol={rolSeleccionado}
      />

      {/* Agregar Font Awesome para los iconos */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </>
  );
};

export default PaginaRoles;