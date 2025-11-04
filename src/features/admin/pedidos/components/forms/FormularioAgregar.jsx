import React, { useState, useMemo } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import { Icon } from "@iconify/react";
import Select from 'react-select';

const FormularioAgregar = ({
  show,
  setShow,
  onSubmit,
  clienteRef,
  direccionRef,
  totalRef,
  productosRef,
  encontrarProducto,
  productosAgregados,
  totalCalculado,
  eliminarProducto,
  cambiarCantidad,
  limpiarProductos,
  correoRef,
  estadoRef,
  estadosDisponibles,
  titulo = "Agregar Nuevo Pedido",
  formatearMoneda,
  clientes = [],
  productos = [],
  clienteSeleccionado,
  onClienteChange
}) => {
  const [clienteSelect, setClienteSelect] = useState(null);
  const [productoSelect, setProductoSelect] = useState(null);
  
  // 🔥 NUEVOS ESTADOS para municipio y departamento
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");

  // 🔸 Preparar datos para react-select
  const opcionesClientes = useMemo(() => {
    return clientes.map((cliente) => {
      const id = cliente.idCliente || cliente.codigoCliente || cliente.Id_Cliente;
      const nombre = cliente.nombreCompleto ||
        `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() ||
        cliente.Nombre || 'Cliente';
      const doc = cliente.documento || cliente.Documento || 'Sin documento';
      
      return {
        value: id,
        label: `${nombre} - ${doc}`,
        data: cliente
      };
    });
  }, [clientes]);

  const opcionesProductos = useMemo(() => {
    return productos.map((producto) => {
      const id = producto.codigoProducto || producto.idProducto || producto.id;
      const nombre = producto.nombreProducto || producto.nombre || producto.Nombre || "Producto";
      const precio = producto.precio || producto.precioVenta || producto.Precio || 0;
      
      return {
        value: id,
        label: `${nombre} - ${formatearMoneda ? formatearMoneda(precio) : precio}`,
        data: producto
      };
    });
  }, [productos, formatearMoneda]);

  // 🔸 Manejo del cambio de cliente
  const handleClienteChange = (selectedOption) => {
    setClienteSelect(selectedOption);
    
    if (selectedOption && onClienteChange) {
      onClienteChange(selectedOption.data);
      if (correoRef.current) {
        correoRef.current.value = selectedOption.data.correo || selectedOption.data.Correo || '';
      }
    } else if (onClienteChange) {
      onClienteChange(null);
      if (correoRef.current) correoRef.current.value = '';
    }
  };

  // 🔸 SOLUCIÓN MEJORADA - Limpiar el ref después de agregar
  const handleAgregarProducto = () => {
    if (!productoSelect) return;

    console.log("🔄 Agregando producto:", productoSelect.value);

    if (productosRef.current) {
      const productId = productoSelect.value;
      productosRef.current.value = productId;
      encontrarProducto();
      productosRef.current.value = "";
      setProductoSelect(null);
    }
  };

  // 🔸 Cerrar modal y limpiar
  const handleClose = () => {
    setShow(false);
    limpiarProductos();
    setClienteSelect(null);
    setProductoSelect(null);
    setMunicipio(""); // 🔥 Limpiar municipio
    setDepartamento(""); // 🔥 Limpiar departamento
    if (clienteRef.current) clienteRef.current.value = "";
    if (correoRef.current) correoRef.current.value = "";
    if (direccionRef.current) direccionRef.current.value = "";
    if (estadoRef.current) estadoRef.current.value = "";
    if (onClienteChange) onClienteChange(null);
  };

  // 🔸 Manejar submit con datos adicionales
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🔥 CREAR OBJETO CON TODOS LOS DATOS NECESARIOS
    const formDataAdicional = {
      clienteSeleccionado,
      productosAgregados, // 🔥 INCLUIR los productos agregados
      totalCalculado,
      direccion: direccionRef.current?.value || "",
      correo: correoRef.current?.value || "",
      estado: estadoRef.current?.value || "Pendiente",
      municipio: municipio, // 🔥 del estado local
      departamento: departamento // 🔥 del estado local
    };

    console.log("📦 Datos del formulario:", formDataAdicional);
    
    // Llamar al onSubmit del padre con todos los datos
    onSubmit(e, formDataAdicional);
  };

  const puedeCrear = productosAgregados.length > 0 && clienteSeleccionado;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      padding: '0.125rem',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: 'var(--naranjado)'
      },
      boxShadow: state.isFocused ? '0 0 0 1px var(--naranjado)' : 'none',
      borderColor: state.isFocused ? 'var(--naranjado)' : '#d1d5db'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--naranjado)' : state.isFocused ? '#fed7aa' : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#fed7aa'
      }
    })
  };

  return (
    <ModalBase
      show={show}
      title={titulo}
      icon="mdi:cart-plus"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 🧍 Cliente con buscador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Cliente *</label>
            <Select
              value={clienteSelect}
              onChange={handleClienteChange}
              options={opcionesClientes}
              placeholder="Buscar cliente..."
              noOptionsMessage={() => "No se encontraron clientes"}
              styles={customStyles}
              isSearchable
              isClearable
              required
            />
            {clientes.length === 0 && (
              <small className="text-red-500 text-sm mt-1 block">
                No hay clientes disponibles.
              </small>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Correo *</label>
            <input
              type="email"
              ref={correoRef}
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-50 focus:border-[var(--naranjado)] focus:outline-none"
              placeholder="Se auto-completa al seleccionar cliente"
              readOnly
              required
            />
          </div>
        </div>

        {/* 📋 Info del cliente */}
        {clienteSeleccionado && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Información del cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><strong>Teléfono:</strong> {clienteSeleccionado.telefono || clienteSeleccionado.Telefono || 'No disponible'}</div>
              <div><strong>Documento:</strong> {clienteSeleccionado.documento || clienteSeleccionado.Documento || 'No disponible'}</div>
              {clienteSeleccionado.direccion && (
                <div className="md:col-span-2">
                  <strong>Dirección:</strong> {clienteSeleccionado.direccion || clienteSeleccionado.Direccion}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🏠 Información de Envío */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Información de Envío</h3>
          
          {/* 📦 Dirección */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Dirección de Entrega *</label>
            <textarea
              ref={direccionRef}
              rows="3"
              required
              placeholder="Dirección completa de entrega (calle, número, barrio, etc.)"
              className="mt-1 block w-full border border-gray-300 rounded p-2 resize-none focus:border-[var(--naranjado)] focus:outline-none"
            ></textarea>
          </div>

          {/* 🔥 NUEVOS CAMPOS: Municipio y Departamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">Municipio *</label>
              <input
                type="text"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                required
                placeholder="Ej: Medellín, Bogotá, Cali"
                className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-[var(--naranjado)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Departamento *</label>
              <input
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                required
                placeholder="Ej: Antioquia, Cundinamarca, Valle"
                className="mt-1 block w-full border border-gray-300 rounded p-2 focus:border-[var(--naranjado)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 🛒 Productos (mantener igual) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Productos *</label>
          
          <select ref={productosRef} className="hidden">
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => {
              const id = producto.codigoProducto || producto.idProducto || producto.id;
              const nombre = producto.nombreProducto || producto.nombre || producto.Nombre || "Producto";
              return <option key={id} value={id}>{nombre}</option>;
            })}
          </select>

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
              onClick={handleAgregarProducto}
              disabled={!productoSelect}
              className={`font-semibold py-2 px-4 rounded transition duration-300 flex items-center gap-1 ${
                productoSelect
                  ? 'bg-[var(--naranjado)] text-white hover:bg-orange-600'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              <Icon icon="mdi:cart-arrow-down" width="18" /> Agregar
            </button>
          </div>

          {/* Productos agregados (mantener igual) */}
          {/* 🛒 Productos agregados - VERIFICAR QUE ESTÉ COMPLETO */}
          {productosAgregados.length > 0 && (
            <div className="border border-gray-300 rounded p-3 bg-gray-50 max-h-48 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Productos en el pedido:</h4>
                <button
                  type="button"
                  onClick={limpiarProductos}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Limpiar todo
                </button>
              </div>

              <div className="space-y-2">
                {productosAgregados.map((p, index) => {
                  const id = p.codigoProducto || p.idProducto || p.id;
                  const nombre = p.nombreProducto || p.nombre || p.Nombre || "Producto sin nombre";
                  const precio = p.precio || p.precioVenta || p.Precio || 0;
                  return (
                    <div key={`${id}-${index}`} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{nombre}</div>
                        <div className="text-xs text-gray-600">
                          {formatearMoneda ? formatearMoneda(precio) : precio} c/u
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => cambiarCantidad(id, p.cantidad - 1)} 
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{p.cantidad}</span>
                        <button 
                          type="button" 
                          onClick={() => cambiarCantidad(id, p.cantidad + 1)} 
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="ml-3 text-sm font-medium w-20 text-right">
                        {formatearMoneda ? formatearMoneda(p.subtotal) : p.subtotal}
                      </div>
                      <button 
                        onClick={() => eliminarProducto(id)} 
                        type="button" 
                        className="ml-2 text-red-600 hover:text-red-800 w-6 h-6 flex items-center justify-center" 
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-300">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatearMoneda ? formatearMoneda(totalCalculado) : totalCalculado}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ⚙️ Estado y Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Estado *</label>
            <select
              ref={estadoRef}
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white focus:border-[var(--naranjado)] focus:outline-none"
              required
              defaultValue="Pendiente"
            >
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Total del Pedido</label>
            <input
              type="text"
              ref={totalRef}
              value={formatearMoneda ? formatearMoneda(totalCalculado) : totalCalculado}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-50 focus:border-[var(--naranjado)] focus:outline-none"
            />
            <small className="text-gray-500">Calculado automáticamente</small>
          </div>
        </div>

        {/* 🧩 Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary font-semibold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!puedeCrear}
            className={`font-semibold py-2 px-4 rounded transition duration-300 ${
              puedeCrear
                ? 'bg-[var(--naranjado)] text-white hover:bg-orange-600'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Agregar Pedido
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioAgregar;