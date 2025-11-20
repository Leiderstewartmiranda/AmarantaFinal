// services/pedidosService.js
const API_URL_PEDIDOS = "http://amarantaapi.somee.com/api/Pedidos";
const API_URL_CLIENTES = "http://amarantaapi.somee.com/api/Clientes";
const API_URL_PRODUCTOS = "http://amarantaapi.somee.com/api/Productos";

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
    const pedidoData = {
      FechaPedido: pedido.FechaPedido || new Date().toISOString().split("T")[0],
      IdCliente: parseInt(pedido.IdCliente),
      Detalles: pedido.Detalles.map((d) => ({
        CodigoProducto: d.CodigoProducto,
        Cantidad: d.Cantidad,
      })),
      Correo: pedido.Correo || "",
      Direccion: pedido.Direccion || "",
      Municipio: pedido.Municipio || "",
      Departamento: pedido.Departamento || ""
    };

    console.log("📦 Pedido a enviar:", pedidoData);

    const response = await fetch(`${API_URL_PEDIDOS}/crear-con-detalles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(pedidoData),
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
