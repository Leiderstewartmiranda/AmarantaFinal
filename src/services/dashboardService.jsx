const API_URL = "https://amarantaapi.somee.com/api";

// 📦 Obtener resumen general del dashboard
export async function GetDashboardData() {
  try {
    const [productosRes, clientesRes, pedidosRes, comprasRes] = await Promise.all([
      fetch(`${API_URL}/Productos`),
      fetch(`${API_URL}/Clientes`),
      fetch(`${API_URL}/Pedidos`),
      fetch(`${API_URL}/Compras`)
    ]);

    const [productos, clientes, pedidos, compras] = await Promise.all([
      productosRes.json(),
      clientesRes.json(),
      pedidosRes.json(),
      comprasRes.json()
    ]);

    return { productos, clientes, pedidos, compras };
  } catch (error) {
    console.error("❌ Error cargando datos del dashboard:", error);
    throw error;
  }
}
