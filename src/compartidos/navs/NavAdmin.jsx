import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingBag,
  FileText,
  Users,
  Truck,
  Package,
  Tags,
  BarChart3,
  LogOut,
  Home,
} from "lucide-react";
import AmaraLogo from "../../assets/AmaraLogo.png";
import "./navAd.css";

export default function NavAdmin() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b45309",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      background: "#fff8e7",
    });

    if (result.isConfirmed) {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const correo = usuario?.correo;

      try {
        await fetch("http://localhost:5201/api/Usuarios/CerrarSesion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo }),
        });
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }

      localStorage.clear();
      navigate("/");
    }
  };

  const location = useLocation();

  // 👉 Detecta si la ruta actual es el Dashboard
  const isDashboard = location.pathname === "/admin/dashboard" || location.pathname === "/admin/perfil" || location.pathname === "/admin/editar-perfil-Ad";

  return (
    <div className={`sidebar ${isDashboard ? "fixed" : "relative"}`}>
      <div className="sidebar-header">
        <img src={AmaraLogo} alt="logo" className="sidebar-logo" />
        <h2 className="sidebar-title">AMARANTA</h2>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/admin/compras" className="menu-item">
          <ShoppingBag size={18} />
          <span>Compras</span>
        </NavLink>
        <NavLink to="/admin/pedidos" className="menu-item">
          <FileText size={18} />
          <span>Pedidos</span>
        </NavLink>
        <NavLink to="/admin/clientes" className="menu-item">
          <Users size={18} />
          <span>Clientes</span>
        </NavLink>
        <NavLink to="/admin/proveedores" className="menu-item">
          <Truck size={18} />
          <span>Proveedores</span>
        </NavLink>
        <NavLink to="/admin/productos" className="menu-item">
          <Package size={18} />
          <span>Productos</span>
        </NavLink>
        <NavLink to="/admin/categorias" className="menu-item">
          <Tags size={18} />
          <span>Categorías</span>
        </NavLink>
        <NavLink to="/admin/roles" className="menu-item">
          <Users size={18} />
          <span>Roles</span>
        </NavLink>
        <NavLink to="/admin/dashboard" className="menu-item">
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/" className="menu-item">
          <Home size={18} />
          <span>Ir al inicio</span>
        </NavLink>
      </div>
      <NavLink to="/perfil" className="menu-item">
        <LogOut size={18} />
        <span>Perfil</span>
      </NavLink>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
