import { Route, Routes } from "react-router";
import App from "./App";
// Clientes
import PaginaClientes from "./features/admin/clientes/pages/PaginaClientes";
import PaginaPedidos from "./features/admin/pedidos/pages/PaginaPedidos";
import Dashboard from "./features/admin/dashboard/dashboard";
import PaginaProveedores from "./features/admin/proveedores/pages/PaginaProveedores";
import PaginaProductos from "./features/admin/productos/pages/PaginaProductos";
import PaginaCompras from "./features/admin/compras/pages/PaginaCompras";
import PaginaCategorias from "./features/admin/categorias/pages/PaginaCategorias";
import Register from "./features/login/register";
import Verification from "./features/login/verification";
import Login from "./features/login/login";
import Landing from "./features/general/landing";
import RecuperarContraseña from "./features/recuperar/recuperarClave";
import VerificarCodigoRecuperacion from "./features/recuperar/verificarCodigoRecuperacion";
import NuevaClave from "./features/recuperar/nuevaClave";
import Perfil from "./features/Usuarios/Perfil";
// import PerfilAdmin from "./features/admin/PerfilAd/PerfilAdmin";
import EditarPerfil from "./features/Usuarios/EditarPerfil";
// import EditarPerfilAdmin from "./features/admin/PerfilAd/EditarPerfilAd";
import PaginaRoles from "./features/admin/roles/pages/paginaRoles";
import ProtectedRoute from "./protectedRoute.jsx";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login/>} ></Route>
      <Route path="/recuperar-clave" element={<RecuperarContraseña/>} ></Route>
      <Route path="/verificar-recuperacion" element={<VerificarCodigoRecuperacion/>} ></Route>
      <Route path="/nueva-clave" element={<NuevaClave/>} ></Route>
      <Route path="/register" element={<Register/>} ></Route>
      <Route path="/verification" element={<Verification/>} ></Route>
      <Route path="/perfil" element={<Perfil/>} ></Route>
      <Route path="/editar-perfil" element={<EditarPerfil/>} ></Route>
      {/* Rutas administrativas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute rolPermitido="Admin">
            <App />
          </ProtectedRoute>
        }
      >
        <Route path="clientes" element={<PaginaClientes />} />
        <Route path="pedidos" element={<PaginaPedidos />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="proveedores" element={<PaginaProveedores />} />
        <Route path="productos" element={<PaginaProductos />} />
        <Route path="compras" element={<PaginaCompras />} />
        <Route path="categorias" element={<PaginaCategorias />} />
        {/* <Route path="perfil" element={<PerfilAdmin />} /> */}
        <Route path="roles" element={<PaginaRoles />} />
        {/* <Route path="editar-perfil-Ad" element={<EditarPerfilAdmin />} /> */}
      </Route>
      {/* Rutas publicas
      <Route path="/" element={<ClientLayout />}>
        <Route path="/home" />
      </Route> */}
    </Routes>
  );
};

export default Router;
