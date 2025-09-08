import "./App.css";
import { Outlet } from "react-router";

// Compartidos
import NavAdmin from "./compartidos/navs/NavAdmin";

function App() {
  return (
    <div className="flex">
      <NavAdmin />
      <div
        className="grid grid-rows-4 grid-cols-2 grid-rows-[60px_60px_1fr] gap-6 flex-grow w-full h-screen p-7"
        style={{ backgroundColor: "var(--beige)" }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default App;
