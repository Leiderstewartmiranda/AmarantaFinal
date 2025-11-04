
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
  GetDetallesByCompra
} from "../../../../services/compraService";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos"; 
import jsPDF from 'jspdf';

const PaginaCompras = () => {
  // Estados reales conectados a API
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
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [compraAAnular, setCompraAAnular] = useState(null);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const busquedaRef = useRef();

  // Cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [comprasData, proveedoresData, productosData] = await Promise.all([
          GetCompras(),
          GetProveedores(),
          GetProductos()
        ]);
        setListaCompras(comprasData);
        setProveedores(proveedoresData);
        setProductos(productosData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [recarga]);

  // Filtrar compras basado en el término de búsqueda
  const comprasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaCompras;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaCompras.filter((compra) => {
      const fecha = compra.fechaCompra?.toLowerCase() || '';
      const total = compra.precioTotal?.toString().toLowerCase() || '';
      const estado = compra.estado?.toLowerCase() || '';
      const codigo = compra.codigoCompra?.toString().toLowerCase() || '';
      
      // Buscar nombre del proveedor
      const proveedor = proveedores.find(p => p.IdProveedor === compra.IdProveedor);
      const nombreProveedor = proveedor?.nombreEmpresa?.toLowerCase() || '';

      return (
        fecha.includes(termino) ||
        total.includes(termino) ||
        estado.includes(termino) ||
        codigo.includes(termino) ||
        nombreProveedor.includes(termino)
      );
    });
  }, [listaCompras, terminoBusqueda, proveedores]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina);
  const indiceInicio = (paginaActual - 1) * comprasPorPagina;
  const comprasPaginadas = comprasFiltradas.slice(indiceInicio, indiceInicio + comprasPorPagina);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Manejar compra creada exitosamente
  const handleCompraCreada = () => {
    setRecarga(prev => prev + 1);
    setShowAgregar(false);
  };

  // Manejar anulación de compra
  const handleAnular = (compra) => {
    if (compra.estado === "Anulada") {
      alert("Esta compra ya está anulada y no se puede modificar");
      return;
    }
    setCompraAAnular(compra);
    setShowConfirmacion(true);
  };

  const confirmarAnulacion = async () => {
    if (compraAAnular) {
      try {
        await AnularCompra(compraAAnular.codigoCompra);
        setRecarga(prev => prev + 1);
        setCompraAAnular(null);
        setShowConfirmacion(false);
      } catch (error) {
        console.error("Error anulando compra:", error);
        alert("Error al anular la compra");
      }
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setCompraAAnular(null);
  };

  // Mostrar detalles de la compra
  const mostrarDetalles = (compra) => {
    setCompraSeleccionada(compra);
    setShowDetalles(true);
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setCompraSeleccionada(null);
  };

  // Formatear moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor || 0);
  };

  // Obtener nombre del proveedor
  const getProveedorNombre = (idProveedor) => {
    const proveedor = proveedores.find(p => p.idProveedor === idProveedor);
    return proveedor?.nombreEmpresa;
  };

  // Función para generar y descargar factura PDF
