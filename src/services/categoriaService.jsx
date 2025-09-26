const API_URL = "http://localhost:5201/api/CProductos";

// Obtener todos
export async function GetCProductos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener categorias");
  return res.json();
}