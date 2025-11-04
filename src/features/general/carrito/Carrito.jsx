import React from "react";
import "./Carrito.css";

const Carrito = ({ carrito, onActualizarCantidad, onEliminarProducto, onRealizarPedido, onLimpiarCarrito, total }) => {
  
  return (
    <div className="carrito">
      <h3>Tu Carrito</h3>
      {carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío</p>
      ) : (
        <>
          <div className="carrito-items">
            {carrito.map((producto, index) => {
              // 🔥 CORRECCIÓN: Usar la misma lógica de identificación
              const productoId = producto.codigoProducto || producto.id;
              const nombre = producto.nombreProducto || producto.nombre || "Producto";
              const precio = producto.precio || producto.precioVenta || 0;
              const subtotal = producto.subtotal || (precio * producto.cantidad);
              
              return (
                <div key={`${productoId}-${index}`} className="carrito-item">
                  <div className="item-info">
                    <h4>{nombre}</h4>
                    <p>${precio.toLocaleString()} c/u</p>
                  </div>
                  <div className="item-controls">
                    <button 
                      onClick={() => onActualizarCantidad(productoId, producto.cantidad - 1)}
                      disabled={producto.cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{producto.cantidad}</span>
                    <button 
                      onClick={() => onActualizarCantidad(productoId, producto.cantidad + 1)}
                    >
                      +
                    </button>
                    <button 
                      onClick={() => onEliminarProducto(productoId)}
                      className="btn-eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="item-subtotal">
                    ${subtotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="carrito-total">
            <strong>Total: ${total.toLocaleString()}</strong>
          </div>
          <button 
            onClick={onRealizarPedido}
            className="btn-pedido"
          >
            Realizar Pedido
          </button>
          {onLimpiarCarrito && (
            <button 
              onClick={onLimpiarCarrito}
              className="btn-limpiar"
            >
              Limpiar Carrito
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Carrito;