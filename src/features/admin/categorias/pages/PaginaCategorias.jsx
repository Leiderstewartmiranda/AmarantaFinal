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

const PaginaCategorias = () => {
  // Estados principales
  const [listaCategorias, setListaCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    idCategoria: 0,
    nombreCategoria: "",
    descripcion: "",
    //estado: true,
    fechaCreacion: ""
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

  // Refs
  const nombreRef = useRef();
  const descripcionRef = useRef();
  const busquedaRef = useRef();

  const categoriasPorPagina = 5;

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
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorías basado en el término de búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaCategorias;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaCategorias.filter((categoria) => {
      const nombre = categoria.nombreCategoria?.toLowerCase() || '';
      const descripcion = categoria.descripcion?.toLowerCase() || '';

      return (
        nombre.includes(termino) ||
        descripcion.includes(termino)
      );
    });
  }, [listaCategorias, terminoBusqueda]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);
  const indiceInicio = (paginaActual - 1) * categoriasPorPagina;
  const indiceFin = indiceInicio + categoriasPorPagina;
  const categoriasPaginadas = categoriasFiltradas.slice(indiceInicio, indiceFin);

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
      return;
    }

    try {
      await PostCProducto(nuevaCategoria);
      await cargarCategorias();
      setShowAgregar(false);
      setErrores({});
    } catch (error) {
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

    if (!validarCategoria({
      nombreCategoria: updatedCategoria.NombreCategoria,
      descripcion: updatedCategoria.Descripcion
    })) {
      return;
    }

    try {
      await PutCategoria(formData.idCategoria, updatedCategoria);
      await cargarCategorias();
      closeModal();
      setErrores({});
    } catch (error) {
      console.error("Error al editar categoría:", error);
    }
  };

  // ELIMINAR categoría
  const handleEliminar = (id) => {
    const categoria = listaCategorias.find((c) => c.idCategoria === id);
    
    if (categoria) {
      setCategoriaAEliminar(categoria);
      setShowConfirmacion(true);
    }
  };

  const confirmarEliminacion = async () => {
    if (categoriaAEliminar) {
      try {
        await DeleteCProducto(categoriaAEliminar.idCategoria);
        await cargarCategorias();
        setCategoriaAEliminar(null);
        setShowConfirmacion(false);
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
      }
    }
  };

  // CAMBIAR ESTADO categoría
  const cambiarEstado = (id) => {
    const categoria = listaCategorias.find(c => c.idCategoria === id);
    
    if (categoria) {
      setCategoriaCambioEstado(categoria);
      setShowConfirmacionEstado(true);
    }
  };

  const confirmarCambioEstado = async () => {
    if (categoriaCambioEstado) {
      try {
        const nuevoEstado = !categoriaCambioEstado.estado;
        await PutCategoria(categoriaCambioEstado.idCategoria, {
          NombreCategoria: categoriaCambioEstado.nombreCategoria,
          Descripcion: categoriaCambioEstado.descripcion,
          Estado: nuevoEstado
        });
        await cargarCategorias();
        setCategoriaCambioEstado(null);
        setShowConfirmacionEstado(false);
      } catch (error) {
        console.error("Error al cambiar estado:", error);
      }
    }
  };

  // MOSTRAR formularios
  const mostrarEditar = (id) => {
    const categoria = listaCategorias.find((c) => c.idCategoria === id);

    if (categoria) {
      setFormData({
        idCategoria: categoria.idCategoria,
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
        estado: categoria.estado,
        fechaCreacion: categoria.fechaCreacion
      });
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
      estado: true,
      fechaCreacion: ""
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

  // Función para generar los números de página
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 7;
    
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }
    
    return numeros;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Categorías</h2>
      </section>
      
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
            listaCabecera={["Nombre", "Descripción", "Estado", "Acciones"]}
          >
            {categoriasPaginadas.length > 0 ? (
              categoriasPaginadas.map((element) => (
                <tr
                  key={element.idCategoria}
                  className="hover:bg-gray-100 border-t-2 border-gray-300"
                >
                  <td className="py-2 px-4">
                    {element.nombreCategoria}
                  </td>
                  <td className="py-2 px-4">
                    {element.descripcion && element.descripcion.length > 50 
                      ? `${element.descripcion.substring(0, 50)}...` 
                      : element.descripcion
                    }
                  </td>
                  <td className="py-2 px-4">
                    {/* Switch para cambiar estado */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={element.estado || false}
                        onChange={() => cambiarEstado(element.idCategoria)}
                      />
                      <div className={`w-11 h-6 rounded-full peer ${element.estado ? 'bg-green-500' : 'bg-gray-300'} peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors`}>
                        <div className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${element.estado ? 'transform translate-x-5' : ''}`}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {element.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </label>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => mostrarDetalles(element.idCategoria)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                      onClick={() => mostrarEditar(element.idCategoria)}
                      title={element.estado ? "Editar" : "No editable (inactivo)"}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 hover:text-red-900 cursor-pointer transition-colors"
                      onClick={() => handleEliminar(element.idCategoria)}
                      title="Eliminar"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda ? 
                    `No se encontraron categorías que coincidan con "${terminoBusqueda}"` : 
                    "No hay categorías disponibles"
                  }
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleCambioPagina={handleCambioPagina}
          generarNumerosPagina={generarNumerosPagina}
        />
      )}

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
      />

      <FormularioVerDetalles
        show={showDetalles}
        close={closeDetalles}
        categoria={categoriaSeleccionada}
      />

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Categoría"
        mensaje="¿Estás seguro de que deseas eliminar esta categoría?"
        detalles={categoriaAEliminar && (
          <>
            <div><strong>Nombre:</strong> {categoriaAEliminar.nombreCategoria}</div>
            <div><strong>Descripción:</strong> {categoriaAEliminar.descripcion}</div>
            <div><strong>Estado:</strong> {categoriaAEliminar.estado ? "Activo" : "Inactivo"}</div>
          </>
        )}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipoIcono="danger"
        colorConfirmar="red"
      />

      {/* Modal de confirmación para cambiar estado */}
      <ModalConfirmacion
        show={showConfirmacionEstado}
        onClose={cerrarConfirmacionEstado}
        onConfirm={confirmarCambioEstado}
        titulo="Cambiar Estado"
        mensaje={`¿Estás seguro de que deseas ${categoriaCambioEstado?.estado ? 'desactivar' : 'activar'} esta categoría?`}
        detalles={categoriaCambioEstado && (
          <>
            <div><strong>Nombre:</strong> {categoriaCambioEstado.nombreCategoria}</div>
            <div><strong>Descripción:</strong> {categoriaCambioEstado.descripcion}</div>
            <div><strong>Estado actual:</strong> {categoriaCambioEstado.estado ? "Activo" : "Inactivo"}</div>
            <div><strong>Nuevo estado:</strong> {categoriaCambioEstado.estado ? "Inactivo" : "Activo"}</div>
          </>
        )}
        textoConfirmar={categoriaCambioEstado?.estado ? 'Desactivar' : 'Activar'}
        textoCancelar="Cancelar"
        tipoIcono="warning"
        colorConfirmar="blue"
      />
    </>
  );
};

export default PaginaCategorias;