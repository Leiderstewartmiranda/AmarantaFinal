import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import { GetProductos, CrearProducto, ActualizarProducto, DeleteProducto } from "../../../../services/productoService";
import { GetCProductos } from "../../../../services/categoriaService";

import FormularioAgregarProducto from "../components/forms/FormularioAgregar";
import FormularioModificarProducto from "../components/forms/FormularioModificar";
import FormularioVerDetallesProducto from "../components/forms/FormularioVerDetalles";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";

const PaginaProductos = () => {
  
  const [categorias, setCategorias] = useState([]);
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await GetCProductos();
        setCategorias(data);
      } catch (error) {
        console.error("❌ Error al cargar categorías:", error);
      }
    };
    
    cargarCategorias();
  }, []);

  const [listaProductos, setListaProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await GetProductos();
        setListaProductos(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // refs
  const imagenRef = useRef();
  const nombreRef = useRef();
  const categoriaRef = useRef();
  const precioRef = useRef();
  const stockRef = useRef();
  const estadoRef = useRef();
  const busquedaRef = useRef();

  // --- CRUD ---
  const handleAgregarSubmit = async (e) => {
    e.preventDefault();
    try {
      const nuevoProducto = {
        NombreProducto: nombreRef.current.value,
        Precio: parseFloat(precioRef.current.value),
        Stock: parseInt(stockRef.current.value),
        IdCategoria: parseInt(categoriaRef.current.value),
        Imagen: null, // si tienes input file, reemplaza aquí
      };

      const creado = await CrearProducto(nuevoProducto);
      setListaProductos([...listaProductos, creado]);
      setShowAgregar(false);
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    try {
      const productoEditado = {
        NombreProducto: nombreRef.current.value,
        Precio: parseFloat(precioRef.current.value),
        Stock: parseInt(stockRef.current.value),
        IdCategoria: parseInt(categoriaRef.current.value),
        Imagen: null,
      };

      await ActualizarProducto(productoSeleccionado.codigoProducto, productoEditado);

      setListaProductos(
        listaProductos.map((p) =>
          p.codigoProducto === productoSeleccionado.codigoProducto
            ? { ...p, ...productoEditado }
            : p
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error editando producto:", error);
    }
  };

  const confirmarEliminacion = async () => {
    if (productoAEliminar) {
      try {
        await DeleteProducto(productoAEliminar.codigoProducto);
        setListaProductos(listaProductos.filter((p) => p.codigoProducto !== productoAEliminar.codigoProducto));
        setProductoAEliminar(null);
        setShowConfirmacion(false);
      } catch (error) {
        console.error("Error eliminando producto:", error);
      }
    }
  };

  // --- búsqueda y paginación ---
  const productosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return listaProductos;
    const termino = terminoBusqueda.toLowerCase().trim();
    return listaProductos.filter(
      (p) =>
        p.nombreProducto?.toLowerCase().includes(termino) ||
        p.categoria?.toLowerCase().includes(termino)
    );
  }, [listaProductos, terminoBusqueda]);

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  const getStockClass = (stock) => {
    if (stock <= 5) return "text-red-600 font-semibold";
    if (stock <= 15) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const closeModal = () => {
    setShowEditar(false);
    setProductoSeleccionado(null);
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setProductoSeleccionado(null);
  };

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Productos</h2>
      </section>

      {/* buscar y agregar */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
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

      {/* tabla */}
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin listaCabecera={["Nombre", "Categoría", "Precio", "Stock", "Acciones"]}>
            {productosPaginados.length > 0 ? (
              productosPaginados.map((producto) => (
                <tr key={producto.codigoProducto} className="hover:bg-gray-100 border-t-2 border-gray-300">
                  <td className="py-2 px-4">{producto.nombreProducto}</td>
                  <td className="py-2 px-4">{producto.idCategoria}</td>
                  <td className="py-2 px-4 font-semibold">{formatearPrecio(producto.precio)}</td>
                  <td className={`py-2 px-4 ${getStockClass(producto.stock)}`}>
                    {producto.stock} unidades
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => {
                        setProductoSeleccionado(producto);
                        setShowDetalles(true);
                      }}
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                      onClick={() => {
                        setProductoSeleccionado(producto);
                        setShowEditar(true);
                      }}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 hover:text-red-900 cursor-pointer"
                      onClick={() => {
                        setProductoAEliminar(producto);
                        setShowConfirmacion(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda
                    ? `No se encontraron productos que coincidan con "${terminoBusqueda}"`
                    : "No hay productos disponibles"}
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* paginación */}
      {totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleCambioPagina={setPaginaActual}
          generarNumerosPagina={() => Array.from({ length: totalPaginas }, (_, i) => i + 1)}
        />
      )}

      {/* formularios */}
      <FormularioAgregarProducto
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        nombreRef={nombreRef}
        categoriaRef={categoriaRef}
        precioRef={precioRef}
        stockRef={stockRef}
        imagenRef={imagenRef} 
        categorias={categorias}
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
        estadoRef={estadoRef}
        categorias={categorias}
        setListaProductos={setListaProductos} 
        listaProductos={listaProductos}  
      />

      <FormularioVerDetallesProducto
        show={showDetalles}
        close={closeDetalles}
        producto={productoSeleccionado}
      />

      <ModalConfirmacion
        show={showConfirmacion}
        onClose={() => setShowConfirmacion(false)}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Producto"
        mensaje="¿Estás seguro de que deseas eliminar este producto?"
      />
    </>
  );
};

export default PaginaProductos;
