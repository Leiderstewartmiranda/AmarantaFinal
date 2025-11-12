// components/ModalPedido.jsx
import React, { useState, useEffect } from "react";
import "./ModalPedido.css";
import { UbicacionService } from "../../../services/ubicacionService";

const ModalPedido = ({ show, onClose, carrito, onConfirmarPedido, usuario }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [formData, setFormData] = useState({
    direccion: "",
    municipio: "",
    departamento: "",
    telefono: ""
  });

  useEffect(() => {
    if (show) {
      UbicacionService.obtenerDepartamentos().then(setDepartamentos);
    }
  }, [show]);

  // cargar municipios cuando cambie el departamento
  useEffect(() => {
    if (formData.departamento) {
      UbicacionService.obtenerMunicipios(formData.departamento).then(setMunicipios);
    } else {
      setMunicipios([]);
    }
  }, [formData.departamento]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmarPedido(formData);
  };

  const total = carrito.reduce(
    (sum, producto) => sum + producto.precio * producto.cantidad,
    0
  );

  return (
    <div className="modal-overlay">
      <div className="modal-pedido">
        <h2>Completar Tu Pedido</h2>

        {/* resumen del pedido */}
        <div className="resumen-pedido">
          <h4>Resumen del Pedido:</h4>
          {carrito.map((producto) => (
            <div key={producto.codigoProducto} className="resumen-item">
              <span>{producto.nombreProducto || producto.nombre}</span>
              <span>
                {producto.cantidad} x $
                {(producto.precio || 0).toLocaleString("es-CO")}
              </span>
            </div>
          ))}
          <div className="resumen-total">
            <strong>Total: ${total.toLocaleString("es-CO")}</strong>
          </div>
        </div>

        {/* formulario */}
        <form onSubmit={handleSubmit} className="form-pedido">
          <div className="form-group">
            <label className="labelpedido text-[#d4a574]">
              Dirección de Entrega *
            </label>
            <textarea
              className="textarea"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              required
              placeholder="Calle, número, barrio..."
            />
          </div>

          <div className="form-row">
            {/* departamento */}
            <div className="form-group">
              <label className="labelpedido">Departamento *</label>
              <select
                className="inputpedido"
                value={formData.departamento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departamento: e.target.value,
                    municipio: "" // limpiar municipio al cambiar departamento
                  })
                }
                required
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {/* municipio */}
            <div className="form-group">
              <label className="labelpedido">Municipio *</label>
              <select
                className="inputpedido"
                value={formData.municipio}
                onChange={(e) =>
                  setFormData({ ...formData, municipio: e.target.value })
                }
                required
                disabled={!municipios.length}
              >
                <option value="">Seleccione un municipio</option>
                {municipios.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* teléfono */}
          <div className="form-group">
            <label className="labelpedido">Teléfono de Contacto *</label>
            <input
              className="inputpedido"
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              required
              placeholder="Tu número de teléfono"
            />
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
