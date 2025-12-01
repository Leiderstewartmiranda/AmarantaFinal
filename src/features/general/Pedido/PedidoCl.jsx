// components/ModalPedido.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./ModalPedido.css";
import { UbicacionService } from "../../../services/ubicacionService";

const ModalPedido = ({ show, onClose, carrito, onConfirmarPedido, usuario }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  // Estados para los selects (objetos {value, label})
  const [departamentoSelect, setDepartamentoSelect] = useState(null);
  const [municipioSelect, setMunicipioSelect] = useState(null);

  const [formData, setFormData] = useState({
    direccion: "",
    municipio: "",
    departamento: "",
    telefono: "",
    factu: null
  });

  // 🎨 Estilos para react-select (Tema Dark Premium)
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #333",
      borderRadius: "4px",
      padding: "0.2rem",
      backgroundColor: "#0a0a0a", // --dark-bg
      color: "#f3f3f3",
      "&:hover": { borderColor: "#d4a574" }, // --primary-gold
      boxShadow: state.isFocused ? "0 0 0 1px rgba(212, 165, 116, 0.5)" : "none",
      borderColor: state.isFocused ? "#d4a574" : "#333",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#d4a574" // --primary-gold
        : state.isFocused
          ? "#1a1a1a" // un poco más claro que el fondo
          : "#0a0a0a", // --dark-bg
      color: state.isSelected ? "#000" : "#f3f3f3",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#1a1a1a" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#0a0a0a",
      border: "1px solid #333",
      borderRadius: "4px",
      marginTop: "4px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#f3f3f3", // Texto claro para la selección
    }),
    input: (base) => ({
      ...base,
      color: "#f3f3f3", // Texto claro al escribir
    }),
    placeholder: (base) => ({
      ...base,
      color: "#666",
    }),
  };

  useEffect(() => {
    if (show) {
      const cargarDepartamentos = async () => {
        const data = await UbicacionService.obtenerDepartamentos();
        const opciones = data.map(dep => ({ value: dep, label: dep }));
        setDepartamentos(opciones);
      };
      cargarDepartamentos();
    }
  }, [show]);

  // cargar municipios cuando cambie el departamento
  useEffect(() => {
    if (departamentoSelect) {
      const cargarMunicipios = async () => {
        const data = await UbicacionService.obtenerMunicipios(departamentoSelect.value);
        const opciones = data.map(mun => ({ value: mun, label: mun }));
        setMunicipios(opciones);
      };
      cargarMunicipios();
    } else {
      setMunicipios([]);
      setMunicipioSelect(null);
    }
  }, [departamentoSelect]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmarPedido({
      ...formData,
      departamento: departamentoSelect?.value || "",
      municipio: municipioSelect?.value || "",
      factu: formData.factu
    });
  };

  const total = carrito.reduce(
    (sum, producto) => sum + producto.precio * producto.cantidad,
    0
  );

  return (
    <div className="modal-overlay">
      <div className="modal-pedido">
        <h2 className="modal-title">Completar Tu Pedido</h2>

        {/* resumen del pedido */}
        <div className="resumen-pedido">
          <h4>Resumen del Pedido:</h4>
          <div className="resumen-items-container">
            {carrito.map((producto) => (
              <div key={producto.codigoProducto} className="resumen-item">
                <span className="resumen-nombre">{producto.nombreProducto || producto.nombre}</span>
                <span className="resumen-precio">
                  {producto.cantidad} x $
                  {(producto.precio || 0).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
          <div className="resumen-total">
            <strong>Total: ${total.toLocaleString("es-CO")}</strong>
          </div>
        </div>

        {/* formulario */}
        <form onSubmit={handleSubmit} className="form-pedido">
          <div className="form-group">
            <label className="labelpedido">
              Dirección de Entrega *
            </label>
            <textarea
              className="textarea-pedido"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              required
              placeholder="Calle, número, barrio..."
              rows="2"
            />
          </div>

          <div className="form-row">
            {/* departamento */}
            <div className="form-group">
              <label className="labelpedido">Departamento *</label>
              <Select
                value={departamentoSelect}
                onChange={(option) => {
                  setDepartamentoSelect(option);
                  setMunicipioSelect(null);
                }}
                options={departamentos}
                placeholder="Seleccione..."
                styles={customStyles}
                required
                isSearchable
              />
            </div>

            {/* municipio */}
            <div className="form-group">
              <label className="labelpedido">Municipio *</label>
              <Select
                value={municipioSelect}
                onChange={setMunicipioSelect}
                options={municipios}
                placeholder="Seleccione..."
                isDisabled={!departamentoSelect}
                styles={customStyles}
                required
                isSearchable
                noOptionsMessage={() => "Seleccione departamento primero"}
              />
            </div>
          </div>

          {/* teléfono */}
          <div className="form-group">
            <label className="labelpedido">Teléfono de Contacto *</label>
            <input
              className="input-pedido"
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              required
              placeholder="Tu número de teléfono"
            />
          </div>

          {/* Comprobante de Transferencia (Factu) */}
          <div className="form-group">
            <label className="labelpedido">Comprobante de Transferencia *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setFormData({ ...formData, factu: file });
              }}
              required
              className="input-pedido file-input"
              style={{ color: "#f3f3f3" }} // Asegurar visibilidad en dark mode
            />
            {!formData.factu && <small style={{ color: "#d4a574" }}>Debes subir el comprobante para continuar.</small>}
          </div>

          {/* acciones */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-confirmar">
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPedido;
