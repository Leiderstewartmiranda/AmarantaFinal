import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import { useRef, useState, useMemo } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVer from "../components/forms/FormularioVer";
import FormularioAbono from "../components/forms/FormularioAbono";
import { productos } from "../utils/ListaProductos";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";

const PaginaPedidos = () => {
  // Lista de clientes - idealmente esto vendría de un contexto global o props
  const [listaClientes] = useState([
    {
      Id_Cliente: 1,
      Documento: "123456789",
      Nombre: "Juan",
      Apellido: "Pérez",
      Correo: "juan.perez@example.com",
      Telefono: "3001234567",
      Id_Rol: 1,
    },
    {
      Id_Cliente: 2,
      Documento: "987654321",
      Nombre: "María",
      Apellido: "Gómez",
      Correo: "maria.gomez@example.com",
      Telefono: "3007654321",
      Id_Rol: 2,
    },
    {
      Id_Cliente: 3,
      Documento: "456789123",
      Nombre: "Carlos",
      Apellido: "López",
      Correo: "carlos.lopez@example.com",
      Telefono: "3009876543",
      Id_Rol: 1,
    },
    {
      Id_Cliente: 4,
      Documento: "321654987",
      Nombre: "Ana",
      Apellido: "Martínez",
      Correo: "ana.martinez@example.com",
      Telefono: "3006543210",
      Id_Rol: 2,
    },
    {
      Id_Cliente: 5,
      Documento: "159753486",
      Nombre: "Luis",
      Apellido: "Hernández",
      Correo: "luis.hernandez@example.com",
      Telefono: "3003216549",
      Id_Rol: 1,
    },
    {
      Id_Cliente: 6,
      Documento: "753159486",
      Nombre: "Sofía",
      Apellido: "Torres",
      Correo: "sofia.torres@example.com",
      Telefono: "3009871234",
      Id_Rol: 2,
    },
  ]);

  const [listaPedidos, setListaPedidos] = useState([
    {
      Id_Pedido: 1,
      Cliente: "Juan Pérez",
      Id_Cliente: 1,
      Direccion: "Calle 123 #45-67, Medellín",
      Total: 150000,
      Correo: "juan.perez@example.com",
      Estado: "Pendiente",
      Abonos: 50000,
    },
    {
      Id_Pedido: 2,
      Cliente: "María Gómez",
      Id_Cliente: 2,
      Direccion: "Carrera 80 #30-25, Medellín",
      Total: 280000,
      Correo: "maria.gomez@example.com",
      Estado: "En Proceso",
      Abonos: 100000,
    },
    {
      Id_Pedido: 3,
      Cliente: "Carlos López",
      Id_Cliente: 3,
      Direccion: "Avenida 70 #52-18, Medellín",
      Total: 95000,
      Correo: "carlos.lopez@example.com",
      Estado: "Completado",
      Abonos: 95000,
    },
    {
      Id_Pedido: 4,
      Cliente: "Ana Martínez",
      Id_Cliente: 4,
      Direccion: "Calle 50 #25-30, Medellín",
      Total: 320000,
      Correo: "ana.martinez@example.com",
      Estado: "Cancelado",
      Abonos: 0,
    },
    {
      Id_Pedido: 5,
      Cliente: "Luis Hernández",
      Id_Cliente: 5,
      Direccion: "Carrera 65 #40-15, Medellín",
      Total: 200000,
      Correo: "luis.hernandez@example.com",
      Estado: "Pendiente",
      Abonos: 80000,
    },
    {
      Id_Pedido: 6,
      Cliente: "Sofía Torres",
      Id_Cliente: 6,
      Direccion: "Calle 30 #60-45, Medellín",
      Total: 175000,
      Correo: "sofia.torres@example.com",
      Estado: "En Proceso",
      Abonos: 175000,
    },
    // Agregando más pedidos para probar la paginación
    {
      Id_Pedido: 7,
      Cliente: "Roberto Silva",
      Id_Cliente: 7,
      Direccion: "Carrera 45 #20-10, Medellín",
      Total: 125000,
      Correo: "roberto.silva@example.com",
      Estado: "Pendiente",
      Abonos: 25000,
    },
    {
      Id_Pedido: 8,
      Cliente: "Carmen Ruiz",
      Id_Cliente: 8,
      Direccion: "Calle 78 #35-42, Medellín",
      Total: 350000,
      Correo: "carmen.ruiz@example.com",
      Estado: "En Proceso",
      Abonos: 150000,
    },
    {
      Id_Pedido: 9,
      Cliente: "Diego Vargas",
      Id_Cliente: 9,
      Direccion: "Avenida 52 #28-15, Medellín",
      Total: 90000,
      Correo: "diego.vargas@example.com",
      Estado: "Completado",
      Abonos: 90000,
    },
    {
      Id_Pedido: 10,
      Cliente: "Laura Fernández",
      Id_Cliente: 10,
      Direccion: "Carrera 33 #55-20, Medellín",
      Total: 240000,
      Correo: "laura.fernandez@example.com",
      Estado: "Pendiente",
      Abonos: 60000,
    },
    {
      Id_Pedido: 11,
      Cliente: "Pedro Ramírez",
      Id_Cliente: 11,
      Direccion: "Calle 15 #40-25, Medellín",
      Total: 180000,
      Correo: "pedro.ramirez@example.com",
      Estado: "En Proceso",
      Abonos: 90000,
    },
    {
      Id_Pedido: 12,
      Cliente: "Lucía Morales",
      Id_Cliente: 12,
      Direccion: "Avenida 85 #60-30, Medellín",
      Total: 310000,
      Correo: "lucia.morales@example.com",
      Estado: "Cancelado",
      Abonos: 0,
    },
  ]);

  const [productosAgregados, setProductosAgregados] = useState([]);
  const [totalCalculado, setTotalCalculado] = useState(0);
  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [showAbono, setShowAbono] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 5; // Número de pedidos por página
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    Cliente: "",
    Id_Cliente: "",
    Direccion: "",
    Total: "",
    Productos: [],
    Correo: "",
    Estado: "",
    Abonos: "",
  });

  const clienteRef = useRef();
  const direccionRef = useRef();
  const totalRef = useRef();
  const correoRef = useRef();
  const estadoRef = useRef();
  const abonosRef = useRef();
  const busquedaRef = useRef();
  const productosRef = useRef();

  const estadosDisponibles = ["Pendiente", "En Proceso", "Completado", "Cancelado"];

  // Filtrar pedidos basado en el término de búsqueda
  const pedidosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaPedidos;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaPedidos.filter((pedido) => {
      const cliente = pedido.Cliente.toLowerCase();
      const direccion = pedido.Direccion.toLowerCase();
      const correo = pedido.Correo.toLowerCase();
      const estado = pedido.Estado.toLowerCase();
      const total = pedido.Total.toString();

      return (
        cliente.includes(termino) ||
        direccion.includes(termino) ||
        correo.includes(termino) ||
        estado.includes(termino) ||
        total.includes(termino)
      );
    });
  }, [listaPedidos, terminoBusqueda]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
  const indiceInicio = (paginaActual - 1) * pedidosPorPagina;
  const indiceFin = indiceInicio + pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicio, indiceFin);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1); // Resetear a la primera página cuando se busca
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Función para manejar cambio de cliente en el formulario
  const handleClienteChange = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  // Nueva función para cambiar el estado directamente
  const handleCambiarEstado = (id, nuevoEstado) => {
    setListaPedidos(
      listaPedidos.map((pedido) =>
        pedido.Id_Pedido === id ? { ...pedido, Estado: nuevoEstado } : pedido
      )
    );
  };

  // Función para manejar abonos
  const handleAbonar = (id, montoAbono) => {
    setListaPedidos(
      listaPedidos.map((pedido) => {
        if (pedido.Id_Pedido === id) {
          const nuevosAbonos = pedido.Abonos + montoAbono;
          // Si el abono completa el total, cambiar estado a Completado
          const nuevoEstado = nuevosAbonos >= pedido.Total ? "Completado" : pedido.Estado;
          return { 
            ...pedido, 
            Abonos: nuevosAbonos,
            Estado: nuevoEstado
          };
        }
        return pedido;
      })
    );
  };

  // Función para mostrar modal de abono
  const mostrarAbono = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.Id_Pedido === id);
    if (pedido) {
      setPedidoSeleccionado(pedido);
      setShowAbono(true);
    }
  };

  // Función mejorada para encontrar y agregar productos
  const encontrarProducto = () => {
    const productId = productosRef.current.value;
    if (!productId) return;

    const product = productos.find(p => p.id_producto == productId);
    
    if (product) {
      setProductosAgregados(prev => {
        // Buscar si el producto ya existe en la lista
        const productoExistente = prev.find(p => p.id_producto === product.id_producto);
        
        if (productoExistente) {
          // Si existe, aumentar la cantidad
          const nuevaLista = prev.map(p => 
            p.id_producto === product.id_producto 
              ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
              : p
          );
          calcularTotal(nuevaLista);
          return nuevaLista;
        } else {
          // Si no existe, agregarlo con cantidad 1
          const nuevoProducto = { 
            ...product, 
            cantidad: 1, 
            subtotal: product.precio 
          };
          const nuevaLista = [...prev, nuevoProducto];
          calcularTotal(nuevaLista);
          return nuevaLista;
        }
      });
      
      // Resetear el select
      productosRef.current.value = "";
    } else {
      console.log("Producto no encontrado");
    }
  };

  // Función para calcular el total
  const calcularTotal = (listaProductos) => {
    const total = listaProductos.reduce((acc, producto) => acc + producto.subtotal, 0);
    setTotalCalculado(total);
  };

  // Función para eliminar producto de la lista
  const eliminarProducto = (productId) => {
    setProductosAgregados(prev => {
      const nuevaLista = prev.filter(p => p.id_producto !== productId);
      calcularTotal(nuevaLista);
      return nuevaLista;
    });
  };

  // Función para cambiar cantidad de un producto
  const cambiarCantidad = (productId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productId);
      return;
    }

    setProductosAgregados(prev => {
      const nuevaLista = prev.map(p => 
        p.id_producto === productId 
          ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio }
          : p
      );
      calcularTotal(nuevaLista);
      return nuevaLista;
    });
  };

  // Función para limpiar productos agregados
  const limpiarProductos = () => {
    setProductosAgregados([]);
    setTotalCalculado(0);
  };

  const handleAgregarSubmit = (e) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
      alert("Por favor selecciona un cliente");
      return;
    }

    const pedido = {
      Id_Pedido: listaPedidos.length + 1,
      Cliente: `${clienteSeleccionado.Nombre} ${clienteSeleccionado.Apellido}`,
      Id_Cliente: clienteSeleccionado.Id_Cliente,
      Direccion: direccionRef.current.value,
      Total: totalCalculado,
      Correo: clienteSeleccionado.Correo,
      Estado: estadoRef.current.value,
      Abonos: parseFloat(abonosRef.current.value) || 0,
      Productos: productosAgregados
    };

    setListaPedidos([...listaPedidos, pedido]);
    setShowAgregar(false);
    
    // Limpiar el formulario
    limpiarProductos();
    setClienteSeleccionado(null);
    direccionRef.current.value = "";
    estadoRef.current.value = "";
    abonosRef.current.value = "0";
  };

  const handleEditarSubmit = (e, datosActualizados) => {
  e.preventDefault();

  // Usar los datos que vienen del formulario modificar
  const updatedPedido = {
    Id_Pedido: datosActualizados.Id_Pedido,
    Cliente: datosActualizados.Cliente,
    Id_Cliente: datosActualizados.Id_Cliente,
    Direccion: datosActualizados.Direccion,
    Total: datosActualizados.Total,
    Correo: datosActualizados.Correo,
    Estado: datosActualizados.Estado,
    Abonos: datosActualizados.Abonos,
    Productos: datosActualizados.Productos || []
  };
    setListaPedidos(
      listaPedidos.map((pedido) =>
        pedido.Id_Pedido === datosActualizados.Id_Pedido ? updatedPedido : pedido
      )
    );
    closeModal();
  };

  const handleEliminar = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.Id_Pedido === id);
    if (pedido) {
      setPedidoAEliminar(pedido);
      setShowConfirmacion(true);
    }
  };

  const confirmarEliminacion = () => {
    if (pedidoAEliminar) {
      setListaPedidos(
        listaPedidos.filter((pedido) => pedido.Id_Pedido !== pedidoAEliminar.Id_Pedido)
      );
      setPedidoAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setPedidoAEliminar(null);
  };

  const mostrarVer = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.Id_Pedido === id);

    if (pedido) {
      setFormData({
        Cliente: pedido.Cliente,
        Id_Cliente: pedido.Id_Cliente,
        Direccion: pedido.Direccion,
        Total: pedido.Total,
        Correo: pedido.Correo,
        Estado: pedido.Estado,
        Abonos: pedido.Abonos,
        Id_Pedido: pedido.Id_Pedido,
        Productos: pedido.Productos || [],
      });
      setShowVer(true);
    }
  };

  const mostrarEditar = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.Id_Pedido === id);

    if (pedido) {
      setFormData({
        Cliente: pedido.Cliente,
        Id_Cliente: pedido.Id_Cliente,
        Direccion: pedido.Direccion,
        Total: pedido.Total,
        Correo: pedido.Correo,
        Estado: pedido.Estado,
        Abonos: pedido.Abonos,
        Id_Pedido: pedido.Id_Pedido,
        Productos: pedido.Productos || [],
      });
      setShowEditar(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setShowVer(false);
    setShowAbono(false);
    setPedidoSeleccionado(null);
    setClienteSeleccionado(null);
    setFormData({
      Cliente: "",
      Id_Cliente: "",
      Direccion: "",
      Total: "",
      Correo: "",
      Estado: "",
      Abonos: "",
      Productos: [],
    });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

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

  // Función para generar los números de página
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 7; // Número máximo de páginas visibles
    
    if (totalPaginas <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      if (paginaActual <= 4) {
        // Mostrar las primeras páginas
        for (let i = 1; i <= 5; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        // Mostrar las últimas páginas
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        // Mostrar páginas alrededor de la actual
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
            placeholder="Buscar pedidos"
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
          listaCabecera={["Cliente", "Dirección", "Total", "Estado", "Abonos", "Acciones"]}
        >
          {pedidosPaginados.length > 0 ? (
            pedidosPaginados.map((element) => (
              <tr
                key={element.Id_Pedido}
                className="hover:bg-gray-100 border-t-2 border-gray-300"
              >
                <td className="py-2 px-4 font-medium">{element.Cliente}</td>
                <td className="py-2 px-4 text-sm text-black max-w-xs truncate">
                  {element.Direccion}
                </td>
                <td className="py-2 px-4 text-black">
                  {formatearMoneda(element.Total)}
                </td>
                <td className="py-2 px-4">
                  {/* Desplegable dinámico para cambiar estado */}
                  <select
                    value={element.Estado}
                    onChange={(e) => handleCambiarEstado(element.Id_Pedido, e.target.value)}
                    disabled={element.Abonos >= element.Total}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${getEstadoColor(element.Estado)} ${
                      element.Abonos >= element.Total
                        ? 'cursor-not-allowed opacity-70' 
                        : 'cursor-pointer hover:shadow-sm'
                    }`}
                    title={
                      element.Abonos >= element.Total
                        ? "No se puede cambiar el estado de un pedido completamente pagado"
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
                <td className="py-2 px-4">
                  {element.Abonos >= element.Total || element.Estado === "Completado" ? (
                    <button 
                      className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium cursor-default"
                      disabled
                    >
                      Pagado
                    </button>
                  ) : element.Estado === "Cancelado" ? (
                    <button 
                      className="bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium cursor-default"
                      disabled
                    >
                      Cancelado
                    </button>
                  ) : (
                    <button 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                      onClick={() => mostrarAbono(element.Id_Pedido)}
                      title={`Abonado: ${formatearMoneda(element.Abonos)} de ${formatearMoneda(element.Total)}`}
                    >
                      Abonar
                    </button>
                  )}
                </td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <Icon
                    icon="material-symbols:visibility-outline"
                    width="24"
                    height="24"
                    className="text-green-700 cursor-pointer hover:text-green-800"
                    onClick={() => mostrarVer(element.Id_Pedido)}
                    title="Ver detalles"
                  />
                  <Icon
                    icon="material-symbols:edit-outline"
                    width="24"
                    height="24"
                    className="text-blue-700 cursor-pointer hover:text-blue-800"
                    onClick={() => mostrarEditar(element.Id_Pedido)}
                    title="Editar pedido"
                  />
                  <Icon
                    icon="tabler:trash"
                    width="24"
                    height="24"
                    className="text-red-700 cursor-pointer hover:text-red-800"
                    onClick={() => handleEliminar(element.Id_Pedido)}
                    title="Eliminar pedido"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
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
        // Props para manejo de clientes
        clientes={listaClientes}
        clienteSeleccionado={clienteSeleccionado}
        onClienteChange={handleClienteChange}
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
        // Props para manejo de clientes
        clientes={listaClientes}
      />

      <FormularioVer
        show={showVer}
        close={closeModal}
        formData={formData}
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
        titulo="Anular Pedido"
        mensaje="¿Estás seguro de que deseas Anular este pedido?"
        detalles={pedidoAEliminar && (
          <>
            <div><strong>Cliente:</strong> {pedidoAEliminar.Cliente}</div>
            <div><strong>Total:</strong> {formatearMoneda(pedidoAEliminar.Total)}</div>
            <div><strong>Estado:</strong> {pedidoAEliminar.Estado}</div>
            <div><strong>Dirección:</strong> {pedidoAEliminar.Direccion}</div>
          </>
        )}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipoIcono="danger"
        colorConfirmar="red"
      />
    </>
  );
};

export default PaginaPedidos;