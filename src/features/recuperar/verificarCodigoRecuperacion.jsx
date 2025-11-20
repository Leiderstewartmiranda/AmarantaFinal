import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./recuperar.css";

export default function VerificarCodigoRecuperacion() {
  const [codigo, setCodigo] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const correo = location.state?.correo;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      // 🔥 CAMBIO: Usar VerificarCodigoRecuperacion en lugar de VerificarCodigo
      const response = await fetch("http://amarantaapi.somee.com/api/Usuarios/VerificarCodigoRecuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "✅ Código verificado",
          text: "Código correcto. Ahora crea una nueva contraseña.",
          confirmButtonColor: "#b45309",
        });
        navigate("/nueva-clave", { state: { correo, codigo } });
      } else {
        Swal.fire({
          icon: "error",
          title: "Código incorrecto",
          text: "El código es inválido o ha expirado.",
          confirmButtonColor: "#b45309",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#b45309",
      });
    }
  };

  const handleResend = async () => {
    try {
      // 🔥 CAMBIO: Usar SolicitarRecuperacion para reenviar
      const response = await fetch("http://amarantaapi.somee.com/api/Usuarios/SolicitarRecuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "info",
          title: "Código reenviado",
          text: "📩 Se envió un nuevo código al correo.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo reenviar el código.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Problema al contactar el servidor.",
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
          <p className="verification-subtitle">Verificar código</p>

          <p className="verification-info">
            Se envió un código a: <b>{correo}</b>
          </p>

          <form onSubmit={handleVerify} className="verification-form">
            <label>Código de verificación</label>
            <input
              type="text"
              placeholder="Ingresa el código recibido"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <button type="submit" className="verify-button">
              Verificar código
            </button>
          </form>

          <button type="button" className="resend-button" onClick={handleResend}>
            Reenviar código
          </button>
        </div>
      </section>
    </div>
  );
}