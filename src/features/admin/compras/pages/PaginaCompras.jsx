// import { Icon } from "@iconify/react/dist/iconify.js";
// import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
// import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
// import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
// import Paginacion from "../../../../compartidos/paginacion/Paginacion";
// import { useRef, useState, useMemo } from "react";
// import FormularioAgregarCompra from "../components/forms/FormularioAgregarCompra";
// import FormularioVerCompra from "../components/forms/FormularioVerCompra";
// import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
// import jsPDF from 'jspdf';

// pages/compras/PaginaCompras.jsx
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
  GetUsuarios 
} from "../../../../services/compraService";
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
  const descargarFactura = (compra) => {
    const doc = new jsPDF();
    
    // Agregar logo o título
    doc.setFontSize(20);
    doc.text('FACTURA DE COMPRA', 105, 15, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text('Mi Empresa S.A.', 20, 25);
    doc.text('Calle Principal #123', 20, 30);
    doc.text('Ciudad, País', 20, 35);
    doc.text('Tel: +123 456 7890', 20, 40);
    
    // Información de la factura
    doc.text(`Factura #: ${compra.codigoCompra}`, 150, 25);
    doc.text(`Fecha: ${new Date(compra.fechaCompra).toLocaleDateString()}`, 150, 30);
    
    // Información del proveedor
    doc.setFontSize(14);
    doc.text('Proveedor:', 20, 55);
    doc.setFontSize(12);
    doc.text(getProveedorNombre(compra.idProveedor), 20, 60);
    
    // Línea separadora
    doc.line(20, 80, 190, 80);
    
    // Información de la compra
    doc.setFontSize(12);
    doc.text(`Estado: ${compra.estado}`, 20, 90);
    doc.text(`Total: ${formatoMoneda(compra.precioTotal)}`, 20, 100);
    
    // Si está anulada, agregar marca de agua
    if (compra.estado === "Anulada") {
      doc.setFontSize(60);
      doc.setTextColor(200, 0, 0, 30);
      doc.text('ANULADO', 105, 150, { align: 'center', angle: 45 });
      doc.setTextColor(0, 0, 0);
    }
    
    // Guardar el PDF
    doc.save(`factura_${compra.codigoCompra}.pdf`);
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
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Gestión de Compras</h2>
      </section>
      
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