import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import FormularioAgregarProducto from "../components/forms/FormularioAgregar";
import FormularioModificarProducto from "../components/forms/FormularioModificar";
import FormularioVerDetallesProducto from "../components/forms/FormularioVerDetalles";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";

const PaginaProductos = () => {
  // Categorías disponibles
  const categorias = [
    { id: 1, nombre: 'Caribe' },
    { id: 2, nombre: 'Sur' },
    { id: 3, nombre: 'Norte' },
    { id: 4, nombre: 'Oceania' }
  ];

  // Datos de productos
  const [listaProductos, setListaProductos] = useState([
    { 
      id: 1, 
      nombre: 'Marianita', 
      categoria: 'Caribe', 
      precio: 30000, 
      stock: 10, 
      estado: true,
      descripcion: 'Producto premium de la región caribe con sabores únicos',
      fechaCreacion: '2024-01-15',
      proveedor: 'Caribe Foods Ltd.'
    },
    // ... (resto de productos)
  ]);

  // Extraer lista de proveedores únicos de los productos existentes
  const [proveedores, setProveedores] = useState([]);
  
  useEffect(() => {
    const proveedoresUnicos = [...new Set(listaProductos.map(p => p.proveedor))].filter(p => p);
    setProveedores(proveedoresUnicos);
  }, [listaProductos]);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Refs para formularios
  const nombreRef = useRef();
  const categoriaRef = useRef();
  const precioRef = useRef();
  const stockRef = useRef();
  const descripcionRef = useRef();
  const proveedorRef = useRef();
  const estadoRef = useRef();
  const busquedaRef = useRef();

  // Filtrar productos basado en el término de búsqueda
  const productosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaProductos;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaProductos.filter((producto) => {
      const nombre = producto.nombre.toLowerCase();
      const categoria = producto.categoria.toLowerCase();
      const proveedor = producto.proveedor?.toLowerCase() || '';
      const descripcion = producto.descripcion.toLowerCase();

      return (
        nombre.includes(termino) ||
        categoria.includes(termino) ||
        proveedor.includes(termino) ||
        descripcion.includes(termino)
      );
    });
  }, [listaProductos, terminoBusqueda]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1); // Resetear a la primera página cuando se busca
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Función para formatear precios
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // Función para obtener clase de stock
  const getStockClass = (stock) => {
    if (stock <= 5) return 'text-red-600 font-semibold';
    if (stock <= 15) return 'text-yellow-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  // Manejar agregar producto
  const handleAgregarSubmit = (e) => {
    e.preventDefault();

    const nuevoProducto = {
      id: Math.max(...listaProductos.map(p => p.id)) + 1,
      nombre: nombreRef.current.value,
      categoria: categoriaRef.current.value,
      precio: parseInt(precioRef.current.value),
      stock: parseInt(stockRef.current.value),
      descripcion: descripcionRef.current.value,
      proveedor: proveedorRef.current.value,
      estado: true,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    setListaProductos([...listaProductos, nuevoProducto]);
    setShowAgregar(false);
  };

  // Manejar editar producto
  const handleEditarSubmit = (e) => {
    e.preventDefault();

    const productoEditado = {
      ...productoSeleccionado,
      nombre: nombreRef.current.value,
      categoria: categoriaRef.current.value,
      precio: parseInt(precioRef.current.value),
      stock: parseInt(stockRef.current.value),
      descripcion: descripcionRef.current.value,
      proveedor: proveedorRef.current.value,
      estado: estadoRef.current.checked
    };

    setListaProductos(
      listaProductos.map((producto) =>
        producto.id === productoSeleccionado.id ? productoEditado : producto
      )
    );
    closeModal();
  };

  // Cambiar estado del producto (toggle)
  const toggleEstadoProducto = (id) => {
    setListaProductos(
      listaProductos.map((producto) =>
        producto.id === id ? { ...producto, estado: !producto.estado } : producto
      )
    );
  };

  // Manejar eliminar producto
  const handleEliminar = (id) => {
    const producto = listaProductos.find((producto) => producto.id === id);
    if (producto) {
      // Validar que el producto no esté activo
      if (producto.estado) {
        alert("No se puede eliminar un producto activo. Primero debe desactivarlo.");
        return;
      }
      
      setProductoAEliminar(producto);
      setShowConfirmacion(true);
    }
  };

  const confirmarEliminacion = () => {
    if (productoAEliminar) {
      setListaProductos(
        listaProductos.filter(
          (producto) => producto.id !== productoAEliminar.id
        )
      );
      setProductoAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setProductoAEliminar(null);
  };

  // Mostrar formulario de edición
  const mostrarEditar = (id) => {
    const producto = listaProductos.find((producto) => producto.id === id);
    if (producto) {
      setProductoSeleccionado(producto);
      setShowEditar(true);
    }
  };

  // Mostrar detalles del producto
  const mostrarDetalles = (id) => {
    const producto = listaProductos.find((producto) => producto.id === id);
    if (producto) {
      setProductoSeleccionado(producto);
      setShowDetalles(true);
    }
  };

  // Cerrar modales
  const closeModal = () => {
    setShowEditar(false);
    setProductoSeleccionado(null);
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setProductoSeleccionado(null);
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

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Productos</h2>
      </section>
      
      {/* Sección de búsqueda y botón agregar */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda 
            ref={busquedaRef}
            placeholder="Buscar productos..."
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {productosFiltrados.length} de {listaProductos.length} productos
            </p>
          )}
        </div>
      </section>

      {/* Tabla de productos */}
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin
            listaCabecera={["Nombre", "Categoría", "Precio", "Stock", "Estado", "Acciones"]}
          >
            {productosPaginados.length > 0 ? (
              productosPaginados.map((producto) => (
                <tr
                  key={producto.id}
                  className="hover:bg-gray-100 border-t-2 border-gray-300"
                >
                  <td className="py-2 px-4">{producto.nombre}</td>
                  <td className="py-2 px-4">{producto.categoria}</td>
                  <td className="py-2 px-4 font-semibold">{formatearPrecio(producto.precio)}</td>
                  <td className={`py-2 px-4 ${getStockClass(producto.stock)}`}>
                    {producto.stock} unidades
                  </td>
                  <td className="py-2 px-4">
                    {/* Switch para cambiar estado */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={producto.estado}
                        onChange={() => toggleEstadoProducto(producto.id)}
                      />
                      <div className={`w-11 h-6 rounded-full peer ${producto.estado ? 'bg-green-500' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {producto.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </label>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => mostrarDetalles(producto.id)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                      onClick={() => mostrarEditar(producto.id)}
                      title="Editar"
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className={`${producto.estado 
                        ? 'text-gray-400 cursor-not-allowed opacity-50' 
                        : 'text-red-700 hover:text-red-900 cursor-pointer'}`}
                      onClick={producto.estado ? undefined : () => handleEliminar(producto.id)}
                      title={producto.estado ? "No se puede eliminar un producto activo" : "Eliminar"}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda ? 
                    `No se encontraron productos que coincidan con "${terminoBusqueda}"` : 
                    "No hay productos disponibles"
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

      {/* Formularios modales */}
      <FormularioAgregarProducto
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        nombreRef={nombreRef}
        categoriaRef={categoriaRef}
        precioRef={precioRef}
        stockRef={stockRef}
        descripcionRef={descripcionRef}
        proveedorRef={proveedorRef}
        categorias={categorias}
        proveedores={proveedores}
      />

      <FormularioModificarProducto
        show={showEditar}
        close={closeModal}
        producto={productoSeleccionado}
        onSubmit={handleEditarSubmit}
        nombreRef={nombreRef}
        categoriaRef={categoriaRef}
        precioRef={precioRef}
        stockRef={stockRef}
        descripcionRef={descripcionRef}
        proveedorRef={proveedorRef}
        estadoRef={estadoRef}
        categorias={categorias}
        proveedores={proveedores}
      />

      <FormularioVerDetallesProducto
        show={showDetalles}
        close={closeDetalles}
        producto={productoSeleccionado}
      />

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Producto"
        mensaje="¿Estás seguro de que deseas eliminar este producto?"
        detalles={productoAEliminar && (
          <>
            <div><strong>Nombre:</strong> {productoAEliminar.nombre}</div>
            <div><strong>Categoría:</strong> {productoAEliminar.categoria}</div>
            <div><strong>Precio:</strong> {formatearPrecio(productoAEliminar.precio)}</div>
            <div><strong>Stock:</strong> {productoAEliminar.stock} unidades</div>
          </>
        )}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipoIcono="danger"
        colorConfirmar="red"
      />
    </>
  );
};

export default PaginaProductos;