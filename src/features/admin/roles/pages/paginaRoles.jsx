// pages/roles/PaginaRoles.js
import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import { GetRoles, PostRole, PutRole, DeleteRole } from "../../../../services/rolService";
import FormularioAgregarRol from "../components/forms/FormularioAgregar";
import FormularioModificarRol from "../components/forms/FormularioModificar";
import FormularioVerDetallesRol from "../components/forms/FormularioVerDetalles";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaRoles = () => {
  // Estados principales
  const [listaRoles, setListaRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroID, setFiltroID] = useState("");
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

  const rolesPorPagina = 5;

  // Cargar roles al iniciar
  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const data = await GetRoles();
      setListaRoles(data);
    } catch (error) {
      console.error("Error cargando los roles:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cargar",
        text: "No se pudieron cargar los roles",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } finally {
      setLoading(false);
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
  }, [listaRoles, terminoBusqueda, filtroID, ordenamiento]);

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
  const handleAgregarSubmit = async (e) => {
    e.preventDefault();

    const nuevoRol = {
      NombreRol: nombreRef.current.value.trim()
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
  const handleEditarSubmit = async (e) => {
    e.preventDefault();

    const rolActualizado = {
      NombreRol: nombreRef.current.value.trim()
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

  // ELIMINAR rol
  const handleEliminar = (rol) => {
    if (rol) {
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
        <section className="col-span-2">
        <div className="filtros flex items-center gap-3 mb-1">
          <input 
            type="text"
            value={filtroID}
            onChange={(e) => {
              setFiltroID(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Filtrar por ID"
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          
          {/* <button 
            onClick={aplicarFiltros}
            className="btn-filtrar px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-amber-700 transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fa-solid fa-filter"></i>
            Filtrar
          </button> */}
        </div>
      </section>
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

      {/* 🔹 Sección de Filtros para Roles */}
      

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
                <td colSpan="3" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda || filtroID ? 
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
        <div className="col-span-2 mt-4">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            handleCambioPagina={handleCambioPagina}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            Página {paginaActual} de {totalPaginas} - {rolesFiltrados.length} roles encontrados
            {(filtroID || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* 🔹 Mostrar info cuando hay filtros pero solo una página */}
      {totalPaginas === 1 && rolesFiltrados.length > 0 && (
        <div className="col-span-2 mt-4">
          <p className="text-sm text-gray-600 text-center">
            Mostrando {rolesFiltrados.length} roles
            {(filtroID || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* Modales */}
      <FormularioAgregarRol
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        nombreRef={nombreRef}
      />

      <FormularioModificarRol
        show={showEditar}
        close={closeModal}
        rol={rolSeleccionado}
        onSubmit={handleEditarSubmit}
        nombreRef={nombreRef}
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