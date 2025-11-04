import React, { useEffect, useState, useMemo } from "react";
import { GetDashboardData } from "../../../services/dashboardService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Icon } from "@iconify/react";
import "./dashboard.css";
import TituloSeccion from "../../../compartidos/Titulo/Titulos";

export default function Dashboard() {
  const [data, setData] = useState({ productos: [], clientes: [], pedidos: [], compras: [] });
  const [filtro, setFiltro] = useState("Año");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await GetDashboardData();
      setData(res);
      setLoading(false);
    })();
  }, []);

  // 📈 Cálculos derivados
  const resumen = useMemo(() => {
    const totalVentas = data.pedidos.reduce((acc, p) => acc + (p.precioTotal || 0), 0);
    const totalProductos = data.productos.length;
    const totalClientes = data.clientes.length;
    const totalPedidos = data.pedidos.length;

    const ventasPorMes = Array.from({ length: 12 }, (_, i) => ({
      mes: new Date(2025, i, 1).toLocaleString("es-CO", { month: "short" }),
      ventas: data.pedidos
        .filter(p => new Date(p.fechaPedido).getMonth() === i)
        .reduce((acc, p) => acc + (p.precioTotal || 0), 0)
    }));

    const topProductos = data.productos
      .sort((a, b) => (b.Stock || 0) - (a.Stock || 0))
      .slice(0, 5);

    const ultimosPedidos = [...data.pedidos]
      .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
      .slice(0, 5);

    return {
      totalVentas,
      totalProductos,
      totalClientes,
      totalPedidos,
      ventasPorMes,
      topProductos,
      ultimosPedidos
    };
  }, [data]);

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor);

  if (loading) return <div className="loading">Cargando Dashboard...</div>;

  return (
    <div className="dashboard-container" >
      {/* ===== ENCABEZADO ===== */}
      <div className="dashboard-header">
        <TituloSeccion titulo="DashBoard" />
        <select className="dashboard-filter" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option>Hoy</option>
          <option>Semana</option>
          <option>Mes</option>
          <option>Año</option>
        </select>
      </div>

      {/* ===== TARJETAS ===== */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ventas Totales</span>
            <Icon icon="mdi:cash" className="card-icon orange" />
          </div>
          <div className="card-value">{formatoMoneda(resumen.totalVentas)}</div>
          <p className="card-desc">Ingresos acumulados</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Productos</span>
            <Icon icon="mdi:package-variant" className="card-icon green" />
          </div>
          <div className="card-value">{resumen.totalProductos}</div>
          <p className="card-desc">Total activos</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Pedidos</span>
            <Icon icon="mdi:cart-outline" className="card-icon yellow" />
          </div>
          <div className="card-value">{resumen.totalPedidos}</div>
          <p className="card-desc">Pedidos registrados</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Clientes</span>
            <Icon icon="mdi:account-group" className="card-icon red" />
          </div>
          <div className="card-value">{resumen.totalClientes}</div>
          <p className="card-desc">Clientes activos</p>
        </div>
      </div>

      {/* ===== GRÁFICOS ===== */}
      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Ventas por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resumen.ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(v) => formatoMoneda(v)} />
              <Line type="monotone" dataKey="ventas" stroke="#d15113" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Productos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resumen.topProductos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="nombreProducto" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#4a4b2f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== TABLA ===== */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Últimos Pedidos</h3>
        </div>
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {resumen.ultimosPedidos.map((p, i) => (
              <tr key={i}>
                <td>{p.nombreCliente || "Desconocido"}</td>
                <td>{new Date(p.fechaPedido).toLocaleDateString()}</td>
                <td>{formatoMoneda(p.precioTotal)}</td>
                <td>
                  <span className={`status ${p.estado === "Completado" ? "Pendiente" : "Cancelado"}`}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
