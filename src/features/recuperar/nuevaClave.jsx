import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./recuperar.css";

export default function NuevaClave() {
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const correo = location.state?.correo;
  const codigo = location.state?.codigo;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaClave !== confirmarClave) {
      Swal.fire({
        icon: "warning",
        title: "Las contraseñas no coinciden",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    try {
        console.log("Datos que envío:", { correo, codigo, nuevaClave });
      const response = await fetch("http://localhost:5201/api/Usuarios/RestablecerClave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo, nuevaClave }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Contraseña actualizada",
          text: "Ya puedes iniciar sesión con tu nueva contraseña.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: "El código puede haber expirado.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo contactar al servidor.",
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
          <p className="verification-subtitle">Restablecer contraseña</p>

          <form onSubmit={handleSubmit} className="verification-form">
            <label>Nueva contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
              required
            />

            <label>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="Confirma tu nueva contraseña"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              required
            />

            <button type="submit" className="verify-button">
              Guardar nueva contraseña
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
