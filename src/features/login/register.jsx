import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./reg.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    departamento: "",
    municipio: "",
    clave: ""
  });

  const [confirmarClave, setConfirmarClave] = useState("");
  const [errorClave, setErrorClave] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirmarClave = (e) => {
    setConfirmarClave(e.target.value);
    if (form.clave !== e.target.value) {
      setErrorClave("⚠️ Las contraseñas no coinciden");
    } else {
      setErrorClave("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.clave !== confirmarClave) {
      setErrorClave("⚠️ Las contraseñas no coinciden");
      return;
    }

    const formData = new FormData();
    formData.append("TipoDocumento", form.tipoDocumento);
    formData.append("Documento", form.documento);
    formData.append("Nombre", form.nombre);
    formData.append("Apellido", form.apellido);
    formData.append("Correo", form.correo);
    formData.append("Telefono", form.telefono);
    formData.append("Clave", form.clave);
    formData.append("Departamento", form.departamento);
    formData.append("Municipio", form.municipio);
    formData.append("Direccion", form.direccion);

    try {
      const response = await fetch("http://localhost:5201/api/Usuarios", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("✅ Usuario registrado: " + data.mensaje);

        // 📌 Redirigir a la pantalla de verificación y pasar el correo
        navigate("/verification", { state: { correo: form.correo } });
      } else {
        const error = await response.text();
        alert("❌ Error: " + error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión con la API");
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Tipo de documento
          <select
            name="tipoDocumento"
            value={form.tipoDocumento}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PA">Pasaporte</option>
          </select>
        </label>

        <label>
          Documento
          <input
            type="text"
            name="documento"
            value={form.documento}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Nombre
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Apellido
          <input
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Teléfono
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Dirección
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Departamento
          <input
            type="text"
            name="departamento"
            value={form.departamento}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Municipio
          <input
            type="text"
            name="municipio"
            value={form.municipio}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            name="clave"
            value={form.clave}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Confirmar contraseña
          <input
            type="password"
            name="confirmarClave"
            value={confirmarClave}
            onChange={handleConfirmarClave}
            required
          />
        </label>
        {errorClave && <p className="error">{errorClave}</p>}

        <button type="submit" disabled={!!errorClave}>
          Registrarse
        </button>
        <p>¿Ya tienes una cuenta? <span onClick={() => navigate("/")} className="link">Inicia sesión</span></p>
      </form>
    </div>
  );
}