const descargarFactura = async (compra) => {
  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // Colores institucionales Amaranta
    const verde = [74, 75, 47]; // #4a4b2f
    const naranjado = [209, 81, 19]; // #d15113

    // Obtener detalles con nombres de productos
    const detallesData = await GetDetallesByCompra(compra.codigoCompra);
    const detalles = Array.isArray(detallesData) ? detallesData : [];

    // Cargar logo
    const logo = new Image();
    logo.src = `${window.location.origin}/AmaraLogo.png`; // ✅ debe estar en public/

    logo.onload = () => {
      // === ENCABEZADO ===
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

      // === DATOS DE COMPRA ===
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Detalles de la Compra", 15, 48);
      doc.setFont("helvetica", "normal");
      doc.text(`Código: ${compra.codigoCompra}`, 15, 55);
      doc.text(`Fecha: ${new Date(compra.fechaCompra).toLocaleDateString()}`, 15, 60);
      doc.text(`Estado: ${compra.estado}`, 15, 65);

      // === PROVEEDOR ===
      const proveedor = proveedores.find(p => p.idProveedor === compra.idProveedor);
      if (proveedor) {
        doc.setFont("helvetica", "bold");
        doc.text("Proveedor:", 15, 75);
        doc.setFont("helvetica", "normal");
        doc.text(proveedor.nombreEmpresa || "", 15, 80);
        doc.text(`${proveedor.nit || ""}: ${proveedor.representante || ""}`, 15, 85);
        doc.text(`Tel: ${proveedor.telefono || "N/A"}`, 15, 90);
      }

      // === TABLA DE PRODUCTOS ===
      let y = 100;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(...naranjado);
      doc.setTextColor(255);
      doc.rect(15, y, 180, 8, "F");
      doc.text("Producto", 20, y + 6);
      doc.text("Cantidad", 90, y + 6);
      doc.text("Precio Unitario", 125, y + 6);
      doc.text("Subtotal", 165, y + 6);

      // === FILAS DE PRODUCTOS ===
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);

      if (detalles.length === 0) {
        doc.text("No hay productos registrados para esta compra.", 20, y + 5);
      } else {
        detalles.forEach((d) => {
          const producto = productos.find(p => p.codigoProducto === d.codigoProducto);
          const nombre = producto?.nombre || d.nombreProducto || "Producto desconocido";
          const cantidad = d.cantidad || 0;
          const precio = d.precioUnitario || 0;
          const subtotal = cantidad * precio;

          // Celdas de texto
          doc.text(nombre, 20, y);
          doc.text(String(cantidad), 95, y, { align: "right" });
          doc.text(`$${precio.toLocaleString("es-CO")}`, 145, y, { align: "right" });
          doc.text(`$${subtotal.toLocaleString("es-CO")}`, 190, y, { align: "right" });

          y += 8;
          if (y > 260) { // Salto de página automático
            doc.addPage();
            y = 20;
          }
        });
      }

      // === TOTAL ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...verde);
      doc.text(
        `TOTAL: $${(compra.precioTotal || 0).toLocaleString("es-CO")}`,
        190,
        y + 10,
        { align: "right" }
      );

      // === MARCA DE AGUA SI ESTÁ ANULADA ===
      if (compra.estado === "Anulada") {
        doc.setFontSize(60);
        doc.setTextColor(255, 0, 0, 30);
        doc.text("ANULADA", 105, 160, { align: "center", angle: 45 });
      }

      // === PIE DE PÁGINA ===
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text("Generado automáticamente por el sistema Amaranta", 105, 285, {
        align: "center",
      });

      // === DESCARGAR ===
      doc.save(`Factura_Compra_${compra.codigoCompra}.pdf`);
    };
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("❌ No se pudo generar el PDF.");
  }
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

  // Estilo para estado
  const getEstadoColor = (estado) => {
    return estado === "Anulada" 
      ? "bg-red-100 text-red-800 border-red-300" 
      : "bg-green-100 text-green-800 border-green-300";
  };

  const getEstadoTexto = (estado) => {
    return estado === "Anulada" ? "Anulada" : "Activa";
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
      <TituloSeccion 
      titulo="Gestión de Compras" />
      
      {/* Sección para botón y búsqueda */}
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
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

      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <TablaAdmin
            listaCabecera={["Código", "Fecha", "Proveedor", "Total", "Estado", "Acciones"]}
          >
            {comprasPaginadas.length > 0 ? (
              comprasPaginadas.map((compra) => (
                <tr
                  key={compra.codigoCompra}
                  className={`hover:bg-gray-100 border-t-2 border-gray-300 ${
                    compra.estado === "Anulada" ? "bg-red-50 text-gray-500" : ""
                  }`}
                >
                  <td className="py-2 px-4 font-semibold">#{compra.codigoCompra}</td>
                  <td className="py-2 px-4">
                    {new Date(compra.fechaCompra).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{getProveedorNombre(compra.idProveedor)}</td>
                  <td className="py-2 px-4 font-semibold">
                    {formatoMoneda(compra.precioTotal)}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getEstadoColor(compra.estado)}`}>
                      {getEstadoTexto(compra.estado)}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="material-symbols:visibility-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-800"
                      onClick={() => mostrarDetalles(compra)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:download"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-800"
                      onClick={() => descargarFactura(compra)}
                      title="Descargar factura PDF"
                    />
                    <Icon
                      icon="mdi:cancel"
                      width="24"
                      height="24"
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
                  {terminoBusqueda ? 
                    `No se encontraron compras que coincidan con "${terminoBusqueda}"` : 
                    "No hay compras disponibles"
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

      {/* Formulario para agregar compra */}
      <FormularioCompra
        show={showAgregar}
        close={() => setShowAgregar(false)}
        onCompraCreada={handleCompraCreada}
        proveedores={proveedores}
        productos={productos}
      />

      {/* Formulario para ver detalles de compra */}
      <FormularioVerCompra
        show={showDetalles}
        close={closeDetalles}
        compra={compraSeleccionada}
        formatoMoneda={formatoMoneda}
        descargarFactura={descargarFactura}
        proveedores={proveedores}
      />

      {/* Modal de confirmación para anular */}
      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarAnulacion}
        titulo="Anular Compra"
        mensaje="¿Estás seguro de que deseas anular esta compra? Esta acción no se puede deshacer."
        detalles={compraAAnular && (
          <>
            <div><strong>Código:</strong> #{compraAAnular.codigoCompra}</div>
            <div><strong>Fecha:</strong> {new Date(compraAAnular.fechaCompra).toLocaleDateString()}</div>
            <div><strong>Proveedor:</strong> {getProveedorNombre(compraAAnular.IdProveedor)}</div>
            <div><strong>Total:</strong> {formatoMoneda(compraAAnular.precioTotal)}</div>
          </>
        )}
        textoConfirmar="Anular"
        textoCancelar="Cancelar"
        tipoIcono="warning"
        colorConfirmar="red"
      />
    </>
  );
};

export default PaginaCompras;