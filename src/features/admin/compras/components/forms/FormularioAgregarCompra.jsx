import React, { useState, useEffect } from 'react';
import { 
  PostCompra, 
  PostDetalleCompra
} from "../../../../../services/compraService";

const FormularioAgregarCompra = ({ 
  show, 
  close, 
  onCompraCreada, 
  proveedores = [], 
  productos = [] 
}) => {
  const [compraData, setCompraData] = useState({
    FechaCompra: new Date().toISOString().split('T')[0],
    PrecioTotal: 0,
    Estado: "Activa",
    IdUsuario: "",
    IdProveedor: ""
  });

  const [detalles, setDetalles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (show) {
      cargarUsuarios();
    }
  }, [show]);

  const cargarUsuarios = async () => {
    try {
      // Simulación de usuarios - reemplaza con tu endpoint real
      const usuariosSimulados = [
        { id_Usuario: 13, nombre: "Admin User", usuario: "admin" }
      ];
      setUsuarios(usuariosSimulados);
      
      if (usuariosSimulados.length > 0) {
        setCompraData(prev => ({
          ...prev,
          IdUsuario: usuariosSimulados[0].id_Usuario.toString()
        }));
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar usuarios');
    }
  };

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!show) {
      setCompraData({
        FechaCompra: new Date().toISOString().split('T')[0],
        PrecioTotal: 0,
        Estado: "Activa",
        IdUsuario: "",
        IdProveedor: ""
      });
      setDetalles([]);
      setError('');
    }
  }, [show]);

  // Manejar cambios en el formulario principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompraData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar nuevo detalle
  const agregarDetalle = () => {
    setDetalles(prev => [...prev, {
      id: Date.now() + Math.random(),
      CodigoProducto: "",
      cantidad: 1,
      precio: 0,
      subtotal: 0
    }]);
  };

  // Manejar cambios en los detalles
  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][field] = value;

    if (field === 'cantidad' || field === 'precio') {
      const cantidad = field === 'cantidad' ? value : nuevosDetalles[index].cantidad;
      const precio = field === 'precio' ? value : nuevosDetalles[index].precio;
      nuevosDetalles[index].subtotal = cantidad * precio;
    }

    setDetalles(nuevosDetalles);

    const precioTotal = nuevosDetalles.reduce((total, detalle) => total + (detalle.subtotal || 0), 0);
    setCompraData(prev => ({ ...prev, PrecioTotal: precioTotal }));
  };

  // Selección de producto
  const handleProductoChange = (index, productoId) => {
    if (!productoId || productoId === "") {
      handleDetalleChange(index, 'CodigoProducto', "");
      return;
    }

    const productoIdNum = parseInt(productoId);

    const productoSeleccionado = productos.find(p => {
      const posiblesIds = [
        p.codigoProducto,
        p.CodigoProducto,
        p.IdProducto,
        p.id,
        p.productoId
      ];
      return posiblesIds.some(id => id == productoIdNum || id?.toString() === productoId?.toString());
    });

    if (productoSeleccionado) {
      const nuevosDetalles = [...detalles];
      nuevosDetalles[index].CodigoProducto = productoId;
      const precioProducto = productoSeleccionado.precioCompra || 
                            productoSeleccionado.precioVenta || 
                            productoSeleccionado.precio || 
                            0;
      nuevosDetalles[index].precio = precioProducto;
      nuevosDetalles[index].subtotal = nuevosDetalles[index].cantidad * precioProducto;

      setDetalles(nuevosDetalles);

      const precioTotal = nuevosDetalles.reduce((total, detalle) => total + (detalle.subtotal || 0), 0);
      setCompraData(prev => ({ ...prev, PrecioTotal: precioTotal }));
    } else {
      const nuevosDetalles = [...detalles];
      nuevosDetalles[index].CodigoProducto = "";
      nuevosDetalles[index].precio = 0;
      nuevosDetalles[index].subtotal = 0;
      setDetalles(nuevosDetalles);
    }
  };

  // Eliminar detalle
  const eliminarDetalle = (index) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!compraData.IdProveedor) throw new Error("Debe seleccionar un proveedor");
    if (!compraData.IdUsuario) throw new Error("Debe seleccionar un usuario");
    if (detalles.length === 0) throw new Error("Debe agregar al menos un producto");

    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];
      if (!detalle.CodigoProducto) {
        throw new Error(`El producto en la línea ${i + 1} es requerido`);
      }
      if (detalle.cantidad <= 0) {
        throw new Error(`La cantidad en la línea ${i + 1} debe ser mayor a 0`);
      }
      if (detalle.precio <= 0) {
        throw new Error(`El precio en la línea ${i + 1} debe ser mayor a 0`);
      }
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      validarFormulario();

      const proveedorSeleccionado = proveedores.find(p => 
        p.IdProveedor == compraData.IdProveedor ||
        p.idProveedor == compraData.IdProveedor ||
        p.CodigoProveedor == compraData.IdProveedor ||
        p.codigoProveedor == compraData.IdProveedor
      );
      if (!proveedorSeleccionado) {
        throw new Error("El proveedor seleccionado no existe");
      }

      const compraDataParaEnviar = {
        FechaCompra: compraData.FechaCompra,
        PrecioTotal: parseFloat(compraData.PrecioTotal),
        Estado: "Activa",
        IdUsuario: parseInt(compraData.IdUsuario),
        IdProveedor: parseInt(compraData.IdProveedor)
      };

      const compraCreada = await PostCompra(compraDataParaEnviar);
      console.log('🛠️ Respuesta API:', compraCreada);

      const codigoCompra = 
        compraCreada.CodigoCompra ||  
        compraCreada.codigoCompra ||
        compraCreada.id ||
        compraCreada.IdCompra ||
        compraCreada.idCompra;

      if (!codigoCompra) {
        throw new Error('No se pudo obtener el ID de la compra creada');
      }

      const promises = detalles.map((detalle) => {
        const detalleParaEnviar = {
          CodigoCompra: codigoCompra,
          IdProducto: parseInt(detalle.CodigoProducto),
          Cantidad: parseInt(detalle.cantidad),
          PrecioUnitario: parseFloat(detalle.precio),
          PrecioTotal: parseFloat(detalle.subtotal)
        };
        return PostDetalleCompra(detalleParaEnviar);
      });

      await Promise.all(promises);
      onCompraCreada();
      alert('✅ Compra guardada exitosamente');

    } catch (error) {
      console.error('❌ Error al guardar compra:', error);
      setError(`Error al guardar compra: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderUsuariosOptions = () => {
    if (!usuarios || usuarios.length === 0) {
      return <option value="">Cargando usuarios...</option>;
    }
    return usuarios.map((usuario) => (
      <option key={`usuario-${usuario.id_Usuario}`} value={usuario.id_Usuario}>
        {usuario.nombre} ({usuario.usuario})
      </option>
    ));
  };

  const renderProveedoresOptions = () => {
    if (!proveedores || proveedores.length === 0) {
      return <option value="">No hay proveedores disponibles</option>;
    }
    return proveedores.map((proveedor) => (
      <option 
        key={`proveedor-${proveedor.IdProveedor || proveedor.idProveedor || proveedor.CodigoProveedor}`} 
        value={proveedor.IdProveedor || proveedor.idProveedor || proveedor.CodigoProveedor}
      >
        {proveedor.nombreEmpresa || proveedor.nombre || `Proveedor`}
      </option>

    ));
  };

  const renderProductosOptions = () => {
    if (!productos || productos.length === 0) {
      return <option value="">No hay productos disponibles</option>;
    }
    return productos.map((producto, index) => {
      const productoId = producto.CodigoProducto || producto.codigoProducto || producto.IdProducto || producto.id || index;
      const nombreProducto = producto.nombre || producto.nombreProducto || `Producto ${productoId}`;
      const precioProducto = producto.precioCompra || producto.precioVenta || producto.precio || 0;
      return (
        <option key={`producto-${productoId}`} value={productoId}>
          {nombreProducto} - ${precioProducto}
        </option>
      );
    });
  };

  const renderDetalles = () => {
    return detalles.map((detalle, index) => {
      const productoSeleccionado = productos.find(p => p.IdProducto == detalle.CodigoProducto || p.CodigoProducto == detalle.CodigoProducto);
      const nombreProducto = productoSeleccionado ? 
        (productoSeleccionado.nombre || productoSeleccionado.nombreProducto) : 
        "Seleccione producto";

      return (
        <div key={detalle.id} className="detalle-item border border-gray-300 p-4 mb-4 rounded-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Producto:</label>
              <select
                value={detalle.CodigoProducto}
                onChange={(e) => handleProductoChange(index, e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccione producto</option>
                {renderProductosOptions()}
              </select>
              {productoSeleccionado && (
                <p className="text-sm text-gray-600 mt-1">
                  Stock: {productoSeleccionado.stock || 0}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">Cantidad:</label>
              <input
                type="number"
                min="1"
                value={detalle.cantidad}
                onChange={(e) => handleDetalleChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">Precio:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={detalle.precio}
                onChange={(e) => handleDetalleChange(index, 'precio', parseFloat(e.target.value) || 0)}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">Subtotal:</label>
              <input
                type="number"
                value={detalle.subtotal || 0}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md font-bold bg-gray-50 text-green-600"
              />
            </div>

            <button 
              type="button" 
              onClick={() => eliminarDetalle(index)}
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors h-fit font-semibold"
            >
              Eliminar
            </button>
          </div>
        </div>
      );
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Nueva Compra</h2>
            <button
              onClick={close}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Formulario principal */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Información de Compra</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Usuario:</label>
                  <select 
                    name="IdUsuario"
                    value={compraData.IdUsuario}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccione un usuario</option>
                    {renderUsuariosOptions()}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Proveedor:</label>
                  <select 
                    name="IdProveedor"
                    value={compraData.IdProveedor}
                    onChange={(e) => setCompraData({ ...compraData, IdProveedor: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccione un proveedor</option>
                    {renderProveedoresOptions()}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Fecha de Compra:</label>
                  <input
                    type="date"
                    name="FechaCompra"
                    value={compraData.FechaCompra}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Precio Total:</label>
                  <input
                    type="number"
                    value={compraData.PrecioTotal}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-md font-bold text-green-600 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700">Productos</h3>
                <button 
                  type="button" 
                  onClick={agregarDetalle}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold"
                >
                  + Agregar Producto
                </button>
              </div>

              {detalles.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                </div>
              ) : (
                renderDetalles()
              )}
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={close}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading || detalles.length === 0 || !compraData.IdProveedor || !compraData.IdUsuario}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Guardando...' : 'Guardar Compra'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioAgregarCompra;
