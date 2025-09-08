import { Icon } from '@iconify/react';
import React from 'react';

const Paginacion = ({ paginaActual, totalPaginas, handleCambioPagina, generarNumerosPagina }) => {
  return (
    <section className="col-span-2 flex justify-center mt-4">
      <div className="flex items-center space-x-1">
        {/* Botón Anterior */}
        <button
          onClick={() => handleCambioPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`p-2 rounded transition-colors ${
            paginaActual === 1
              ? 'bg-white cursor-not-allowed'
              : 'bg-white'
          }`}
        >
          <Icon icon="material-symbols:chevron-left" width="20" height="20" />
        </button>

        {/* Números de página */}
        {generarNumerosPagina().map((numero, index) => (
          <div key={index}>
            {numero === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => handleCambioPagina(numero)}
                className={`px-3 py-2 rounded transition-colors ${
                  paginaActual === numero
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {numero}
              </button>
            )}
          </div>
        ))}

        {/* Botón Siguiente */}
        <button 
          onClick={() => handleCambioPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`p-2 rounded transition-colors ${
            paginaActual === totalPaginas
              ? 'bg-white cursor-not-allowed'
              : 'bg-white '
          }`}
        >
          <Icon icon="material-symbols:chevron-right" width="20" height="20" />
        </button>
      </div>
    </section>
  );
};

export default Paginacion;