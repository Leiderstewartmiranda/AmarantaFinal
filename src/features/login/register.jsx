import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import { UbicacionService } from "../../services/ubicacionService";
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
    clave: "",
  });

  const [confirmarClave, setConfirmarClave] = useState("");
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // 🗺️ Estados para departamentos y municipios
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSelect, setDepartamentoSelect] = useState(null);
  const [municipioSelect, setMunicipioSelect] = useState(null);
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(true);

  // 🟣 Cargar departamentos al iniciar
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        const deptos = await UbicacionService.obtenerDepartamentos();
        const opciones = deptos.map(depto => ({
          value: depto,
          label: depto
        }));
        setDepartamentos(opciones);
      } catch (error) {
        console.error("Error cargando departamentos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los departamentos",
          confirmButtonColor: "#a78bfa",
        });
      } finally {
        setCargandoDepartamentos(false);
      }
    };

    cargarDepartamentos();
  }, []);

  // 🟣 Cargar municipios cuando se selecciona un departamento
  useEffect(() => {
    const cargarMunicipios = async () => {
      if (!departamentoSelect) {
        setMunicipios([]);
        setMunicipioSelect(null);
        setForm(prev => ({ ...prev, municipio: "" }));
        return;
      }

      try {
        const munis = await UbicacionService.obtenerMunicipios(departamentoSelect.value);
        const opciones = munis.map(muni => ({
          value: muni,
          label: muni
        }));
        setMunicipios(opciones);
        
        // Limpiar municipio seleccionado
        setMunicipioSelect(null);
        setForm(prev => ({ ...prev, municipio: "" }));
      } catch (error) {
        console.error("Error cargando municipios:", error);
        setMunicipios([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los municipios",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
    };

    cargarMunicipios();
  }, [departamentoSelect]);

  // 🟣 Manejo de cambios para los campos normales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: "" }));
    }
  };

  // 🟣 Manejo de cambios para departamento (react-select)
  const handleDepartamentoChange = (selectedOption) => {
    setDepartamentoSelect(selectedOption);
    setForm(prev => ({ 
      ...prev, 
      departamento: selectedOption ? selectedOption.value : "" 
    }));
    setErrores(prev => ({ ...prev, departamento: "" }));
  };

  // 🟣 Manejo de cambios para municipio (react-select)
  const handleMunicipioChange = (selectedOption) => {
    setMunicipioSelect(selectedOption);
    setForm(prev => ({ 
      ...prev, 
      municipio: selectedOption ? selectedOption.value : "" 
    }));
    setErrores(prev => ({ ...prev, municipio: "" }));
  };

  const handleConfirmarClave = (e) => {
    const value = e.target.value;
    setConfirmarClave(value);
    
    // Validar en tiempo real si las contraseñas coinciden
    if (value && form.clave && value !== form.clave) {
      setErrores(prev => ({
        ...prev,
        confirmarClave: "⚠️ Las contraseñas no coinciden",
      }));
    } else {
      setErrores(prev => ({ ...prev, confirmarClave: "" }));
    }
  };

  // 🔎 Validación de campos
  const validarCampos = () => {
    const nuevosErrores = {};

    // Validar campos obligatorios
    if (!form.tipoDocumento.trim()) nuevosErrores.tipoDocumento = "⚠️ Este campo es obligatorio";
    if (!form.documento.trim()) nuevosErrores.documento = "⚠️ Este campo es obligatorio";
    if (!form.nombre.trim()) nuevosErrores.nombre = "⚠️ Este campo es obligatorio";
    if (!form.apellido.trim()) nuevosErrores.apellido = "⚠️ Este campo es obligatorio";
    if (!form.correo.trim()) nuevosErrores.correo = "⚠️ Este campo es obligatorio";
    if (!form.telefono.trim()) nuevosErrores.telefono = "⚠️ Este campo es obligatorio";
    if (!form.direccion.trim()) nuevosErrores.direccion = "⚠️ Este campo es obligatorio";
    if (!form.departamento.trim()) nuevosErrores.departamento = "⚠️ Este campo es obligatorio";
    if (!form.municipio.trim()) nuevosErrores.municipio = "⚠️ Este campo es obligatorio";
    if (!form.clave.trim()) nuevosErrores.clave = "⚠️ Este campo es obligatorio";
    if (!confirmarClave.trim()) nuevosErrores.confirmarClave = "⚠️ Este campo es obligatorio";

    // Validar formato de correo
    if (form.correo && !/\S+@\S+\.\S+/.test(form.correo)) {
      nuevosErrores.correo = "⚠️ Ingresa un correo válido";
    }

    // Validar contraseña
    if (form.clave && form.clave.length < 6) {
      nuevosErrores.clave = "⚠️ La contraseña debe tener al menos 6 caracteres";
    }

    // Validar que las contraseñas coincidan
    if (form.clave && confirmarClave && form.clave !== confirmarClave) {
      nuevosErrores.confirmarClave = "⚠️ Las contraseñas no coinciden";
    }

    // Validar teléfono (solo números, mínimo 10 caracteres)
    if (form.telefono && !/^\d+$/.test(form.telefono)) {
      nuevosErrores.telefono = "⚠️ El teléfono debe contener solo números";
    } else if (form.telefono && form.telefono.length < 10) {
      nuevosErrores.telefono = "⚠️ El teléfono debe tener al menos 10 dígitos";
    }

    // Validar documento (solo números)
    if (form.documento && !/^\d+$/.test(form.documento)) {
      nuevosErrores.documento = "⚠️ El documento debe contener solo números";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // 🔎 Verificar si correo o documento ya existen en la API
  const validarExistenciaEnBackend = async () => {
    try {
      const response = await fetch("http://amarantaapi.somee.com/api/Usuarios");
      if (!response.ok) throw new Error("Error al consultar usuarios");

      const usuarios = await response.json();
      const nuevosErrores = {};

      // Validar correo
      const correoExiste = usuarios.some(
        (u) => u.correo?.toLowerCase() === form.correo.toLowerCase()
      );
      if (correoExiste) {
        nuevosErrores.correo = "⚠️ Este correo ya está en uso";
      }

      // Validar documento
      const documentoExiste = usuarios.some((u) => u.documento === form.documento);
      if (documentoExiste) {
        nuevosErrores.documento = "⚠️ Este documento ya está registrado";
      }

      if (Object.keys(nuevosErrores).length > 0) {
        setErrores(prev => ({ ...prev, ...nuevosErrores }));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validando existencia:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo verificar la disponibilidad de los datos",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return false;
    }
  };

  // 🟢 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos locales primero
    if (!validarCampos()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos requeridos",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    // Validar existencia en backend
    const datosDisponibles = await validarExistenciaEnBackend();
    if (!datosDisponibles) {
      return;
    }

    setLoading(true);

    try {
      // 🧩 Crear el FormData
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

      console.log("📤 Enviando datos de registro:", {
        tipoDocumento: form.tipoDocumento,
        documento: form.documento,
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        telefono: form.telefono,
        departamento: form.departamento,
        municipio: form.municipio,
        direccion: form.direccion
      });

      const response = await fetch("http://amarantaapi.somee.com/api/Usuarios", {
        method: "POST",
        body: formData, // 🚫 sin headers Content-Type para FormData
      });

      const responseText = await response.text();
      console.log("📥 Respuesta del servidor:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parseando JSON:", parseError);
        throw new Error("Respuesta inválida del servidor");
      }

      if (!response.ok) {
        // Manejar errores específicos del backend
        if (data.campo === "correo") {
          throw new Error(`Correo: ${data.mensaje}`);
        } else if (data.campo === "documento") {
          throw new Error(`Documento: ${data.mensaje}`);
        } else {
          throw new Error(data.mensaje || `Error ${response.status}: ${response.statusText}`);
        }
      }

      // ✅ REGISTRO EXITOSO
      if (data.exito) {
        await Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: data.mensaje || "Tu cuenta ha sido creada correctamente",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });

        // 🧭 Redirige al componente de verificación con los datos correctos
        navigate("/verification", {
          state: { 
            correo: form.correo, 
            rol: data.rol || "Usuario",
            usuario: data.usuario || {
              idUsuario: data.idUsuario,
              nombre: form.nombre,
              apellido: form.apellido,
              correo: form.correo,
              rol: data.rol || "Usuario"
            }
          },
        });
      } else {
        throw new Error(data.mensaje || "Error en el registro");
      }

    } catch (error) {
      console.error("❌ Error en registro:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: error.message || "Ocurrió un error al registrarse. Por favor, intenta nuevamente.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Estilos para react-select
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
        borderColor: "#a78bfa"
      },
      borderColor: state.isFocused ? "#a78bfa" : errores.departamento || errores.municipio ? "#ef4444" : "#d6d3d1",
      boxShadow: state.isFocused ? "0 0 5px rgba(167, 139, 250, 0.4)" : "none",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? "#a78bfa"
        : state.isFocused 
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#1c1917",
      fontSize: "0.95rem",
      padding: "10px 12px",
      "&:hover": {
        backgroundColor: "#a78bfa",
        color: "white"
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "6px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      border: "1px solid #d6d3d1",
      marginTop: "4px",
      zIndex: 9999,
    }),
    placeholder: (base) => ({
      ...base,
      color: "#a8a29e",
      fontSize: "0.95rem",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "#6b7280",
      padding: "4px 8px",
      transition: "all 0.25s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
      "&:hover": {
        color: "#a78bfa",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px 8px",
      "&:hover": {
        color: "#ef4444",
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

  return (
    <div className="register-page">
      <section className="register-section">
        <div className="register-container">
          <h1 className="register-title">AMARANTA</h1>
          <p className="register-subtitle">Crea tu cuenta</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* 🧍 Datos personales */}
            <h3 className="form-section-title">Datos personales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="labelregister">Tipo de documento *</label>
                <select
                  name="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={handleChange}
                  className={errores.tipoDocumento ? 'input-error' : ''}
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                </select>
                {errores.tipoDocumento && (
                  <p className="error">{errores.tipoDocumento}</p>
                )}
              </div>

              <div className="form-group">
                <label className="labelregister">Documento *</label>
                <input
                  type="text"
                  name="documento"
                  placeholder="Ej: 1234567890"
                  value={form.documento}
                  onChange={handleChange}
                  className={errores.documento ? 'input-error' : ''}
                />
                {errores.documento && (
                  <p className="error">{errores.documento}</p>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="labelregister">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={errores.nombre ? 'input-error' : ''}
                />
                {errores.nombre && <p className="error">{errores.nombre}</p>}
              </div>

              <div className="form-group">
                <label className="labelregister">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Tu apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  className={errores.apellido ? 'input-error' : ''}
                />
                {errores.apellido && <p className="error">{errores.apellido}</p>}
              </div>
            </div>

            {/* 📞 Contacto */}
            <h3 className="form-section-title">Contacto</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="labelregister">Correo electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  placeholder="Ej: correo@ejemplo.com"
                  value={form.correo}
                  onChange={handleChange}
                  className={errores.correo ? 'input-error' : ''}
                />
                {errores.correo && <p className="error">{errores.correo}</p>}
              </div>

              <div className="form-group">
                <label className="labelregister">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Ej: 3001234567"
                  value={form.telefono}
                  onChange={handleChange}
                  className={errores.telefono ? 'input-error' : ''}
                />
                {errores.telefono && <p className="error">{errores.telefono}</p>}
              </div>
            </div>

            {/* 📍 Ubicación */}
            <h3 className="form-section-title">Ubicación</h3>
            <div className="form-group">
              <label className="labelregister">Dirección *</label>
              <input
                type="text"
                name="direccion"
                placeholder="Dirección completa (calle, carrera, número)"
                value={form.direccion}
                onChange={handleChange}
                className={errores.direccion ? 'input-error' : ''}
              />
              {errores.direccion && <p className="error">{errores.direccion}</p>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="labelregister">Departamento *</label>
                <Select
                  value={departamentoSelect}
                  onChange={handleDepartamentoChange}
                  options={departamentos}
                  placeholder={
                    cargandoDepartamentos 
                      ? "Cargando departamentos..." 
                      : "Buscar departamento..."
                  }
                  noOptionsMessage={() => "No se encontraron departamentos"}
                  styles={customStyles}
                  isSearchable
                  isClearable
                  isDisabled={cargandoDepartamentos}
                />
                {errores.departamento && (
                  <p className="error">{errores.departamento}</p>
                )}
              </div>

              <div className="form-group">
                <label className="labelregister">Municipio *</label>
                <Select
                  value={municipioSelect}
                  onChange={handleMunicipioChange}
                  options={municipios}
                  placeholder={
                    !departamentoSelect 
                      ? "Primero selecciona un departamento" 
                      : municipios.length === 0 
                      ? "Cargando municipios..." 
                      : "Buscar municipio..."
                  }
                  noOptionsMessage={() => "No se encontraron municipios"}
                  styles={customStyles}
                  isSearchable
                  isClearable
                  isDisabled={!departamentoSelect}
                />
                {errores.municipio && <p className="error">{errores.municipio}</p>}
              </div>
            </div>

            {/* 🔒 Seguridad */}
            <h3 className="form-section-title">Seguridad</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="labelregister">Contraseña *</label>
                <input
                  type="password"
                  name="clave"
                  placeholder="Mínimo 6 caracteres"
                  value={form.clave}
                  onChange={handleChange}
                  className={errores.clave ? 'input-error' : ''}
                />
                {errores.clave && <p className="error">{errores.clave}</p>}
              </div>

              <div className="form-group">
                <label className="labelregister">Confirmar contraseña *</label>
                <input
                  type="password"
                  name="confirmarClave"
                  placeholder="Repite tu contraseña"
                  value={confirmarClave}
                  onChange={handleConfirmarClave}
                  className={errores.confirmarClave ? 'input-error' : ''}
                />
                {errores.confirmarClave && (
                  <p className="error">{errores.confirmarClave}</p>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className={`register-button ${loading ? 'button-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  REGISTRANDO...
                </>
              ) : (
                "REGISTRARSE"
              )}
            </button>

            <div className="register-link">
              ¿Ya tienes una cuenta?{" "}
              <a
                onClick={() => navigate("/login")}
                className="link"
                style={{ cursor: "pointer"}}
              >
                Inicia sesión
              </a>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}