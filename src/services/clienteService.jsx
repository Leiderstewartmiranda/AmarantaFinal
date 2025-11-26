const API_URL = "https://amarantaapi.somee.com/api/Clientes";

export async function GetClientes() {
  const response = await fetch(API_URL);
  return await response.json();
}

export async function CrearCliente(cliente) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return await response.json();
}

export async function EditarCliente(id, cliente) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
}

export async function DeleteCliente(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}

export async function GetClienteById(idCliente) {
  try {
    const response = await fetch(`${API_URL}/${idCliente}`);
    if (!response.ok) throw new Error("Cliente no encontrado");
    const data = await response.json();
    console.log("✅ Cliente encontrado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al obtener cliente:", error.message);
    throw error; // importante para manejar el error arriba
  }
}

