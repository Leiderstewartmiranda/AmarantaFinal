import React, { createContext, useContext, useState } from 'react';

// Crear el contexto
const ClienteContext = createContext();

// Hook personalizado para usar el contexto
export const useClientes = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error('useClientes debe ser usado dentro de un ClienteProvider');
  }
  return context;
};

// Provider del contexto
export const ClienteProvider = ({ children }) => {
  const [listaClientes, setListaClientes] = useState([
    {
      Id_Cliente: 1,
      Documento: "123456789",
      Nombre: "Juan",
      Apellido: "Pérez",
      Correo: "juan.perez@example.com",
      Telefono: "3001234567",
      Id_Rol: 1,
    },
    {
      Id_Cliente: 2,
      Documento: "987654321",
      Nombre: "María",
      Apellido: "Gómez",
      Correo: "maria.gomez@example.com",
      Telefono: "3007654321",
      Id_Rol: 2,
    },
    {
      Id_Cliente: 3,
      Documento: "456789123",
      Nombre: "Carlos",
      Apellido: "López",
      Correo: "carlos.lopez@example.com",
      Telefono: "3009876543",
      Id_Rol: 1,
    },
    {
      Id_Cliente: 4,
      Documento: "321654987",
      Nombre: "Ana",
      Apellido: "Martínez",
      Correo: "ana.martinez@example.com",
      Telefono: "3006543210",
      Id_Rol: 2,
    },
    {
      Id_Cliente: 5,
      Documento: "159753486",
      Nombre: "Luis",
      Apellido: "Hernández",
      Correo: "luis.hernandez@example.com",
      Telefono: "3003216549",
      Id_Rol: 1,
    },
    {
      Id_Cliente: 6,
      Documento: "753159486",
      Nombre: "Sofía",
      Apellido: "Torres",
      Correo: "sofia.torres@example.com",
      Telefono: "3009871234",
      Id_Rol: 2,
    },
  ]);

  // Función para agregar un nuevo cliente
  const agregarCliente = (nuevoCliente) => {
    const clienteConId = {
      ...nuevoCliente,
      Id_Cliente: Math.max(...listaClientes.map(c => c.Id_Cliente), 0) + 1
    };
    setListaClientes(prev => [...prev, clienteConId]);
    return clienteConId;
  };

  // Función para actualizar un cliente
  const actualizarCliente = (id, clienteActualizado) => {
    setListaClientes(prev => 
      prev.map(cliente => 
        cliente.Id_Cliente === id ? { ...clienteActualizado, Id_Cliente: id } : cliente
      )
    );
  };

  // Función para eliminar un cliente
  const eliminarCliente = (id) => {
    setListaClientes(prev => prev.filter(cliente => cliente.Id_Cliente !== id));
  };

  // Función para obtener un cliente por ID
  const obtenerClientePorId = (id) => {
    return listaClientes.find(cliente => cliente.Id_Cliente === id);
  };

  const value = {
    listaClientes,
    setListaClientes,
    agregarCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerClientePorId
  };

  return (
    <ClienteContext.Provider value={value}>
      {children}
    </ClienteContext.Provider>
  );
};