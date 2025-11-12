// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import "./PerfilAdmin.css";

// export default function PerfilAdmin() {
//   const navigate = useNavigate();
//   const [usuario, setUsuario] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

//     if (!usuarioLocal) {
//       Swal.fire({
//         icon: "warning",
//         title: "⚠️ No hay sesión activa.",
//         text: "Por favor, inicia sesión para acceder a tu perfil.",
//         confirmButtonColor: "#b45309",
//         background: "#fff8e7",
//       }).then(() => (window.location.href = "/login"));
//       return;
//     }

//     // 🔹 Petición al backend con el correo del usuario
//     fetch(
//       `http://localhost:5201/api/Usuarios/ObtenerPorCorreo?correo=${usuarioLocal.correo}`
//     )
//       .then((res) => {
//         if (!res.ok) throw new Error("Error al obtener datos");
//         return res.json();
//       })
//       .then((data) => {
//         setUsuario(data);
//         setLoading(false);
//       })
//       .catch(() => {
//         Swal.fire({
//           icon: "error",
//           title: "Error al cargar el perfil",
//           text: "No se pudo conectar al servidor.",
//           confirmButtonColor: "#b45309",
//         });
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p className="loading-text">Cargando perfil...</p>
//       </div>
//     );
//   }

//   if (!usuario) return null;

//   return (
//     <div className="perfilAd-container">
//       <div className="header-decor"></div>

//       <div className="perfil-card">
//         <div className="foto-container">
//           <div className="foto-wrapper">
//             {usuario.imagenPerfil ? (
//               <img
//                 src={usuario.imagenPerfil}
//                 alt="Perfil"
//                 className="foto-usuario"
//               />
//             ) : (
//               <div className="foto-placeholder">
//                 {usuario.nombre?.[0]?.toUpperCase() || "?"}
//               </div>
//             )}
//           </div>
//         </div>

//         <h1 className="nombre-completo">
//           {usuario.nombre} {usuario.apellido}
//         </h1>
//         <p className="correo-subtitle">{usuario.correo}</p>

//         <div className="divider">
//           <div className="divider-line"></div>
//           <div className="divider-diamond">◆</div>
//           <div className="divider-line"></div>
//         </div>
        
//         <div className="divid2">
            
//           <div className="info-card">
//             <div className="info-icon">🪪</div>
//             <div className="info-content">
//               <span className="info-label">Documento</span>
//               <span className="info-value">{usuario.documento}</span>
//             </div>
//           </div>

//           <div className="info-card">
//             <div className="info-icon">📞</div>
//             <div className="info-content">
//               <span className="info-label">Teléfono</span>
//               <span className="info-value">{usuario.telefono}</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="divid2">
//           <div className="info-card">
//               <div className="info-icon">📍</div>
//               <div className="info-content">
//                 <span className="info-label">Ubicación</span>
//                 <span className="info-value">
//                   {usuario.municipio}, {usuario.departamento}
//                 </span>
//               </div>
//           </div>

//           <div className="info-card">
//               <div className="info-icon">📫</div>
//               <div className="info-content">
//                 <span className="info-label">Dirección</span>
//                 <span className="info-value">{usuario.direccion}</span>
//               </div>
//           </div>
//         </div>

          

//         <div className="actions-container">
//           <button
//             className="btn-editar"
//             onClick={() => navigate("/admin/editar-perfil-Ad", { state: { usuario } })}
//           >
//             <span className="btn-icon">✏️</span> Editar Perfil
//           </button>
//           <button
//             className="btn-cerrar"
//             onClick={() => {
//               localStorage.removeItem("usuario");
//               window.location.href = "/";
//             }}
//           >
//             <span className="btn-icon">🚪</span> Cerrar Sesión
//           </button>
//         </div>
//       </div>

//       <div className="footer-decor"></div>
//     </div>
//   );
// }
