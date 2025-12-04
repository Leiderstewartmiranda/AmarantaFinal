import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import { useRef, useState, useMemo, useEffect } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVer from "../components/forms/FormularioVer";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import {
  GetPedidos,
  GetPedidoById,
  PostPedido,
  CancelarPedido,
  GetClientes,
  GetProductos,
  ActualizarEstadoPedido
} from "../../../../services/pedidoService";
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

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
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 7;
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estado para ordenamiento - MODIFICADO: orden por defecto descendente por código de pedido
  const [ordenamiento, setOrdenamiento] = useState({
    columna: 'CodigoPedido', // Ordenar por código de pedido por defecto
    direccion: 'desc' // Orden descendente por defecto (más recientes primero)
  });

  const [formData, setFormData] = useState({
    Cliente: "",
    IdCliente: "",
    Direccion: "",
    PrecioTotal: "",
    Productos: [],
    Correo: "",
    Estado: "",
    Municipio: "",
    Departamento: ""
  });

  // Refs
  const clienteRef = useRef();
  const direccionRef = useRef();
  const totalRef = useRef();
  const correoRef = useRef();
  const estadoRef = useRef();
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

      Swal.fire({
        icon: "error",
        title: "❌ Error al cargar",
        text: "No se pudieron cargar los datos iniciales",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
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
      FechaPedido: pedido.fechaPedido || pedido.FechaPedido,
      Productos: pedido.detalles || pedido.Detalles || [],
      Detalles: pedido.detalles || pedido.Detalles || [] // Para compatibilidad con formularios
    };
  };

  // 🔹 Función para ordenar
  const handleOrdenar = (columna) => {
    setOrdenamiento(prev => {
      if (prev.columna === columna) {
        return {
          columna,
          direccion: prev.direccion === 'asc' ? 'desc' : 'asc'
        };
      } else {
        return {
          columna,
          direccion: 'asc'
        };
      }
    });
  };

  // 🔹 Función para aplicar filtros
  const aplicarFiltros = () => {
    setPaginaActual(1);
  };

  // 🔹 Función para obtener el icono de ordenamiento
  const getSortIcon = (columna) => {
    if (ordenamiento.columna !== columna) {
      return <i className="fa-solid fa-sort ml-1 text-xs opacity-70"></i>;
    }
    return ordenamiento.direccion === 'asc'
      ? <i className="fa-solid fa-sort-up ml-1 text-xs opacity-70"></i>
      : <i className="fa-solid fa-sort-down ml-1 text-xs opacity-70"></i>;
  };

  // 🔹 Configuración de las columnas con ordenamiento
  const columnasConOrdenamiento = [
    {
      titulo: "Cliente",
      onClick: () => handleOrdenar('Cliente'),
      icono: getSortIcon('Cliente')
    },
    {
      titulo: "Fecha",
      onClick: () => handleOrdenar('FechaPedido'),
      icono: getSortIcon('FechaPedido')
    },
    {
      titulo: "Total",
      onClick: () => handleOrdenar('PrecioTotal'),
      icono: getSortIcon('PrecioTotal')
    },
    {
      titulo: "Estado",
      onClick: () => handleOrdenar('Estado'),
      icono: getSortIcon('Estado')
    },
    "Acciones"
  ];

  // 🔹 Filtrar y ordenar pedidos - MEJORADA la lógica de ordenamiento
  const pedidosFiltrados = useMemo(() => {
    let filtrados = listaPedidos;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda.trim()) {
      const termino = terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((pedido) => {
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
    }

    // Aplicar filtro de cliente
    if (filtroCliente) {
      filtrados = filtrados.filter(pedido =>
        pedido.IdCliente === parseInt(filtroCliente)
      );
    }

    // Aplicar filtro de estado
    if (filtroEstado) {
      filtrados = filtrados.filter(pedido => pedido.Estado === filtroEstado);
    }

    // Aplicar filtro de fecha
    if (filtroFecha) {
      const hoy = new Date();
      const fechaPedido = new Date();

      switch (filtroFecha) {
        case "hoy":
          filtrados = filtrados.filter(pedido => {
            const fechaPedido = new Date(pedido.FechaPedido);
            return fechaPedido.toDateString() === hoy.toDateString();
          });
          break;
        case "semana":
          const haceUnaSemana = new Date();
          haceUnaSemana.setDate(hoy.getDate() - 7);
          filtrados = filtrados.filter(pedido => {
            const fechaPedido = new Date(pedido.FechaPedido);
            return fechaPedido >= haceUnaSemana;
          });
          break;
        case "mes":
          const haceUnMes = new Date();
          haceUnMes.setMonth(hoy.getMonth() - 1);
          filtrados = filtrados.filter(pedido => {
            const fechaPedido = new Date(pedido.FechaPedido);
            return fechaPedido >= haceUnMes;
          });
          break;
        default:
          break;
      }
    }

    // Aplicar ordenamiento
    if (ordenamiento.columna) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue = a[ordenamiento.columna];
        let bValue = b[ordenamiento.columna];

        // Para columnas de fecha
        if (ordenamiento.columna === 'FechaPedido') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Para columnas numéricas (código de pedido y precio total)
        if (ordenamiento.columna === 'PrecioTotal' || ordenamiento.columna === 'CodigoPedido') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        // Manejar valores null/undefined en strings
        if (typeof aValue === 'string') aValue = aValue.toLowerCase() || '';
        if (typeof bValue === 'string') bValue = bValue.toLowerCase() || '';

        if (ordenamiento.direccion === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtrados;
  }, [listaPedidos, terminoBusqueda, filtroCliente, filtroEstado, filtroFecha, ordenamiento]);

  // 📄 Calcular datos de paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
  const indiceInicio = (paginaActual - 1) * pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicio, indiceInicio + pedidosPorPagina);

  // Ajustar página actual si es necesario
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    } else if (paginaActual < 1 && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

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
      } else {
        await ActualizarEstadoPedido(id, nuevoEstado);
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

      Swal.fire({
        icon: "success",
        title: "✅ Estado actualizado",
        text: `El pedido ha sido ${nuevoEstado.toLowerCase()} correctamente`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error cambiando estado:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cambiar estado",
        text: "No se pudo cambiar el estado del pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const getCodigo = (p) =>
    (p.codigoProducto ?? p.id ?? p.idProducto)?.toString();

  // 🛍️ Función para encontrar y agregar productos
  const encontrarProducto = () => {
    const productId = productosRef.current.value?.toString();
    if (!productId) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Campo vacío",
        text: "Por favor ingresa un código de producto",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    const product = listaProductos.find(p => getCodigo(p) === productId);
    if (!product) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Producto no encontrado",
        text: "No se encontró ningún producto con ese código",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    setProductosAgregados(prev => {
      const existe = prev.find(p => getCodigo(p) === productId);

      const nuevaLista = existe
        ? prev.map(p =>
          getCodigo(p) === productId
            ? {
              ...p,
              cantidad: p.cantidad + 1,
              subtotal: (p.cantidad + 1) * (p.precio || p.precioVenta || 0)
            }
            : p
        )
        : [
          ...prev,
          {
            ...product,
            cantidad: 1,
            subtotal: product.precio || product.precioVenta || 0,
          },
        ];

      calcularTotal(nuevaLista);
      return nuevaLista;
    });

    productosRef.current.value = "";
  };

  // 🧮 Función para calcular el total
  const calcularTotal = (listaProductos) => {
    const total = listaProductos.reduce((acc, producto) => acc + (producto.subtotal || 0), 0);
    setTotalCalculado(total);
  };

  // ❌ Función para eliminar producto de la lista
  const eliminarProducto = (productId) => {
    setProductosAgregados(prev => {
      const nuevaLista = prev.filter(p => getCodigo(p) !== productId.toString());
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
        getCodigo(p) === productId.toString()
          ? {
            ...p,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * (p.precio || p.precioVenta || 0),
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
  const handleAgregarSubmit = async (e, formDataAdicional) => {
    e.preventDefault();

    console.log("📝 HandleAgregarSubmit llamado", { formDataAdicional });

    // 🔥 USAR formDataAdicional si viene, sino usar los estados existentes
    const datos = formDataAdicional || {
      clienteSeleccionado,
      productosAgregados,
      totalCalculado,
      direccion: direccionRef.current?.value || "",
      correo: correoRef.current?.value || "",
      estado: estadoRef.current?.value || "Pendiente",
      municipio: "",
      departamento: ""
    };

    console.log("📦 Datos a procesar:", datos);

    if (!datos.clienteSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cliente requerido",
        text: "Por favor selecciona un cliente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    if (datos.productosAgregados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Productos requeridos",
        text: "Por favor agrega al menos un producto",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    // 🔥 VALIDAR CAMPOS NUEVOS
    if (!datos.direccion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Dirección requerida",
        text: "Por favor ingresa la dirección de entrega",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    if (!datos.municipio.trim()) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Municipio requerido",
        text: "Por favor ingresa el municipio",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    if (!datos.departamento.trim()) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Departamento requerido",
        text: "Por favor ingresa el departamento",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    // 🔻 VALIDAR STOCK DISPONIBLE
    for (const item of datos.productosAgregados) {
      const codigo = item.codigoProducto || item.CodigoProducto || item.id;
      const productoOriginal = listaProductos.find(p => getCodigo(p) === codigo.toString());

      if (productoOriginal) {
        const stockDisponible = productoOriginal.stock || productoOriginal.Stock || 0;
        const cantidadSolicitada = parseInt(item.cantidad);

        if (cantidadSolicitada > stockDisponible) {
          const nombreProducto = productoOriginal.nombreProducto || productoOriginal.NombreProducto || "Producto";
          Swal.fire({
            icon: "error",
            title: "❌ Stock insuficiente",
            text: `El producto "${nombreProducto}" solo tiene ${stockDisponible} unidades disponibles. No se pueden ordenar ${cantidadSolicitada} unidades.`,
            confirmButtonColor: "#b45309",
            background: "#fff8e7",
          });
          return;
        }
      }
    }
    // 🔺 FIN VALIDAR STOCK

    try {
      const clienteId = datos.clienteSeleccionado.idCliente ||
        datos.clienteSeleccionado.codigoCliente ||
        datos.clienteSeleccionado.Id_Cliente ||
        datos.clienteSeleccionado.id;

      console.log("👤 Cliente seleccionado:", datos.clienteSeleccionado);
      console.log("📍 Datos de envío:", {
        direccion: datos.direccion,
        municipio: datos.municipio,
        departamento: datos.departamento,
        correo: datos.correo
      });

      const detalles = datos.productosAgregados.map(producto => {
        const codigoProducto = producto.codigoProducto || producto.CodigoProducto || producto.id;
        return {
          CodigoProducto: parseInt(codigoProducto),
          Cantidad: parseInt(producto.cantidad)
        };
      });

      const nuevoPedido = {
        IdCliente: parseInt(clienteId),
        FechaPedido: new Date().toISOString().split("T")[0],
        Detalles: detalles,
        // 🔥 INCLUIR TODOS LOS CAMPOS REQUERIDOS
        Correo: datos.correo,
        Direccion: datos.direccion,
        Municipio: datos.municipio,
        Departamento: datos.departamento,
        Estado: datos.estado
      };

      console.log("🚀 Enviando pedido completo:", nuevoPedido);

      const resultado = await PostPedido(nuevoPedido);

      await cargarDatosIniciales();
      setShowAgregar(false);
      limpiarProductos();
      setClienteSeleccionado(null);

      Swal.fire({
        icon: "success",
        title: "✅ Pedido creado",
        text: "El pedido se ha creado exitosamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });

    } catch (error) {
      console.error("Error creando pedido:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al crear pedido",
        text: "No se pudo crear el pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  // ✏️ Manejar editar pedido (solo estado por ahora)
  const handleEditarSubmit = async (e, datosActualizados) => {
    e.preventDefault();

    try {
      // Actualizar solo el estado por ahora
      if (datosActualizados.Estado === "Cancelado") {
        await CancelarPedido(datosActualizados.CodigoPedido);
      } else {
        await ActualizarEstadoPedido(datosActualizados.CodigoPedido, datosActualizados.Estado);
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

      Swal.fire({
        icon: "success",
        title: "✅ Pedido actualizado",
        text: "El pedido se ha actualizado exitosamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al actualizar",
        text: "No se pudo actualizar el pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  // 🗑️ Manejar eliminar pedido
  const handleEliminar = (id) => {
    const pedido = listaPedidos.find((pedido) => pedido.CodigoPedido === id);
    if (pedido) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Confirmar cancelación",
        html: `¿Estás seguro de que deseas cancelar este pedido?<br><br>
               <div class="text-left">
                 <p><strong>Cliente:</strong> ${pedido.Cliente}</p>
                 <p><strong>Total:</strong> ${formatearMoneda(pedido.PrecioTotal)}</p>
                 <p><strong>Estado:</strong> ${pedido.Estado}</p>
                 <p><strong>Fecha:</strong> ${pedido.FechaPedido ? new Date(pedido.FechaPedido).toLocaleDateString('es-CO') : 'N/A'}</p>
               </div>`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Cerrar"
      }).then((result) => {
        if (result.isConfirmed) {
          confirmarEliminacion(pedido);
        }
      });
    }
  };

  // ✅ Confirmar eliminación
  const confirmarEliminacion = async (pedido) => {
    if (!pedido) return;

    try {
      // Cancelar en lugar de eliminar
      await CancelarPedido(pedido.CodigoPedido);

      // Recargar datos
      await cargarDatosIniciales();

      Swal.fire({
        icon: "success",
        title: "✅ Pedido cancelado",
        text: "El pedido se ha cancelado exitosamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error cancelando pedido:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cancelar",
        text: "No se pudo cancelar el pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
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
      Swal.fire({
        icon: "error",
        title: "❌ Error al cargar",
        text: "No se pudieron cargar los detalles del pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
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
      Swal.fire({
        icon: "error",
        title: "❌ Error al cargar",
        text: "No se pudieron cargar los detalles del pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  // ❌ Cerrar modales
  const closeModal = () => {
    setShowEditar(false);
    setShowVer(false);
    setPedidoSeleccionado(null);
    setClienteSeleccionado(null);
    setFormData({
      Cliente: "",
      IdCliente: "",
      Direccion: "",
      PrecioTotal: "",
      Correo: "",
      Estado: "",
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
    <div className="flex flex-col gap-6">
      <TituloSeccion titulo="Gestión de Pedidos" />
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <section className="col-span-2">
          <div className="filtros flex items-center gap-2 mb-1">
            <select
              value={filtroCliente}
              onChange={(e) => {
                setFiltroCliente(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los clientes</option>
              {listaClientes.map(cliente => (
                <option key={cliente.idCliente} value={cliente.idCliente}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los estados</option>
              {estadosDisponibles.map(estado => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <select
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
            </select>
          </div>
        </section>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda
            ref={busquedaRef}
            placeholder="Buscar por cliente, estado o total"
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
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
          <TablaAdmin listaCabecera={columnasConOrdenamiento}>
            {pedidosPaginados.length > 0 ? (
              pedidosPaginados.map((element) => (
                <tr
                  key={element.CodigoPedido}
                  className={`hover:bg-gray-100 border-t-2 border-gray-300 ${element.Estado === "Cancelado" ? "bg-red-50 text-gray-500" : ""
                    }`}
                >
                  <td className="py-2 px-4 font-medium">{element.Cliente}</td>
                  <td className="py-2 px-4 text-sm text-black">
                    {element.FechaPedido ? new Date(element.FechaPedido).toLocaleDateString('es-CO') : 'N/A'}
                  </td>
                  <td className="py-2 px-4 text-black">
                    {formatearMoneda(element.PrecioTotal)}
                  </td>
                  <td className="py-1 px-4">
                    <select
                      value={element.Estado}
                      onChange={(e) => handleCambiarEstado(element.CodigoPedido, e.target.value)}
                      disabled={element.Estado === "Completado" || element.Estado === "Cancelado"}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${getEstadoColor(element.Estado)} ${element.Estado === "Completado" || element.Estado === "Cancelado"
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
                      icon="tabler:trash"
                      width="24"
                      height="24"
                      className={`cursor-pointer hover:text-red-800 ${element.Estado === "Cancelado"
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
                  {terminoBusqueda || filtroCliente || filtroEstado || filtroFecha ?
                    `No se encontraron pedidos que coincidan con los filtros aplicados` :
                    "No hay pedidos disponibles"}
                </td>
              </tr>
            )}
          </TablaAdmin>
        </div>
      </section>

      {/* 🔹 Paginación con información de resultados */}
      {
        totalPaginas > 1 && (
          <div className="col-span-2 mt-1">
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              handleCambioPagina={handleCambioPagina}
            />
            <p className="text-sm text-gray-600 text-center mt-2">
              Página {paginaActual} de {totalPaginas} - {pedidosFiltrados.length} pedidos encontrados
              {(filtroCliente || filtroEstado || filtroFecha || terminoBusqueda) && " (filtrados)"}
            </p>
          </div>
        )
      }

      {/* 🔹 Mostrar info cuando hay filtros pero solo una página */}
      {
        totalPaginas === 1 && pedidosFiltrados.length > 0 && (
          <div className="col-span-2 mt-1">
            <p className="text-sm text-gray-600 text-center">
              Mostrando {pedidosFiltrados.length} pedidos
              {(filtroCliente || filtroEstado || filtroFecha || terminoBusqueda) && " (filtrados)"}
            </p>
          </div>
        )
      }

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
        estadosDisponibles={estadosDisponibles}
        titulo="Agregar Nuevo Pedido"
        formatearMoneda={formatearMoneda}
        clientes={listaClientes}
        clienteSeleccionado={clienteSeleccionado}
        onClienteChange={handleClienteChange}
        productos={listaProductos}
        onMunicipioChange={(municipio) => setFormData(prev => ({ ...prev, Municipio: municipio }))}
        onDepartamentoChange={(departamento) => setFormData(prev => ({ ...prev, Departamento: departamento }))}
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

      {/* Agregar Font Awesome para los iconos */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div >
  );
};

export default PaginaPedidos;