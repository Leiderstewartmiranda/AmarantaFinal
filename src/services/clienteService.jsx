const API_URL = "http://localhost:5201/api/Clientes";

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
