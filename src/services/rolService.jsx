// services/roleService.js
const API_URL = "http://amarantaapi.somee.com/api/roles";

// Obtener todos los roles
export const GetRoles = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener los roles");
  return await res.json();
};

// Obtener un rol por ID
export const GetRole = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener el rol");
  return await res.json();
};

// Crear un nuevo rol
export const PostRole = async (role) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });

  if (!res.ok) throw new Error("Error al crear el rol");
  return await res.json();
};

// Actualizar un rol
export const PutRole = async (id, role) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });

  if (!res.ok) throw new Error("Error al actualizar el rol");
  return true;
};

// Eliminar un rol
export const DeleteRole = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar el rol");
  return true;
};