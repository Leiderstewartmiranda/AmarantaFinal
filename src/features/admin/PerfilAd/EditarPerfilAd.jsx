import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UbicacionService } from "../../../services/ubicacionService";

import Swal from "sweetalert2";
import "./EditarPerfilAd.css";

export default function EditarPerfilAdmin() {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);  
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Datos enviados desde Perfil (si existen)
  const usuarioInicial = location.state?.usuario || {};

  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    departamento: "",
    municipio: "",
    imagenPerfil: "",
    ...usuarioInicial, // usa los datos enviados
  });

  const [editando, setEditando] = useState(true); // editable al entrar desde Perfil
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  const correo = usuario.correo || JSON.parse(localStorage.getItem("usuario"))?.correo;

  useEffect(() => {
    const cargarDepartamentos = async () => {
        const deps = await UbicacionService.obtenerDepartamentos();
        setDepartamentos(deps);
    };
    cargarDepartamentos();
  }, []);

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

  // 🔹 Fetch opcional si no hay datos
  useEffect(() => {
    if (!usuarioInicial.correo && correo) {
      const fetchUsuario = async () => {
        try {
          const response = await fetch(
            `http://localhost:5201/api/Usuarios/ObtenerPorCorreo?correo=${correo}`
          );
          if (!response.ok) throw new Error("No se pudo obtener el usuario");
          const data = await response.json();
          setUsuario(data);
        } catch {
          Swal.fire("Error", "No se pudo cargar la información del perfil", "error");
        }
      };
      fetchUsuario();
    }
  }, [usuarioInicial, correo]);

  // 🔹 Manejar cambio de campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Manejar cambio de imagen
  const handleImagen = (e) => {
    const file = e.target.files[0];
    setNuevaImagen(file);
    setVistaPrevia(URL.createObjectURL(file));
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: "1.5px solid #d6d3d1",
      borderRadius: "6px",
      padding: "0.125rem",
      backgroundColor: "#fff",
      minHeight: "48px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#b45309"
      },
      borderColor: state.isFocused ? "#b45309" : "#d6d3d1",
      boxShadow: state.isFocused ? "0 0 5px rgba(180, 83, 9, 0.4)" : "none",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? "#b45309"
        : state.isFocused 
        ? "#fef3c7"
        : "white",
      color: state.isSelected ? "white" : "#1c1917",
      fontSize: "0.95rem",
      padding: "10px 12px",
      "&:hover": {
        backgroundColor: "#fef3c7",
        color: "#1c1917"
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "6px",
      boxShadow: "0 4px 20px rgba(180, 83, 9, 0.3)",
      border: "1px solid #d6d3d1",
      marginTop: "4px",
      zIndex: 9999,
    }),
    placeholder: (base) => ({
      ...base,
      color: "#a8a29e",
      fontSize: "0.95rem",
      fontStyle: "italic",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "#6b7280",
      padding: "4px 8px",
      transition: "all 0.25s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
      "&:hover": {
        color: "#b45309",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px 8px",
      "&:hover": {
        color: "#e63946",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1c1917",
      fontSize: "0.95rem",
      fontWeight: "400",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 12px",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#d6d3d1",
    }),
    input: (base) => ({
      ...base,
      color: "#1c1917",
      fontSize: "0.95rem",
      margin: "0",
      padding: "0",
    }),
  };

  // 🔹 Guardar cambios
  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!correo) return;

    const formData = new FormData();
    Object.entries(usuario).forEach(([key, value]) => formData.append(key, value || ""));
    if (nuevaImagen) formData.append("nuevaImagen", nuevaImagen);

    try {
      const response = await fetch(
        `http://localhost:5201/api/Usuarios/ActualizarPorCorreo/${correo}`,
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
      navigate("/admin/perfil");

      setEditando(false);
      setVistaPrevia(null);
      setNuevaImagen(null);
    } catch {
      Swal.fire("Error", "No se pudo actualizar el perfil", "error");
    }
  };

  if (!correo) {
    Swal.fire({
      icon: "warning",
      title: "⚠️ No hay sesión activa.",
      text: "Por favor, inicia sesión para acceder a tu perfil.",
      confirmButtonColor: "#b45309",
    });
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="perfilAd-container">
      <div className="perfil-card">
        <h2>Editar Perfil</h2>

        <form className="perfil-form" onSubmit={handleGuardar}>
          {/* Imagen */}
          <div className="perfil-imagen">
            <img
              src={vistaPrevia || usuario.imagenPerfil || "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"}
              alt="Foto de perfil"
            />
            {editando && <input type="file" accept="image/*" onChange={handleImagen} />}
          </div>

          {/* Campos editables */}
          {[
            ["nombre", "Nombre"],
            ["apellido", "Apellido"],
            ["telefono", "Teléfono"],
            // ["departamento", "Departamento"],
            // ["municipio", "Municipio"],
            ["direccion", "Dirección"],
          ].map(([campo, label]) => (
            <div className="form-group" key={campo}>
              <label>{label}:</label>
              <input
                name={campo}
                value={usuario[campo] || ""}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            
          ))}
          {/* Departamento */}
          <div className="form-group">
            <label>Departamento:</label>
            <select
              name="departamento"
              value={usuario.departamento || ""}
              onChange={handleChange}
              disabled={!editando}
            >
              <option value="">Selecciona un departamento</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep} styles={customStyles}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* Municipio */}
          <div className="form-group">
            <label>Municipio:</label>
            <select
              name="municipio"
              value={usuario.municipio || ""}
              onChange={handleChange}
              disabled={!editando || !usuario.departamento}
            >
              <option value="">Selecciona un municipio</option>
              {municipios.map((mun) => (
                <option key={mun} value={mun} styles={customStyles}>
                  {mun}
                </option>
              ))}
            </select>
          </div>

          {/* Correo (solo lectura) */}
          <div className="form-group">
            <label>Correo:</label>
            <input value={correo} disabled />
          </div>

          {/* Botones */}
          <div className="perfil-botones">
            {!editando ? (
              <button type="button" className="editar-btn" onClick={() => setEditando(true)}>
                Editar
              </button>
            ) : (
              <>
                <button type="submit" className="guardar-btn">
                  Guardar
                </button>
                <button
                  type="button"
                  className="cancelar-btn"
                  onClick={() => {
                    setEditando(false);
                    setVistaPrevia(null);
                    setNuevaImagen(null);
                    if (usuarioInicial.correo) setUsuario(usuarioInicial); // Revertir cambios
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
