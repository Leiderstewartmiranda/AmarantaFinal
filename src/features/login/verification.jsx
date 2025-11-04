import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./verifi.css";

export default function Verification() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const correo = location.state?.correo;
  const rol = location.state?.rol;
  const usuario = location.state?.usuario;

  // Si no hay correo, redirigir al login
  React.useEffect(() => {
    if (!correo) {
      Swal.fire({
        icon: "warning",
        title: "Acceso denegado",
        text: "Debes iniciar sesión primero",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      navigate("/login");
    }
  }, [correo, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5201/api/Usuarios/VerificarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      const data = await response.json();

      if (data.exito && data.usuario) {
        // 🔥 GUARDAR LOS DATOS COMPLETOS DEL USUARIO EN LOCALSTORAGE
        const usuarioData = {
          id: data.usuario.idUsuario,
          idCliente: data.usuario.idCliente, // ← Mismo campo crítico que en el login
          nombre: data.usuario.nombre,
          apellido: data.usuario.apellido,
          correo: data.usuario.correo,
          rol: data.usuario.rol,
          verificado: true // ← Agregar flag de verificación
        };
        
        localStorage.setItem("usuario", JSON.stringify(usuarioData));
        console.log("✅ Usuario verificado y guardado en localStorage:", usuarioData);

        Swal.fire({
          icon: "success",
          title: "✅ Verificación exitosa",
          text: "Usuario verificado con éxito",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });

        // Redirección según rol (consistente con el login)
        if (data.usuario.rol === "Admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Código inválido",
          text: data.mensaje || "El código es incorrecto o ha expirado.",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    } catch (error) {
      console.error("Error en verificación:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar al servidor.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } finally {
      setLoading(false);
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

  // Si no hay correo, mostrar mensaje de carga
  if (!correo) {
    return (
      <div className="verification-page">
        <div className="verification-box">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <section className="verification-section">
        <div className="verification-box">
          <h1 className="verification-title">AMARANTA</h1>
          <p className="verification-subtitle">Verifica tu cuenta</p>

          <p className="verification-info">
            Se envió un código a: <b>{correo}</b>
          </p>

          <form onSubmit={handleVerify} className="verification-form">
            <label className="labelverify">Código de verificación</label>
            <input
              type="text"
              placeholder="Ingresa el código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              disabled={loading}
            />
            <button 
              type="submit" 
              className="verify-button"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>

          <button 
            type="button" 
            className="resend-button" 
            onClick={handleResend}
            disabled={loading}
          >
            Reenviar código
          </button>
        </div>
      </section>
    </div>  
  );
}