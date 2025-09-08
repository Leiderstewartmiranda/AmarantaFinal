import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";
import { useRef, useState, useMemo } from "react";
import FormularioAgregar from "../components/forms/FormularioAgregar";
import FormularioModificar from "../components/forms/FormularioModificar";
import FormularioVerDetalles from "../components/forms/FormularioVerDetalles";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";

const PaginaClientes = () => {
  const [listaClientes, setListaClientes] = useState([
    {
      Id_Cliente: 1,
      TipoDocumento: "CC",
      Documento: "123456789",
      NombreCompleto: "Juan Pérez",
      Correo: "juan.perez@example.com",
      Telefono: "3001234567",
      Direccion: "Calle 123 #45-67",
      Estado: "Activo",
    },
    {
      Id_Cliente: 2,
      TipoDocumento: "CE",
      Documento: "987654321",
      NombreCompleto: "María Gómez",
      Correo: "maria.gomez@example.com",
      Telefono: "3007654321",
      Direccion: "Avenida 456 #78-90",
      Estado: "Activo",
    },
  ]);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5; 
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    TipoDocumento: "",
    Documento: "",
    NombreCompleto: "",
    Correo: "",
    Telefono: "",
    Direccion: "",
    Estado: "",
  });

  // Referencias para los formularios (mantener para FormularioModificar si es necesario)
  const tipoDocumentoRef = useRef();
  const documentoRef = useRef();
  const nombreCompletoRef = useRef();
  const correoRef = useRef();
  const telefonoRef = useRef();
  const direccionRef = useRef();
  const estadoRef = useRef();
  const busquedaRef = useRef();

  // Filtrar clientes basado en el término de búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaClientes;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaClientes.filter((cliente) => {
      const nombreCompleto = cliente.NombreCompleto.toLowerCase();
      const tipoDocumento = cliente.TipoDocumento.toLowerCase();
      const documento = cliente.Documento.toLowerCase();
      const correo = cliente.Correo.toLowerCase();
      const telefono = cliente.Telefono.toLowerCase();
      const direccion = cliente.Direccion ? cliente.Direccion.toLowerCase() : "";
      const estado = cliente.Estado.toLowerCase();

      return (
        nombreCompleto.includes(termino) ||
        tipoDocumento.includes(termino) ||
        documento.includes(termino) ||
        correo.includes(termino) ||
        telefono.includes(termino) ||
        direccion.includes(termino) ||
        estado.includes(termino)
      );
    });
  }, [listaClientes, terminoBusqueda]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const indiceFin = indiceInicio + clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFin);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // NUEVA función para manejar agregar cliente - compatible con FormularioAgregar
  const handleAgregarCliente = (datosFormulario) => {
    const nuevoCliente = {
      Id_Cliente: Math.max(...listaClientes.map(c => c.Id_Cliente), 0) + 1,
      TipoDocumento: datosFormulario.tipoDocumento,
      Documento: datosFormulario.documento,
      NombreCompleto: datosFormulario.nombreCompleto,
      Correo: datosFormulario.correo,
      Telefono: datosFormulario.telefono,
      Direccion: datosFormulario.direccion || "",
      Estado: datosFormulario.estado,
    };

    setListaClientes(prevClientes => [...prevClientes, nuevoCliente]);
    console.log("Cliente agregado:", nuevoCliente);
  };

  const handleEditarSubmit = (e) => {
    e.preventDefault();

    const updatedCliente = {
      Id_Cliente: formData.Id_Cliente,
      TipoDocumento: tipoDocumentoRef.current.value,
      Documento: documentoRef.current.value,
      NombreCompleto: nombreCompletoRef.current.value,
      Correo: correoRef.current.value,
      Telefono: telefonoRef.current.value,
      Direccion: direccionRef.current.value,
      Estado: estadoRef.current.value,
    };

    setListaClientes(
      listaClientes.map((cliente) =>
        cliente.Id_Cliente === formData.Id_Cliente ? updatedCliente : cliente
      )
    );
    closeModal();
  };

  const handleEliminar = (id) => {
    const cliente = listaClientes.find((cliente) => cliente.Id_Cliente === id);
    
    if (cliente) {
      setClienteAEliminar(cliente);
      setShowConfirmacion(true);
    }
  };

  const confirmarEliminacion = () => {
    if (clienteAEliminar) {
      setListaClientes(
        listaClientes.filter(
          (cliente) => cliente.Id_Cliente !== clienteAEliminar.Id_Cliente
        )
      );
      setClienteAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setClienteAEliminar(null);
  };

  const mostrarEditar = (id) => {
    const cliente = listaClientes.find((cliente) => cliente.Id_Cliente === id);

    if (cliente) {
      setFormData({
        TipoDocumento: cliente.TipoDocumento,
        Documento: cliente.Documento,
        NombreCompleto: cliente.NombreCompleto,
        Correo: cliente.Correo,
        Telefono: cliente.Telefono,
        Direccion: cliente.Direccion,
        Estado: cliente.Estado,
        Id_Cliente: cliente.Id_Cliente,
      });
      setShowEditar(true);
    }
  };

  const mostrarDetalles = (id) => {
    const cliente = listaClientes.find((cliente) => cliente.Id_Cliente === id);
    if (cliente) {
      setClienteSeleccionado(cliente);
      setShowDetalles(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setFormData({
      TipoDocumento: "",
      Documento: "",
      NombreCompleto: "",
      Correo: "",
      Telefono: "",
      Direccion: "",
      Estado: "",
    });
  };

  const closeDetalles = () => {
    setShowDetalles(false);
    setClienteSeleccionado(null);
  };

  // Función para generar los números de página
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 7;
    
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        numeros.push(1);
        numeros.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }
    
    return numeros;
  };

  return (
    <>
      <section className="flex justify-center col-span-2">
        <h2 className="text-2xl font-bold">Clientes</h2>
      </section>
      
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda 
            ref={busquedaRef}
            placeholder="Buscar cliente"
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {clientesFiltrados.length} de {listaClientes.length} clientes
            </p>
          )}
        </div>
      </section>

      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <TablaAdmin
          listaCabecera={["Nombre Completo", "Tipo Doc.", "Documento", "Correo", "Teléfono", "Estado", "Acciones"]}
        >
          {clientesPaginados.length > 0 ? (
            clientesPaginados.map((element) => (
              <tr
                key={element.Id_Cliente}
                className="hover:bg-gray-100 border-t-2 border-gray-300"
              >
                <td className="py-2 px-4">
                  {element.NombreCompleto}
                </td>
                <td className="py-2 px-4">{element.TipoDocumento}</td>
                <td className="py-2 px-4">{element.Documento}</td>
                <td className="py-2 px-4">{element.Correo}</td>
                <td className="py-2 px-4">{element.Telefono}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    element.Estado === "Activo" ? "bg-green-100 text-green-800" :
                    element.Estado === "Inactivo" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {element.Estado}
                  </span>
                </td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <Icon
                    icon="mdi:eye-outline"
                    width="24"
                    height="24"
                    className="text-green-700 cursor-pointer hover:text-green-900 transition-colors"
                    onClick={() => mostrarDetalles(element.Id_Cliente)}
                    title="Ver detalles"
                  />
                  <Icon
                    icon="material-symbols:edit-outline"
                    width="24"
                    height="24"
                    className="text-blue-700 cursor-pointer hover:text-blue-900 transition-colors"
                    onClick={() => mostrarEditar(element.Id_Cliente)}
                    title="Editar"
                  />
                  <Icon
                    icon="tabler:trash"
                    width="24"
                    height="24"
                    className="text-red-700 cursor-pointer hover:text-red-900 transition-colors"
                    onClick={() => handleEliminar(element.Id_Cliente)}
                    title="Eliminar"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                {terminoBusqueda ? 
                  `No se encontraron clientes que coincidan con "${terminoBusqueda}"` : 
                  "No hay clientes disponibles"
                }
              </td>
            </tr>
          )}
        </TablaAdmin>
        </div>
      </section>

      {totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          handleCambioPagina={handleCambioPagina}
          generarNumerosPagina={generarNumerosPagina}
        />
      )}

      {/* FormularioAgregar actualizado - usando la nueva función */}
      <FormularioAgregar
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarCliente}
        titulo="Agregar Nuevo Cliente"
      />

      <FormularioModificar
        show={showEditar}
        close={closeModal}
        formData={formData}
        onSubmit={handleEditarSubmit}
        tipoDocumentoRef={tipoDocumentoRef}
        documentoRef={documentoRef}
        nombreCompletoRef={nombreCompletoRef}
        correoRef={correoRef}
        telefonoRef={telefonoRef}
        direccionRef={direccionRef}
        estadoRef={estadoRef}
      />

      <FormularioVerDetalles
        show={showDetalles}
        close={closeDetalles}
        cliente={clienteSeleccionado}
      />

      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Cliente"
        mensaje="¿Estás seguro de que deseas eliminar este cliente?"
        detalles={clienteAEliminar && (
          <>
            <div><strong>Nombre:</strong> {clienteAEliminar.NombreCompleto}</div>
            <div><strong>Tipo Documento:</strong> {clienteAEliminar.TipoDocumento}</div>
            <div><strong>Documento:</strong> {clienteAEliminar.Documento}</div>
            <div><strong>Correo:</strong> {clienteAEliminar.Correo}</div>
            <div><strong>Teléfono:</strong> {clienteAEliminar.Telefono}</div>
            <div><strong>Estado:</strong> {clienteAEliminar.Estado}</div>
          </>
        )}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tipoIcono="danger"
        colorConfirmar="red"
      />
    </>
  );
};

export default PaginaClientes;