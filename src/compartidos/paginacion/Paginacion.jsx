import { Icon } from "@iconify/react";
import "./paginacion.css";

const Paginacion = ({ paginaActual, totalPaginas, handleCambioPagina }) => {
  const generarNumerosPagina = () => {
    const paginas = [];
    const maxPaginas = 5;

    if (totalPaginas <= maxPaginas) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) paginas.push(i);
        paginas.push("...");
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        paginas.push(1);
        paginas.push("...");
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i);
      } else {
        paginas.push(1, "...");
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) paginas.push(i);
        paginas.push("...", totalPaginas);
      }
    }
    return paginas;
  };

  if (totalPaginas <= 1) return null;

  return (
    <section className="paginacion">
      <button
        onClick={() => handleCambioPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="nav-btn"
      >
        <Icon icon="material-symbols:chevron-left" width="20" height="20" />
      </button>

      {generarNumerosPagina().map((numero, i) =>
        numero === "..." ? (
          <span key={i} className="pagina-dots">...</span>
        ) : (
          <button
            key={i}
            onClick={() => handleCambioPagina(numero)}
            className={`pagina-btn ${paginaActual === numero ? "active" : ""}`}
          >
            {numero}
          </button>
        )
      )}

      <button
        onClick={() => handleCambioPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="nav-btn"
      >
        <Icon icon="material-symbols:chevron-right" width="20" height="20" />
      </button>
    </section>
  );
};

export default Paginacion;
