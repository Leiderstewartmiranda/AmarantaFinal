const API_URL = "http://localhost:5201/api/Productos";

// Obtener todos
export async function GetProductos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

// Crear producto
export async function CrearProducto(producto) {
  const formData = new FormData();
  
  formData.append("NombreProducto", producto.NombreProducto);
  formData.append("Precio", producto.Precio.toString());
  formData.append("Stock", producto.Stock.toString());
  formData.append("IdCategoria", producto.IdCategoria.toString());
  
  // IMAGEN OBLIGATORIA (temporalmente)
  if (producto.Imagen) {
    formData.append("Imagen", producto.Imagen);
  } else {
    // Si no hay imagen, mostrar error
    throw new Error("La imagen es requerida");
  }

  console.log("📤 Campos enviados:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  const res = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Error ${res.status}: ${errorData}`);
  }
  
  return res.json();
}
// Actualizar producto
export async function ActualizarProducto(id, producto) {
  const formData = new FormData();
  if (producto.NombreProducto) formData.append("NombreProducto", producto.NombreProducto);
  if (producto.Precio) formData.append("Precio", producto.Precio);
  if (producto.Stock) formData.append("Stock", producto.Stock);
  if (producto.IdCategoria) formData.append("IdCategoria", producto.IdCategoria);
  if (producto.Imagen) formData.append("nuevaImagen", producto.Imagen); // 👈 parámetro "nuevaImagen" en tu API

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al actualizar producto");
  return true; // en tu API el PUT devuelve NoContent (204)
}

// Eliminar producto
export async function DeleteProducto(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar producto");
  return true;
}
