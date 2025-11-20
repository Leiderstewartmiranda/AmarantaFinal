//La variable representante es la que utilizo como documento JAJAJAJA. y la de nit como tipo de documento

const API_URL = "http://amarantaapi.somee.com/api/Proveedores"; // 👈 tu endpoint real

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
  const proveedores = await GetProveedores();

  const tipoDocNuevo = (proveedor.nit ?? "").toString().trim().toLowerCase();
  const docNuevo = (proveedor.representante ?? "").toString().trim().toLowerCase();

  const existe = proveedores.some((p) => {
    const tipoDocExistente = (p.nit ?? "").toString().trim().toLowerCase();
    const docExistente = (p.representante ?? "").toString().trim().toLowerCase();
    return (
      tipoDocExistente === tipoDocNuevo &&
      docExistente === docNuevo &&
      p.idProveedor !== id
    );
  });

  if (existe) {
    throw new Error("⚠️ No se permite actualizar a un documento ya existente.");
  }

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
