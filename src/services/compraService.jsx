// services/comprasService.js
const API_URL_COMPRAS = "http://localhost:5201/api/Compras";
const API_URL_DETALLE_COMPRAS = "http://localhost:5201/api/DetallesCompras";
const API_URL_PRODUCTOS = "http://localhost:5201/api/Productos";
const API_URL_PROVEEDORES = "http://localhost:5201/api/Proveedores";
const API_URL_USUARIOS = "http://localhost:5201/api/Usuarios";

export async function GetUsuarios() {
  try {
    const response = await fetch(API_URL_USUARIOS);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en GetUsuarios:', error);
    throw error;
  }
}

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
    // 🚨 Validación obligatoria
    if (!compra.IdProveedor || compra.IdProveedor === "0") {
      throw new Error("Debe seleccionar un proveedor válido");
    }

    const compraData = {
      FechaCompra: compra.FechaCompra,
      PrecioTotal: compra.PrecioTotal || 0,
      Estado: compra.Estado || "Activa",
      IdUsuario: compra.IdUsuario || 1,
      IdProveedor: parseInt(compra.IdProveedor) // 👈 siempre debe existir
    };

    console.log('📦 Datos de compra a enviar:', compraData);

    const response = await fetch(API_URL_COMPRAS, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(compraData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Compra creada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en PostCompra:', error);
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
      CodigoProducto: detalle.IdProducto,
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