// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import "./Landing.css";
// import AmaraLogo from "../../assets/AmaraLogo.png";
// import AmarantaSur from "../../assets/Landing-img/AmarantaSur.png";
// import AmarantaCaribe from "../../assets/Landing-img/AmarantaCaribe.png";
// import AmarantaAnimus from "../../assets/Landing-img/AmarantaAnimus.png";

// // Componentes para el sistema de pedidos
// import CatalogoProductos from "./ProductosG/CatalogoProductos";
// import Carrito from "./carrito/Carrito";
// import ModalPedido from "./Pedido/PedidoCl";
// import { PostPedido } from "../../services/pedidoService";
// import { GetProductos } from "../../services/productoService";

// export default function Landing() {
//   const [usuarioImg, setUsuarioImg] = useState(null);
//   const [carrito, setCarrito] = useState([]);
//   const [showModalPedido, setShowModalPedido] = useState(false);
//   const [productos, setProductos] = useState([]);
//   const [loadingProductos, setLoadingProductos] = useState(true);
  
//   const navigate = useNavigate();
//   const usuario = JSON.parse(localStorage.getItem("usuario"));

//   // En tu Landing.jsx, agrega este useEffect
//   useEffect(() => {
//     if (usuario) {
//       console.log("🔍 Estructura completa del usuario:", usuario);
//       console.log("📋 Propiedades del usuario:", Object.keys(usuario));
//     }
//   }, [usuario]);

//   // === Cargar imagen del usuario ===
//   useEffect(() => {
//     if (!usuario?.correo) return;

//     fetch(`http://localhost:5201/api/Usuarios/ObtenerPorCorreo?correo=${usuario.correo}`)
//       .then((response) => {
//         if (!response.ok) throw new Error("No se encontró usuario");
//         return response.json();
//       })
//       .then((data) => setUsuarioImg(data.imagenPerfil))
//       .catch((error) => console.error("Error al obtener imagen:", error));

//     // === Scroll suave ===
//     const handleSmoothScroll = (e) => {
//       if (e.target.tagName === "A" && e.target.getAttribute("href")?.startsWith("#")) {
//         e.preventDefault();
//         const id = e.target.getAttribute("href").substring(1);
//         const target = document.getElementById(id);
//         if (target) {
//           window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
//         }
//       }
//     };

//     document.addEventListener("click", handleSmoothScroll);
//     return () => document.removeEventListener("click", handleSmoothScroll);
//   }, [usuario]);

//   // === Cargar productos ===
//   useEffect(() => {
//     const cargarProductos = async () => {
//       try {
//         const data = await GetProductos();
//         setProductos(data);
//       } catch (error) {
//         console.error("Error cargando productos:", error);
//       } finally {
//         setLoadingProductos(false);
//       }
//     };

//     cargarProductos();
//   }, []);

//   // === Funciones del carrito ===
//   // === Funciones del carrito MEJORADAS ===
//   const agregarAlCarrito = (producto) => {
//     console.log('🛒 Agregando producto:', {
//       id: producto.codigoProducto || producto.id,
//       nombre: producto.nombreProducto || producto.nombre,
//       precio: producto.precio || producto.precioVenta
//     });

//     setCarrito(prev => {
//       const productoId = producto.codigoProducto || producto.id;
//       const precio = producto.precio || producto.precioVenta || 0;
      
//       const existe = prev.find(p => 
//         (p.codigoProducto || p.id) === productoId
//       );
      
//       if (existe) {
//         // Si ya existe, aumentar la cantidad
//         const nuevaCantidad = existe.cantidad + 1;
//         return prev.map(p =>
//           (p.codigoProducto || p.id) === productoId
//             ? { 
//                 ...p, 
//                 cantidad: nuevaCantidad,
//                 subtotal: precio * nuevaCantidad
//               }
//             : p
//         );
//       }
      
//       // Si no existe, agregar nuevo producto
//       return [...prev, { 
//         ...producto, 
//         cantidad: 1,
//         subtotal: precio
//       }];
//     });

//     Swal.fire({
//       icon: "success",
//       title: "Producto agregado",
//       text: `${producto.nombreProducto || producto.nombre} se agregó al carrito`,
//       confirmButtonColor: "#b45309",
//       background: "#fff8e7",
//       timer: 1500
//     });
//   };

//   const actualizarCantidad = (productoId, nuevaCantidad) => {
//     if (nuevaCantidad <= 0) {
//       eliminarProducto(productoId);
//       return;
//     }
    
//     setCarrito(prev =>
//       prev.map(p => {
//         const id = p.codigoProducto || p.id;
//         const precio = p.precio || p.precioVenta || 0;
        
