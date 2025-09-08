import React from "react";

const BotonAgregar = ({ action }) => {
  return (
    <button
      onClick={action}
      className="bg-[var(--naranjado)] text-white font-bold py-2 px-4 rounded hover:bg-orange-700 transition duration-300"
    >
      Agregar
    </button>
  );
};

export default BotonAgregar;
