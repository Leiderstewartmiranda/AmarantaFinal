const API_URL = "https://amarantaapi.somee.com/api/Usuarios";

export async function GetUsuarios() {
    const response = await fetch(API_URL);
    return await response.json();
}

export async function CrearUsuario(usuario) {
    // usuario should be a FormData object or a plain object to be converted
    let body = usuario;
    const headers = {};

    if (!(usuario instanceof FormData)) {
        const formData = new FormData();
        Object.keys(usuario).forEach(key => {
            if (usuario[key] !== null && usuario[key] !== undefined) {
                formData.append(key, usuario[key]);
            }
        });
        body = formData;
    }

    // When using FormData, do NOT set Content-Type header, let the browser set it with boundary
    const response = await fetch(API_URL, {
        method: "POST",
        body: body,
    });

    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        throw new Error(responseText || "Error en la respuesta del servidor");
    }

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al crear usuario");
    }

    return data;
}

export async function EditarUsuario(id, usuario) {
    let body = usuario;

    if (!(usuario instanceof FormData)) {
        const formData = new FormData();
        Object.keys(usuario).forEach(key => {
            if (usuario[key] !== null && usuario[key] !== undefined) {
                formData.append(key, usuario[key]);
            }
        });
        body = formData;
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al actualizar usuario");
    }
}

export async function DeleteUsuario(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error("Error al eliminar usuario");
    }
}

export async function GetUsuarioById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Usuario no encontrado");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener usuario:", error.message);
        throw error;
    }
}