//         if (id === productoId) {
//           return { 
//             ...p, 
//             cantidad: nuevaCantidad,
//             subtotal: precio * nuevaCantidad
//           };
//         }
//         return p;
//       })
//     );
//   };

//   const eliminarProducto = (productoId) => {
//     setCarrito(prev => prev.filter(p => 
//       (p.codigoProducto || p.id) !== productoId
//     ));
//   };



//   const limpiarCarrito = () => {
//     setCarrito([]);
//   };

//   const realizarPedido = () => {
//     console.log("🔍 Realizar pedido - Estado:", {
//       usuario: usuario,
//       carritoLength: carrito.length,
//       carrito: carrito
//     });

//     if (!usuario) {
//       console.log("❌ No hay usuario logueado");
//       Swal.fire({
//         icon: "warning",
//         title: "Inicia sesión",
//         text: "Debes iniciar sesión para realizar un pedido",
//         confirmButtonColor: "#b45309",
//         background: "#fff8e7",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           navigate("/login");
//         }
//       });
//       return;
//     }

//     if (carrito.length === 0) {
//       console.log("❌ Carrito vacío");
//       Swal.fire({
//         icon: "warning",
//         title: "Carrito vacío",
//         text: "Agrega productos al carrito antes de realizar el pedido",
//         confirmButtonColor: "#b45309",
//         background: "#fff8e7",
//       });
//       return;
//     }

//     console.log("✅ Todo OK, abriendo modal de pedido");
//     setShowModalPedido(true);
//   };

//   const confirmarPedido = async (datosEnvio) => {
//     console.log("🚀 Confirmando pedido:", {
//       datosEnvio,
//       carrito,
//       usuario
//     });

//     try {
//       // 🔥 OBTENER EL ID DEL CLIENTE DE FORMA SEGURA
//       let clienteId;
      
//       // Opción 1: Si el usuario tiene idCliente o id
//       clienteId = usuario.idCliente || usuario.id;
      
//       // Opción 2: Si no tiene, buscar en localStorage o hacer una consulta a la API
//       if (!clienteId) {
//         console.log("🔍 Buscando ID del cliente en la API...");
        
//         // Hacer una petición para obtener el cliente por correo
//         const response = await fetch(`http://localhost:5201/api/Clientes/por-correo?correo=${usuario.correo}`);
//         if (response.ok) {
//           const clienteData = await response.json();
//           clienteId = clienteData.idCliente || clienteData.id;
//           console.log("✅ ID del cliente encontrado:", clienteId);
//         } else {
//           throw new Error("No se pudo encontrar el cliente en la base de datos");
//         }
//       }

//       console.log("👤 ID Cliente final:", clienteId);

//       if (!clienteId) {
//         throw new Error("No se pudo obtener el ID del cliente. Contacta al administrador.");
//       }

//       const pedidoData = {
//         IdCliente: parseInt(clienteId),
//         FechaPedido: new Date().toISOString().split("T")[0],
//         Detalles: carrito.map(producto => {
//           const codigoProducto = producto.codigoProducto || producto.id;
//           console.log(`📦 Producto en detalle:`, {
//             codigoProducto,
//             cantidad: producto.cantidad,
//             nombre: producto.nombreProducto || producto.nombre
//           });
          
//           return {
//             CodigoProducto: parseInt(codigoProducto),
//             Cantidad: parseInt(producto.cantidad)
//           };
//         }),
//         Correo: usuario.correo || usuario.email || "",
//         Direccion: datosEnvio.direccion || "",
//         Municipio: datosEnvio.municipio || "",
//         Departamento: datosEnvio.departamento || "",
//         Estado: "Pendiente"
//       };

//       console.log("📦 Pedido a enviar:", pedidoData);
      
//       const resultado = await PostPedido(pedidoData);
//       console.log("✅ Pedido creado:", resultado);
      
//       Swal.fire({
//         icon: "success",
//         title: "¡Pedido realizado!",
//         text: "Tu pedido ha sido creado exitosamente. Te contactaremos pronto.",
//         confirmButtonColor: "#b45309",
//         background: "#fff8e7",
//       });

//       setCarrito([]);
//       setShowModalPedido(false);
      
//     } catch (error) {
//       console.error("❌ Error creando pedido:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.message || "No se pudo crear el pedido. Intenta nuevamente.",
//         confirmButtonColor: "#b45309",
//         background: "#fff8e7",
//       });
//     }
//   };

//   // === Función auxiliar: renderizar opciones según el rol ===
//   const renderUserOptions = () => {
//     if (!usuario) {
//       // 🟠 Usuario no logueado
//       return (
//         <li>
//           <a onClick={() => navigate("/login")} className="link" style={{ cursor: "pointer" }}>
//             Ingresar
//           </a>
//         </li>
//       );
//     }

