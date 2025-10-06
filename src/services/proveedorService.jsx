const API_URL = "http://localhost:5201/api/Proveedores"; // 👈 tu endpoint real

export async function GetProveedores() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener proveedores");
  return await response.json();
}

export async function PostProveedor(proveedor) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  if (!response.ok) throw new Error("Error al crear proveedor");
  return await response.json();
}

export async function PutProveedor(id, proveedor) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  if (!response.ok) throw new Error("Error al actualizar proveedor");
  return true; // porque tu API devuelve NoContent
}

export async function DeleteProveedore(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar proveedor");
  return true; // porque tu API devuelve NoContent
}
