// components/CatalogoProductos.jsx
import React, { useState, useEffect } from "react";
import { GetProductos } from "../../../services/productoService";
import "./CatalogoProductos.css";

const CatalogoProductos = ({ onAgregarAlCarrito }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await GetProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.codigoProducto === producto.codigoProducto);
      if (existe) {
        return prev.map(p =>
          p.codigoProducto === producto.codigoProducto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    onAgregarAlCarrito(producto);
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="catalogo">
      <h2>Nuestros Puros Premium</h2>
      <div className="productos-grid">
        {productos.map(producto => (
          <div key={producto.codigoProducto} className="producto-card">
            <div className="producto-imagen">
              {/* Aquí puedes agregar imágenes de los productos */}
              <img
                src={producto.imagen }
                alt={producto.nombreProducto || producto.nombre}
              />
              {/* <div className="imagen-placeholder">
                {producto.nombre?.charAt(0)}
              </div> */}
            </div>
            <div className="producto-info">
              <h3>{producto.nombreProducto || producto.nombre}</h3>
              <p className="producto-descripcion">
                {producto.descripcion || "Puro premium de alta calidad"}
              </p>
              <p className="producto-precio">
                ${(producto.precio || 0).toLocaleString()}
              </p>
              <button 
                onClick={() => agregarAlCarrito(producto)}
                className="btn-agregar"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogoProductos;