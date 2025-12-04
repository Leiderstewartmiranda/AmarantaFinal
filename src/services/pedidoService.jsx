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

export async function ActualizarEstadoPedido(id, nuevoEstado) {
  try {
    console.log(`📤 Actualizando estado del pedido ${id} a: ${nuevoEstado}`);
    
    // 1. Crear el DTO correctamente según lo que espera el backend
    const dto = {
      estado: nuevoEstado // ← Esto debe coincidir con la propiedad del DTO en C#
    };
    
    console.log('📦 Enviando DTO:', dto);
    
    // 2. Hacer la petición PUT al endpoint correcto
    const response = await fetch(`${API_URL_PEDIDOS}/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Si necesitas autenticación:
        // "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(dto) // ← Enviar solo el DTO, no query params
    });
    
    console.log('📡 Status de respuesta:', response.status);
    
    // 3. Verificar si la respuesta fue exitosa
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar obtener más detalles del error
      try {
        const errorData = await response.json();
        console.error('❌ Detalles del error:', errorData);
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, obtener como texto
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // 4. Procesar respuesta exitosa
    const result = await response.json();
    console.log('✅ Estado actualizado correctamente:', result);
    return result;
    
  } catch (error) {
    console.error("❌ Error en ActualizarEstadoPedido:", error.message);
    throw error; // Propagar el error para manejarlo en el componente
  }
}

// ✅ Cancelar pedido
export async function CancelarPedido(id) {
  try {
    const response = await fetch(`${API_URL_PEDIDOS}/${id}/cancelar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    
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
