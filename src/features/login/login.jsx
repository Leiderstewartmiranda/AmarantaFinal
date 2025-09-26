import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./log.css";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5201/api/Usuarios/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, clave }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.mensaje || "❌ Error al iniciar sesión");
      }

      // ✅ Siempre redirigir a verification después de login
      alert("📩 Se ha enviado un código de verificación a tu correo.");
      navigate("/verification", { state: { correo } });
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Correo
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit">Ingresar</button>

        <button type="button" className="secondary-btn" onClick={() => navigate("/register")}>
            Registrarse
        </button>

      </form>

    </div>
  );
}
