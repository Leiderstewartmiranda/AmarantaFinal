import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./log.css";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState("");
  const [loading, setLoading] = useState(false);

  const validarCampos = () => {
    const nuevosErrores = {};

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      nuevosErrores.correo = "Ingrese un correo válido.";
    }

    if (!clave.trim()) {
      nuevosErrores.clave = "La contraseña es obligatoria.";
    } else if (clave.length < 6) {
      nuevosErrores.clave = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGlobal("");
    setErrores({});

    if (!validarCampos()) return;

    setLoading(true);

    try {
      console.log("🔄 Iniciando proceso de login...");

      const response = await fetch("https://amarantaapi.somee.com/api/Usuarios/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ correo, clave }),
      });

      console.log("📨 Respuesta recibida, status:", response.status);

      // Verificar el tipo de contenido
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("✅ Respuesta JSON:", data);
      } else {
        const textResponse = await response.text();
        console.error("❌ Respuesta no JSON:", textResponse.substring(0, 500));

        // Si es un timeout de SQL Server
        if (textResponse.includes("SqlException") && textResponse.includes("Timeout")) {
          throw new Error("El servidor está experimentando problemas de conexión. Por favor, intenta nuevamente en unos momentos.");
        } else if (textResponse.includes("Exception")) {
          throw new Error("Error interno del servidor. Contacta al administrador.");
        } else {
          throw new Error("Respuesta inesperada del servidor");
        }
      }

      if (!response.ok) {
        // Manejar errores HTTP
        const errorMessage = data?.mensaje || data?.message || `Error ${response.status}`;
        throw new Error(errorMessage);
      }

      // 🔥 ÉXITO: Login correcto
      if (data.exito && data.usuario) {
        const usuarioData = {
          id: data.usuario.idUsuario,
          idCliente: data.usuario.idCliente,
          nombre: data.usuario.nombre,
          apellido: data.usuario.apellido,
          correo: data.usuario.correo,
          rol: data.usuario.rol,
          verificado: false // Inicialmente no verificado hasta ingresar código
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioData));
        console.log("✅ Usuario guardado en localStorage:", usuarioData);

        // Mostrar confirmación
        await Swal.fire({
          icon: "success",
          title: "¡Código enviado!",
          text: `Hola ${data.usuario.nombre}, se envió un código de verificación a tu correo.`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });

        // Redirigir a verificación
        navigate("/verification", {
          state: {
            correo,
            rol: data.usuario.rol,
            usuario: data.usuario
          }
        });
      } else {
        throw new Error(data.mensaje || "Error en el proceso de login");
      }

    } catch (err) {
      console.error("💥 Error completo en login:", err);

      let errorMessage = err.message;

      // Manejo específico de errores
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        errorMessage = "❌ No se puede conectar al servidor. Verifica tu conexión a internet.";
      } else if (err.message.includes("Timeout") || err.message.includes("conexión")) {
        errorMessage = "⏰ El servidor está tardando demasiado en responder. Por favor, intenta nuevamente.";
      } else if (err.message.includes("500") || err.message.includes("Internal Server")) {
        errorMessage = "🔧 Error del servidor. El administrador ha sido notificado.";
      }

      setErrorGlobal(errorMessage);

      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: errorMessage,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: "" }));
    }
    if (errorGlobal) {
      setErrorGlobal("");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page">
        <section className="login-section" aria-labelledby="login-title">
          <div className="login-container">
            <h1 id="login-title" className="login-title">
              AMARANTA
            </h1>
            <p className="login-subtitle">Inicia sesión en tu cuenta</p>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label labellogin">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-input ${errores.correo ? 'input-error' : ''}`}
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    clearError('correo');
                  }}
                  onBlur={validarCampos}
                  placeholder="tu@correo.com"
                  disabled={loading}
                />
                {errores.correo && <p className="error">{errores.correo}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label labellogin">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-input ${errores.clave ? 'input-error' : ''}`}
                  value={clave}
                  onChange={(e) => {
                    setClave(e.target.value);
                    clearError('clave');
                  }}
                  onBlur={validarCampos}
                  placeholder="••••••"
                  disabled={loading}
                />
                {errores.clave && <p className="error">{errores.clave}</p>}
              </div>

              <div className="form-options">
                <a
                  href="#"
                  className="forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/recuperar-clave");
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {errorGlobal && (
                <div className="error-global">
                  <p>⚠️ {errorGlobal}</p>
                </div>
              )}

              <button
                type="submit"
                className={`login-button ${loading ? 'button-loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    CONECTANDO...
                  </>
                ) : (
                  "INICIAR SESIÓN"
                )}
              </button>

              <div className="register-link">
                ¿No tienes una cuenta?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                >
                  Regístrate aquí
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}