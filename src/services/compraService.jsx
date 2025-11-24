// services/comprasService.js
const API_URL_COMPRAS = "http://amarantaapi.somee.com/api/Compras";
const API_URL_DETALLE_COMPRAS = "http://amarantaapi.somee.com/api/DetallesCompras";
const API_URL_PRODUCTOS = "http://amarantaapi.somee.com/api/Productos";
const API_URL_PROVEEDORES = "http://localhost:5201/api/Proveedores";


// Servicios para Compras
export async function GetCompras() {
  try {
    const response = await fetch(API_URL_COMPRAS);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en GetCompras:', error);
    throw error;
  }
}

export async function PostCompra(compra) {
  try {
    const compraData = {
      fechaCompra: compra.FechaCompra,
      precioTotal: compra.PrecioTotal || 0,
      estado: compra.Estado || "Activa",
      idProveedor: parseInt(compra.IdProveedor)
    };

    console.log("📦 Enviando compra:", compraData);

    const response = await fetch(API_URL_COMPRAS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(compraData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Compra creada:", result);
    return result;
  } catch (error) {
    console.error("❌ Error en PostCompra:", error);
    throw error;
  }
}



export async function AnularCompra(id) {
  try {
    const response = await fetch(`${API_URL_COMPRAS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Estado: "Anulada"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error en AnularCompra:', error);
    throw error;
  }
}

// Servicios para DetalleCompra
export async function GetDetallesByCompra(compraId) {
  try {
    const response = await fetch(`${API_URL_DETALLE_COMPRAS}/compra/${compraId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en GetDetallesByCompra:', error);
    throw error;
  }
}

export async function PostDetalleCompra(detalle) {
  try {
    console.log('📤 Enviando detalle de compra:', detalle);

    // VERIFICA QUE TENGA EL CodigoCompra CORRECTO (18 en este caso)
    const detalleData = {
      CodigoCompra: detalle.CodigoCompra,
      CodigoProducto: detalle.CodigoProducto,
      Cantidad: detalle.Cantidad,
      PrecioUnitario: detalle.Precio || detalle.PrecioUnitario,
      PrecioTotal: detalle.Subtotal || detalle.PrecioTotal,
      NombreProducto: detalle.NombreProducto 
    };

    console.log('🔗 URL de detalles:', API_URL_DETALLE_COMPRAS);
    console.log('📦 Datos de detalle:', detalleData);

    const response = await fetch(API_URL_DETALLE_COMPRAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detalleData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Detalle creado exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en PostDetalleCompra:', error);
    throw error;
  }
}

// Servicios auxiliares
export async function GetProductos() {
  try {
    const response = await fetch(API_URL_PRODUCTOS);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en GetProductos:', error);
    throw error;
  }
}

export async function GetProveedores() {
  try {
    const response = await fetch(API_URL_PROVEEDORES);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en GetProveedores:', error);
    throw error;
  }
}


// ✅ Nuevo método: registrar varios detalles de una compra
export async function PostDetallesCompraMultiple(detalles) {
  try {
    const response = await fetch("http://amarantaapi.somee.com/api/DetallesCompras/multiple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detalles),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error en PostDetallesCompraMultiple:", error);
    throw error;
  }
}
