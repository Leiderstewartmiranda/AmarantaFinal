import { Route, Routes } from "react-router";
import App from "./App";
// Clientes
import PaginaClientes from "./features/admin/clientes/pages/PaginaClientes";
import PaginaPedidos from "./features/admin/pedidos/pages/PaginaPedidos";
import Dashboard from "./features/admin/dashboard/pages/DashBoard";
import PaginaProveedores from "./features/admin/proveedores/pages/PaginaProveedores";
import PaginaProductos from "./features/admin/productos/pages/PaginaProductos";
import PaginaCompras from "./features/admin/compras/pages/PaginaCompras";
import PaginaCategorias from "./features/admin/categorias/pages/PaginaCategorias";

const Router = () => {
  return (
    <Routes>
      {/* Rutas administrativas */}
      <Route path="/admin" element={<App />}>
        <Route path="clientes" element={<PaginaClientes />} />
        <Route path="pedidos" element={<PaginaPedidos/>} />
        <Route path="dashboard" element={<Dashboard/>} />
        <Route path="proveedores" element={<PaginaProveedores />} />
        <Route path="productos" element={<PaginaProductos />} />
        <Route path="compras" element={<PaginaCompras />} />
        <Route path="categorias" element={<PaginaCategorias />} />
      </Route>
      {/* Rutas publicas
      <Route path="/" element={<ClientLayout />}>
        <Route path="/home" />
      </Route> */}
    </Routes>
  );
};

export default Router;
