import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import {
  PostDetallesCompraMultiple,
  PostCompra,
  PostDetalleCompra,
  GetProveedores,
  GetProductos,
} from "../../../../../services/compraService";
import { Icon } from "@iconify/react";

export default function FormularioAgregarCompra({ show, close, onCompraCreada }) {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedorSelect, setProveedorSelect] = useState(null);
  const [productoSelect, setProductoSelect] = useState(null);
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [totalCalculado, setTotalCalculado] = useState(0);
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split("T")[0]);

  // Cargar datos
  useEffect(() => {
    if (show) {
      cargarDatos();
    }
  }, [show]);

  const cargarDatos = async () => {
    try {
      const [prov, prod] = await Promise.all([GetProveedores(), GetProductos()]);
      setProveedores(prov);
      setProductos(prod);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  // Opciones de Select
  const opcionesProveedores = useMemo(() =>
    proveedores.map((p) => ({
      value: p.idProveedor,
      label: `${p.nombreEmpresa} — (${p.nit}) ${p.representante} `,
      data: p,
    })), [proveedores]
  );

  const opcionesProductos = useMemo(() =>
    productos.map((p) => ({
      value: p.codigoProducto,
      label: `${p.nombreProducto} — $${p.precio || p.precioVenta || 0}`,
      precio: p.precio || p.precioVenta || 0,
      data: p,
    })), [productos]
  );

  // 🔥 AGREGAR PRODUCTO - CORREGIDO
  const agregarProducto = () => {
    if (!productoSelect) return;

    console.log("🔄 Agregando producto:", productoSelect);

    setProductosAgregados((prev) => {
      // Buscar si el producto ya está agregado usando el ID correcto
      const existente = prev.find((p) => p.codigoProducto === productoSelect.value);
      let nuevaLista;

      if (existente) {
        // Si ya existe, incrementar la cantidad
        nuevaLista = prev.map((p) =>
          p.codigoProducto === productoSelect.value
            ? { 
                ...p, 
                cantidad: p.cantidad + 1, 
                subtotal: (p.cantidad + 1) * p.precio 
              }
            : p
        );
      } else {
        // Si no existe, agregar nuevo producto con todos los datos necesarios
        const nuevo = {
          codigoProducto: productoSelect.value,
          nombreProducto: productoSelect.data?.nombreProducto || productoSelect.label.split(" — ")[0],
          precio: productoSelect.precio,
          cantidad: 1,
          subtotal: productoSelect.precio,
          // Guardar datos adicionales que puedan necesitarse
          productoData: productoSelect.data
        };
        nuevaLista = [...prev, nuevo];
      }

      calcularTotal(nuevaLista);
      return nuevaLista;
    });

    // Limpiar selección después de agregar
    setProductoSelect(null);
  };

  // Eliminar producto
  const eliminarProducto = (codigo) => {
    const nuevaLista = productosAgregados.filter((p) => p.codigoProducto !== codigo);
    setProductosAgregados(nuevaLista);
    calcularTotal(nuevaLista);
  };

  // Cambiar cantidad
  const cambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return eliminarProducto(id);

    const nuevaLista = productosAgregados.map((p) =>
      p.codigoProducto === id
        ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio }
        : p
    );
    setProductosAgregados(nuevaLista);
    calcularTotal(nuevaLista);
  };

  // Calcular total
  const calcularTotal = (lista) => {
    const total = lista.reduce((acc, p) => acc + p.subtotal, 0);
    setTotalCalculado(total);
  };

  // 💾 Guardar compra (versión mejorada)
  const handleGuardar = async () => {
    if (!proveedorSelect) return alert("Seleccione un proveedor");
    if (productosAgregados.length === 0)
      return alert("Agregue al menos un producto");

    try {
      // 🧾 Crear la compra
      const compra = {
        FechaCompra: fechaCompra,
        PrecioTotal: totalCalculado,
        Estado: "Activa",
        IdUsuario: 1, // o el ID del usuario actual
        IdProveedor: proveedorSelect.value,
      };

      const compraCreada = await PostCompra(compra);
      const idCompra = compraCreada.codigoCompra || compraCreada.idCompra;

      // 🧱 Preparar detalles de compra
      const detalles = productosAgregados.map((producto) => ({
        CodigoCompra: idCompra,
        CodigoProducto: producto.codigoProducto,
        Cantidad: producto.cantidad,
        PrecioUnitario: producto.precio,
        Subtotal: producto.subtotal,
        NombreProducto: producto.nombreProducto,
      }));

      // 🚀 Enviar todos los detalles en una sola petición
      await PostDetallesCompraMultiple(detalles);

      
      setProductosAgregados([]);
      setProveedorSelect(null);
      setProductoSelect(null);
      setTotalCalculado(0);
      close();
      onCompraCreada && onCompraCreada();
    } catch (error) {
      console.error("❌ Error al registrar compra:", error);
      alert("Error al crear la compra");
    }
  };


  // Estilos de React Select (idénticos al de pedidos)
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.125rem",
      backgroundColor: "white",
      "&:hover": { borderColor: "var(--naranjado)" },
      boxShadow: state.isFocused ? "0 0 0 1px var(--naranjado)" : "none",
      borderColor: state.isFocused ? "var(--naranjado)" : "#d1d5db",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--naranjado)"
        : state.isFocused
        ? "#fed7aa"
        : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": { backgroundColor: "#fed7aa" },
    }),
  };

  return (
    <ModalBase show={show} title="Registrar Compra" onClose={close}>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* 🗓️ Fecha y proveedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium"> Fecha de Compra</label>
            <input
              type="date"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white focus:border-[var(--naranjado)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Proveedor *</label>
            <Select
              value={proveedorSelect}
              onChange={setProveedorSelect}
              options={opcionesProveedores}
              placeholder="Buscar proveedor..."
              noOptionsMessage={() => "No se encontraron proveedores"}
              styles={customStyles}
              isSearchable
              isClearable
            />
          </div>
        </div>

        {/* 🧾 Productos */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Productos *</label>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <Select
                value={productoSelect}
                onChange={setProductoSelect}
                options={opcionesProductos}
                placeholder="Buscar producto..."
                noOptionsMessage={() => "No se encontraron productos"}
                styles={customStyles}
                isSearchable
                isClearable
              />
            </div>
            <button
              type="button"
              onClick={agregarProducto}
              disabled={!productoSelect}
              className={`font-semibold py-2 px-4 rounded transition duration-300 flex items-center gap-1 ${
                productoSelect
                  ? "bg-[var(--naranjado)] text-white hover:bg-orange-600"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              <Icon icon="mdi:cart-plus" width="18" /> Agregar
            </button>
          </div>

          {/* Productos agregados */}
          {productosAgregados.length > 0 && (
            <div className="border border-gray-300 rounded p-3 bg-gray-50 max-h-48 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Productos agregados:</h4>
                <button
                  type="button"
                  onClick={() => {
                    setProductosAgregados([]);
                    setTotalCalculado(0);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Limpiar todo
                </button>
              </div>

              <div className="space-y-2">
                {productosAgregados.map((p, i) => (
                  <div
                    key={`${p.codigoProducto}-${i}`} // 🔥 Key única con ID e índice
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.nombreProducto}</div>
                      <div className="text-xs text-gray-600">${p.precio.toFixed(2)} c/u</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(p.codigoProducto, p.cantidad - 1)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{p.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(p.codigoProducto, p.cantidad + 1)}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="ml-3 text-sm font-medium w-20 text-right">
                      ${p.subtotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => eliminarProducto(p.codigoProducto)}
                      type="button"
                      className="ml-2 text-red-600 hover:text-red-800 w-6 h-6 flex items-center justify-center"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-300">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">${totalCalculado.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay productos disponibles */}
          {productos.length === 0 && (
            <small className="text-red-500 text-sm mt-1 block">
              No hay productos disponibles.
            </small>
          )}
        </div>

        {/* Validaciones visuales */}
        {!proveedorSelect && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center text-red-600 text-sm">
            Debes seleccionar un proveedor
          </div>
        )}
        {productosAgregados.length === 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center text-red-600 text-sm">
            Debes agregar al menos un producto
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={close}
            className="btn-secondary font-semibold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={!proveedorSelect || productosAgregados.length === 0}
            className={`font-semibold py-2 px-4 rounded transition duration-300 ${
              proveedorSelect && productosAgregados.length > 0
                ? "bg-[var(--naranjado)] text-white hover:bg-orange-600"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
             Agregar Compra
          </button>
        </div>
      </form>
    </ModalBase>
  );
}