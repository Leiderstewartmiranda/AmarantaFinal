import { Icon } from "@iconify/react/dist/iconify.js";

const FormularioVerCompra = ({
  show,
  close,
  compra,
  formatoMoneda,
  descargarFactura
}) => {
  if (!show || !compra) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Detalles de la Compra #{compra.Id_Compra}</h3>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="material-symbols:close" width="24" height="24" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Compra</p>
              <p className="text-sm font-semibold">{compra.Fecha}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Proveedor</p>
              <p className="text-sm font-semibold">{compra.Proveedor}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="text-sm font-semibold">{compra.Cliente}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                compra.Estado === "Completado" 
                  ? "bg-green-100 text-green-800" 
                  : compra.Estado === "Pendiente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {compra.Estado}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-bold text-blue-700">{formatoMoneda(compra.Total)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Factura</p>
              <button
                onClick={() => descargarFactura(compra)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Icon icon="material-symbols:download" width="20" height="20" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detalles de productos */}
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-3">Productos de la Compra</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Producto</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Precio Unitario</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {compra.Productos.map((producto, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4 text-sm">{producto.nombre}</td>
                    <td className="py-2 px-4 text-right text-sm">{producto.cantidad}</td>
                    <td className="py-2 px-4 text-right text-sm">{formatoMoneda(producto.precio)}</td>
                    <td className="py-2 px-4 text-right text-sm font-medium">
                      {formatoMoneda(producto.cantidad * producto.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={close}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioVerCompra;