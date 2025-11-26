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
import { GetCProductos, PostCProducto, PutCategoria, DeleteCProducto } from "../../../../services/categoriaService";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaCategorias = () => {
  // Estados principales
  const [listaCategorias, setListaCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    idCategoria: 0,
    nombreCategoria: "",
    descripcion: "",
    estado: true,
  });

  // Estados de UI
  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [showConfirmacionEstado, setShowConfirmacionEstado] = useState(false);

  // Estados de datos temporales
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [categoriaCambioEstado, setCategoriaCambioEstado] = useState(null);
  const [errores, setErrores] = useState({});

  // Estado para ordenamiento - MODIFICADO: orden por defecto descendente por ID
  const [ordenamiento, setOrdenamiento] = useState({
    columna: 'idCategoria', // Ordenar por ID por defecto
    direccion: 'desc' // Orden descendente por defecto (más recientes primero)
  });

  // Refs
  const nombreRef = useRef();
  const descripcionRef = useRef();
  const busquedaRef = useRef();

  const categoriasPorPagina = 9;

  // Cargar categorías al iniciar
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await GetCProductos();
      setListaCategorias(data);
    } catch (error) {
      console.error("Error cargando las categorías:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cargar",
        text: "No se pudieron cargar las categorías",
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
      titulo: "Nombre",
      onClick: () => handleOrdenar('nombreCategoria'),
      icono: getSortIcon('nombreCategoria')
    },
    {
      titulo: "Descripción",
      onClick: () => handleOrdenar('descripcion'),
      icono: getSortIcon('descripcion')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('estado'),
      icono: getSortIcon('estado')
    },
    "Acciones"
  ];

  // Filtrar y ordenar categorías - MEJORADA la lógica de ordenamiento
  const categoriasFiltradas = useMemo(() => {
    let filtrados = listaCategorias;

    // Filtrar por búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((categoria) => {
        const nombre = categoria.nombreCategoria?.toLowerCase() || '';
        const descripcion = categoria.descripcion?.toLowerCase() || '';

        return (
          nombre.includes(termino) ||
          descripcion.includes(termino)
        );
      });
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

        // Para columna idCategoria (orden numérico)
        if (ordenamiento.columna === 'idCategoria') {
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
  }, [listaCategorias, terminoBusqueda, ordenamiento]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);
  const indiceInicio = (paginaActual - 1) * categoriasPorPagina;
  const indiceFin = indiceInicio + categoriasPorPagina;
  const categoriasPaginadas = categoriasFiltradas.slice(indiceInicio, indiceFin);

  // 🔹 CORRECCIÓN: Asegurar que la página actual no exceda el total de páginas
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    } else if (paginaActual < 1 && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Validaciones
  const validarCategoria = (categoria) => {
    const nuevosErrores = {};
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;

    // Validar nombre
    if (!categoria.nombreCategoria || categoria.nombreCategoria.trim() === '') {
      nuevosErrores.nombreCategoria = 'El nombre es obligatorio';
    } else if (!regexLetras.test(categoria.nombreCategoria.trim())) {
      nuevosErrores.nombreCategoria = 'El nombre contiene caracteres no permitidos';
    } else if (categoria.nombreCategoria.trim().length < 2) {
      nuevosErrores.nombreCategoria = 'El nombre debe tener al menos 2 caracteres';
    } else if (categoria.nombreCategoria.trim().length > 50) {
      nuevosErrores.nombreCategoria = 'El nombre no puede exceder 50 caracteres';
    }

    // Validar descripción
    if (!categoria.descripcion || categoria.descripcion.trim() === '') {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (!regexLetras.test(categoria.descripcion.trim())) {
      nuevosErrores.descripcion = 'La descripción contiene caracteres no permitidos';
    } else if (categoria.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (categoria.descripcion.trim().length > 200) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 200 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // AGREGAR categoría
  const handleAgregarSubmit = async (e) => {
    e.preventDefault();

    const nuevaCategoria = {
      NombreCategoria: nombreRef.current.value,
      Descripcion: descripcionRef.current.value,
    };

    if (!validarCategoria({
      nombreCategoria: nuevaCategoria.NombreCategoria,
      descripcion: nuevaCategoria.Descripcion
    })) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Validación requerida",
        text: "Por favor corrige los errores en el formulario",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    try {
      await PostCProducto(nuevaCategoria);
      await cargarCategorias();
      setShowAgregar(false);
      setErrores({});
      Swal.fire({
        icon: "success",
        title: "✅ Categoría agregada",
        text: "La categoría se ha agregado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "❌ Error al agregar",
        text: "No se pudo agregar la categoría",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      console.error("Error al agregar categoría:", error);
    }
  };

  // EDITAR categoría
  const handleEditarSubmit = async (e) => {
    e.preventDefault();

    const updatedCategoria = {
      NombreCategoria: nombreRef.current.value,
      Descripcion: descripcionRef.current.value,
      Estado: formData.estado
    };

    const existeDuplicado = listaCategorias.some(
      (c) =>
        c.nombreCategoria?.toLowerCase() === updatedCategoria.NombreCategoria.trim().toLowerCase() &&
        c.idCategoria !== formData.idCategoria
    );

    if (existeDuplicado) {
      setErrores({ nombreCategoria: "Ya existe una categoría con ese nombre" });
      nombreRef.current.focus();
      Swal.fire({
        icon: "warning",
        title: "⚠️ Categoría duplicada",
        text: "Ya existe una categoría con ese nombre",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    if (!validarCategoria({
      nombreCategoria: updatedCategoria.NombreCategoria,
      descripcion: updatedCategoria.Descripcion
    })) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Validación requerida",
        text: "Por favor corrige los errores en el formulario",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    try {
      await PutCategoria(formData.idCategoria, updatedCategoria);
      await cargarCategorias();
      closeModal();
      setErrores({});
      Swal.fire({
        icon: "success",
        title: "✅ Categoría actualizada",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "❌ Error al actualizar",
        text: "No se pudo actualizar la categoría",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      console.error("Error al editar categoría:", error);
    }
  };

  // ELIMINAR categoría
  const handleEliminar = (id) => {
    const categoria = listaCategorias.find((c) => c.idCategoria === id);

    if (categoria) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Confirmar eliminación",
        text: "¿Estás seguro de eliminar esta categoría?",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        html: `
          <div class="text-left">
            <p><strong>Nombre:</strong> ${categoria.nombreCategoria}</p>
            <p><strong>Descripción:</strong> ${categoria.descripcion}</p>
            <p><strong>Estado:</strong> ${categoria.estado ? "Activo" : "Inactivo"}</p>
          </div>
        `
      }).then((result) => {
        if (result.isConfirmed) {
          confirmarEliminacion(categoria);
        }
      });
    }
  };

  const confirmarEliminacion = async (categoria) => {
    if (!categoria) {
      console.error("❌ Categoría es null/undefined");
      return;
    }

    try {
      await DeleteCProducto(categoria.idCategoria);
      await cargarCategorias();
      Swal.fire({
        icon: "success",
        title: "✅ Categoría eliminada",
        text: "La categoría se ha eliminado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      setCategoriaAEliminar(null);
      setShowConfirmacion(false);
    } catch (error) {
      console.error("💥 Error al eliminar categoría:", error);

      // Manejar específicamente el error de integridad referencial
      if (error.message.includes("REFERENCE constraint") ||
        error.message.includes("FK_Productos_Categorias") ||
        error.message.includes("Error 500")) {

        Swal.fire({
          icon: "error",
          title: "❌ No se puede eliminar",
          html: `No se puede eliminar la categoría <strong>"${categoria.nombreCategoria}"</strong> porque tiene productos asociados.<br><br>Primero debes eliminar o reasignar los productos de esta categoría.`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "❌ Error al eliminar",
          text: "Ocurrió un error al eliminar la categoría",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }

      setCategoriaAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  // CAMBIAR ESTADO categoría
  const cambiarEstado = (id) => {
    const categoria = listaCategorias.find(c => c.idCategoria === id);

    if (categoria) {
      Swal.fire({
        icon: "question",
        title: "🔄 Cambiar estado",
        html: `¿Estás seguro de que deseas <strong>${categoria.estado ? 'desactivar' : 'activar'}</strong> esta categoría?<br><br>
               <div class="text-left">
                 <p><strong>Nombre:</strong> ${categoria.nombreCategoria}</p>
                 <p><strong>Descripción:</strong> ${categoria.descripcion}</p>
                 <p><strong>Estado actual:</strong> ${categoria.estado ? "Activo" : "Inactivo"}</p>
                 <p><strong>Nuevo estado:</strong> ${categoria.estado ? "Inactivo" : "Activo"}</p>
               </div>`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: categoria.estado ? 'Desactivar' : 'Activar',
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          confirmarCambioEstado(categoria);
        }
      });
    }
  };

  const confirmarCambioEstado = async (categoria) => {
    if (categoria) {
      try {
        const nuevoEstado = !categoria.estado;
        await PutCategoria(categoria.idCategoria, {
          NombreCategoria: categoria.nombreCategoria,
          Descripcion: categoria.descripcion,
          Estado: nuevoEstado
        });
        await cargarCategorias();

        Swal.fire({
          icon: "success",
          title: "✅ Estado actualizado",
          text: `La categoría ha sido ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });

        setCategoriaCambioEstado(null);
        setShowConfirmacionEstado(false);
      } catch (error) {
        console.error("Error al cambiar estado:", error);
        Swal.fire({
          icon: "error",
          title: "❌ Error al cambiar estado",
          text: "No se pudo cambiar el estado de la categoría",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    }
  };

  // MOSTRAR formularios
  const mostrarEditar = (id) => {
    const categoria = listaCategorias.find((c) => c.idCategoria === id);

    if (categoria) {
      if (!categoria.estado) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Categoría inactiva",
          text: "No se puede editar una categoría inactiva",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        return;
      }

      setFormData({
        idCategoria: categoria.idCategoria,
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
        estado: categoria.estado
      });
      setErrores({});
      setShowEditar(true);
    }
  };

  const mostrarDetalles = (id) => {
    const categoria = listaCategorias.find((c) => c.idCategoria === id);
    if (categoria) {
      setCategoriaSeleccionada(categoria);
      setShowDetalles(true);
    }
  };

  // CERRAR modales
  const closeModal = () => {
    setShowEditar(false);
    setFormData({
      idCategoria: 0,
      nombreCategoria: "",
      descripcion: "",
      estado: true
    });
    setErrores({});
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setCategoriaSeleccionada(null);
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setCategoriaAEliminar(null);
  };

  const cerrarConfirmacionEstado = () => {
    setShowConfirmacionEstado(false);
    setCategoriaCambioEstado(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TituloSeccion titulo="Categorías" />

      {/* Sección de botón y búsqueda */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar categoría"
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {categoriasFiltradas.length} de {listaCategorias.length} categorías
            </p>
          )}
        </div>
      </section>

      {/* Tabla de categorías */}
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin
            listaCabecera={columnasConOrdenamiento}
          >
            {categoriasPaginadas.length > 0 ? (
              categoriasPaginadas.map((element) => (
                <tr
                  key={element.idCategoria}
                  className="hover:bg-gray-100 border-t-2 border-gray-300"
                >
                  <td className="py-2 px-4">{element.nombreCategoria}</td>

                  <td className="py-2 px-4">
                    {element.descripcion && element.descripcion.length > 50
                      ? `${element.descripcion.substring(0, 50)}...`
                      : element.descripcion}
                  </td>

                  <td className="py-1 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={element.estado || false}
                        onChange={() => cambiarEstado(element.idCategoria)}
                      />
                      <div
                        className={`w-11 h-6 rounded-full peer ${element.estado ? "bg-green-500" : "bg-gray-300"
                          } peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${element.estado ? "transform translate-x-5" : ""
                            }`}
                        ></div>
                      </div>
                    </label>
                  </td>

                  <td className="py-2 px-4 flex gap-2 justify-center">
                    {/* Ver detalles */}
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => mostrarDetalles(element.idCategoria)}
                    />

                    {/* Editar */}
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className={`cursor-pointer transition-colors ${element.estado
                        ? "text-blue-700 hover:text-blue-900"
                        : "text-gray-400 cursor-not-allowed"
                        }`}
                      onClick={() => mostrarEditar(element.idCategoria)}
                    />

                    {/* Eliminar */}
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 hover:text-red-900 cursor-pointer transition-colors"
                      onClick={() => handleEliminar(element.idCategoria)}
                      alt=""
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda
                    ? `No se encontraron categorías que coincidan con "${terminoBusqueda}"`
                    : "No hay categorías disponibles"}
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* Paginación con el mismo formato que clientes */}
      {
        totalPaginas > 1 && (
          <div className="col-span-2 mt-4">
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              handleCambioPagina={handleCambioPagina}
            />
            <p className="text-sm text-gray-600 text-center mt-2">
              Página {paginaActual} de {totalPaginas} - {categoriasFiltradas.length} categorías encontradas
            </p>
          </div>
        )
      }

      {
        totalPaginas === 1 && categoriasFiltradas.length > 0 && (
          <div className="col-span-2 mt-4">
            <p className="text-sm text-gray-600 text-center">
              Mostrando {categoriasFiltradas.length} categorías
              {terminoBusqueda && " (filtradas)"}
            </p>
          </div>
        )
      }

      {/* Modales */}
      <FormularioAgregar
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        nombreRef={nombreRef}
        descripcionRef={descripcionRef}
        errores={errores}
        setErrores={setErrores}
      />

      <FormularioModificar
        show={showEditar}
        close={closeModal}
        formData={formData}
        onSubmit={handleEditarSubmit}
        nombreRef={nombreRef}
        descripcionRef={descripcionRef}
        errores={errores}
        setErrores={setErrores}
        setFormData={setFormData}
        categorias={listaCategorias}
        categoriaActual={listaCategorias.find(c => c.idCategoria === formData.idCategoria)}
      />

      <FormularioVerDetalles
        show={showDetalles}
        close={closeDetalles}
        categoria={categoriaSeleccionada}
      />

      {/* Agregar Font Awesome para los iconos */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
};

export default PaginaCategorias;