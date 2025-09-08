import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Icon } from '@iconify/react/dist/iconify.js';

const Dashboard = () => {
  // Datos de pedidos
  const [pedidos] = useState([
    {
      Id_Pedido: 1,
      Cliente: "Juan Pérez",
      Id_Cliente: 1,
      Direccion: "Calle 123 #45-67, Medellín",
      Total: 150000,
      Correo: "juan.perez@example.com",
      Estado: "Completado",
      Abonos: 150000,
      Fecha: "2024-01-15"
    },
    {
      Id_Pedido: 24,
      Cliente: "María Gómez",
      Id_Cliente: 2,
      Total: 315000,
      Estado: "Completado",
      Abonos: 315000,
      Fecha: "2024-12-15"
    },
    // Nuevos datos quemados
    {
      Id_Pedido: 35,
      Cliente: "Carlos Ruiz",
      Id_Cliente: 3,
      Total: 210000,
      Estado: "Completado",
      Abonos: 210000,
      Fecha: "2024-05-10"
    },
    {
      Id_Pedido: 42,
      Cliente: "Ana Torres",
      Id_Cliente: 4,
      Total: 180000,
      Estado: "Completado",
      Abonos: 180000,
      Fecha: "2024-07-22"
    }
  ]);

  // Filtrar solo pedidos completados del año actual
  const pedidosCompletados = pedidos.filter(pedido => 
    pedido.Estado === "Completado" && 
    new Date(pedido.Fecha).getFullYear() === 2024
  );

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  // Datos calculados
  const datosCalculados = useMemo(() => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Inicializar datos por mes
    const ventasPorMes = meses.map((mes, index) => ({
      mes,
      ventas: 0,
      cantidad: 0,
      numeroMes: index + 1
    }));

    // Calcular ventas por mes
    pedidosCompletados.forEach(pedido => {
      const fechaPedido = new Date(pedido.Fecha);
      const mes = fechaPedido.getMonth();
      ventasPorMes[mes].ventas += pedido.Total;
      ventasPorMes[mes].cantidad += 1;
    });

    // Encontrar mes con más y menos ventas
    const mesConMasVentas = ventasPorMes.reduce((max, mes) => 
      mes.ventas > max.ventas ? mes : max
    );
    const mesConMenosVentas = ventasPorMes.reduce((min, mes) => 
      mes.ventas < min.ventas && mes.ventas > 0 ? mes : min
    );

    // Calcular clientes frecuentes
    const clientesVentas = {};
    pedidosCompletados.forEach(pedido => {
      if (!clientesVentas[pedido.Id_Cliente]) {
        clientesVentas[pedido.Id_Cliente] = {
          nombre: pedido.Cliente,
          totalVentas: 0,
          cantidadPedidos: 0
        };
      }
      clientesVentas[pedido.Id_Cliente].totalVentas += pedido.Total;
      clientesVentas[pedido.Id_Cliente].cantidadPedidos += 1;
    });

    // Top 3 clientes por cantidad de pedidos
    const topClientes = Object.values(clientesVentas)
      .sort((a, b) => b.cantidadPedidos - a.cantidadPedidos)
      .slice(0, 3);

    // Total del año
    const totalAnual = pedidosCompletados.reduce((sum, pedido) => sum + pedido.Total, 0);

    return {
      ventasPorMes,
      mesConMasVentas,
      mesConMenosVentas,
      topClientes,
      totalAnual,
      totalPedidos: pedidosCompletados.length
    };
  }, [pedidosCompletados]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[442px_1fr_442px] gap-12.5 ml-6.9 lg:ml-19.55 p-7.59">
      {/* Tarjetas de resumen */}
      <section className="w-[442px] flex-shrink-0 grid grid-cols-1 gap-6.58">
        {[
          {
            title: "Total Ventas",
            value: formatearMoneda(datosCalculados.totalAnual),
            icon: "material-symbols:attach-money",
            color: "blue"
          },
          {
            title: "Total Pedidos",
            value: datosCalculados.totalPedidos,
            icon: "material-symbols:shopping-cart",
            color: "green"
          },
          {
            title: "Promedio Mensual",
            value: formatearMoneda(datosCalculados.totalAnual / 12),
            icon: "material-symbols:trending-up",
            color: "yellow"
          },
          {
            title: "Ticket Promedio",
            value: formatearMoneda(datosCalculados.totalAnual / datosCalculados.totalPedidos),
            icon: "material-symbols:calculate",
            color: "purple"
          }
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm py-5.57 px-5.06 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2.53">
                <p className="text-sm font-medium text-gray-600" style={{ fontSize: '14.35px' }}>{card.title}</p>
                <p className="text-xl font-bold text-gray-900" style={{ fontSize: '23px' }}>
                  {card.value}
                </p>
              </div>
              <div className={`py-2.53 px-2.53 bg-${card.color}-100 rounded-full`}>
                <Icon icon={card.icon} className={`w-7.59 h-7.59 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Gráficos principales */}
      <section className="w-[632px] flex-shrink-0 gap-11.41 flex flex-col">
        {/* Gráfico de líneas */}
        <div className="bg-white p-5.57 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-3.79" style={{ fontSize: '20.24px' }}>Ventas por Mes</h3>
          <div className="h-[345px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosCalculados.ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: '15.82px' }} interval={0} angle={-30} textAnchor="end" height={81} />
                <YAxis tick={{ fontSize: '15.82px' }} />
                <Tooltip 
                  formatter={(value) => [formatearMoneda(value), 'Ventas']}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#3B82F6" 
                  strokeWidth={2.3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2.3, r: 5.75 }}
                  activeDot={{ r: 9.2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-white p-5.57 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-3.79" style={{ fontSize: '20.24px' }}>Cantidad de Pedidos por Mes</h3>
          <div className="h-[345px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosCalculados.ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: '15.82px' }} interval={0} angle={-30} textAnchor="end" height={81} />
                <YAxis tick={{ fontSize: '15.82px' }} />
                <Tooltip 
                  formatter={(value) => [value, 'Pedidos']}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Bar dataKey="cantidad" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Sección de análisis */}
      <section className="w-[442px] flex-shrink-0 grid grid-rows-2 gap-8.83">
        {/* Mejores y peores meses */}
        <div className="bg-white py-6.44 px-5.57 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4.14" style={{ fontSize: '20.24px' }}>Análisis de Meses</h3>
          <div className="space-y-4.14">
            <div className="flex items-center justify-between py-4.05 px-3.54 bg-green-50 rounded-lg">
              <div className="space-y-1.29">
                <p className="text-sm font-medium text-green-800" style={{ fontSize: '14.35px' }}>Mejor Mes</p>
                <p className="text-base font-bold text-green-900" style={{ fontSize: '18.4px' }}>
                  {datosCalculados.mesConMasVentas.mes}
                </p>
              </div>
              <div className="text-right space-y-1.29">
                <p className="text-sm text-green-700" style={{ fontSize: '14.35px' }}>Total:</p>
                <p className="text-base font-bold text-green-900" style={{ fontSize: '18.4px' }}>
                  {formatearMoneda(datosCalculados.mesConMasVentas.ventas)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-4.05 px-3.54 bg-red-50 rounded-lg">
              <div className="space-y-1.29">
                <p className="text-sm font-medium text-red-800" style={{ fontSize: '14.35px' }}>Mes con Menos Ventas</p>
                <p className="text-base font-bold text-red-900" style={{ fontSize: '18.4px' }}>
                  {datosCalculados.mesConMenosVentas.mes}
                </p>
              </div>
              <div className="text-right space-y-1.29">
                <p className="text-sm text-red-700" style={{ fontSize: '14.35px' }}>Total:</p>
                <p className="text-base font-bold text-red-900" style={{ fontSize: '18.4px' }}>
                  {formatearMoneda(datosCalculados.mesConMenosVentas.ventas)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 clientes */}
        <div className="bg-white py-6.44 px-5.57 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4.14" style={{ fontSize: '20.24px' }}>Top 3 Clientes Habituales</h3>
          <div className="space-y-4.14">
            {datosCalculados.topClientes.map((cliente, index) => (
              <div key={index} className="flex items-center justify-between py-4.05 px-3.54 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4.14">
                  <div className={`w-10.12 h-10.12 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="space-y-1.29">
                    <p className="text-sm font-medium text-gray-900" style={{ fontSize: '14.35px' }}>{cliente.nombre}</p>
                    <p className="text-xs text-gray-600" style={{ fontSize: '13.16px' }}>{cliente.cantidadPedidos} pedidos</p>
                  </div>
                </div>
                <div className="text-right space-y-1.29">
                  <p className="text-sm font-bold text-gray-900" style={{ fontSize: '14.35px' }}>
                    {formatearMoneda(cliente.totalVentas)}
                  </p>
                  <p className="text-xs text-gray-600" style={{ fontSize: '13.16px' }}>Total compras</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;