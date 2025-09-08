import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const FormularioAbono = ({ 
  show, 
  close, 
  pedido, 
  onAbonar, 
  formatearMoneda 
}) => {
  const [montoAbono, setMontoAbono] = useState("");
  const [error, setError] = useState("");

  if (!show || !pedido) return null;

  const saldoPendiente = pedido.Total - pedido.Abonos;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const monto = parseFloat(montoAbono);
    
    // Validaciones
    if (!monto || monto <= 0) {
      setError("Ingrese un monto válido mayor a 0");
      return;
    }
    
    if (monto > saldoPendiente) {
      setError("El abono no puede ser mayor al saldo pendiente");
      return;
    }

    onAbonar(pedido.Id_Pedido, monto);
    handleClose();
  };

  const handleClose = () => {
    setMontoAbono("");
    setError("");
    close();
  };

  const handleMontoChange = (e) => {
    setMontoAbono(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Registrar Abono
          </h3>
          <Icon
            icon="material-symbols:close"
            width="24"
            height="24"
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={handleClose}
          />
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Información del Pedido</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Cliente:</span> {pedido.Cliente}</p>
            <p><span className="font-medium">Total:</span> {formatearMoneda(pedido.Total)}</p>
            <p><span className="font-medium">Abonado:</span> {formatearMoneda(pedido.Abonos)}</p>
            <p className="text-lg font-bold text-orange-600">
              <span className="font-medium">Saldo Pendiente:</span> {formatearMoneda(saldoPendiente)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Abonar
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={saldoPendiente}
              value={montoAbono}
              onChange={handleMontoChange}
              placeholder="Ingrese el monto"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <Icon icon="material-symbols:info-outline" className="inline mr-1" />
              Después del abono quedará un saldo de: {" "}
              <span className="font-bold">
                {formatearMoneda(saldoPendiente - (parseFloat(montoAbono) || 0))}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
            >
              Registrar Abono
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAbono;