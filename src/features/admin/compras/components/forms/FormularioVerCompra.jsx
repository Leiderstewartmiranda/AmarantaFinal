// components/forms/FormularioVerCompra.jsx
import React, { useState, useEffect } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase.jsx";
import { GetDetallesByCompra } from "../../../../../services/compraService";
import { GetProveedores } from "../../../../../services/compraService";

const FormularioVerCompra = ({
  show,
  close,
  compra,
  formatoMoneda,
  descargarFactura,
  proveedores = []
}) => {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && compra) {
      cargarDetalles();
    }
  }, [show, compra]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const detallesData = await GetDetallesByCompra(compra.codigoCompra);
      setDetalles(detallesData);
    } catch (error) {
      console.error("Error cargando detalles:", error);
      setDetalles([]);
    } finally {
      setLoading(false);
    }
  };

  

  const getProveedorInfo = () => {
    if (!compra || !compra.idProveedor) {
      return { nombre: "Desconocido", tipoDocumento: "-", documento: "-" };
    }

    const proveedor = proveedores.find(p => p.idProveedor === compra.idProveedor);

    return proveedor
      ? {
          nombre: proveedor.nombreEmpresa,
          tipoDocumento: proveedor.nit || "No especificado",
          documento: proveedor.representante || "N/A"
        }
      : { nombre: "Desconocido", tipoDocumento: "-", documento: "-" };
  };

  const proveedor = getProveedorInfo();

  if (!show) return null;

  return (
    <ModalBase
      show={show}
      title={`Detalles de la Compra #${compra?.codigoCompra}`}
      onClose={close}
      footerButtons={
        <>
          <button
            className="btn-secundary"
            onClick={close}
          >
            Cerrar
          </button>
          <button
            className="btn"
            onClick={() => descargarFactura(compra)}
          >
            Descargar PDF
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p>
          <b>Fecha:</b>{" "}
          {new Date(compra.fechaCompra).toLocaleDateString("es-CO")}
        </p>
        <p>
          <b>Proveedor:</b> {proveedor.nombre}
        </p>
        <p>
          <b>{proveedor.tipoDocumento}:</b> {proveedor.documento}
        </p>
        
        <p>
          <b>Total:</b> {formatoMoneda(compra.precioTotal)}
        </p>

        <hr className="my-3 border-gray-300" />

        <h4 className="font-semibold text-lg mb-2">Productos</h4>
        {detalles.length > 0 ? (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-[var(--naranjado)] text-white">
              <tr>
                <th className="py-2 px-4 text-left">Producto</th>
                <th className="py-2 px-4 text-center">Cantidad</th>
                <th className="py-2 px-4 text-center">Precio</th>
                <th className="py-2 px-4 text-center">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 px-4">{d.nombreProducto}</td>
                  <td className="py-2 px-4 text-center">{d.cantidad}</td>
                  <td className="py-2 px-4 text-center">
                    {formatoMoneda(d.precioUnitario)}
                  </td>
                  <td className="py-2 px-4 text-center font-semibold">
                    {formatoMoneda(d.cantidad * d.precioUnitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay detalles disponibles.</p>
        )}
      </div>
    </ModalBase>
  );
};

export default FormularioVerCompra;