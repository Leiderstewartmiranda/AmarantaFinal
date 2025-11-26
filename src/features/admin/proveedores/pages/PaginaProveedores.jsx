import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import { useRef, useState, useMemo, useEffect } from "react";
import { GetProveedores, PostProveedor, PutProveedor, DeleteProveedore, CambiarEstadoProveedor } from "../../../../services/proveedorService";
import FormularioAgregarProveedor from "../components/forms/FormularioAgregar";
import FormularioModificarProveedor from "../components/forms/FormularioModificar";
import FormularioVerProveedor from "../components/forms/FormularioVer";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaProveedores = () => {
  // Lista de proveedores
  const [listaProveedores, setListaProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recarga, setRecarga] = useState(0);

  // Estados para filtros y ordenamiento
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipoDoc, setFiltroTipoDoc] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const proveedoresPorPagina = 9;

  // Estado para ordenamiento - MODIFICADO: orden por defecto descendente por ID
  const [ordenamiento, setOrdenamiento] = useState({
    columna: 'idProveedor', // Ordenar por ID de proveedor por defecto
    direccion: 'desc' // Orden descendente por defecto (más recientes primero)
  });

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const busquedaRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await GetProveedores();
        console.log("Datos recibidos de la API:", data);
        setListaProveedores(data);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        Swal.fire({
          icon: "error",
          title: "❌ Error al cargar",
          text: "No se pudieron cargar los proveedores",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [recarga]);

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
      titulo: "Nombre Empresa",
      onClick: () => handleOrdenar('nombreEmpresa'),
      icono: getSortIcon('nombreEmpresa')
    },
    {
      titulo: "Contacto",
      onClick: () => handleOrdenar('correo'),
      icono: getSortIcon('correo')
    },
    {
      titulo: "Tipo Documento",
      onClick: () => handleOrdenar('nit'),
      icono: getSortIcon('nit')
    },
    {
      titulo: "Documento",
      onClick: () => handleOrdenar('representante'),
      icono: getSortIcon('representante')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('estado'),
      icono: getSortIcon('estado')
    },
    "Acciones"
  ];

  // 🔹 Filtrar y ordenar proveedores - MEJORADA la lógica de ordenamiento
  const proveedoresFiltrados = useMemo(() => {
    let filtrados = listaProveedores;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter((proveedor) => {
        const nombreEmpresa = proveedor.nombreEmpresa?.toLowerCase() || '';
        const correo = proveedor.correo?.toLowerCase() || '';
        const tipoDocumento = proveedor.nit?.toLowerCase() || '';
        const documento = proveedor.representante?.toLowerCase() || '';
        const telefono = proveedor.telefono ? proveedor.telefono.toLowerCase() : "";

        return (
          nombreEmpresa.includes(termino) ||
          correo.includes(termino) ||
          tipoDocumento.includes(termino) ||
          documento.includes(termino) ||
          telefono.includes(termino)
        );
      });
    }

    // Aplicar filtro de estado
    if (filtroEstado) {
      const estadoFiltro = filtroEstado === "Activo";
      filtrados = filtrados.filter(proveedor => proveedor.estado === estadoFiltro);
    }

    // Aplicar filtro de tipo de documento
    if (filtroTipoDoc) {
      filtrados = filtrados.filter(proveedor => proveedor.nit === filtroTipoDoc);
    }

    // Aplicar ordenamiento
    if (ordenamiento.columna) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue = a[ordenamiento.columna];
        let bValue = b[ordenamiento.columna];

        // Para columnas booleanas (estado)
        if (ordenamiento.columna === 'estado') {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }

        // Para columna idProveedor (orden numérico)
        if (ordenamiento.columna === 'idProveedor') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        // Manejar valores null/undefined en strings
        if (typeof aValue === 'string') aValue = aValue.toLowerCase() || '';
        if (typeof bValue === 'string') bValue = bValue.toLowerCase() || '';

        if (ordenamiento.direccion === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtrados;
  }, [listaProveedores, terminoBusqueda, filtroEstado, filtroTipoDoc, ordenamiento]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina);
  const indiceInicio = (paginaActual - 1) * proveedoresPorPagina;
  const proveedoresPaginados = proveedoresFiltrados.slice(indiceInicio, indiceInicio + proveedoresPorPagina);

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

  // Función para cambiar estado del proveedor
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const proveedor = listaProveedores.find(p => p.idProveedor === id);
      if (proveedor) {
        Swal.fire({
          icon: "question",
          title: "🔄 Cambiar estado",
          html: `¿Estás seguro de que deseas <strong>${nuevoEstado ? 'activar' : 'desactivar'}</strong> este proveedor?<br><br>
                 <div class="text-left">
                   <p><strong>Proveedor:</strong> ${proveedor.nombreEmpresa}</p>
                   <p><strong>Estado actual:</strong> ${proveedor.estado ? "Activo" : "Inactivo"}</p>
                   <p><strong>Nuevo estado:</strong> ${nuevoEstado ? "Activo" : "Inactivo"}</p>
                 </div>`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
          showCancelButton: true,
          cancelButtonColor: "#6b7280",
          confirmButtonText: nuevoEstado ? 'Activar' : 'Desactivar',
          cancelButtonText: "Cancelar"
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const datosActualizados = {
                ...proveedor,
                estado: nuevoEstado
              };

              await CambiarEstadoProveedor(id, datosActualizados);

              setListaProveedores(
                listaProveedores.map((proveedor) =>
                  proveedor.idProveedor === id ? { ...proveedor, estado: nuevoEstado } : proveedor
                )
              );

              Swal.fire({
                icon: "success",
                title: "✅ Estado actualizado",
                text: `El proveedor ha sido ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            } catch (error) {
              console.error("Error cambiando estado:", error);
              Swal.fire({
                icon: "error",
                title: "❌ Error al cambiar estado",
                text: "No se pudo cambiar el estado del proveedor",
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cambiar estado",
        text: "No se pudo cambiar el estado del proveedor",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const handleAgregarSubmit = async (nuevoProveedor) => {
    try {
      const proveedorCreado = await PostProveedor(nuevoProveedor);
      setRecarga(prev => prev + 1);
      setListaProveedores([...listaProveedores, proveedorCreado]);
      setShowAgregar(false);

      Swal.fire({
        icon: "success",
        title: "✅ Proveedor agregado",
        text: "El proveedor se ha agregado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error creando proveedor:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al agregar",
        text: "No se pudo agregar el proveedor",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const handleEditarSubmit = async (proveedorActualizado) => {
    try {
      console.log("🔄 Recibiendo proveedor actualizado:", proveedorActualizado);
      console.log("🔍 ID del proveedor:", proveedorActualizado?.idProveedor);

      // ✅ VALIDACIÓN: Asegurar que el proveedor tiene ID
      if (!proveedorActualizado || !proveedorActualizado.idProveedor) {
        console.error("❌ Error: Proveedor sin ID", proveedorActualizado);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo identificar el proveedor para actualizar.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        return;
      }

      // Llamar al servicio
      await PutProveedor(proveedorActualizado.idProveedor, proveedorActualizado);

      // ✅ ACTUALIZAR ESTADO LOCAL
      setListaProveedores(prev =>
        prev.map(proveedor =>
          proveedor.idProveedor === proveedorActualizado.idProveedor
            ? { ...proveedor, ...proveedorActualizado }
            : proveedor
        )
      );

      setRecarga(prev => prev + 1);
      closeModal();

      Swal.fire({
        icon: "success",
        title: "✅ Proveedor actualizado",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });

    } catch (error) {
      console.error("💥 Error actualizando proveedor:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al actualizar",
        text: "No se pudo actualizar el proveedor",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const handleEliminar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);
    if (proveedor) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Confirmar eliminación",
        html: `¿Estás seguro de eliminar este proveedor?<br><br>
               <div class="text-left">
                 <p><strong>Nombre:</strong> ${proveedor.nombreEmpresa}</p>
                 <p><strong>Correo:</strong> ${proveedor.correo}</p>
                 <p><strong>Tipo Documento:</strong> ${proveedor.nit}</p>
                 <p><strong>Documento:</strong> ${proveedor.representante}</p>
                 <p><strong>Estado:</strong> ${proveedor.estado ? "Activo" : "Inactivo"}</p>
               </div>`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          confirmarEliminacion(proveedor);
        }
      });
    }
  };

  const confirmarEliminacion = async (proveedor) => {
    if (!proveedor) {
      console.error("❌ Proveedor es null/undefined");
      return;
    }

    try {
      await DeleteProveedore(proveedor.idProveedor);
      setListaProveedores(
        listaProveedores.filter((p) => p.idProveedor !== proveedor.idProveedor)
      );

      Swal.fire({
        icon: "success",
        title: "✅ Proveedor eliminado",
        text: "El proveedor se ha eliminado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });

      setProveedorAEliminar(null);
      setShowConfirmacion(false);
    } catch (error) {
      console.error("Error eliminando proveedor:", error);

      if (error.message.includes("REFERENCE constraint") ||
        error.message.includes("FK_Productos_Proveedores") ||
        error.message.includes("Error 500")) {

        Swal.fire({
          icon: "error",
          title: "❌ No se puede eliminar",
          html: `No se puede eliminar el proveedor <strong>"${proveedor.nombreEmpresa}"</strong> porque tiene productos asociados.<br><br>Primero debes eliminar o reasignar los productos de este proveedor.`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "❌ Error al eliminar",
          text: "Ocurrió un error al eliminar el proveedor",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }

      setProveedorAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setProveedorAEliminar(null);
  };

  const mostrarVer = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);

    if (proveedor) {
      setProveedorSeleccionado({
        idProveedor: proveedor.idProveedor,
        nombreEmpresa: proveedor.nombreEmpresa,
        correo: proveedor.correo,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        representante: proveedor.representante,
        estado: proveedor.estado,
        fechaCreacion: proveedor.fechaCreacion
      });
      setShowVer(true);
    }
  };

  const mostrarEditar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);

    if (proveedor) {
      if (!proveedor.estado) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Proveedor inactivo",
          text: "No se puede editar un proveedor inactivo",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        return;
      }

      setProveedorSeleccionado({
        idProveedor: proveedor.idProveedor,
        nombreEmpresa: proveedor.nombreEmpresa,
        correo: proveedor.correo,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        representante: proveedor.representante,
        estado: proveedor.estado,
        fechaCreacion: proveedor.fechaCreacion
      });
      setShowEditar(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setShowVer(false);
    setProveedorSeleccionado(null);
  };

  const getEstadoColor = (estado) => {
    return estado ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300";
  };

  const getTipoDocumentoColor = (nit) => {
    return nit === "NIT" ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-purple-100 text-purple-800 border-purple-300";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center col-span-2 h-64">
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TituloSeccion titulo="Proveedores" />

      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <section className="col-span-2">
          <div className="filtros flex items-center gap-3 mb-1">
            <select
              value={filtroTipoDoc}
              onChange={(e) => {
                setFiltroTipoDoc(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tipo documento</option>
              <option value="NIT">NIT</option>
              <option value="RUT">RUT</option>
              <option value="CC">CC</option>
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </section>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar proveedores"
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {proveedoresFiltrados.length} de {listaProveedores.length} proveedores
            </p>
          )}
        </div>
      </section>

      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin listaCabecera={columnasConOrdenamiento}>
            {proveedoresPaginados.length > 0 ? (
              proveedoresPaginados.map((element) => (
                <tr
                  key={element.idProveedor}
                  className="hover:bg-gray-100 border-t-2 border-gray-300"
                >
                  <td className="py-2 px-4 font-medium">{element.nombreEmpresa}</td>
                  <td className="py-2 px-4 text-sm text-black max-w-xs truncate">
                    {element.correo}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getTipoDocumentoColor(element.nit)}`}>
                      {element.nit}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-black">
                    {element.representante}
                  </td>
                  <td className="py-1 px-4">
                    {/* 🔄 SWITCH PARA CAMBIAR ESTADO */}
                    <div className="flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={element.estado}
                          onChange={(e) => handleCambiarEstado(element.idProveedor, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer ${element.estado ? 'bg-green-500' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 transition-colors duration-200`}>
                          <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ${element.estado ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                      </label>
                    </div>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="material-symbols:visibility-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-800"
                      onClick={() => mostrarVer(element.idProveedor)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className={`cursor-pointer transition-colors ${element.estado
                        ? "text-blue-700 hover:text-blue-800"
                        : "text-gray-400 cursor-not-allowed"
                        }`
                      }
                      onClick={() => mostrarEditar(element.idProveedor)}
                      title={element.estado ? "Editar proveedor" : "No editable (inactivo)"}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 cursor-pointer hover:text-red-800"
                      onClick={() => handleEliminar(element.idProveedor)}
                      title="Eliminar proveedor"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda || filtroEstado || filtroTipoDoc ?
                    `No se encontraron proveedores que coincidan con los filtros aplicados` :
                    "No hay proveedores disponibles"
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
            Página {paginaActual} de {totalPaginas} - {proveedoresFiltrados.length} proveedores encontrados
            {(filtroEstado || filtroTipoDoc || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* 🔹 Mostrar info cuando hay filtros pero solo una página */}
      {totalPaginas === 1 && proveedoresFiltrados.length > 0 && (
        <div className="col-span-2 mt-4">
          <p className="text-sm text-gray-600 text-center">
            Mostrando {proveedoresFiltrados.length} proveedores
            {(filtroEstado || filtroTipoDoc || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      <FormularioAgregarProveedor
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        titulo="Agregar Nuevo Proveedor"
      />

      <FormularioModificarProveedor
        show={showEditar}
        close={closeModal}
        formData={proveedorSeleccionado}
        onProveedorActualizado={handleEditarSubmit}
        proveedores={listaProveedores}
        titulo="Modificar Proveedor"
      />

      <FormularioVerProveedor
        show={showVer}
        close={closeModal}
        formData={proveedorSeleccionado}
        titulo="Detalles del Proveedor"
      />

      {/* Agregar Font Awesome para los iconos */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
};

export default PaginaProveedores;