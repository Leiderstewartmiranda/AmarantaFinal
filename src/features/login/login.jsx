import React, { useState } from "react";
import AmaraLogo from "../../assets/AmaraLogo.png";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
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

      Swal.fire({
        icon: 'info',
        title: 'Código enviado',
        text: 'Se ha enviado un código de verificación a tu correo.',
        confirmButtonColor: '#a78bfa', // color del botón
        background: '#1f1f1f',        // fondo oscuro
        color: '#fff'                 // texto blanco
      });
      navigate("/verification", { state: { correo } });
    } catch (err) {
      console.error(err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#a78bfa',
        background: '#fff',
        color: '#1f1f1f'
      });
    }
  };

  return (
    <div className="login-container">
      <h1>Amaranta</h1>
      <img src={AmaraLogo} alt="logo" />
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
