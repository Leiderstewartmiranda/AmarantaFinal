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
  const [paginaActual, setPaginaActual] = useState(1);
  const comprasPorPagina = 5;

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

  // Filtrar compras
  const comprasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) return listaCompras;
    const termino = terminoBusqueda.toLowerCase().trim();

    return listaCompras.filter((compra) => {
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
  }, [listaCompras, terminoBusqueda, proveedores]);

  // Paginación
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina);
  const indiceInicio = (paginaActual - 1) * comprasPorPagina;
  const comprasPaginadas = comprasFiltradas.slice(indiceInicio, indiceInicio + comprasPorPagina);

  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

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
    <>
      <TituloSeccion titulo="Gestión de Compras" />

      {/* Botón + búsqueda */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <BotonAgregar action={() => setShowAgregar(true)} />
        <div className="w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar por proveedor, código o estado"
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
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
          <TablaAdmin listaCabecera={["Código", "Fecha", "Proveedor", "Total", "Estado", "Acciones"]}>
            {comprasPaginadas.length > 0 ? (
              comprasPaginadas.map((compra) => (
                <tr
                  key={compra.codigoCompra}
                  className={`hover:bg-gray-100 border-t-2 border-gray-300 ${
                    compra.estado === "Anulada" ? "bg-red-50 text-gray-500" : ""
                  }`}
                >
                  <td className="py-2 px-4 font-semibold">#{compra.codigoCompra}</td>
                  <td className="py-2 px-4">{new Date(compra.fechaCompra).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{getProveedorNombre(compra.idProveedor)}</td>
                  <td className="py-2 px-4 font-semibold">{formatoMoneda(compra.precioTotal)}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${
                        compra.estado === "Anulada"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-green-100 text-green-800 border-green-300"
                      }`}
                    >
                      {compra.estado === "Anulada" ? "Anulada" : "Activa"}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="material-symbols:visibility-outline"
                      width="24"
                      className="text-green-700 cursor-pointer hover:text-green-800"
                      onClick={() => mostrarDetalles(compra)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:download"
                      width="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-800"
                      onClick={() => descargarFactura(compra)}
                      title="Descargar factura PDF"
                    />
                    <Icon
                      icon="mdi:cancel"
                      width="24"
                      className={`cursor-pointer transition-colors ${
                        compra.estado === "Anulada"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-700 hover:text-red-800"
                      }`}
                      onClick={() => compra.estado !== "Anulada" && handleAnular(compra)}
                      title={compra.estado === "Anulada" ? "Compra ya anulada" : "Anular compra"}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  {terminoBusqueda
                    ? `No se encontraron compras que coincidan con "${terminoBusqueda}"`
                    : "No hay compras disponibles"}
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
          generarNumerosPagina={() => Array.from({ length: totalPaginas }, (_, i) => i + 1)}
        />
      )}

      {/* Formularios */}
      <FormularioCompra
        show={showAgregar}
        close={() => setShowAgregar(false)}
        onCompraCreada={handleCompraCreada}
        proveedores={proveedores}
        productos={productos}
      />

      <FormularioVerCompra
        show={showDetalles}
        close={closeDetalles}
        compra={compraSeleccionada}
        formatoMoneda={formatoMoneda}
        descargarFactura={descargarFactura}
        proveedores={proveedores}
      />
    </>
  );
};

export default PaginaCompras;
