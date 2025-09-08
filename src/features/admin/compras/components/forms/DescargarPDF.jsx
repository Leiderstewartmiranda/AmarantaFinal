import jsPDF from 'jspdf';

// ... resto del código ...

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
  
  // Guardar el PDF
  doc.save(`factura_${compra.Id_Compra}.pdf`);
};