//     if (usuario.rol === "Admin") {
//       // 🔵 Usuario administrador
//       return (
//         <>
//           <li>
//             <a onClick={() => navigate("/admin/dashboard")} className="link" style={{ cursor: "pointer" }}>
//               Admin
//             </a>
//           </li>
//           <li>
//             <a
//               onClick={() => {
//                 localStorage.removeItem("usuario");
//                 navigate("/");
//                 window.location.reload();
//               }}
//               className="link"
//               style={{ cursor: "pointer" }}
//             >
//               Cerrar sesión
//             </a>
//           </li>
//         </>
//       );
//     }

//     // 🟢 Usuario normal (Empleado o Cliente)
//     return (
//       <>
//         <li className="perfil-opciones">
//           <a onClick={() => navigate("/perfil")} className="link" style={{ cursor: "pointer" }}>
//             <div className="foto-container-nav">
//               <div className="foto-wrapper-nav">
//                 <img
//                   src={
//                     usuarioImg ||
//                     "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"
//                   }
//                   alt="Perfil"
//                   className="foto-usuario-nav"
//                 />
//               </div>
//             </div>
//           </a>
//         </li>
//         <li>
//           <a
//             onClick={() => {
//               localStorage.removeItem("usuario");
//               navigate("/");
//               window.location.reload();
//             }}
//             className="link"
//             style={{ cursor: "pointer" }}
//           >
//             Cerrar sesión
//           </a>
//         </li>
//       </>
//     );
//   };

//   const totalCarrito = carrito.reduce((sum, producto) => sum + (producto.subtotal || 0), 0);

//   return (
//     <div className="landing-page">
//       {/* ===== Navbar ===== */}
//       <header className="navbar">
//         <div className="logos">
//           <img src={AmaraLogo} alt="Amaranta Logo" className="img-logo" />
//           <div className="nav-brand">
//             <h1 className="logo">AMARANTA</h1>
//             <span className="logo-subtitle">Cigars</span>
//           </div>
//         </div>

//         <nav>
//           <ul className="nav-links">
//             <li><a href="#catalogo">Catálogo</a></li>
//             <li><a href="#productos">Líneas</a></li>
//             <li><a href="#origen">Origen</a></li>
//             <li><a href="#experiencia">Experiencia</a></li>

//             {/* 🔹 Opciones dinámicas según el rol */}
//             {renderUserOptions()}
//           </ul>
//         </nav>
//       </header>

//       {/* ===== Hero ===== */}
//       <section id="inicio" className="hero-section">
//         <div className="hero-content">
//           <div className="hero-brand">
//             <h1 className="hero-logo">AMARANTA</h1>
//             <span className="hero-subtitle">Cigars</span>
//           </div>
//           <p className="hero-description">
//             La excelencia colombiana en cada calada. Tabacos premium seleccionados con maestría.
//           </p>
//           <a href="#catalogo" className="hero-btn">
//             DESCUBRE NUESTRA COLECCIÓN
//           </a>
//         </div>
//       </section>

//       {/* ===== Catálogo de Productos ===== */}
//       <section id="catalogo" className="catalogo-section">
//         <div className="container">
//           <h2 className="section-title">Nuestro Catálogo</h2>
//           <p className="section-subtitle">
//             Explora nuestra selección premium de puros y accesorios
//           </p>
          
//           {loadingProductos ? (
//             <div className="loading-products">
//               <p>Cargando productos...</p>
//             </div>
//           ) : (
//             <div className="catalogo-grid">
//               {productos.map(producto => (
//                 <div key={producto.codigoProducto || producto.id} className="producto-catalogo-card">
//                   <div className="producto-imagen">
//                     <img
//                       src={producto.imagen }
//                       alt={producto.nombreProducto || producto.nombre}
//                     />
                    
//                   </div>
//                   <div className="producto-info">
//                     <h3>{producto.nombreProducto || producto.nombre}</h3>
//                     <p className="producto-descripcion">
//                       {producto.descripcion || "Puro premium de alta calidad"}
//                     </p>
//                     <div className="producto-precio">
//                       ${(producto.precio || producto.precioVenta || 0).toLocaleString()}
//                     </div>
//                     <button 
//                       onClick={() => agregarAlCarrito(producto)}
//                       className="btn-agregar-carrito"
//                     >
//                       Agregar al Carrito
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         {/* <CatalogoProductos
//           productos={productos}
//           loading={loadingProductos}
//           onAgregarAlCarrito={agregarAlCarrito}
//         /> */}
//       </section>

