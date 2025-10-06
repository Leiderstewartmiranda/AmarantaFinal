import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import { useRef, useState, useMemo, useEffect } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVer from "../components/forms/FormularioVer";
import FormularioAbono from "../components/forms/FormularioAbono";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { 
  GetPedidos,
  GetPedidoById, 
  PostPedido, 
  CancelarPedido,
  GetClientes,
  GetProductos 
} from "../../../../services/pedidoService";

const PaginaPedidos = () => {
  // Estados para datos
  const [listaClientes, setListaClientes] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);
  const [listaPedidos, setListaPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de UI
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [totalCalculado, setTotalCalculado] = useState(0);
  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [showAbono, setShowAbono] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 5;
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    Cliente: "",
    IdCliente: "",
    Direccion: "",
    PrecioTotal: "",
    Productos: [],
    Correo: "",
    Estado: "",
    Abonos: "",
  });

  // Refs
  const clienteRef = useRef();
  const direccionRef = useRef();
  const totalRef = useRef();
  const correoRef = useRef();
  const estadoRef = useRef();
  const abonosRef = useRef();
  const busquedaRef = useRef();
  const productosRef = useRef();

  const estadosDisponibles = ["Pendiente", "En Proceso", "Completado", "Cancelado"];

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [pedidosData, clientesData, productosData] = await Promise.all([
        GetPedidos(),
        GetClientes(),
        GetProductos()
      ]);
      
      // Mapear los pedidos con la estructura correcta según tu DTO
      const pedidosMapeados = pedidosData.map(pedido => mapearPedidoDesdeAPI(pedido));
      setListaPedidos(pedidosMapeados);
      setListaClientes(clientesData);
      setListaProductos(productosData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Función para mapear datos de la API a tu formato
  const mapearPedidoDesdeAPI = (pedido) => {
    return {
      CodigoPedido: pedido.codigoPedido || pedido.CodigoPedido,
      Id_Pedido: pedido.codigoPedido || pedido.CodigoPedido, // Para compatibilidad
      Cliente: pedido.nombreCliente || pedido.NombreCliente || "Cliente no disponible",
      IdCliente: pedido.idCliente || pedido.IdCliente,
      Direccion: "Dirección del cliente", // Tu DTO no incluye dirección del cliente
      PrecioTotal: pedido.precioTotal || pedido.PrecioTotal || 0,
      Total: pedido.precioTotal || pedido.PrecioTotal || 0, // Para compatibilidad
      Correo: "", // Tu DTO no incluye correo
      Estado: pedido.estado || pedido.Estado || "Pendiente",
      Abonos: 0, // Tu modelo no tiene abonos
      FechaPedido: pedido.fechaPedido || pedido.FechaPedido,
      Productos: pedido.detalles || pedido.Detalles || [],
      Detalles: pedido.detalles || pedido.Detalles || [] // Para compatibilidad con formularios
    };
  };

  // 🔍 Filtrar pedidos basado en el término de búsqueda
  const pedidosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaPedidos;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaPedidos.filter((pedido) => {
      const cliente = pedido.Cliente?.toLowerCase() || "";
      const direccion = pedido.Direccion?.toLowerCase() || "";
      const correo = pedido.Correo?.toLowerCase() || "";
      const estado = pedido.Estado?.toLowerCase() || "";
      const total = pedido.PrecioTotal?.toString() || "";

      return (
        cliente.includes(termino) ||
        direccion.includes(termino) ||
        correo.includes(termino) ||
        estado.includes(termino) ||
        total.includes(termino)
      );
    });
  }, [listaPedidos, terminoBusqueda]);

  // 📄 Calcular datos de paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
  const indiceInicio = (paginaActual - 1) * pedidosPorPagina;
  const indiceFin = indiceInicio + pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicio, indiceFin);

  // 🔄 Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // 🔄 Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // 👤 Manejar cambio de cliente en el formulario
  const handleClienteChange = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  // 📝 Función para cambiar el estado directamente
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      if (nuevoEstado === "Cancelado") {
        await CancelarPedido(id);
      }
      
      // Actualizar estado localmente
      setListaPedidos(
        listaPedidos.map((pedido) =>
          pedido.CodigoPedido === id ? { ...pedido, Estado: nuevoEstado } : pedido
        )
      );
      
      // Recargar datos para asegurar consistencia
      if (nuevoEstado === "Cancelado") {
        await cargarDatosIniciales();
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al cambiar el estado del pedido");
    }
  };

  // 💰 Función para manejar abonos
  const handleAbonar = async (id, montoAbono) => {
    try {
      // Actualizar localmente (necesitarías un servicio para esto)
      setListaPedidos(
        listaPedidos.map((pedido) => {
          if (pedido.CodigoPedido === id) {
            const nuevosAbonos = (pedido.Abonos || 0) + montoAbono;
            const nuevoEstado = nuevosAbonos >= pedido.PrecioTotal ? "Completado" : pedido.Estado;
            return { 
              ...pedido, 
              Abonos: nuevosAbonos,
              Estado: nuevoEstado
            };
          }
          return pedido;
        })
      );
    } catch (error) {
      console.error("Error procesando abono:", error);
      alert("Error al procesar el abono");
    }
  };

  // 💰 Mostrar modal de abono
  const mostrarAbono = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.CodigoPedido === id);
    if (pedido) {
      setPedidoSeleccionado(pedido);
      setShowAbono(true);
    }
  };

  // 🛍️ Función para encontrar y agregar productos
  const encontrarProducto = () => {
    const productId = productosRef.current.value;
    if (!productId) return;

    const product = listaProductos.find(p => 
      p.codigoProducto == productId || 
      p.id == productId ||
      p.codigoProducto?.toString() === productId
    );
    
    if (product) {
      setProductosAgregados(prev => {
        const productoExistente = prev.find(p => 
          p.codigoProducto === product.codigoProducto || 
          p.id === product.id
        );
        
        if (productoExistente) {
          const nuevaLista = prev.map(p => 
            (p.codigoProducto === product.codigoProducto || p.id === product.id)
              ? { 
                  ...p, 
                  cantidad: p.cantidad + 1, 
                  subtotal: (p.cantidad + 1) * (p.precio || p.precioVenta || 0) 
                }
              : p
          );
          calcularTotal(nuevaLista);
          return nuevaLista;
        } else {
          const nuevoProducto = { 
            ...product, 
            cantidad: 1, 
            subtotal: product.precio || product.precioVenta || 0,
            CodigoProducto: product.codigoProducto || product.id,
            NombreProducto: product.nombreProducto || product.nombre || "Producto sin nombre"
          };
          const nuevaLista = [...prev, nuevoProducto];
          calcularTotal(nuevaLista);
          return nuevaLista;
        }
      });
      
      productosRef.current.value = "";
    } else {
      alert("Producto no encontrado");
    }
  };

  // 🧮 Función para calcular el total
  const calcularTotal = (listaProductos) => {
    const total = listaProductos.reduce((acc, producto) => acc + (producto.subtotal || 0), 0);
    setTotalCalculado(total);
  };

  // ❌ Función para eliminar producto de la lista
  const eliminarProducto = (productId) => {
    setProductosAgregados(prev => {
      const nuevaLista = prev.filter(p => 
        p.codigoProducto !== productId && p.id !== productId
      );
      calcularTotal(nuevaLista);
      return nuevaLista;
    });
  };

  // 🔢 Función para cambiar cantidad de un producto
  const cambiarCantidad = (productId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productId);
      return;
    }

    setProductosAgregados(prev => {
      const nuevaLista = prev.map(p => 
        (p.codigoProducto === productId || p.id === productId)
          ? { 
              ...p, 
              cantidad: nuevaCantidad, 
              subtotal: nuevaCantidad * (p.precio || p.precioVenta || 0) 
            }
          : p
      );
      calcularTotal(nuevaLista);
      return nuevaLista;
    });
  };

  // 🧹 Función para limpiar productos agregados
  const limpiarProductos = () => {
    setProductosAgregados([]);
    setTotalCalculado(0);
  };

 // ➕ Manejar agregar pedido - VERSIÓN CORREGIDA
  const handleAgregarSubmit = async (e) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
      alert("Por favor selecciona un cliente");
      return;
    }

    if (productosAgregados.length === 0) {
      alert("Por favor agrega al menos un producto");
      return;
    }

    try {
      // Obtener el ID del cliente correctamente
      const clienteId = clienteSeleccionado.idCliente || 
                      clienteSeleccionado.codigoCliente || 
                      clienteSeleccionado.Id_Cliente || 
                      clienteSeleccionado.id;

      console.log("👤 Cliente seleccionado:", clienteSeleccionado);
      console.log("🆔 ID Cliente a usar:", clienteId);

      // Preparar los detalles correctamente
      const detalles = productosAgregados.map(producto => {
        const codigoProducto = producto.codigoProducto || producto.CodigoProducto || producto.id;
        console.log(`📦 Producto: ${producto.nombre || producto.nombreProducto}, ID: ${codigoProducto}, Cantidad: ${producto.cantidad}`);
        
        return {
          CodigoProducto: parseInt(codigoProducto),
          Cantidad: parseInt(producto.cantidad)
        };
      });

      console.log("📋 Detalles preparados:", detalles);

      const nuevoPedido = {
        IdCliente: parseInt(clienteId),
        FechaPedido: new Date().toISOString().split("T")[0],
        Detalles: detalles
      };

      console.log("🚀 Enviando pedido completo:", nuevoPedido);
      
      const resultado = await PostPedido(nuevoPedido);
      
      // Recargar la lista de pedidos
      await cargarDatosIniciales();
      
      setShowAgregar(false);
      limpiarProductos();
      setClienteSeleccionado(null);
      
      alert("Pedido creado exitosamente");
      
    } catch (error) {
      console.error("Error creando pedido:", error);
      alert("Error al crear el pedido: " + error.message);
    }
  };

  // ✏️ Manejar editar pedido (solo estado por ahora)
  const handleEditarSubmit = async (e, datosActualizados) => {
    e.preventDefault();

    try {
      // Actualizar solo el estado por ahora
      if (datosActualizados.Estado === "Cancelado") {
        await CancelarPedido(datosActualizados.CodigoPedido);
      }
      
      // Actualizar localmente
      setListaPedidos(
        listaPedidos.map((pedido) =>
          pedido.CodigoPedido === datosActualizados.CodigoPedido 
            ? { ...pedido, Estado: datosActualizados.Estado }
            : pedido
        )
      );
      
      closeModal();
      alert("Pedido actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      alert("Error al actualizar el pedido");
    }
  };

  // 🗑️ Manejar eliminar pedido
  const handleEliminar = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.CodigoPedido === id);
    if (pedido) {
      setPedidoAEliminar(pedido);
      setShowConfirmacion(true);
    }
  };

  // ✅ Confirmar eliminación
  const confirmarEliminacion = async () => {
    if (pedidoAEliminar) {
      try {
        // Cancelar en lugar de eliminar
        await CancelarPedido(pedidoAEliminar.CodigoPedido);
        
        // Recargar datos
        await cargarDatosIniciales();
        
        alert("Pedido cancelado exitosamente");
      } catch (error) {
        console.error("Error cancelando pedido:", error);
        alert("Error al cancelar el pedido");
      } finally {
        setPedidoAEliminar(null);
        setShowConfirmacion(false);
      }
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setPedidoAEliminar(null);
  };

  // 👀 Mostrar detalles del pedido
  const mostrarVer = async (id) => {
    try {
      console.log("🔍 Abriendo detalles del pedido ID:", id);
      
      // Establecer el pedido seleccionado con el ID
      setPedidoSeleccionado({ CodigoPedido: id });
      setShowVer(true);
      
    } catch (error) {
      console.error("Error cargando detalles:", error);
      alert("Error al cargar los detalles del pedido");
    }
  };

  // ✏️ Mostrar editar pedido
  const mostrarEditar = async (id) => {
    try {
      const pedido = listaPedidos.find((pedido) => pedido.CodigoPedido === id);
      
      if (pedido) {
        setFormData({
          ...pedido,
          Productos: pedido.Detalles || pedido.Productos || []
        });
        setShowEditar(true);
      }
    } catch (error) {
      console.error("Error cargando detalles:", error);
      alert("Error al cargar los detalles del pedido");
    }
  };

  // ❌ Cerrar modales
  const closeModal = () => {
    setShowEditar(false);
    setShowVer(false);
    setShowAbono(false);
    setPedidoSeleccionado(null);
    setClienteSeleccionado(null);
    setFormData({
      Cliente: "",
      IdCliente: "",
      Direccion: "",
      PrecioTotal: "",
      Correo: "",
      Estado: "",
      Abonos: "",
      Productos: [],
    });
  };

  // 💵 Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);
  };

  // 🎨 Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "En Proceso":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Completado":
        return "bg-green-100 text-green-800 border-green-300";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // 🔢 Generar números de página
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 7;
    
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }
    
    return numeros;
  };

  // ⏳ Mostrar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando pedidos...</div>
      </div>
    );
  }

  // ❌ Mostrar error
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={cargarDatosIniciales}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Pedidos</h2>
      </section>
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda 
            ref={busquedaRef}
            placeholder="Buscar por cliente, estado o total"
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {pedidosFiltrados.length} de {listaPedidos.length} pedidos
            </p>
          )}
        </div>
      </section>
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <TablaAdmin
          listaCabecera={["Cliente", "Fecha", "Total", "Estado", "Acciones"]}
        >
          {pedidosPaginados.length > 0 ? (
            pedidosPaginados.map((element) => (
              <tr
                key={element.CodigoPedido}
                className="hover:bg-gray-100 border-t-2 border-gray-300"
              >
                <td className="py-2 px-4 font-medium">{element.Cliente}</td>
                <td className="py-2 px-4 text-sm text-black">
                  {element.FechaPedido ? new Date(element.FechaPedido).toLocaleDateString('es-CO') : 'N/A'}
                </td>
                <td className="py-2 px-4 text-black">
                  {formatearMoneda(element.PrecioTotal)}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={element.Estado}
                    onChange={(e) => handleCambiarEstado(element.CodigoPedido, e.target.value)}
                    disabled={element.Estado === "Completado" || element.Estado === "Cancelado"}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${getEstadoColor(element.Estado)} ${
                      element.Estado === "Completado" || element.Estado === "Cancelado"
                        ? 'cursor-not-allowed opacity-70' 
                        : 'cursor-pointer hover:shadow-sm'
                    }`}
                    title={
                      element.Estado === "Completado" || element.Estado === "Cancelado"
                        ? "No se puede cambiar el estado de un pedido completado o cancelado"
                        : "Cambiar estado del pedido"
                    }
                  >
                    {estadosDisponibles.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <Icon
                    icon="material-symbols:visibility-outline"
                    width="24"
                    height="24"
                    className="text-green-700 cursor-pointer hover:text-green-800"
                    onClick={() => mostrarVer(element.CodigoPedido)}
                    title="Ver detalles"
                  />
                  <Icon
                    icon="material-symbols:edit-outline"
                    width="24"
                    height="24"
                    className="text-blue-700 cursor-pointer hover:text-blue-800"
                    onClick={() => mostrarEditar(element.CodigoPedido)}
                    title="Editar pedido"
                    disabled={element.Estado === "Completado" || element.Estado === "Cancelado"}
                  />
                  <Icon
                    icon="tabler:trash"
                    width="24"
                    height="24"
                    className={`cursor-pointer hover:text-red-800 ${
                      element.Estado === "Cancelado" 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-red-700"
                    }`}
                    onClick={() => element.Estado !== "Cancelado" && handleEliminar(element.CodigoPedido)}
                    title={
                      element.Estado === "Cancelado" 
                        ? "Pedido ya cancelado" 
                        : "Cancelar pedido"
                    }
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                {terminoBusqueda ? 
                  `No se encontraron pedidos que coincidan con "${terminoBusqueda}"` : 
                  "No hay pedidos disponibles"
                }
              </td>
            </tr>
          )}
        </TablaAdmin>
        </div>
      </section>

      {totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleCambioPagina={handleCambioPagina}
          generarNumerosPagina={generarNumerosPagina}
        />
      )}

      <FormularioAgregar
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        clienteRef={clienteRef}
        direccionRef={direccionRef}
        totalRef={totalRef}
        productosRef={productosRef}
        encontrarProducto={encontrarProducto}
        productosAgregados={productosAgregados}
        totalCalculado={totalCalculado}
        eliminarProducto={eliminarProducto}
        cambiarCantidad={cambiarCantidad}
        limpiarProductos={limpiarProductos}
        correoRef={correoRef}
        estadoRef={estadoRef}
        abonosRef={abonosRef}
        estadosDisponibles={estadosDisponibles}
        titulo="Agregar Nuevo Pedido"
        formatearMoneda={formatearMoneda}
        clientes={listaClientes}
        clienteSeleccionado={clienteSeleccionado}
        onClienteChange={handleClienteChange}
        productos={listaProductos}
      />

      <FormularioModificar
        show={showEditar}
        close={closeModal}
        formData={formData}
        onSubmit={handleEditarSubmit}
        clienteRef={clienteRef}
        direccionRef={direccionRef}
        totalRef={totalRef}
        correoRef={correoRef}
        estadoRef={estadoRef}
        abonosRef={abonosRef}
        estadosDisponibles={estadosDisponibles}
        titulo="Modificar Pedido"
        formatearMoneda={formatearMoneda}
        clientes={listaClientes}
      />

      <FormularioVer
        show={showVer}
        close={closeModal}
        codigoPedido={pedidoSeleccionado?.CodigoPedido} // Pasa solo el ID
        titulo="Detalles del Pedido"
        formatearMoneda={formatearMoneda}
      />

      <FormularioAbono
        show={showAbono}
        close={closeModal}
        pedido={pedidoSeleccionado}
        onAbonar={handleAbonar}
        formatearMoneda={formatearMoneda}
      />

      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarEliminacion}
        titulo="Cancelar Pedido"
        mensaje="¿Estás seguro de que deseas cancelar este pedido?"
        detalles={pedidoAEliminar && (
          <>
            <div><strong>Cliente:</strong> {pedidoAEliminar.Cliente}</div>
            <div><strong>Total:</strong> {formatearMoneda(pedidoAEliminar.PrecioTotal)}</div>
            <div><strong>Estado:</strong> {pedidoAEliminar.Estado}</div>
            <div><strong>Fecha:</strong> {pedidoAEliminar.FechaPedido ? new Date(pedidoAEliminar.FechaPedido).toLocaleDateString('es-CO') : 'N/A'}</div>
          </>
        )}
        textoConfirmar="Cancelar Pedido"
        textoCancelar="Mantener"
        tipoIcono="warning"
        colorConfirmar="red"
      />
    </>
  );
};

export default PaginaPedidos;