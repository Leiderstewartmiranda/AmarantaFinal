import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
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
        Swal.fire({
          icon: 'success',
          title: 'Verificación exitosa',
          text: "Usuario verificado con éxito",
          confirmButtonColor: '#a78bfa',
          background: '#fff',
          color: '#1f1f1f'
        });
        navigate("/admin/productos");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "Código inválido o expirado",
          confirmButtonColor: '#a78bfa',
          background: '#fff',
          color: '#1f1f1f'
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error en la conexión con el servidor",
        confirmButtonColor: '#a78bfa',
        background: '#fff',
        color: '#1f1f1f'
      });
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
        Swal.fire({
          icon: 'info',
          title: 'Código reenviado',
          text: "📩 Código reenviado al correo",
          confirmButtonColor: '#a78bfa',
          background: '#fff',
          color: '#1f1f1f'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "Error al reenviar código",
          confirmButtonColor: '#a78bfa',
          background: '#fff',
          color: '#1f1f1f'
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error en la conexión con el servidor",
        confirmButtonColor: '#a78bfa',
        background: '#fff',
        color: '#1f1f1f'
      });
    }
  };

  return (
    <div className="verification-container">
      <h2>Verificación</h2>
      <p>Se envió un código a: <b>{correo}</b></p>

      <form className="verification-form" onSubmit={handleVerify}>
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
