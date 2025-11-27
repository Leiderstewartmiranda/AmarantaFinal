import React from "react";
import "./carrito.css";

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
              const productoId = producto.codigoProducto || producto.id;
              const nombre = producto.nombreProducto || producto.nombre || "Producto";
              const precio = producto.precio || producto.precioVenta || 0;
              const subtotal = producto.subtotal || (precio * producto.cantidad);

              return (
                <div key={`${productoId}-${index}`} className="carrito-item">
                  {/* Fila 1: Nombre y Precio Unitario */}
                  <div className="carrito-row-top">
                    <h4 title={nombre}>{nombre}</h4>
                    <span className="precio-unitario">${precio.toLocaleString()} c/u</span>
                  </div>

                  {/* Fila 2: Controles y Subtotal */}
                  <div className="carrito-row-bottom">
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