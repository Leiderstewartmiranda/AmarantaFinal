import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Landing.css";
import AmaraLogo from "../../assets/AmaraLogo.png";
import ContactForm from "./contactForm/contactForm";

// Componentes para el sistema de pedidos
import Carrito from "./carrito/Carrito";
import ModalPedido from "./Pedido/PedidoCl";
import { PostPedido } from "../../services/pedidoService";
import { GetProductos } from "../../services/productoService";
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

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // === Cargar imagen del usuario ===
  useEffect(() => {
    if (!usuario?.correo) return;
    fetch(`http://amarantaapi.somee.com/api/Usuarios/ObtenerPorCorreo?correo=${usuario.correo}`)
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

  const realizarPedido = () => {
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

    setShowModalPedido(true);
  };

  const confirmarPedido = async (datosEnvio) => {
    try {
      let clienteId = usuario.idCliente || usuario.id;
      if (!clienteId) {
        const response = await fetch(`http://amarantaapi.somee.com/api/Clientes/por-correo?correo=${usuario.correo}`);
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

      Swal.fire({
        icon: "success",
        title: "¡Pedido realizado!",
        text: "Tu pedido ha sido creado exitosamente.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });

      setCarrito([]);
      setShowModalPedido(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear el pedido.",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const totalCarrito = carrito.reduce((sum, producto) => sum + (producto.subtotal || 0), 0);

  // === FILTRAR productos ===
  const productosFiltrados = productos.filter((p) => {
    const nombre = (p.nombreProducto || "").toLowerCase();
    const precio = p.precio || p.precioVenta || 0;

    const coincideBusqueda = nombre.includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaSeleccionada === "" ||
      p.idCategoria === parseInt(categoriaSeleccionada);

    const coincidePrecioMin =
      precioMin === "" || precio >= parseFloat(precioMin);
    const coincidePrecioMax =
      precioMax === "" || precio <= parseFloat(precioMax);

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincidePrecioMin &&
      coincidePrecioMax
    );
  });

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
      <header className="navbar">
        <div className="logos">
          <img src={AmaraLogo} alt="Amaranta Logo" className="img-logo" />
          <div className="nav-brand">
            <h1 className="logo">AMARANTA</h1>
            <span className="logo-subtitle">Cigars</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li><a href="#catalogo">Catálogo</a></li>
            <li><a href="#productos">Líneas</a></li>
            <li><a href="#origen">Origen</a></li>
            <li><a href="#experiencia">Experiencia</a></li>
            {/* 🔹 Opciones dinámicas según el rol */}
            {renderUserOptions()}
          </ul>
        </nav>
      </header>

      {/* ===== Hero ===== */}
      <section id="inicio" className="hero-section">
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
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
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
                placeholder="Precio mínimo"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                className="filtro-precio"
                min="0"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Precio máximo"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                className="filtro-precio"
                min="0"
              />
            </div>
          </div>

          {loadingProductos ? (
            <div className="loading-products">
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
                    <h3>{producto.nombreProducto}</h3>
                    <p>{producto.descripcion}</p>
                    <div className="producto-precio">
                      ${(producto.precio || 0).toLocaleString()}
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="btn-agregar-carrito"
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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

      {/* ===== Líneas ===== */}
      <section id="productos" className="productos-section">
        <h2 className="section-title">Nuestras Líneas</h2>
        <div className="productos-grid">
          <div className="producto-card">
            <img src="https://res.cloudinary.com/dev1t6xl9/image/upload/v1762828346/AmarantaSur_w7p6b7.png" alt="Amaranta Sur" />
            <h3>Amaranta Sur</h3>
            <p>Del corazón del tabaco colombiano, una fumada que habla con acento propio.</p>
          </div>
          <div className="producto-card">
            <img src="https://res.cloudinary.com/dev1t6xl9/image/upload/v1762828346/AmarantaCaribe_kwfmh6.png" alt="Amaranta Caribe" />
            <h3>Amaranta Caribe</h3>
            <p>Del corazón del tabaco caribeño, una experiencia fresca y vibrante.</p>
          </div>
          <div className="producto-card">
            <img src="https://res.cloudinary.com/dev1t6xl9/image/upload/v1762828346/AmarantaAnimus_fgvbf5.png" alt="Amaranta Animus" />
            <h3>Amaranta Animus</h3>
            <p>Una experiencia envolvente que despierta los sentidos.</p>
          </div>
        </div>
      </section>

      {/* ===== Origen ===== */}
      <section id="origen" className="origen-section">
        <div className="container">
            <h2 className="section-title">Nuestro Origen</h2>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
                Amaranta Cigars nace de la pasión por el arte ancestral de los buenos tabacos. Fundada en el corazón de las tierras más fértiles para el cultivo del tabaco, nuestra marca representa la herencia, el conocimiento y la dedicación de generaciones de maestros torcedores.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Nuestra Herencia</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Desde 2020, hemos preservado las técnicas tradicionales de cultivo y secado, combinándolas con innovaciones modernas que respetan la esencia del auténtico puro. Cada hoja es seleccionada manualmente tras un riguroso proceso de curación natural.
                    </p>
                </div>
                
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>El Arte del Torcido</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Nuestros maestros torcedores, con más de 20 años de experiencia, dan forma a cada cigarro con paciencia y precisión. Este proceso artesanal garantiza un tiro perfecto y una combustión uniforme en cada una de nuestras vitolas.
                    </p>
                </div>
                
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Filosofía Amaranta</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Creemos que un buen cigarro no es solo un producto, es una experiencia. Una tradición que se comparte, un momento de reflexión y placer que conecta a los conocedores con la esencia más pura del tabaco.
                    </p>
                </div>
            </div>
            
            <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', borderRadius: '10px', border: '1px solid #444' }}>
                <h3 style={{ color: '#d4a574', textAlign: 'center', marginBottom: '1rem', fontSize: '1.4rem' }}>
                    "Cada Amaranta es una promesa de excelencia, un tributo a la tradición tabacalera"
                </h3>
                <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
                    - Familia Rodríguez, Fundadores
                </p>
            </div>
        </div>
    </section>

      {/* ===== Experiencia ===== */}
      <section id="experiencia" className="experiencia-section">
        <div className="container">
            <h2 className="section-title">La Experiencia Amaranta</h2>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.8', textAlign: 'center' }}>
                Sumérgete en el arte del tabaco premium a través de una tradición que honra los sentidos y celebra el tiempo pausado.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>El Ritual del Aroma</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Cada Amaranta libera una sinfonía de aromas que evolucionan con cada calada. Notas de madera noble, toques de nuez y un final especiado que perdura en el paladar, creando una experiencia olfativa única.
                    </p>
                </div>
                
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Sabores que Perduran</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        La complejidad de nuestros blends ofrece un viaje gustativo que comienza suave, se intensifica en el desarrollo y concluye con un retrogusto elegante. Un diálogo entre fuerza y sutileza en cada vitola.
                    </p>
                </div>
                
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Combustión Perfecta</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Gracias al torcido artesanal, cada cigarro mantiene una combustión uniforme y lenta, permitiendo disfrutar de la experiencia durante el tiempo perfecto. La ceniza compacta y grisácea es testimonio de calidad.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Tiempo y Paciencia</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Un Amaranta no se fuma, se saborea. Es una invitación a detener el tiempo, a disfrutar del momento presente y a convertir una simple pausa en una experiencia contemplativa y enriquecedora.
                    </p>
                </div>
                
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Ingredientes Naturales</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Utilizamos exclusivamente hojas de tabaco de primera calidad, sin aditivos ni acelerantes. La pureza de nuestros ingredientes garantiza una experiencia auténtica y libre de artificios.
                    </p>
                </div>
                
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ color: '#d4a574', marginBottom: '1rem', fontSize: '1.3rem' }}>Arte en Cada Detalle</h3>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                        Desde la selección de la capa hasta el anillado final, cada elemento es cuidadosamente considerado. La estética de nuestros puros refleja la elegancia y sofisticación que definen la marca.
                    </p>
                </div>
            </div>
            
            <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', borderRadius: '10px', border: '1px solid #444' }}>
                <h3 style={{ color: '#d4a574', textAlign: 'center', marginBottom: '1rem', fontSize: '1.4rem' }}>
                    "La verdadera experiencia Amaranta trasciende el humo: es un encuentro con la tradición, los sentidos y el arte del buen vivir"
                </h3>
                <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
                    - Filosofía de la Casa Amaranta
                </p>
            </div>
        </div>
    </section>

      {/* ===== Contact Form ===== */}
      
        <ContactForm />

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
        <p>Tel: 321 0000000</p>
        <p>© 2025 Amaranta Cigars | Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
