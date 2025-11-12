import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, rolPermitido }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Si no hay sesión activa, redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si se define un rol permitido y no coincide, redirige al inicio
  if (rolPermitido && usuario.rol !== rolPermitido) {
    return <Navigate to="/" replace />;
  }

  // Si pasa las validaciones, renderiza el contenido
  return children;
};

export default ProtectedRoute;
