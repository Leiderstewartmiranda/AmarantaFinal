import React, { Children } from "react";
import "./tablaAdmin.css"; // nuevo archivo para el estilo

const TablaAdmin = ({ listaCabecera, children }) => {
  return (
    <div className="table-container">
      <table className="tabla-admin">
        <thead>
          <tr>
            {listaCabecera.map((element) => (
              <th
                key={element}
                className={`${
                  element === "Acciones" ? "text-center" : "text-left"
                }`}
              >
                {element}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{Children.toArray(children)}</tbody>
      </table>
    </div>
  );
};

export default TablaAdmin;
