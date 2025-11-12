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
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [orden, setOrden] = useState("alfabetico");

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
        setListaProductos(data);
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

  const ordenarProductos = (lista) => {
    const productosOrdenados = [...lista];

    switch (orden) {
      case "alfabetico":
        return productosOrdenados.sort((a, b) =>
          a.nombreProducto.localeCompare(b.nombreProducto, "es", { sensitivity: "base" })
        );

      case "recientes":
        return productosOrdenados.sort((a, b) => {
          const numA = parseInt(a.codigoProducto.replace(/\D/g, "")) || 0;
          const numB = parseInt(b.codigoProducto.replace(/\D/g, "")) || 0;
          return numB - numA; // mayor → más reciente
        });

      case "antiguos":
        return productosOrdenados.sort((a, b) => {
          const numA = parseInt(a.codigoProducto.replace(/\D/g, "")) || 0;
          const numB = parseInt(b.codigoProducto.replace(/\D/g, "")) || 0;
          return numA - numB; // menor → más antiguo
        });

      default:
        return productosOrdenados;
    }
  };




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

  // --- búsqueda y paginación ---
  const productosFiltrados = useMemo(() => {
    const termino = terminoBusqueda.toLowerCase().trim();
    let filtrados = listaProductos;

    if (termino) {
      filtrados = listaProductos.filter(
        (p) =>
          p.nombreProducto?.toLowerCase().includes(termino) ||
          p.categoria?.toLowerCase().includes(termino)
      );
    }

    console.log(listaProductos.map(p => p.codigoProducto));
    return ordenarProductos(filtrados);
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
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  return (
    <>
      <TituloSeccion titulo="Productos" />

      {/* buscar y agregar */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
        <div className="flex-shrink-0 w-80">
          <div className="flex items-center gap-2 mt-3">
          <label htmlFor="orden" className="text-sm text-gray-700">Ordenar por:</label>
          <select
            id="orden"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="alfabetico">Nombre (A–Z)</option>
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
          </select>
        </div>
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
          <TablaAdmin listaCabecera={["Nombre", "Categoría", "Precio", "Stock", "Estado", "Acciones"]}>
            {productosPaginados.length > 0 ? (
              productosPaginados.map((producto) => (
                <tr key={producto.codigoProducto} className="hover:bg-gray-100 border-t-2 border-gray-300">
                  <td className="py-2 px-4">{producto.nombreProducto}</td>
                  <td className="py-2 px-4">{categorias.find(cat => cat.idCategoria === producto.idCategoria)?.nombreCategoria || "-"}</td>
                  <td className="py-2 px-4 font-semibold">{formatearPrecio(producto.precio)}</td>
                  <td className={`py-2 px-4 ${getStockClass(producto.stock)}`}>
                    {producto.stock} unidades
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
                        className={`w-11 h-6 rounded-full peer ${
                          producto.estado ? "bg-green-500" : "bg-gray-300"
                        } peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${
                            producto.estado ? "transform translate-x-5" : ""
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
                      className={`cursor-pointer transition-colors ${
                        producto.estado 
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
          generarNumerosPagina={generarNumerosPagina}
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
    </>
  );
};

export default PaginaProductos;