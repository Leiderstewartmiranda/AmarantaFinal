import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./verifi.css"

export default function Verification() {
  const [codigo, setCodigo] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const correo = location.state?.correo;

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5201/api/Usuarios/VerificarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      if (response.ok) {
        alert("✅ Usuario verificado con éxito");
        navigate("/admin/productos");
      } else {
        alert("❌ Código inválido o expirado");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error en la conexión con el servidor");
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch("http://localhost:5201/api/Usuarios/EnviarCodigoRegistro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      if (response.ok) {
        alert("📩 Código reenviado al correo");
      } else {
        alert("❌ Error al reenviar código");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error en la conexión con el servidor");
    }
  };

  return (
    <div className="verification-container">
      <h2>Verificación</h2>
      <p>Se envió un código a: <b>{correo}</b></p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Ingrese el código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <button type="submit">Verificar</button>
      </form>

      <button type="button" onClick={handleResend}>
        Reenviar código
      </button>
    </div>
  );
}
