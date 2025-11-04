// components/ModalPedido.jsx
import React, { useState } from "react";
import "./ModalPedido.css";

const ModalPedido = ({ show, onClose, carrito, onConfirmarPedido, usuario }) => {
  const [formData, setFormData] = useState({
    direccion: "",
    municipio: "",
    departamento: "",
    telefono: ""
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmarPedido(formData);
  };

  const total = carrito.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-pedido">
        <h2>Completar Tu Pedido</h2>
        
        <div className="resumen-pedido">
          <h4>Resumen del Pedido:</h4>
          {carrito.map(producto => (
            <div key={producto.codigoProducto} className="resumen-item">
              <span>{producto.nombreProducto || producto.nombre}</span>
              <span>{producto.cantidad} x ${(producto.precio || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="resumen-total">
            <strong>Total: ${total.toLocaleString()}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-pedido">
          <div className="form-group">
            <label className="labelpedido">Dirección de Entrega *</label>
            <textarea
            className="textarea"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              required
              placeholder="Calle, número, barrio..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="labelpedido">Municipio *</label>
              <input
                className="inputpedido"
                type="text"
                value={formData.municipio}
                onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                required
                placeholder="Tu municipio"
              />
            </div>

            <div className="form-group">
              <label className="labelpedido">Departamento *</label>
              <input
                className="inputpedido"
                type="text"
                value={formData.departamento}
                onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                required
                placeholder="Tu departamento"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="labelpedido">Teléfono de Contacto *</label>
            <input
              className="inputpedido"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              required
              placeholder="Tu número de teléfono"
            />
          </div>


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