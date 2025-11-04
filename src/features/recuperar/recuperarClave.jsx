import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./recuperar.css";

export default function RecuperarClave() {
  const [correo, setCorreo] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5201/api/Usuarios/EnviarCodigoRegistro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({correo}),
      });

      if (response.ok) {
        Swal.fire({
          icon: "info",
          title: "📩 Código enviado",
          text: "Se ha enviado un código de verificación a tu correo.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        navigate("/verificar-recuperacion", { state: { correo } });
      } else {
        Swal.fire({
          icon: "error",
          title: "Correo no encontrado",
          text: "Verifica que el correo esté registrado.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  return (
    <div className="verifi-page">
      <section className="verification-section">
        <div className="verification-box">
          <h1 className="verification-title">AMARANTA</h1>
          <p className="verification-subtitle">Recuperar contraseña</p>

          <form onSubmit={handleSubmit} className="verification-form">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="Ingresa tu correo registrado"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <button type="submit" className="verify-button">
              Enviar código
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
