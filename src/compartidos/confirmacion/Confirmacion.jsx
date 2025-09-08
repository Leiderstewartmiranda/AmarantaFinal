import { Icon } from "@iconify/react/dist/iconify.js";

const ModalConfirmacion = ({ 
  show, 
  onClose, 
  onConfirm, 
  titulo = "Confirmar acción",
  mensaje = "¿Estás seguro de realizar esta acción?",
  detalles = null,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  tipoIcono = "warning", // warning, danger, info, success
  colorConfirmar = "red" // red, blue, green, orange
}) => {
  if (!show) return null;

  const getIcono = () => {
    switch (tipoIcono) {
      case "danger":
        return "material-symbols:delete-outline";
      case "warning":
        return "material-symbols:warning-outline";
      case "info":
        return "material-symbols:info-outline";
      case "success":
        return "material-symbols:check-circle-outline";
      default:
        return "material-symbols:help-outline";
    }
  };

  const getColorIcono = () => {
    switch (tipoIcono) {
      case "danger":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "success":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getColorBoton = () => {
    switch (colorConfirmar) {
      case "red":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
      case "green":
        return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
      case "orange":
        return "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500";
      default:
        return "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 ${getColorIcono()}`}>
              <Icon icon={getIcono()} width="24" height="24" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {titulo}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <Icon icon="material-symbols:close" width="24" height="24" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4">
            {mensaje}
          </p>
          
          {detalles && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                {detalles}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon icon="material-symbols:warning" className="text-yellow-400" width="20" height="20" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {textoCancelar}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getColorBoton()}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;