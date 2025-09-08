import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo } from "react";
import FormularioAgregarCompra from "../components/forms/FormularioAgregarCompra";
import FormularioVerCompra from "../components/forms/FormularioVerCompra";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import jsPDF from 'jspdf';

const PaginaCompras = () => {
  // Datos de ejemplo para compras
  const [listaCompras, setListaCompras] = useState([
    {
      Id_Compra: 1,
      Fecha: "2023-10-15",
      Proveedor: "Tecnología Avanzada S.A.",
      Total: 1500.75,
      Estado: "Completado",
      Documento: "factura_001.pdf",
      Id_Cliente: 1,
      Cliente: "Juan Pérez",
      Productos: [
        { nombre: "Laptop HP Pavilion", cantidad: 1, precio: 1200.00 },
        { nombre: "Mouse inalámbrico", cantidad: 1, precio: 25.75 },
        { nombre: "Impresora HP", cantidad: 1, precio: 275.00 }
      ]
    },
    {
      Id_Compra: 2,
      Fecha: "2023-10-16",
      Proveedor: "Suministros de Oficina Ltda.",
      Total: 2300.50,
      Estado: "Pendiente",
      Documento: "factura_002.pdf",
      Id_Cliente: 2,
      Cliente: "María Gómez",
      Productos: [
        { nombre: "Silla ergonómica", cantidad: 2, precio: 800.00 },
        { nombre: "Escritorio ejecutivo", cantidad: 1, precio: 450.50 },
        { nombre: "Archivador metálico", cantidad: 1, precio: 250.00 }
      ]
    },
    {
      Id_Compra: 3,
      Fecha: "2023-10-17",
      Proveedor: "Materiales de Construcción XYZ",
      Total: 875.25,
      Estado: "Anulado", // Cambiado de "Cancelado" a "Anulado"
      Documento: "factura_003.pdf",
      Id_Cliente: 3,
      Cliente: "Carlos López",
      Productos: [
        { nombre: "Cemento 50kg", cantidad: 5, precio: 150.25 },
        { nombre: "Varilla corrugada", cantidad: 10, precio: 12.50 }
      ]
    },
    {
      Id_Compra: 4,
      Fecha: "2023-10-18",
      Proveedor: "Tecnología Avanzada S.A.",
      Total: 3200.00,
      Estado: "Completado",
      Documento: "factura_004.pdf",
      Id_Cliente: 1,
      Cliente: "Juan Pérez",
      Productos: [
        { nombre: "Monitor 24\"", cantidad: 2, precio: 1200.00 },
        { nombre: "Teclado mecánico", cantidad: 2, precio: 400.00 }
      ]
    },
    {
      Id_Compra: 5,
      Fecha: "2023-10-19",
      Proveedor: "Suministros de Oficina Ltda.",
      Total: 1250.30,
      Estado: "Pendiente",
      Documento: "factura_005.pdf",
      Id_Cliente: 4,
      Cliente: "Ana Martínez",
      Productos: [
        { nombre: "Papel bond A4", cantidad: 10, precio: 75.30 },
        { nombre: "Tóner impresora", cantidad: 2, precio: 500.00 },
        { nombre: "Folders archivadores", cantidad: 5, precio: 15.00 }
      ]
    }
  ]);

  // Lista de clientes para el formulario de agregar
  const [listaClientes] = useState([
    { Id_Cliente: 1, Nombre: "Juan Pérez" },
    { Id_Cliente: 2, Nombre: "María Gómez" },
    { Id_Cliente: 3, Nombre: "Carlos López" },
    { Id_Cliente: 4, Nombre: "Ana Martínez" },
    { Id_Cliente: 5, Nombre: "Luis Hernández" }
  ]);

  // Lista de proveedores para el formulario de agregar
  const [listaProveedores] = useState([
    { Id_Proveedor: 1, Nombre: "Tecnología Avanzada S.A." },
    { Id_Proveedor: 2, Nombre: "Suministros de Oficina Ltda." },
    { Id_Proveedor: 3, Nombre: "Materiales de Construcción XYZ" },
    { Id_Proveedor: 4, Nombre: "Electrodomésticos Modernos" },
    { Id_Proveedor: 5, Nombre: "Ropa y Accesorios Fashion" }
  ]);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const comprasPorPagina = 5;
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [compraAAnular, setCompraAAnular] = useState(null);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  // Referencias para el formulario
  const fechaRef = useRef();
  const proveedorRef = useRef();
  const totalRef = useRef();
  const estadoRef = useRef();
  const idClienteRef = useRef();
  const busquedaRef = useRef();

  // Filtrar compras basado en el término de búsqueda
  const comprasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaCompras;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaCompras.filter((compra) => {
      const fecha = compra.Fecha.toLowerCase();
      const proveedor = compra.Proveedor.toLowerCase();
      const total = compra.Total.toString().toLowerCase();
      const estado = compra.Estado.toLowerCase();
      const cliente = compra.Cliente.toLowerCase();

      return (
        fecha.includes(termino) ||
        proveedor.includes(termino) ||
        total.includes(termino) ||
        estado.includes(termino) ||
        cliente.includes(termino)
      );
    });
  }, [listaCompras, terminoBusqueda]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina);
  const indiceInicio = (paginaActual - 1) * comprasPorPagina;
  const indiceFin = indiceInicio + comprasPorPagina;
  const comprasPaginadas = comprasFiltradas.slice(indiceInicio, indiceFin);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1); // Resetear a la primera página cuando se busca
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Manejar envío del formulario de agregar
  const handleAgregarSubmit = (e) => {
    e.preventDefault();

    const compra = {
      Id_Compra: listaCompras.length + 1,
      Fecha: fechaRef.current.value,
      Proveedor: proveedorRef.current.value,
      Total: parseFloat(totalRef.current.value),
      Estado: estadoRef.current.value,
      Documento: `factura_${String(listaCompras.length + 1).padStart(3, '0')}.pdf`,
      Id_Cliente: parseInt(idClienteRef.current.value),
      Cliente: listaClientes.find(c => c.Id_Cliente === parseInt(idClienteRef.current.value))?.Nombre || "Cliente no encontrado",
      Productos: [
        { nombre: "Producto ejemplo", cantidad: 1, precio: parseFloat(totalRef.current.value) }
      ]
    };

    setListaCompras([...listaCompras, compra]);
    setShowAgregar(false);
  };

  // Manejar anulación de compra
  const handleAnular = (id) => {
    const compra = listaCompras.find((compra) => compra.Id_Compra === id);
    
    if (compra) {
      setCompraAAnular(compra);
      setShowConfirmacion(true);
    }
  };

  const confirmarAnulacion = () => {
    if (compraAAnular) {
      setListaCompras(
        listaCompras.map(compra => 
          compra.Id_Compra === compraAAnular.Id_Compra 
            ? {...compra, Estado: "Anulado"} 
            : compra
        )
      );
      setCompraAAnular(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setCompraAAnular(null);
  };

  // Mostrar detalles de la compra
  const mostrarDetalles = (id) => {
    const compra = listaCompras.find((compra) => compra.Id_Compra === id);
    if (compra) {
      setCompraSeleccionada(compra);
      setShowDetalles(true);
    }
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
    }).format(valor);
  };

  // Función para generar y descargar factura PDF
  const descargarFactura = (compra) => {
    // Crear un nuevo documento PDF
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
    doc.text(`Factura #: ${compra.Id_Compra}`, 150, 25);
    doc.text(`Fecha: ${compra.Fecha}`, 150, 30);
    
    // Información del proveedor
    doc.setFontSize(14);
    doc.text('Proveedor:', 20, 55);
    doc.setFontSize(12);
    doc.text(compra.Proveedor, 20, 60);
    
    // Información del cliente
    doc.setFontSize(14);
    doc.text('Cliente:', 20, 70);
    doc.setFontSize(12);
    doc.text(compra.Cliente, 20, 75);
    
    // Línea separadora
    doc.line(20, 80, 190, 80);
    
    // Encabezado de la tabla de productos
    doc.setFontSize(12);
    doc.text('Producto', 20, 90);
    doc.text('Cantidad', 100, 90);
    doc.text('Precio Unit.', 130, 90);
    doc.text('Total', 170, 90);
    
    // Línea separadora
    doc.line(20, 92, 190, 92);
    
    // Productos
    let y = 100;
    compra.Productos.forEach((producto, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(producto.nombre, 20, y);
      doc.text(producto.cantidad.toString(), 100, y);
      doc.text(formatoMoneda(producto.precio), 130, y);
      doc.text(formatoMoneda(producto.cantidad * producto.precio), 170, y);
      
      y += 10;
    });
    
    // Línea separadora
    doc.line(20, y, 190, y);
    y += 10;
    
    // Total
    doc.setFontSize(14);
    doc.text('TOTAL:', 130, y);
    doc.text(formatoMoneda(compra.Total), 170, y);
    
    // Estado
    doc.setFontSize(12);
    doc.text(`Estado: ${compra.Estado}`, 20, y + 15);
    
    // Si está anulada, agregar marca de agua
    if (compra.Estado === "Anulado") {
      doc.setFontSize(60);
      doc.setTextColor(200, 0, 0, 30); // Rojo transparente
      doc.text('ANULADO', 105, 150, { align: 'center', angle: 45 });
      doc.setTextColor(0, 0, 0); // Restaurar color negro
    }
    
    // Guardar el PDF
    doc.save(`factura_${compra.Id_Compra}.pdf`);
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
            placeholder="Buscar por proveedor, cliente o estado"
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
            listaCabecera={["Fecha", "Proveedor", "Cliente", "Total", "Estado", "Acciones"]}
          >
            {comprasPaginadas.length > 0 ? (
              comprasPaginadas.map((element) => (
                <tr
                  key={element.Id_Compra}
                  className={`hover:bg-gray-100 border-t-2 border-gray-300 ${
                    element.Estado === "Anulado" ? "bg-red-50 text-gray-500" : ""
                  }`}
                >
                  <td className="py-2 px-4">{element.Fecha}</td>
                  <td className="py-2 px-4">{element.Proveedor}</td>
                  <td className="py-2 px-4">{element.Cliente}</td>
                  <td className="py-2 px-4">{formatoMoneda(element.Total)}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      element.Estado === "Completado" 
                        ? "bg-green-100 text-green-800" 
                        : element.Estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : element.Estado === "Anulado"
                        ? "bg-red-100 text-red-800 line-through"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {element.Estado}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 justify-center">
                    <Icon
                      icon="mdi:eye-outline"
                      width="24"
                      height="24"
                      className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                      onClick={() => mostrarDetalles(element.Id_Compra)}
                      title="Ver detalles"
                    />
                    <Icon
                      icon="material-symbols:download"
                      width="24"
                      height="24"
                      className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                      onClick={() => descargarFactura(element)}
                      title="Descargar factura PDF"
                    />
                    <Icon
                      icon="mdi:cancel"
                      width="24"
                      height="24"
                      className={`cursor-pointer transition-colors ${
                        element.Estado === "Anulado" 
                          ? "text-gray-400 cursor-not-allowed" 
                          : "text-red-700 hover:text-red-900"
                      }`}
                      onClick={() => element.Estado !== "Anulado" && handleAnular(element.Id_Compra)}
                      title={element.Estado === "Anulado" ? "Compra ya anulada" : "Anular compra"}
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
      <FormularioAgregarCompra
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        fechaRef={fechaRef}
        proveedorRef={proveedorRef}
        totalRef={totalRef}
        estadoRef={estadoRef}
        idClienteRef={idClienteRef}
        listaClientes={listaClientes}
        listaProveedores={listaProveedores}
      />

      {/* Formulario para ver detalles de compra */}
      <FormularioVerCompra
        show={showDetalles}
        close={closeDetalles}
        compra={compraSeleccionada}
        formatoMoneda={formatoMoneda}
        descargarFactura={descargarFactura}
      />

      {/* Modal de confirmación para anular */}
      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarAnulacion}
        titulo="Anular Compra"
        mensaje="¿Estás seguro de que deseas anular esta compra?"
        detalles={compraAAnular && (
          <>
            <div><strong>Fecha:</strong> {compraAAnular.Fecha}</div>
            <div><strong>Proveedor:</strong> {compraAAnular.Proveedor}</div>
            <div><strong>Cliente:</strong> {compraAAnular.Cliente}</div>
            <div><strong>Total:</strong> {formatoMoneda(compraAAnular.Total)}</div>
            <div><strong>Estado actual:</strong> {compraAAnular.Estado}</div>
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