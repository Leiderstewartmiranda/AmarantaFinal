import React, { Children } from "react";

const TablaAdmin = ({ listaCabecera, children }) => {
  return (
    <table className="min-w-full bg-[var(--beige)] border border-gray-300">
      <thead className="bg-[var(--naranjado)] text-white">
        <tr>
          {listaCabecera.map((element) => (
            <th
              key={element}
              className={`py-2 px-4 text-${
                element == "Acciones" ? "center" : "left"
              } text-sm font-semibold tracking-wider`}
            >
              {element}
            </th>
          ))}
        </tr>
      </thead>
      <tbody class="bg-[var(--blanco)]">{Children.toArray(children)}</tbody>
    </table>
  );
};

export default TablaAdmin;