//       {/* ===== Carrito Flotante ===== */}
//       {carrito.length > 0 && (
//         <div className="carrito-flotante">
//           <Carrito
//             carrito={carrito}
//             onActualizarCantidad={actualizarCantidad}
//             onEliminarProducto={eliminarProducto}
//             onRealizarPedido={realizarPedido}
//             onLimpiarCarrito={limpiarCarrito}
//             total={totalCarrito}
//           />
//         </div>
//       )}

//       {/* ===== Líneas de Productos (Existente) ===== */}
//       <section id="productos" className="productos-section">
//         <h2 className="section-title">Nuestras Líneas</h2>
//         <div className="productos-grid">
//           <div className="producto-card">
//             <img src="https://res.cloudinary.com/dev1t6xl9/image/upload/v1762828346/AmarantaSur_w7p6b7.png" alt="Amaranta Sur" />
//             <h3>Amaranta Sur</h3>
//             <p>Del corazón del tabaco colombiano, una fumada que habla con acento propio.</p>
//           </div>
//           <div className="producto-card">
//             <img src="https://res.cloudinary.com/dev1t6xl9/image/upload/v1762828346/AmarantaCaribe_kwfmh6.png" alt="Amaranta Caribe" />
//             <h3>Amaranta Caribe</h3>
//             <p>Del corazón del tabaco caribeño, una experiencia fresca y vibrante.</p>
//           </div>
//           <div className="producto-card">
//             <img src="https://res.cloudinary.com/dev1t6xl9/image/upload/v1762828346/AmarantaAnimus_fgvbf5.png" alt="Amaranta Animus" />
//             <h3>Amaranta Animus</h3>
//             <p>Una experiencia envolvente que despierta los sentidos.</p>
//           </div>
//         </div>
//       </section>

//       {/* ===== Origen ===== */}
//       <section id="origen" className="origen-section">
//         <h2 className="section-title">Nuestro Origen</h2>
//         <p>
//           Amaranta Cigars nace de la pasión por el arte de los buenos tabacos.
//           Cada producto representa la herencia, el conocimiento y la dedicación
//           de los maestros torcedores. Nuestro compromiso es ofrecer calidad,
//           tradición y una experiencia única.
//         </p>
//       </section>

//       {/* ===== Experiencia ===== */}
//       <section id="experiencia" className="experiencia-section">
//         <h2 className="section-title">La Experiencia Amaranta</h2>
//         <p>
//           Descubre el mundo del tabaco premium a través de nuestros eventos exclusivos,
//           catas guiadas y asesoramiento personalizado para conocedores.
//         </p>
//       </section>

//       {/* ===== Modal de Pedido ===== */}
//       <ModalPedido
//         show={showModalPedido}
//         onClose={() => setShowModalPedido(false)}
//         carrito={carrito}
//         onConfirmarPedido={confirmarPedido}
//         usuario={usuario}
//         total={totalCarrito}
//       />

//       {/* ===== Footer ===== */}
//       <footer className="footer">
//         <div className="footer-icons">
//           <a href="https://www.facebook.com/share/17KYrWg3x8/" target="blank"><i className="fab fa-facebook"></i> <img src="https://i.pinimg.com/736x/07/52/f5/0752f5634bcf549014cb18a9cf6b4481.jpg" alt="Facebook" /> </a>
//           <a href="https://www.instagram.com/amarantacigars?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="blank">  <i className="fab fa-instagram"><img src="https://i.pinimg.com/564x/25/38/de/2538ded09c774ccd821d768b92f24e5a.jpg" alt="Instagram" /></i></a>
//           <a href="https://w.app/yyivp3" target="blank"><i className="fab fa-twitter"></i> <img src="https://i.pinimg.com/1200x/fa/6b/2c/fa6b2c3835597812db7407c06f4d6f3f.jpg" alt="Twitter" /></a>
//         </div>
//         <p>Tel: 321 0000000</p>
//         <p>© 2025 Amaranta Cigars | Todos los derechos reservados</p>
//       </footer>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Landing.css";
import AmaraLogo from "../../assets/AmaraLogo.png";

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
    fetch(`http://localhost:5201/api/Usuarios/ObtenerPorCorreo?correo=${usuario.correo}`)
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
        const response = await fetch(`http://localhost:5201/api/Clientes/por-correo?correo=${usuario.correo}`);
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
        <h2 className="section-title">Nuestro Origen</h2>
        <p>
          Amaranta Cigars nace de la pasión por el arte de los buenos tabacos. Cada producto representa
          la herencia, el conocimiento y la dedicación de los maestros torcedores.
        </p>
      </section>

      {/* ===== Experiencia ===== */}
      <section id="experiencia" className="experiencia-section">
        <h2 className="section-title">La Experiencia Amaranta</h2>
        <p>
          Descubre el mundo del tabaco premium a través de nuestros eventos exclusivos y catas guiadas.
        </p>
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
