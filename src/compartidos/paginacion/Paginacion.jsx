import { Icon } from '@iconify/react';
import React from 'react';

const Paginacion = ({ paginaActual, totalPaginas, handleCambioPagina }) => {
  
  // 🔹 CORREGIR EL NOMBRE: "generarNumerosPagina" (no "generalNumerosPagina")
  const generarNumerosPagina = () => {
    const paginas = [];
    const maxPaginas = 5;
    
    if (totalPaginas <= maxPaginas) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas con "..." cuando hay muchas
      if (paginaActual <= 3) {
        // Al inicio: 1, 2, 3, 4, ..., última
        for (let i = 1; i <= 4; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        // Al final: 1, ..., últimas 4 páginas
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i);
      } else {
        // En medio: 1, ..., actual-1, actual, actual+1, ..., última
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  // Si no hay páginas, no mostrar nada
  if (totalPaginas <= 1) return null;

  return (
    <section className="col-span-2 flex justify-center mt-4">
      <div className="flex items-center space-x-1">
        {/* Botón Anterior */}
        <button
          onClick={() => handleCambioPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`p-2 rounded transition-colors ${
            paginaActual === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon icon="material-symbols:chevron-left" width="20" height="20" />
        </button>

        {/* Números de página - 🔹 USAR el nombre CORRECTO aquí también */}
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
                    : 'bg-white text-gray-600 hover:bg-gray-100'
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
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon icon="material-symbols:chevron-right" width="20" height="20" />
        </button>
      </div>
    </section>
  );
};

export default Paginacion;