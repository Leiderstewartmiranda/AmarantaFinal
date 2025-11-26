import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UbicacionService } from "../../services/ubicacionService";
import Swal from "sweetalert2";
import { Camera } from "lucide-react";
import "./EditarPerfil.css"; // 👈 usamos el mismo estilo

export default function EditarPerfil() {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioInicial = location.state?.usuario || {};
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    departamento: "",
    municipio: "",
    imagenPerfil: "",
    ...usuarioInicial,
  });

  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  const correo = usuario.correo || JSON.parse(localStorage.getItem("usuario"))?.correo;

  // Cargar departamentos
  useEffect(() => {
    const cargarDepartamentos = async () => {
      const deps = await UbicacionService.obtenerDepartamentos();
      setDepartamentos(deps);
    };
    cargarDepartamentos();
  }, []);

  // Cargar municipios al cambiar departamento
  useEffect(() => {
    const cargarMunicipios = async () => {
      if (usuario.departamento) {
        const mun = await UbicacionService.obtenerMunicipios(usuario.departamento);
        setMunicipios(mun);
      } else {
        setMunicipios([]);
      }
    };
    cargarMunicipios();
  }, [usuario.departamento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    setNuevaImagen(file);
    setVistaPrevia(URL.createObjectURL(file));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(usuario).forEach(([key, value]) => formData.append(key, value || ""));
    if (nuevaImagen) formData.append("nuevaImagen", nuevaImagen);

    try {
      const response = await fetch(
        `https://amarantaapi.somee.com/api/Usuarios/ActualizarPorCorreo/${correo}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al actualizar perfil");

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Tu información se ha guardado correctamente.",
        confirmButtonColor: "#b45309",
      });
      navigate("/perfil");
    } catch {
      Swal.fire("Error", "No se pudo actualizar el perfil", "error");
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h2>Editar Información</h2>
        <form className="perfil-form" onSubmit={handleGuardar}>
          {/* Imagen con botón flotante */}
          <div className="perfil-imagen">
            <div style={{ position: "relative" }}>
              <img
                src={
                  vistaPrevia ||
                  usuario.imagenPerfil ||
                  "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"
                }
                alt="Foto de perfil"
              />
              <label
                htmlFor="file-upload"
                title="Cambiar imagen"
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                  background: "#b45309",
                  color: "white",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  transition: "0.2s",
                }}
              >
                <Camera size={18} />
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImagen}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Campos compactos */}
          <div className="form-group">
            <label className="label-per">Nombre</label>
            <input name="nombre" value={usuario.nombre || ""} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="label-per">Apellido</label>
            <input name="apellido" value={usuario.apellido || ""} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="label-per">Teléfono</label>
            <input name="telefono" value={usuario.telefono || ""} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label-per">Dirección</label>
            <input name="direccion" value={usuario.direccion || ""} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="label-per">Departamento</label>
            <select name="departamento" value={usuario.departamento || ""} onChange={handleChange}>
              <option value="">Selecciona un departamento</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label-per">Municipio</label>
            <select
              name="municipio"
              value={usuario.municipio || ""}
              onChange={handleChange}
              disabled={!usuario.departamento}
            >
              <option value="">Selecciona un municipio</option>
              {municipios.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>
          </div>

          <div className="perfil-botones">
            <button type="submit" className="guar-btn">Guardar</button>
            <button type="button" className="canc-btn" onClick={() => navigate("/perfil")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
