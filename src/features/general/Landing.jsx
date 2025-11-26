import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Landing.css";
import "./orders-grid.css";
import AmaraLogo from "../../assets/AmaraLogo.png";
import ContactForm from "./contactForm/contactForm";

// Componentes para el sistema de pedidos
import Carrito from "./carrito/Carrito";
import ModalPedido from "./Pedido/PedidoCl";
import { PostPedido, GetPedidos } from "../../services/pedidoService";
import { GetProductos, ActualizarProducto } from "../../services/productoService";
import { GetCProductos } from "../../services/categoriaService";

export default function Landing() {
  const [usuarioImg, setUsuarioImg] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [showModalPedido, setShowModalPedido] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [showModalPedidos, setShowModalPedidos] = useState(false);
  const [showDetallesPedido, setShowDetallesPedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // === Efecto de scroll para navbar ===
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // === Cargar imagen del usuario ===
  useEffect(() => {
    if (!usuario?.correo) return;
    fetch(`https://amarantaapi.somee.com/api/Usuarios/ObtenerPorCorreo?correo=${usuario.correo}`)
      .then((response) => {
        if (!response.ok) throw new Error("No se encontró usuario");
        return response.json();
      })
      .then((data) => setUsuarioImg(data.imagenPerfil))
      .catch((error) => console.error("Error al obtener imagen:", error));
  }, [usuario]);

  // === Cargar productos y categorías ===
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, categoriasData] = await Promise.all([
          GetProductos(),
          GetCProductos(),
        ]);
        setProductos(productosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error cargando productos o categorías:", error);
      } finally {
        setLoadingProductos(false);
      }
    };
    cargarDatos();
  }, []);

  // === Cargar pedidos del cliente ===
  useEffect(() => {
    const cargarPedidos = async () => {
      if (!usuario || usuario.rol === "Admin") return;

      try {
        const todosPedidos = await GetPedidos();
        const clienteId = usuario.idCliente || usuario.id;

        // Filtrar solo los pedidos del cliente actual
        const pedidosCliente = todosPedidos.filter(
          p => p.idCliente === clienteId || p.IdCliente === clienteId
        );

        // Ordenar por fecha más reciente primero
        pedidosCliente.sort((a, b) => new Date(b.fechaPedido || b.FechaPedido) - new Date(a.fechaPedido || a.FechaPedido));

        setPedidos(pedidosCliente);
      } catch (error) {
        console.error("Error cargando pedidos:", error);
      }
    };
    cargarPedidos();
  }, [usuario]);


  // === Funciones del carrito ===
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const productoId = producto.codigoProducto || producto.id;
      const precio = producto.precio || producto.precioVenta || 0;
      const existe = prev.find((p) => (p.codigoProducto || p.id) === productoId);

      if (existe) {
        const nuevaCantidad = existe.cantidad + 1;
        return prev.map((p) =>
          (p.codigoProducto || p.id) === productoId
            ? { ...p, cantidad: nuevaCantidad, subtotal: precio * nuevaCantidad }
            : p
        );
      }

      return [...prev, { ...producto, cantidad: 1, subtotal: precio }];
    });

    Swal.fire({
      icon: "success",
      title: "Producto agregado",
      text: `${producto.nombreProducto || producto.nombre} se agregó al carrito`,
      confirmButtonColor: "#b45309",
      background: "#fff8e7",
      timer: 1500,
    });
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }

    setCarrito((prev) =>
      prev.map((p) => {
        const id = p.codigoProducto || p.id;
        const precio = p.precio || p.precioVenta || 0;

        if (id === productoId) {
          return { ...p, cantidad: nuevaCantidad, subtotal: precio * nuevaCantidad };
        }
        return p;
      })
    );
  };

  const eliminarProducto = (productoId) => {
    setCarrito((prev) => prev.filter((p) => (p.codigoProducto || p.id) !== productoId));
  };

  const limpiarCarrito = () => setCarrito([]);
  const totalCarrito = carrito.reduce((sum, producto) => sum + (producto.subtotal || 0), 0);

  // === FILTRAR productos ===
  const productosFiltrados = productos.filter((p) => {
    const nombre = (p.nombreProducto || "").toLowerCase();
    const precio = p.precio || p.precioVenta || 0;
    const estaActivo = p.estado || p.Estado; // 🟢 Verificar estado
    const tieneStock = (p.stock || p.Stock || 0) > 0; // 🟢 Verificar stock

    const coincideBusqueda = nombre.includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaSeleccionada === "" ||
      p.idCategoria === parseInt(categoriaSeleccionada);

    const coincidePrecioMin =
      precioMin === "" || precio >= parseFloat(precioMin);
    const coincidePrecioMax =
      precioMax === "" || precio <= parseFloat(precioMax);

    return (
      estaActivo &&
      tieneStock &&
      coincideBusqueda &&
      coincideCategoria &&
      coincidePrecioMin &&
      coincidePrecioMax
    );
  });

  const realizarPedido = async () => {
    if (!usuario) {
      Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para realizar un pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }

    if (carrito.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Agrega productos al carrito antes de realizar el pedido",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      return;
    }

    // 🟢 NUEVA VALIDACIÓN DE STOCK (Con datos frescos)
    try {
      // Mostrar loading opcional si se desea, o simplemente esperar
      const productosFrescos = await GetProductos();
      const productosSinStock = [];

      carrito.forEach(item => {
        const productoOriginal = productosFrescos.find(p => (p.codigoProducto || p.id) === (item.codigoProducto || item.id));

        // Si no se encuentra el producto, asumimos que no hay stock o fue eliminado
        if (!productoOriginal) {
          productosSinStock.push({
            nombre: item.nombreProducto || item.nombre,
            solicitado: item.cantidad,
            disponible: 0,
            mensaje: "Producto no disponible"
          });
          return;
        }

        const stockDisponible = parseInt(productoOriginal.stock || productoOriginal.Stock || 0);
        const cantidadSolicitada = parseInt(item.cantidad);

        if (cantidadSolicitada > stockDisponible) {
          productosSinStock.push({
            nombre: item.nombreProducto || item.nombre,
            solicitado: cantidadSolicitada,
            disponible: stockDisponible
          });
        }
      });

      if (productosSinStock.length > 0) {
        const mensajeError = productosSinStock
          .map(p => p.mensaje ? `• ${p.nombre}: ${p.mensaje}` : `• ${p.nombre}: Solicitado ${p.solicitado}, Disponible ${p.disponible}`)
          .join('<br/>');

        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          html: `<div style="text-align: left">Algunos productos no tienen suficiente stock o ya no están disponibles:<br/><br/>${mensajeError}</div>`,
          confirmButtonColor: "#d15113",
          background: "#fff8e7",
        });
        return;
      }

      setShowModalPedido(true);

    } catch (error) {
      console.error("Error al validar stock:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo verificar el stock. Intenta nuevamente.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const confirmarPedido = async (datosEnvio) => {
    try {
      let clienteId = usuario.idCliente || usuario.id;
      if (!clienteId) {
        const response = await fetch(`https://amarantaapi.somee.com/api/Clientes/por-correo?correo=${usuario.correo}`);
        if (response.ok) {
          const clienteData = await response.json();
          clienteId = clienteData.idCliente || clienteData.id;
        }
      }

      const pedidoData = {
        IdCliente: parseInt(clienteId),
        FechaPedido: new Date().toISOString().split("T")[0],
        Detalles: carrito.map((p) => ({
          CodigoProducto: parseInt(p.codigoProducto || p.id),
          Cantidad: parseInt(p.cantidad),
        })),
        Correo: usuario.correo || "",
        Direccion: datosEnvio.direccion || "",
        Municipio: datosEnvio.municipio || "",
        Departamento: datosEnvio.departamento || "",
        Estado: "Pendiente",
      };

      await PostPedido(pedidoData);

      // 🔻 ACTUALIZAR STOCK (RESTAR)
      // Obtenemos productos frescos para asegurar consistencia
      const productosFrescos = await GetProductos();

      for (const item of carrito) {
        const productoOriginal = productosFrescos.find(p => (p.codigoProducto || p.id) === (item.codigoProducto || item.id));

        if (productoOriginal) {
          const stockActual = parseInt(productoOriginal.stock || productoOriginal.Stock || 0);
          const cantidadComprada = parseInt(item.cantidad);
          const nuevoStock = Math.max(0, stockActual - cantidadComprada);

          await ActualizarProducto(item.codigoProducto || item.id, {
            NombreProducto: productoOriginal.nombreProducto || productoOriginal.NombreProducto,
            Precio: productoOriginal.precio || productoOriginal.Precio,
            Stock: nuevoStock,
            IdCategoria: productoOriginal.idCategoria || productoOriginal.IdCategoria,
            Estado: productoOriginal.estado !== undefined ? productoOriginal.estado : productoOriginal.Estado,
            Imagen: null // O mantener la imagen si es necesario, pero la API suele manejar esto
          });
        }
      }
      // 🔺 FIN ACTUALIZAR STOCK

      Swal.fire({
        icon: "success",
        title: "¡Pedido realizado!",
        text: "Tu pedido ha sido creado exitosamente.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });

      setCarrito([]);
      setShowModalPedido(false);

      // Recargar productos para actualizar la vista
      const nuevosProductos = await GetProductos();
      setProductos(nuevosProductos);

    } catch (error) {
      console.error("Error al confirmar pedido:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear el pedido.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const renderUserOptions = () => {
    if (!usuario) {
      // 🟠 Usuario no logueado
      return (
        <li>
          <a onClick={() => navigate("/login")} className="link" style={{ cursor: "pointer" }}>
            Ingresar
          </a>
        </li>
      );
    }

    if (usuario.rol === "Admin") {
      // 🔵 Usuario administrador
      return (
        <>
          <li>
            <a onClick={() => navigate("/admin/dashboard")} className="link" style={{ cursor: "pointer" }}>
              Admin
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                localStorage.removeItem("usuario");
                navigate("/");
                window.location.reload();
              }}
              className="link"
              style={{ cursor: "pointer" }}
            >
              Cerrar sesión
            </a>
          </li>
        </>
      );
    }
    return (
      <>
        <li className="perfil-opciones">
          <a onClick={() => navigate("/perfil")} className="link" style={{ cursor: "pointer" }}>
            <div className="foto-container-nav">
              <div className="foto-wrapper-nav">
                <img
                  src={
                    usuarioImg ||
                    "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"
                  }
                  alt="Perfil"
                  className="foto-usuario-nav"
                />
              </div>
            </div>
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              localStorage.removeItem("usuario");
              navigate("/");
              window.location.reload();
            }}
            className="link"
            style={{ cursor: "pointer" }}
          >
            Cerrar sesión
          </a>
        </li>
      </>
    );
  };


  return (
    <div className="landing-page">
      {/* ===== Navbar ===== */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logos">
          <img src={AmaraLogo} alt="Amaranta Logo" className="img-logo" />
          <div className="nav-brand">
            <h1 className="logo">AMARANTA</h1>
            <span className="logo-subtitle">Cigars</span>
          </div>
        </div>

        <div className="hamburger-menu" onClick={toggleMobileMenu}>
          <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
          <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
          <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
        </div>

        <nav className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li><a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>Catálogo</a></li>
            <li><Link to="/nosotros" onClick={() => setMobileMenuOpen(false)}>Origen & Experiencia</Link></li>
            {usuario && usuario.rol !== "Admin" && (
              <li>
                <a
                  onClick={() => {
                    setShowModalPedidos(true);
                    setMobileMenuOpen(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Mis Pedidos
                </a>
              </li>
            )}
            {/* 🔹 Opciones dinámicas según el rol */}
            {renderUserOptions()}
          </ul>
        </nav>
      </header>

      {/* ===== Hero ===== */}
      <section id="inicio" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-brand">
            <h1 className="hero-logo">AMARANTA</h1>
            <span className="hero-subtitle">Cigars</span>
          </div>
          <p className="hero-description">
            La excelencia colombiana en cada calada. Tabacos premium seleccionados con maestría.
          </p>
          <a href="#catalogo" className="hero-btn">
            DESCUBRE NUESTRA COLECCIÓN
          </a>
        </div>
      </section>

      {/* ===== Catálogo ===== */}
      <section id="catalogo" className="catalogo-section">
        <div className="container">
          <h2 className="section-title">Nuestro Catálogo</h2>
          <p className="section-subtitle">Explora nuestra selección premium</p>

          {/* 🔍 Búsqueda y filtro */}
          <div className="filtros-container">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </div>
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="select-categoria"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.nombreCategoria}
                </option>
              ))}
            </select>
            <div className="filtro-precio-container">
              <input
                type="number"
                placeholder="Min $"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                className="filtro-precio"
                min="0"
              />
              <span className="separator">-</span>
              <input
                type="number"
                placeholder="Max $"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                className="filtro-precio"
                min="0"
              />
            </div>
          </div>

          {loadingProductos ? (
            <div className="loading-products">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : (
            <div className="catalogo-grid">
              {productosFiltrados.map((producto) => (
                <div key={producto.codigoProducto || producto.id} className="producto-catalogo-card">
                  <div className="producto-imagen">
                    <img src={producto.imagen} alt={producto.nombreProducto} />
                  </div>
                  <div className="producto-info">
                    <div className="producto-header">
                      <h3>{producto.nombreProducto}</h3>
                      <div className="producto-precio">
                        ${(producto.precio || 0).toLocaleString()}
                      </div>
                    </div>
                    <p className="producto-descripcion">{producto.descripcion}</p>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="btn-agregar-carrito"
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}            </div>
          )}
        </div>
      </section>

      {/* ===== Modal Mis Pedidos ===== */}
      {showModalPedidos && usuario && usuario.rol === "Usuario" && (
        <div className="modal-overlay" onClick={() => setShowModalPedidos(false)}>
          <div className="modal-pedidos-lista" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModalPedidos(false)}>
              <i className="fas fa-times"></i>
            </button>

            <h3 className="modal-title">
              <i className="fas fa-shopping-bag"></i>
              Mis Pedidos
            </h3>

            <div className="modal-body-pedidos">
              {pedidos.length === 0 ? (
                <div className="no-pedidos">
                  <i className="fas fa-box-open"></i>
                  <p>Aún no has realizado ningún pedido</p>
                  <button
                    className="btn-explorar"
                    onClick={() => {
                      setShowModalPedidos(false);
                      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explorar Catálogo
                  </button>
                </div>
              ) : (
                <div className="pedidos-grid">
                  {pedidos.map((pedido) => {
                    const fecha = new Date(pedido.fechaPedido || pedido.FechaPedido);
                    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    const estadoClass = (pedido.estado || pedido.Estado || '').toLowerCase();
                    const estadoTexto = pedido.estado || pedido.Estado || 'Pendiente';

                    return (
                      <div key={pedido.codigoPedido || pedido.IdPedido} className="pedido-card">
                        <div className="pedido-header">
                          <div className="pedido-numero">
                            <i className="fas fa-receipt"></i>
                            <span>Pedido #{pedido.codigoPedido || pedido.IdPedido}</span>
                          </div>
                          <span className={`pedido-estado ${estadoClass}`}>
                            {estadoTexto}
                          </span>
                        </div>

                        <div className="pedido-info">
                          <div className="info-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{fechaFormateada}</span>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{pedido.municipio || pedido.Municipio}, {pedido.departamento || pedido.Departamento}</span>
                          </div>
                        </div>

                        <button
                          className="btn-ver-detalles"
                          onClick={() => {
                            setPedidoSeleccionado(pedido);
                            setShowDetallesPedido(true);
                          }}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal Detalles Pedido ===== */}
      {showDetallesPedido && pedidoSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowDetallesPedido(false)}>
          <div className="modal-detalles-pedido" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetallesPedido(false)}>
              <i className="fas fa-times"></i>
            </button>

            <h3 className="modal-title">
              <i className="fas fa-receipt"></i>
              Detalles del Pedido #{pedidoSeleccionado.codigoPedido || pedidoSeleccionado.IdPedido}
            </h3>

            <div className="modal-body">
              <div className="detalles-info">
                <div className="info-row">
                  <span className="label">Estado:</span>
                  <span className={`badge ${(pedidoSeleccionado.estado || pedidoSeleccionado.Estado || '').toLowerCase()}`}>
                    {pedidoSeleccionado.estado || pedidoSeleccionado.Estado}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Fecha:</span>
                  <span>{new Date(pedidoSeleccionado.fechaPedido || pedidoSeleccionado.FechaPedido).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="info-row">
                  <span className="label">Dirección:</span>
                  <span>{pedidoSeleccionado.direccion || pedidoSeleccionado.Direccion}</span>
                </div>
                <div className="info-row">
                  <span className="label">Municipio:</span>
                  <span>{pedidoSeleccionado.municipio || pedidoSeleccionado.Municipio}</span>
                </div>
                <div className="info-row">
                  <span className="label">Departamento:</span>
                  <span>{pedidoSeleccionado.departamento || pedidoSeleccionado.Departamento}</span>
                </div>
              </div>

              <div className="detalles-productos">
                <h4>Productos</h4>
                {(pedidoSeleccionado.detalles || pedidoSeleccionado.Detalles || []).length > 0 ? (
                  <div className="productos-list">
                    {(pedidoSeleccionado.detalles || pedidoSeleccionado.Detalles).map((detalle, index) => (
                      <div key={index} className="producto-item">
                        <div className="producto-nombre">
                          {detalle.nombreProducto || detalle.NombreProducto || `Producto #${detalle.codigoProducto || detalle.CodigoProducto}`}
                        </div>
                        <div className="producto-cantidad">
                          Cantidad: {detalle.cantidad || detalle.Cantidad}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-detalles">No hay detalles de productos disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ===== Carrito ===== */}
      {carrito.length > 0 && (
        <div className="carrito-flotante">
          <Carrito
            carrito={carrito}
            onActualizarCantidad={actualizarCantidad}
            onEliminarProducto={eliminarProducto}
            onRealizarPedido={realizarPedido}
            onLimpiarCarrito={limpiarCarrito}
            total={totalCarrito}
          />
        </div>
      )}

      {/* ===== Contact Form ===== */}
      <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Contáctanos</h2>
          <ContactForm />
        </div>
      </section>

      {/* ===== Modal Pedido ===== */}
      <ModalPedido
        show={showModalPedido}
        onClose={() => setShowModalPedido(false)}
        carrito={carrito}
        onConfirmarPedido={confirmarPedido}
        usuario={usuario}
        total={totalCarrito}
      />

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column brand-column">
              <div className="footer-brand">
                <h2>AMARANTA</h2>
                <span>Cigars</span>
              </div>
              <p className="footer-desc">
                Tradición y excelencia en cada cigarro. Llevando el mejor tabaco colombiano al mundo.
              </p>
            </div>

            <div className="footer-column">
              <h3>Enlaces Rápidos</h3>
              <ul className="footer-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#catalogo">Catálogo</a></li>
                <li><Link to="/nosotros">Origen & Experiencia</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Contacto</h3>
              <ul className="footer-contact">
                <li><i className="fas fa-phone"></i> 321 0000000</li>
                <li><i className="fas fa-envelope"></i> info@amarantacigars.com</li>
                <li><i className="fas fa-map-marker-alt"></i> Colombia</li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Síguenos</h3>
              <div className="footer-icons">
                <a href="https://www.facebook.com/share/17KYrWg3x8/" target="blank">
                  <img src="https://i.pinimg.com/736x/07/52/f5/0752f5634bcf549014cb18a9cf6b4481.jpg" alt="Facebook" />
                </a>
                <a href="https://www.instagram.com/amarantacigars" target="blank">
                  <img src="https://i.pinimg.com/564x/25/38/de/2538ded09c774ccd821d768b92f24e5a.jpg" alt="Instagram" />
                </a>
                <a href="https://w.app/yyivp3" target="blank">
                  <img src="https://i.pinimg.com/1200x/fa/6b/2c/fa6b2c3835597812db7407c06f4d6f3f.jpg" alt="WhatsApp" />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 Amaranta Cigars | Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
