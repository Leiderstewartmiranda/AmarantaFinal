import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVerDetalles from "../components/forms/FormularioVerDetalles";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";

const PaginaCategorias = () => {
  // Datos de categorías (reemplazando los datos de clientes)
  const [listaCategorias, setListaCategorias] = useState([
    { 
      id: 1, 
      nombre: 'Caribe', 
      descripcion: 'Productos de la región caribe con sabores tropicales únicos',
      estado: true,
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 2, 
      nombre: 'Sur', 
      descripcion: 'Especialidades del sur del país, productos artesanales',
      estado: true,
      fechaCreacion: '2024-01-20'
    },
    { 
      id: 3, 
      nombre: 'Norte', 
      descripcion: 'Productos del norte, tradición y calidad',
      estado: false,
      fechaCreacion: '2024-02-01'
    },
    { 
      id: 4, 
      nombre: 'Oceania', 
      descripcion: 'Productos exclusivos de Oceanía, edición limitada',
      estado: true,
      fechaCreacion: '2024-02-10'
    },
    { 
      id: 5, 
      nombre: 'Asia', 
      descripcion: 'Sabores exóticos y especias orientales',
      estado: true,
      fechaCreacion: '2024-02-15'
    },
    { 
      id: 6, 
      nombre: 'Europea', 
      descripcion: 'Productos gourmet de tradición europea',
      estado: true,
      fechaCreacion: '2024-02-20'
    },
    { 
      id: 7, 
      nombre: 'Vegana', 
      descripcion: 'Productos 100% vegetales y naturales',
      estado: true,
      fechaCreacion: '2024-03-01'
    },
    { 
      id: 8, 
      nombre: 'Orgánica', 
      descripcion: 'Ingredientes cultivados sin pesticidas',
      estado: false,
      fechaCreacion: '2024-03-05'
    },
  ]);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const categoriasPorPagina = 5; 
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [errores, setErrores] = useState({});
  const [showConfirmacionEstado, setShowConfirmacionEstado] = useState(false);
  const [categoriaCambioEstado, setCategoriaCambioEstado] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: true,
  });

  const nombreRef = useRef();
  const descripcionRef = useRef();
  const estadoRef = useRef();
  const busquedaRef = useRef();

  // Filtrar categorías basado en el término de búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaCategorias;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaCategorias.filter((categoria) => {
      const nombre = categoria.nombre.toLowerCase();
      const descripcion = categoria.descripcion.toLowerCase();

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
    setPaginaActual(1); // Resetear a la primera página cuando se busca
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Validaciones
  const validarCategoria = (categoria) => {
    const nuevosErrores = {};

    // Validar nombre
    if (!categoria.nombre || categoria.nombre.trim() === '') {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (categoria.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (categoria.nombre.trim().length > 50) {
      nuevosErrores.nombre = 'El nombre no puede exceder 50 caracteres';
    } else if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(categoria.nombre.trim())) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios';
    }

    // Validar descripción
    if (!categoria.descripcion || categoria.descripcion.trim() === '') {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (categoria.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (categoria.descripcion.trim().length > 200) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 200 caracteres';
    }

    // Validar nombre duplicado
    const nombreExistente = listaCategorias.find(c => 
      c.id !== categoria.id && 
      c.nombre.toLowerCase().trim() === categoria.nombre.toLowerCase().trim()
    );
    
    if (nombreExistente) {
      nuevosErrores.nombre = 'Ya existe una categoría con este nombre';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleAgregarSubmit = (e) => {
    e.preventDefault();

    const nuevaCategoria = {
      id: listaCategorias.length > 0 ? Math.max(...listaCategorias.map(c => c.id)) + 1 : 1,
      nombre: nombreRef.current.value,
      descripcion: descripcionRef.current.value,
      estado: true,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    if (!validarCategoria(nuevaCategoria)) {
      return;
    }

    setListaCategorias([...listaCategorias, nuevaCategoria]);
    setShowAgregar(false);
    setErrores({});
  };

  const handleEditarSubmit = (e) => {
    e.preventDefault();

    const updatedCategoria = {
      id: formData.id,
      nombre: nombreRef.current.value,
      descripcion: descripcionRef.current.value,
      estado: formData.estado,
      fechaCreacion: formData.fechaCreacion
    };

    if (!validarCategoria(updatedCategoria)) {
      return;
    }

    setListaCategorias(
      listaCategorias.map((categoria) =>
        categoria.id === formData.id ? updatedCategoria : categoria
      )
    );
    closeModal();
    setErrores({});
  };

  const handleEliminar = (id) => {
    const categoria = listaCategorias.find((categoria) => categoria.id === id);
    
    if (categoria) {
      setCategoriaAEliminar(categoria);
      setShowConfirmacion(true);
    }
  };

  const cambiarEstado = (id) => {
    const categoria = listaCategorias.find(c => c.id === id);
    
    if (categoria) {
      setCategoriaCambioEstado(categoria);
      setShowConfirmacionEstado(true);
    }
  };

  const confirmarCambioEstado = () => {
    if (categoriaCambioEstado) {
      setListaCategorias(
        listaCategorias.map((categoria) =>
          categoria.id === categoriaCambioEstado.id
            ? { ...categoria, estado: !categoria.estado }
            : categoria
        )
      );
      setCategoriaCambioEstado(null);
      setShowConfirmacionEstado(false);
    }
  };

  const confirmarEliminacion = () => {
    if (categoriaAEliminar) {
      setListaCategorias(
        listaCategorias.filter(
          (categoria) => categoria.id !== categoriaAEliminar.id
        )
      );
      setCategoriaAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setCategoriaAEliminar(null);
  };

  const cerrarConfirmacionEstado = () => {
    setShowConfirmacionEstado(false);
    setCategoriaCambioEstado(null);
  };

  const mostrarEditar = (id) => {
    const categoria = listaCategorias.find((categoria) => categoria.id === id);

    if (categoria) {
      setFormData({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        estado: categoria.estado,
        fechaCreacion: categoria.fechaCreacion
      });
      setShowEditar(true);
    }
  };

  const mostrarDetalles = (id) => {
    const categoria = listaCategorias.find((categoria) => categoria.id === id);
    if (categoria) {
      setCategoriaSeleccionada(categoria);
      setShowDetalles(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setFormData({
      nombre: "",
      descripcion: "",
      estado: true,
    });
    setErrores({});
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setCategoriaSeleccionada(null);
  };

  // Función para generar los números de página
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 7; // Número máximo de páginas visibles
    
    if (totalPaginas <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      if (paginaActual <= 4) {
        // Mostrar las primeras páginas
        for (let i = 1; i <= 5; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        // Mostrar las últimas páginas
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        // Mostrar páginas alrededor de la actual
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

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Categorías</h2>
      </section>
      
      {/* Sección modificada para alinear botón y búsqueda */}
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

      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <TablaAdmin
          listaCabecera={["Nombre", "Descripción", "Estado", "Acciones"]}
        >
          {categoriasPaginadas.length > 0 ? (
            categoriasPaginadas.map((element) => (
              <tr
                key={element.id}
                className="hover:bg-gray-100 border-t-2 border-gray-300"
              >
                <td className="py-2 px-4">
                  {element.nombre}
                </td>
                <td className="py-2 px-4">
                  {element.descripcion.length > 50 
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
                      checked={element.estado}
                      onChange={() => cambiarEstado(element.id)}
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
                    onClick={() => mostrarDetalles(element.id)}
                    title="Ver detalles"
                  />
                  <Icon
                    icon="material-symbols:edit-outline"
                    width="24"
                    height="24"
                    className={`cursor-pointer transition-colors ${
                      element.estado 
                        ? "text-blue-700 hover:text-blue-900" 
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={() => element.estado && mostrarEditar(element.id)}
                    title={element.estado ? "Editar" : "No editable (inactivo)"}
                  />
                  <Icon
                    icon="tabler:trash"
                    width="24"
                    height="24"
                    className="text-red-700 hover:text-red-900 cursor-pointer transition-colors"
                    onClick={() => handleEliminar(element.id)}
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

      {/* Usando el componente de paginación separado */}
      {totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleCambioPagina={handleCambioPagina}
          generarNumerosPagina={generarNumerosPagina}
        />
      )}

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

      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Categoría"
        mensaje="¿Estás seguro de que deseas eliminar esta categoría?"
        detalles={categoriaAEliminar && (
          <>
            <div><strong>Nombre:</strong> {categoriaAEliminar.nombre}</div>
            <div><strong>Descripción:</strong> {categoriaAEliminar.descripcion}</div>
            <div><strong>Estado:</strong> {categoriaAEliminar.estado ? "Activo" : "Inactivo"}</div>
          </>
        )}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipoIcono="danger"
        colorConfirmar="red"
      />

      <ModalConfirmacion
        show={showConfirmacionEstado}
        onClose={cerrarConfirmacionEstado}
        onConfirm={confirmarCambioEstado}
        titulo="Cambiar Estado"
        mensaje={`¿Estás seguro de que deseas ${categoriaCambioEstado?.estado ? 'desactivar' : 'activar'} esta categoría?`}
        detalles={categoriaCambioEstado && (
          <>
            <div><strong>Nombre:</strong> {categoriaCambioEstado.nombre}</div>
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