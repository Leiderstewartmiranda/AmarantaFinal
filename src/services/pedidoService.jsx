// services/pedidosService.js
const API_URL_PEDIDOS = "https://amarantaapi.somee.com/api/Pedidos";
const API_URL_CLIENTES = "https://amarantaapi.somee.com/api/Clientes";
const API_URL_PRODUCTOS = "https://amarantaapi.somee.com/api/Productos";

// ✅ Obtener todos los pedidos
export async function GetPedidos() {
  try {
    const response = await fetch(API_URL_PEDIDOS);
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("❌ Error en GetPedidos:", error);
    throw error;
  }
}

// ✅ Obtener un pedido por ID (incluye detalles)
export async function GetPedidoById(id) {
  try {
    const response = await fetch(`${API_URL_PEDIDOS}/${id}`);
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("❌ Error en GetPedidoById:", error);
    throw error;
  }
}

// ✅ Crear pedido con detalles
export async function PostPedido(pedido) {
  try {
    const formData = new FormData();
    formData.append("FechaPedido", pedido.FechaPedido || new Date().toISOString().split("T")[0]);
    formData.append("IdCliente", parseInt(pedido.IdCliente));
    formData.append("Correo", pedido.Correo || "");
    formData.append("Direccion", pedido.Direccion || "");
    formData.append("Municipio", pedido.Municipio || "");
    formData.append("Departamento", pedido.Departamento || "");
    formData.append("Estado", "Pendiente");

    // Agregar archivo si existe
    if (pedido.Factu) {
      formData.append("Factu", pedido.Factu);
    }

    // Agregar detalles con índice para que el backend (ASP.NET) lo reconozca
    pedido.Detalles.forEach((d, index) => {
      formData.append(`Detalles[${index}].CodigoProducto`, d.CodigoProducto);
      formData.append(`Detalles[${index}].Cantidad`, d.Cantidad);
    });

    console.log("📦 Pedido a enviar (FormData):", pedido);

    const response = await fetch(`${API_URL_PEDIDOS}/crear-con-detalles`, {
      method: "POST",
      // No establecer Content-Type explícitamente cuando se usa FormData, el navegador lo hace
      headers: { Accept: "application/json" },
      body: formData,
    });

    const responseText = await response.text();
    if (!response.ok) throw new Error(responseText);

    return JSON.parse(responseText);
  } catch (error) {
    console.error("❌ Error en PostPedido:", error);
    throw error;
  }
}

// ✅ Cancelar pedido
export async function CancelarPedido(id) {
  try {
    const response = await fetch(`${API_URL_PEDIDOS}/${id}/cancelar`, {
      method: "PUT",
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("❌ Error en CancelarPedido:", error);
    throw error;
  }
}

// ✅ Servicios auxiliares
export async function GetClientes() {
  try {
    const response = await fetch(API_URL_CLIENTES);
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("❌ Error en GetClientes:", error);
    throw error;
  }
}

export async function GetProductos() {
  try {
    const response = await fetch(API_URL_PRODUCTOS);
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("❌ Error en GetProductos:", error);
    throw error;
  }
}
