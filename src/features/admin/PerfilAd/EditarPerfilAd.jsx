// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { UbicacionService } from "../../../services/ubicacionService";
// import Swal from "sweetalert2";
// import { Camera } from "lucide-react";
// import "./EditarPerfilAd.css";

// export default function EditarPerfilAdmin() {
//   const [departamentos, setDepartamentos] = useState([]);
//   const [municipios, setMunicipios] = useState([]);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const usuarioInicial = location.state?.usuario || {};
//   const [usuario, setUsuario] = useState({
//     nombre: "",
//     apellido: "",
//     telefono: "",
//     direccion: "",
//     departamento: "",
//     municipio: "",
//     imagenPerfil: "",
//     ...usuarioInicial,
//   });

//   const [nuevaImagen, setNuevaImagen] = useState(null);
//   const [vistaPrevia, setVistaPrevia] = useState(null);

//   const correo = usuario.correo || JSON.parse(localStorage.getItem("usuario"))?.correo;

//   useEffect(() => {
//     const cargarDepartamentos = async () => {
//       const deps = await UbicacionService.obtenerDepartamentos();
//       setDepartamentos(deps);
//     };
//     cargarDepartamentos();
//   }, []);

//   useEffect(() => {
//     const cargarMunicipios = async () => {
//       if (usuario.departamento) {
//         const mun = await UbicacionService.obtenerMunicipios(usuario.departamento);
//         setMunicipios(mun);
//       } else {
//         setMunicipios([]);
//       }
//     };
//     cargarMunicipios();
//   }, [usuario.departamento]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUsuario((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImagen = (e) => {
//     const file = e.target.files[0];
//     setNuevaImagen(file);
//     setVistaPrevia(URL.createObjectURL(file));
//   };

//   const handleGuardar = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     Object.entries(usuario).forEach(([key, value]) => formData.append(key, value || ""));
//     if (nuevaImagen) formData.append("nuevaImagen", nuevaImagen);

//     try {
//       const response = await fetch(
//         `http://localhost:5201/api/Usuarios/ActualizarPorCorreo/${correo}`,
//         {
//           method: "PUT",
//           body: formData,
//         }
//       );

//       if (!response.ok) throw new Error("Error al actualizar perfil");

//       Swal.fire({
//         icon: "success",
//         title: "Perfil actualizado",
//         text: "Tu información se ha guardado correctamente.",
//         confirmButtonColor: "#b45309",
//       });
//       navigate("/admin/perfil");
//     } catch {
//       Swal.fire("Error", "No se pudo actualizar el perfil", "error");
//     }
//   };

//   return (
//     <div className="perfilAd-container">
//       <div className="perfil-card edit-card">
//         <h2>Editar Perfil</h2>
//         <form className="perfil-form" onSubmit={handleGuardar}>
//           {/* Imagen */}
//           <div className="perfil-imagen">
//             <div className="imagen-wrapper">
//               <img
//                 src={
//                   vistaPrevia ||
//                   usuario.imagenPerfil ||
//                   "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"
//                 }
//                 alt="Foto de perfil"
//               />
//               <label htmlFor="file-upload" className="btn-cambiar-imagen" title="Cambiar imagen">
//                 <Camera size={20} />
//               </label>
//               <input
//                 id="file-upload"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImagen}
//                 style={{ display: "none" }}
//               />
//             </div>
//           </div>

//           <div className="form-grid">
//             {[
//               ["nombre", "Nombre"],
//               ["apellido", "Apellido"],
//               ["telefono", "Teléfono"],
//               ["direccion", "Dirección"],
//             ].map(([campo, label]) => (
//               <div className="form-group" key={campo}>
//                 <label className="label-per">{label}</label>
//                 <input
//                   name={campo}
//                   value={usuario[campo] || ""}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             ))}

//             <div className="form-group">
//               <label className="label-per">Departamento</label>
//               <select
//                 name="departamento"
//                 value={usuario.departamento || ""}
//                 onChange={handleChange}
//               >
//                 <option value="">Selecciona un departamento</option>
//                 {departamentos.map((dep) => (
//                   <option key={dep} value={dep}>
//                     {dep}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label className="label-per">Municipio</label>
//               <select
//                 name="municipio"
//                 value={usuario.municipio || ""}
//                 onChange={handleChange}
//                 disabled={!usuario.departamento}
//               >
//                 <option value="">Selecciona un municipio</option>
//                 {municipios.map((mun) => (
//                   <option key={mun} value={mun}>
//                     {mun}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="perfil-botones">
//             <button type="submit" className="guar-btn">
//               Guardar
//             </button>
//             <button
//               type="button"
//               className="canc-btn"
//               onClick={() => navigate("/admin/perfil")}
//             >
//               Cancelar
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
