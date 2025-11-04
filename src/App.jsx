import "./App.css";
import { Outlet } from "react-router-dom";
import NavAdmin from "./compartidos/navs/NavAdmin";

function App() {
  return (
    <div className="admin-layout">
      {/* Sidebar fija */}
      <NavAdmin />

      {/* Contenido dinámico */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
