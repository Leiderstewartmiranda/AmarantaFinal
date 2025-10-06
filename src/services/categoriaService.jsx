const API_URL = "http://localhost:5201/api/CProductos";

// GET - Obtener todas las categorías
export async function GetCProductos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener categorías");
  return res.json();
}

// GET - Obtener una categoría por ID
export async function GetCProductoById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener la categoría");
  return res.json();
}

// POST - Crear nueva categoría
// POST - Crear nueva categoría
export async function PostCProducto(categoria) {
  const datos = {
    NombreCategoria: categoria.NombreCategoria,
    Descripcion: categoria.Descripcion
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Error ${res.status}: ${errorData}`);
  }

  return res.json();
}


// PUT - Actualizar categoría existente
export async function PutCategoria(id, categoria) {
  const datosActualizados = {
    IdCategoria: parseInt(id),
    NombreCategoria: categoria.NombreCategoria,
    Descripcion: categoria.Descripcion
    // Estado: categoria.Estado
  };

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosActualizados)
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Error ${res.status}: ${errorData}`);
  }
  
  return res.json();
}

// DELETE - Eliminar categoría
export async function DeleteCProducto(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Error ${res.status}: ${errorData}`);
  }
  
  return { success: true, message: "Categoría eliminada correctamente" };
}