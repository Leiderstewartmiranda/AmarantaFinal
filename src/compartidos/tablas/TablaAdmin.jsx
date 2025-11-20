import React, { Children } from "react";
import "./tablaAdmin.css";

const TablaAdmin = ({ listaCabecera, children }) => {
  return (
    <div className="table-container">
      <table className="tabla-admin">
        <thead>
          <tr>
            {listaCabecera.map((col, index) => {
              const esObjeto = typeof col === "object";

              return (
                <th
                  key={index}
                  onClick={esObjeto && col.onClick ? col.onClick : undefined}
                  className={`${
                    (esObjeto ? col.titulo : col) === "Acciones"
                      ? "text-center"
                      : "text-left"
                  } ${esObjeto && col.onClick ? "cursor-pointer select-none" : ""}`}
                >
                  {esObjeto ? (
                    <div className="flex items-center gap-1">
                      {col.titulo}
                      {col.icono && <span>{col.icono}</span>}
                    </div>
                  ) : (
                    col
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default TablaAdmin;
