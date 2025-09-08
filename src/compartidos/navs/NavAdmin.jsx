import { NavLink } from "react-router";
import AmaraLogo from "../../assets/AmaraLogo.png";
import "./navAd.css";

function NavAdmin() {
  return (
    <>
      <nav>
        <ul>
          <img src={AmaraLogo} alt="logo" />
          <li>
            <NavLink className="link-route-admin" to="/admin/productos">
              <b>Productos</b>
            </NavLink>
          </li>
          <li>
            <NavLink className="link-route-admin" to="/admin/compras">
              <b>Compras</b>
            </NavLink>
          </li>

          <li>
            <NavLink className="link-route-admin" to="/admin/proveedores">
              <b>Proveedor</b>
            </NavLink>
          </li>

          <li>
            <NavLink className="link-route-admin" to="/admin/categorias">
              <b>Categoria</b>
            </NavLink>
          </li>

          <li>
            <NavLink className="link-route-admin" to="/admin/pedidos">
              <b>Pedidos</b>
            </NavLink>
          </li>
          <li>
            <NavLink className="link-route-admin" to="/admin/clientes">
              <b>Clientes</b>
            </NavLink>
          </li>
          <li>
            <NavLink className="link-route-admin" to="/admin/dashboard">
              <b>Dashboard</b>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
export default NavAdmin;
