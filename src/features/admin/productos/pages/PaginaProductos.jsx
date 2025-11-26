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
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaProductos = () => {

  const [categorias, setCategorias] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroStock, setFiltroStock] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 9;
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({
    columna: null,
    direccion: 'asc'
  });

  // refs
  const imagenRef = useRef();
  const nombreRef = useRef();
  const categoriaRef = useRef();
  const precioRef = useRef();
  const stockRef = useRef();
  const busquedaRef = useRef();

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await GetCProductos();
        setCategorias(data);
      } catch (error) {
        console.error("❌ Error al cargar categorías:", error);
        Swal.fire({
          icon: "error",
          title: "❌ Error al cargar",
          text: "No se pudieron cargar las categorías",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    };

    cargarCategorias();
  }, []);

  // Cargar productos
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await GetProductos();
        // 🔹 Ordenar por defecto: Últimos creados primero (ID descendente)
        const dataOrdenada = [...data].sort((a, b) => b.codigoProducto - a.codigoProducto);
        setListaProductos(dataOrdenada);
      } catch (error) {
        console.error("Error cargando productos:", error);
        Swal.fire({
          icon: "error",
          title: "❌ Error al cargar",
          text: "No se pudieron cargar los productos",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      titulo: "Nombre",
      onClick: () => handleOrdenar('nombreProducto'),
      icono: getSortIcon('nombreProducto')
    },
    {
      titulo: "Categoría",
      onClick: () => handleOrdenar('idCategoria'),
      icono: getSortIcon('idCategoria')
    },
    {
      titulo: "Precio",
      onClick: () => handleOrdenar('precio'),
      icono: getSortIcon('precio')
    },
    {
      titulo: "Stock",
      onClick: () => handleOrdenar('stock'),
      icono: getSortIcon('stock')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('estado'),
      icono: getSortIcon('estado')
    },
    "Acciones"
  ];

  // 🔹 Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let filtrados = listaProductos;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((producto) => {
        const nombreProducto = producto.nombreProducto?.toLowerCase() || '';
        const categoriaNombre = categorias.find(cat => cat.idCategoria === producto.idCategoria)?.nombreCategoria?.toLowerCase() || '';

        return (
          nombreProducto.includes(termino) ||
          categoriaNombre.includes(termino)
        );
      });
    }

    // Aplicar filtro de categoría
    if (filtroCategoria) {
      filtrados = filtrados.filter(producto =>
        producto.idCategoria === parseInt(filtroCategoria)
      );
    }

    // Aplicar filtro de estado
    if (filtroEstado) {
      const estadoFiltro = filtroEstado === "Activo";
      filtrados = filtrados.filter(producto => producto.estado === estadoFiltro);
    }

    // Aplicar filtro de stock - CORREGIDO
    if (filtroStock) {
      filtrados = filtrados.filter(producto => {
        const stock = producto.stock || 0; // Manejar valores null/undefined

        switch (filtroStock) {
          case "bajo":
            return stock <= 5;
          case "medio":
            return stock > 5 && stock <= 15;
          case "alto":
            return stock > 15;
          case "sin-stock":
            return stock === 0;
          default:
            return true;
        }
      });
    }

    // Aplicar ordenamiento
    if (ordenamiento.columna) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue = a[ordenamiento.columna];
        let bValue = b[ordenamiento.columna];

        // Para columnas específicas
        if (ordenamiento.columna === 'idCategoria') {
          // Ordenar por nombre de categoría en lugar del ID
          const aCategoria = categorias.find(cat => cat.idCategoria === aValue)?.nombreCategoria || '';
          const bCategoria = categorias.find(cat => cat.idCategoria === bValue)?.nombreCategoria || '';
          aValue = aCategoria;
          bValue = bCategoria;
        }

        // Para columnas booleanas (estado)
        if (ordenamiento.columna === 'estado') {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }

        // Para columnas numéricas - CORREGIDO
        if (ordenamiento.columna === 'precio' || ordenamiento.columna === 'stock') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
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
  }, [listaProductos, terminoBusqueda, filtroCategoria, filtroEstado, filtroStock, ordenamiento, categorias]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + productosPorPagina);

  // Ajustar página actual si es necesario
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    } else if (paginaActual < 1 && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  // Función para cambiar estado del producto
  const cambiarEstado = async (codigoProducto) => {
    const producto = listaProductos.find(p => p.codigoProducto === codigoProducto);
    if (producto) {
      const nuevoEstado = !producto.estado;

      Swal.fire({
        icon: "question",
        title: "🔄 Cambiar estado",
        html: `¿Estás seguro de que deseas <strong>${producto.estado ? 'desactivar' : 'activar'}</strong> este producto?<br><br>
               <div class="text-left">
                 <p><strong>Producto:</strong> ${producto.nombreProducto}</p>
                 <p><strong>Categoría:</strong> ${categorias.find(cat => cat.idCategoria === producto.idCategoria)?.nombreCategoria || "-"}</p>
                 <p><strong>Precio:</strong> ${formatearPrecio(producto.precio)}</p>
                 <p><strong>Stock:</strong> ${producto.stock} unidades</p>
                 <p><strong>Estado actual:</strong> ${producto.estado ? "Activo" : "Inactivo"}</p>
                 <p><strong>Nuevo estado:</strong> ${producto.estado ? "Inactivo" : "Activo"}</p>
               </div>`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: producto.estado ? 'Desactivar' : 'Activar',
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ActualizarProducto(producto.codigoProducto, {
              NombreProducto: producto.nombreProducto,
              Precio: producto.precio,
              Stock: producto.stock,
              IdCategoria: producto.idCategoria,
              Estado: nuevoEstado
            });

            setListaProductos(prev =>
              prev.map(p =>
                p.codigoProducto === producto.codigoProducto
                  ? { ...p, estado: nuevoEstado }
                  : p
              )
            );

            Swal.fire({
              icon: "success",
              title: "✅ Estado actualizado",
              text: `El producto ha sido ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
              confirmButtonColor: "#b45309",
              background: "#fff8e7",
            });
          } catch (error) {
            console.error("Error al cambiar el estado del producto:", error);
            Swal.fire({
              icon: "error",
              title: "❌ Error al cambiar estado",
              text: "No se pudo cambiar el estado del producto",
              confirmButtonColor: "#b45309",
              background: "#fff8e7",
            });
          }
        }
      });
    }
  };

  // --- CRUD ---
  const handleAgregarSubmit = async (e) => {
    e.preventDefault();
    try {
      const nuevoProducto = {
        NombreProducto: nombreRef.current.value,
        Precio: parseFloat(precioRef.current.value),
        Stock: parseInt(stockRef.current.value),
        IdCategoria: parseInt(categoriaRef.current.value),
        Imagen: null,
      };

      const creado = await CrearProducto(nuevoProducto);
      setListaProductos([...listaProductos, creado]);
      setShowAgregar(false);

      Swal.fire({
        icon: "success",
        title: "✅ Producto agregado",
        text: "El producto se ha agregado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error creando producto:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al agregar",
        text: "No se pudo agregar el producto",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
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

      Swal.fire({
        icon: "success",
        title: "✅ Producto actualizado",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error editando producto:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al actualizar",
        text: "No se pudo actualizar el producto",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const handleEliminar = (producto) => {
    if (producto) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Confirmar eliminación",
        html: `¿Estás seguro de eliminar este producto?<br><br>
               <div class="text-left">
                 <p><strong>Producto:</strong> ${producto.nombreProducto}</p>
                 <p><strong>Categoría:</strong> ${categorias.find(cat => cat.idCategoria === producto.idCategoria)?.nombreCategoria || "-"}</p>
                 <p><strong>Precio:</strong> ${formatearPrecio(producto.precio)}</p>
                 <p><strong>Stock:</strong> ${producto.stock} unidades</p>
                 <p><strong>Estado:</strong> ${producto.estado ? "Activo" : "Inactivo"}</p>
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
            await DeleteProducto(producto.codigoProducto);
            setListaProductos(listaProductos.filter((p) => p.codigoProducto !== producto.codigoProducto));

            Swal.fire({
              icon: "success",
              title: "✅ Producto eliminado",
              text: "El producto se ha eliminado correctamente",
              confirmButtonColor: "#b45309",
              background: "#fff8e7",
            });
          } catch (error) {
            console.error("Error eliminando producto:", error);

            // Extraer mensaje o código de error si viene de la API
            const errorMsg = error.message || error.toString();

            console.log("🧠 Mensaje de error al eliminar producto:", errorMsg);

            // 🧩 Detección más específica: si el producto está vinculado con una compra/pedido
            if (
              errorMsg.includes("REFERENCE constraint") ||
              errorMsg.includes("FK_") ||
              errorMsg.includes("compra") ||
              errorMsg.includes("pedido") ||
              errorMsg.includes("detalles") ||
              errorMsg.includes("Error 500")
            ) {
              Swal.fire({
                icon: "error",
                title: "❌ No se puede eliminar el producto",
                html: `
                    Este producto está vinculado a un <strong>pedido</strong> o una <strong>compra</strong> registrada.<br><br>
                    Por motivos de integridad, no puede eliminarse directamente.<br><br>
                    <small>Si deseas eliminarlo, primero elimina o actualiza los registros relacionados.</small>
                  `,
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "❌ Error al eliminar",
                text: "No se pudo eliminar el producto ya que se encuentra vinculado a otros registros.",
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            }
          }
        }
      });
    }
  };

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  const getStockClass = (stock) => {
    const stockNum = stock || 0; // Manejar valores null/undefined
    if (stockNum <= 5) return "text-red-600 font-semibold";
    if (stockNum <= 15) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const closeModal = () => {
    setShowEditar(false);
    setProductoSeleccionado(null);
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setProductoSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TituloSeccion titulo="Productos" />

      {/* buscar y agregar */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
        <section className="col-span-2">
          <div className="filtros flex items-center gap-3 mb-1">
            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.idCategoria} value={categoria.idCategoria}>
                  {categoria.nombreCategoria}
                </option>
              ))}
            </select>

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

            <select
              value={filtroStock}
              onChange={(e) => {
                setFiltroStock(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todo el stock</option>
              <option value="bajo">Stock bajo (≤5)</option>
              <option value="medio">Stock medio (6-15)</option>
              <option value="alto">Stock alto (&gt;15)</option>
              <option value="sin-stock">Sin stock</option>
            </select>

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
            placeholder="Buscar productos..."
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {productosFiltrados.length} de {listaProductos.length} productos
            </p>
          )}
        </div>
      </section>

      {/* 🔹 Sección de Filtros para Productos */}

      {/* tabla */}
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin listaCabecera={columnasConOrdenamiento}>
            {productosPaginados.length > 0 ? (
              productosPaginados.map((producto) => (
                <tr key={producto.codigoProducto} className="hover:bg-gray-100 border-t-2 border-gray-300">
                  <td className="py-2 px-4">{producto.nombreProducto}</td>
                  <td className="py-2 px-4">{categorias.find(cat => cat.idCategoria === producto.idCategoria)?.nombreCategoria || "-"}</td>
                  <td className="py-2 px-4 font-semibold">{formatearPrecio(producto.precio)}</td>
                  <td className={`py-2 px-4 ${getStockClass(producto.stock)}`}>
                    {producto.stock || 0} unidades
                  </td>
                  <td className="py-1 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={producto.estado || false}
                        onChange={() => cambiarEstado(producto.codigoProducto)}
                      />
                      <div
                        className={`w-11 h-6 rounded-full peer ${producto.estado ? "bg-green-500" : "bg-gray-300"
                          } peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${producto.estado ? "transform translate-x-5" : ""
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
                      onClick={() => {
                        setProductoSeleccionado(producto);
                        setShowDetalles(true);
                      }}
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      width="24"
                      height="24"
                      className={`cursor-pointer transition-colors ${producto.estado
                        ? "text-blue-700 hover:text-blue-900"
                        : "text-gray-400 cursor-not-allowed"
                        }`}
                      onClick={() => {
                        if (!producto.estado) {
                          Swal.fire({
                            icon: "warning",
                            title: "⚠️ Producto inactivo",
                            text: "No se puede editar un producto inactivo",
                            confirmButtonColor: "#b45309",
                            background: "#fff8e7",
                          });
                          return;
                        }
                        setProductoSeleccionado(producto);
                        setShowEditar(true);
                      }}
                      title={producto.estado ? "Editar producto" : "No editable (inactivo)"}
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className="text-red-700 hover:text-red-900 cursor-pointer"
                      onClick={() => handleEliminar(producto)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda || filtroCategoria || filtroEstado || filtroStock ?
                    `No se encontraron productos que coincidan con los filtros aplicados` :
                    "No hay productos disponibles"}
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
            handleCambioPagina={setPaginaActual}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            Página {paginaActual} de {totalPaginas} - {productosFiltrados.length} productos encontrados
            {(filtroCategoria || filtroEstado || filtroStock || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* 🔹 Mostrar info cuando hay filtros pero solo una página */}
      {totalPaginas === 1 && productosFiltrados.length > 0 && (
        <div className="col-span-2 mt-4">
          <p className="text-sm text-gray-600 text-center">
            Mostrando {productosFiltrados.length} productos
            {(filtroCategoria || filtroEstado || filtroStock || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
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
        setListaProductos={setListaProductos}
        listaProductos={listaProductos}
      />

      <FormularioModificarProducto
        show={showEditar}
        close={closeModal}
        producto={productoSeleccionado}
        categorias={categorias}
        setListaProductos={setListaProductos}
        listaProductos={listaProductos}
        onSubmit={handleEditarSubmit}
      />

      <FormularioVerDetallesProducto
        show={showDetalles}
        close={closeDetalles}
        producto={productoSeleccionado}
        categorias={categorias}
      />

      {/* Agregar Font Awesome para los iconos */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
};

export default PaginaProductos;