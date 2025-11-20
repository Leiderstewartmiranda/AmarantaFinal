import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioLocal) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ No hay sesión activa.",
        text: "Por favor, inicia sesión para acceder a tu perfil.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      }).then(() => (window.location.href = "/login"));
      return;
    }

    // 🔹 Petición al backend con el correo del usuario
    fetch(
      `http://amarantaapi.somee.com/api/Usuarios/ObtenerPorCorreo?correo=${usuarioLocal.correo}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener datos");
        return res.json();
      })
      .then((data) => {
        console.log("🧠 Datos usuario:", data);
        setUsuario(data);
        setLoading(false);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error al cargar el perfil",
          text: "No se pudo conectar al servidor.",
          confirmButtonColor: "#b45309",
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando perfil...</p>
      </div>
    );
  }

  if (!usuario) return null;

  // 🔹 Función para redirigir según el rol
  const handleVolver = () => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const rol = usuarioLocal?.rol;

    if (rol === "Admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="perfil-container">
      <div className="header-decor"></div>

      <div className="perfil-card">
        <div className="foto-container">
          <div className="foto-wrapper">
            <img
              src={
                usuario.imagenPerfil ||
                "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"
              }
              alt="Perfil"
              className="foto-usuario"
            />
          </div>
        </div>

        <h1 className="nombre-completo">
          {usuario.nombre} {usuario.apellido}
        </h1>
        <p className="correo-subtitle">{usuario.correo}</p>

        <div className="divider">
          <div className="divider-line"></div>
          <div className="divider-diamond">◆</div>
          <div className="divider-line"></div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🪪</div>
            <div className="info-content">
              <span className="info-label">Documento</span>
              <span className="info-value">{usuario.documento}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <span className="info-label">Teléfono</span>
              <span className="info-value">{usuario.telefono}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <span className="info-label">Ubicación</span>
              <span className="info-value">
                {usuario.municipio}, {usuario.departamento}
              </span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📫</div>
            <div className="info-content">
              <span className="info-label">Dirección</span>
              <span className="info-value">{usuario.direccion}</span>
            </div>
          </div>
        </div>

        <div className="actions-container">
          <button
            className="btn-volver"
            onClick={handleVolver}
          >
           Volver
          </button>
          <button
            className="btn-editar"
            onClick={() => navigate("/editar-perfil", { state: { usuario } })}
          >
             Editar Perfil
          </button>
          <button
            className="btn-cerrar"
            onClick={() => {
              localStorage.removeItem("usuario");
              window.location.href = "/";
            }}
          >
             Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="footer-decor"></div>
    </div>
  );
}
