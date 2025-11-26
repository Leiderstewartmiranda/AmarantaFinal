import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo, useEffect } from "react";
import FormularioCompra from "../components/forms/FormularioAgregarCompra";
import FormularioVerCompra from "../components/forms/FormularioVerCompra";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import {
  GetCompras,
  AnularCompra,
  GetProveedores,
  GetProductos,
  GetDetallesByCompra,
} from "../../../../services/compraService";
import { ActualizarProducto } from "../../../../services/productoService";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

const PaginaCompras = () => {
  const [listaCompras, setListaCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recarga, setRecarga] = useState(0);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const comprasPorPagina = 9;

  // Estado para ordenamiento - MODIFICADO: orden por defecto descendente por código de compra
  const [ordenamiento, setOrdenamiento] = useState({
    columna: 'codigoCompra', // Ordenar por código de compra por defecto
    direccion: 'desc' // Orden descendente por defecto (más recientes primero)
  });

  const busquedaRef = useRef();

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [comprasData, proveedoresData, productosData] = await Promise.all([
          GetCompras(),
          GetProveedores(),
          GetProductos(),
        ]);
        setListaCompras(comprasData);
        setProveedores(proveedoresData);
        setProductos(productosData);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "No se pudieron obtener los datos de compras o proveedores.",
          confirmButtonColor: "#d15113",
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
      titulo: "Código",
      onClick: () => handleOrdenar('codigoCompra'),
      icono: getSortIcon('codigoCompra')
    },
    {
      titulo: "Fecha",
      onClick: () => handleOrdenar('fechaCompra'),
      icono: getSortIcon('fechaCompra')
    },
    {
      titulo: "Proveedor",
      onClick: () => handleOrdenar('idProveedor'),
      icono: getSortIcon('idProveedor')
    },
    {
      titulo: "Total",
      onClick: () => handleOrdenar('precioTotal'),
      icono: getSortIcon('precioTotal')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('estado'),
      icono: getSortIcon('estado')
    },
    "Acciones"
  ];

  // 🔹 Filtrar y ordenar compras - MEJORADA la lógica de ordenamiento
  const comprasFiltradas = useMemo(() => {
    let filtrados = listaCompras;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((compra) => {
        const proveedor = proveedores.find((p) => p.IdProveedor === compra.IdProveedor);
        const nombreProveedor = proveedor?.nombreEmpresa?.toLowerCase() || "";
        return (
          compra.fechaCompra?.toLowerCase().includes(termino) ||
          compra.precioTotal?.toString().toLowerCase().includes(termino) ||
          compra.estado?.toLowerCase().includes(termino) ||
          compra.codigoCompra?.toString().toLowerCase().includes(termino) ||
          nombreProveedor.includes(termino)
        );
      });
    }

    // Aplicar filtro de proveedor
    if (filtroProveedor) {
      filtrados = filtrados.filter(compra =>
        compra.idProveedor === parseInt(filtroProveedor)
      );
    }

    // Aplicar filtro de estado
    if (filtroEstado) {
      filtrados = filtrados.filter(compra => compra.estado === filtroEstado);
    }

    // Aplicar filtro de fecha
    if (filtroFecha) {
      const hoy = new Date();
      const fechaCompra = new Date();

      switch (filtroFecha) {
        case "hoy":
          filtrados = filtrados.filter(compra => {
            const fechaCompra = new Date(compra.fechaCompra);
            return fechaCompra.toDateString() === hoy.toDateString();
          });
          break;
        case "semana":
          const haceUnaSemana = new Date();
          haceUnaSemana.setDate(hoy.getDate() - 7);
          filtrados = filtrados.filter(compra => {
            const fechaCompra = new Date(compra.fechaCompra);
            return fechaCompra >= haceUnaSemana;
          });
          break;
        case "mes":
          const haceUnMes = new Date();
          haceUnMes.setMonth(hoy.getMonth() - 1);
          filtrados = filtrados.filter(compra => {
            const fechaCompra = new Date(compra.fechaCompra);
            return fechaCompra >= haceUnMes;
          });
          break;
        default:
          break;
      }
    }

    // Aplicar ordenamiento
    if (ordenamiento.columna) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue = a[ordenamiento.columna];
        let bValue = b[ordenamiento.columna];

        // Para columnas específicas
        if (ordenamiento.columna === 'idProveedor') {
          // Ordenar por nombre de proveedor en lugar del ID
          const aProveedor = proveedores.find(prov => prov.idProveedor === aValue)?.nombreEmpresa || '';
          const bProveedor = proveedores.find(prov => prov.idProveedor === bValue)?.nombreEmpresa || '';
          aValue = aProveedor;
          bValue = bProveedor;
        }

        // Para columnas de fecha
        if (ordenamiento.columna === 'fechaCompra') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Para columnas numéricas (código de compra y precio total)
        if (ordenamiento.columna === 'precioTotal' || ordenamiento.columna === 'codigoCompra') {
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
  }, [listaCompras, terminoBusqueda, filtroProveedor, filtroEstado, filtroFecha, ordenamiento, proveedores]);

  // Paginación
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina);
  const indiceInicio = (paginaActual - 1) * comprasPorPagina;
  const comprasPaginadas = comprasFiltradas.slice(indiceInicio, indiceInicio + comprasPorPagina);

  // Ajustar página actual si es necesario
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    } else if (paginaActual < 1 && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  const handleCambioPagina = (nuevaPagina) => setPaginaActual(nuevaPagina);

  // Compra creada
  const handleCompraCreada = () => {
    setRecarga((prev) => prev + 1);
    setShowAgregar(false);
    Swal.fire({
      icon: "success",
      title: "Compra registrada",
      text: "La compra se ha agregado correctamente.",
      confirmButtonColor: "#d15113",
      background: "#fff8e7",
    });
  };

  // Confirmar anulación con alerta moderna
  const handleAnular = async (compra) => {
    if (compra.estado === "Anulada") {
      Swal.fire({
        icon: "info",
        title: "Compra ya anulada",
        text: "Esta compra ya fue anulada previamente.",
        confirmButtonColor: "#d15113",
        background: "#fff8e7",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Anular compra?",
      html: `
          <div style="text-align:left; font-size:14px;">
            <strong>Código:</strong> #${compra.codigoCompra}<br/>
            <strong>Fecha:</strong> ${new Date(compra.fechaCompra).toLocaleDateString()}<br/>
            <strong>Proveedor:</strong> ${getProveedorNombre(compra.idProveedor)}<br/>
            <strong>Total:</strong> ${formatoMoneda(compra.precioTotal)}
          </div>
        `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "#d15113",
      cancelButtonColor: "#888888ff",
      background: "#fff8e7",
    });

    if (result.isConfirmed) {
      try {
        // 🔻 REVERTIR STOCK (RESTAR)
        const detalles = await GetDetallesByCompra(compra.codigoCompra);

        if (Array.isArray(detalles)) {
          for (const item of detalles) {
            const productoOriginal = productos.find(p => p.codigoProducto === item.codigoProducto);

            if (productoOriginal) {
              const nuevoStock = (productoOriginal.stock || productoOriginal.Stock || 0) - parseInt(item.cantidad);

              await ActualizarProducto(item.codigoProducto, {
                NombreProducto: productoOriginal.nombreProducto || productoOriginal.NombreProducto,
                Precio: productoOriginal.precio || productoOriginal.Precio,
                Stock: nuevoStock,
                IdCategoria: productoOriginal.idCategoria || productoOriginal.IdCategoria,
                Estado: productoOriginal.estado !== undefined ? productoOriginal.estado : productoOriginal.Estado,
                Imagen: null
              });
            }
          }
        }
        // 🔺 FIN REVERTIR STOCK

        await AnularCompra(compra.codigoCompra);
        Swal.fire({
          icon: "success",
          title: "Compra anulada",
          text: `La compra #${compra.codigoCompra} ha sido anulada correctamente.`,
          confirmButtonColor: "#d15113",
          background: "#fff8e7",
        });
        setRecarga((prev) => prev + 1);
      } catch (error) {
        console.error("Error anulando compra:", error);
        Swal.fire({
          icon: "error",
          title: "Error al anular",
          text: "No se pudo anular la compra. Intenta nuevamente.",
          confirmButtonColor: "#d15113",
          background: "#fff8e7",
        });
      }
    }
  };

  const mostrarDetalles = (compra) => {
    setShowDetalles(true);
    setCompraSeleccionada(compra);
  };

  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const closeDetalles = () => {
    setShowDetalles(false);
    setCompraSeleccionada(null);
  };

  // Formateo
  const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor || 0);

  const getProveedorNombre = (idProveedor) => {
    const proveedor = proveedores.find((p) => p.idProveedor === idProveedor);
    return proveedor?.nombreEmpresa || "Desconocido";
  };

  // Generar factura PDF
  const descargarFactura = async (compra) => {
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const verde = [74, 75, 47];
      const naranjado = [209, 81, 19];
      const detallesData = await GetDetallesByCompra(compra.codigoCompra);
      const detalles = Array.isArray(detallesData) ? detallesData : [];

      const logo = new Image();
      logo.src = `${window.location.origin}/AmaraLogo.png`;
      logo.onload = () => {
        doc.addImage(logo, "PNG", 15, 10, 25, 25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...verde);
        doc.text("AMARANTA", 45, 20);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("Reporte de Compra", 45, 28);
        doc.setDrawColor(...verde);
        doc.line(15, 38, 195, 38);
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Detalles de la Compra", 15, 48);
        doc.setFont("helvetica", "normal");
        doc.text(`Código: ${compra.codigoCompra}`, 15, 55);
        doc.text(`Fecha: ${new Date(compra.fechaCompra).toLocaleDateString()}`, 15, 60);
        doc.text(`Estado: ${compra.estado}`, 15, 65);

        const proveedor = proveedores.find((p) => p.idProveedor === compra.idProveedor);
        if (proveedor) {
          doc.setFont("helvetica", "bold");
          doc.text("Proveedor:", 15, 75);
          doc.setFont("helvetica", "normal");
          doc.text(proveedor.nombreEmpresa || "", 15, 80);
          doc.text(`${proveedor.nit || ""}: ${proveedor.representante || ""}`, 15, 85);
          doc.text(`Tel: ${proveedor.telefono || "N/A"}`, 15, 90);
        }

        let y = 100;
        doc.setFont("helvetica", "bold");
        doc.setFillColor(...naranjado);
        doc.setTextColor(255);
        doc.rect(15, y, 180, 8, "F");
        doc.text("Producto", 20, y + 6);
        doc.text("Cantidad", 90, y + 6);
        doc.text("Precio Unitario", 125, y + 6);
        doc.text("Subtotal", 165, y + 6);

        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        if (detalles.length === 0) {
          doc.text("No hay productos registrados para esta compra.", 20, y + 5);
        } else {
          detalles.forEach((d) => {
            const producto = productos.find((p) => p.codigoProducto === d.codigoProducto);
            const nombre = producto?.nombre || d.nombreProducto || "Producto desconocido";
            const cantidad = d.cantidad || 0;
            const precio = d.precioUnitario || 0;
            const subtotal = cantidad * precio;
            doc.text(nombre, 20, y);
            doc.text(String(cantidad), 95, y, { align: "right" });
            doc.text(`$${precio.toLocaleString("es-CO")}`, 145, y, { align: "right" });
            doc.text(`$${subtotal.toLocaleString("es-CO")}`, 190, y, { align: "right" });
            y += 8;
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
          });
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...verde);
        doc.text(`TOTAL: ${formatoMoneda(compra.precioTotal)}`, 190, y + 10, { align: "right" });

        if (compra.estado === "Anulada") {
          doc.setFontSize(60);
          doc.setTextColor(255, 0, 0, 30);
          doc.text("ANULADA", 105, 160, { align: "center", angle: 45 });
        }

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("Generado automáticamente por el sistema Amaranta", 105, 285, { align: "center" });
        doc.save(`Factura_Compra_${compra.codigoCompra}.pdf`);
      };
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al generar PDF",
        text: "No se pudo generar la factura.",
        confirmButtonColor: "#d15113",
        background: "#fff8e7",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center col-span-2 h-64">
        <p>Cargando compras...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TituloSeccion titulo="Gestión de Compras" />

      {/* Botón + búsqueda */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
        <section className="col-span-2">
          <div className="filtros flex items-center gap-2 mb-1">
            <select
              value={filtroProveedor}
              onChange={(e) => {
                setFiltroProveedor(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                  {proveedor.nombreEmpresa}
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
              <option value="Activa">Activa</option>
              <option value="Anulada">Anulada</option>
            </select>

            <select
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
            </select>
          </div>
        </section>
        <div className="w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar por proveedor, código o estado"
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {comprasFiltradas.length} de {listaCompras.length} compras
            </p>
          )}
        </div>
      </section>

      {/* Tabla */}
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin listaCabecera={columnasConOrdenamiento}>
            {comprasPaginadas.length > 0 ? (
              comprasPaginadas.map((compra) => (
                <tr
                  key={compra.codigoCompra}
                  className={`hover:bg-gray-100 border-t-2 border-gray-300 ${compra.estado === "Anulada" ? "bg-red-50 text-gray-500" : ""
                    }`}
                >
                  <td className="py-2 px-4 font-medium">#{compra.codigoCompra}</td>
                  <td className="py-2 px-4 text-black">
                    {new Date(compra.fechaCompra).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-black">
                    {getProveedorNombre(compra.idProveedor)}
                  </td>
                  <td className="py-2 px-4 font-semibold text-black">
                    {formatoMoneda(compra.precioTotal)}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${compra.estado === "Activa"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                    >
                      {compra.estado}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="material-symbols:visibility-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-800 transition-colors"
                      onClick={() => mostrarDetalles(compra)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="mdi:file-pdf-box"
                      width="24"
                      height="24"
                      className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                      onClick={() => descargarFactura(compra)}
                      title="Descargar Factura PDF"
                    />
                    <Icon
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className={`transition-colors ${compra.estado === "Anulada"
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-700 cursor-pointer hover:text-red-800"
                        }`}
                      onClick={() => handleAnular(compra)}
                      title={
                        compra.estado === "Anulada"
                          ? "Compra ya anulada"
                          : "Anular compra"
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda || filtroProveedor || filtroEstado || filtroFecha ?
                    "No se encontraron compras que coincidan con los filtros." :
                    "No hay compras registradas."}
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="col-span-2 mt-1">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            handleCambioPagina={handleCambioPagina}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            Página {paginaActual} de {totalPaginas} - {comprasFiltradas.length} compras encontradas
            {(filtroProveedor || filtroEstado || filtroFecha || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* Mostrar info cuando hay filtros pero solo una página */}
      {totalPaginas === 1 && comprasFiltradas.length > 0 && (
        <div className="col-span-2 mt-4">
          <p className="text-sm text-gray-600 text-center">
            Mostrando {comprasFiltradas.length} compras
            {(filtroProveedor || filtroEstado || filtroFecha || terminoBusqueda) && " (filtrados)"}
          </p>
        </div>
      )}

      {/* Modales */}
      <FormularioCompra
        show={showAgregar}
        close={() => setShowAgregar(false)}
        onCompraCreada={handleCompraCreada}
      />

      <FormularioVerCompra
        show={showDetalles}
        close={closeDetalles}
        compra={compraSeleccionada}
        formatoMoneda={formatoMoneda}
      />
    </div>
  );
};

export default PaginaCompras;