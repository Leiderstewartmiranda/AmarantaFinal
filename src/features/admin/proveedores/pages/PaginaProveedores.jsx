import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import { useRef, useState, useMemo } from "react";
import FormularioAgregarProveedor from "../components/forms/FormularioAgregar";
import FormularioModificarProveedor from "../components/forms/FormularioModificar";
import FormularioVerProveedor from "../components/forms/FormularioVer";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";

const PaginaProveedores = () => {
  // Lista de proveedores
  const [listaProveedores, setListaProveedores] = useState([
    { 
      id: 1, 
      nombre: 'Distribuidora Caribe S.A.S', 
      contacto: 'contacto@caribe.com',
      telefono: '300-123-4567',
      tipoDocumento: 'NIT',
      documento: '900123456-1',
      estado: true,
      fechaCreacion: '2024-01-15'
    },
    { 
      id: 2, 
      nombre: 'Productos del Sur Ltda', 
      contacto: 'ventas@sur.com',
      telefono: '310-987-6543',
      tipoDocumento: 'NIT',
      documento: '800987654-2',
      estado: true,
      fechaCreacion: '2024-01-20'
    },
    { 
      id: 3, 
      nombre: 'Juan Carlos Pérez', 
      contacto: 'juan.perez@email.com',
      telefono: '320-555-7890',
      tipoDocumento: 'Cédula',
      documento: '12345678',
      estado: false,
      fechaCreacion: '2024-02-01'
    },
    { 
      id: 4, 
      nombre: 'Importadora Oceanía S.A', 
      contacto: 'info@oceania.co',
      telefono: '315-444-1122',
      tipoDocumento: 'NIT',
      documento: '900444555-7',
      estado: true,
      fechaCreacion: '2024-02-10'
    },
    { 
      id: 5, 
      nombre: 'Tecnología Avanzada Ltda', 
      contacto: 'info@tecnologia.co',
      telefono: '318-777-8888',
      tipoDocumento: 'NIT',
      documento: '900777888-9',
      estado: true,
      fechaCreacion: '2024-02-15'
    },
    { 
      id: 6, 
      nombre: 'María Elena Rodríguez', 
      contacto: 'maria.rodriguez@email.com',
      telefono: '319-666-5555',
      tipoDocumento: 'Cédula',
      documento: '98765432',
      estado: false,
      fechaCreacion: '2024-02-20'
    },
  ]);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const proveedoresPorPagina = 5; // Número de proveedores por página
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    contacto: "",
    telefono: "",
    tipoDocumento: "",
    documento: "",
    estado: true,
    fechaCreacion: ""
  });

  const busquedaRef = useRef();

  // Filtrar proveedores basado en el término de búsqueda
  const proveedoresFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaProveedores;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaProveedores.filter((proveedor) => {
      const nombre = proveedor.nombre.toLowerCase();
      const contacto = proveedor.contacto.toLowerCase();
      const tipoDocumento = proveedor.tipoDocumento.toLowerCase();
      const documento = proveedor.documento.toLowerCase();
      const telefono = proveedor.telefono ? proveedor.telefono.toLowerCase() : "";

      return (
        nombre.includes(termino) ||
        contacto.includes(termino) ||
        tipoDocumento.includes(termino) ||
        documento.includes(termino) ||
        telefono.includes(termino)
      );
    });
  }, [listaProveedores, terminoBusqueda]);

  // Calcular datos de paginación
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina);
  const indiceInicio = (paginaActual - 1) * proveedoresPorPagina;
  const indiceFin = indiceInicio + proveedoresPorPagina;
  const proveedoresPaginados = proveedoresFiltrados.slice(indiceInicio, indiceFin);

  // Manejar cambios en la barra de búsqueda
  const handleBusquedaChange = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1); // Resetear a la primera página cuando se busca
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Función para cambiar estado del proveedor
  const handleCambiarEstado = (id, nuevoEstado) => {
    setListaProveedores(
      listaProveedores.map((proveedor) =>
        proveedor.id === id ? { ...proveedor, estado: nuevoEstado } : proveedor
      )
    );
  };

  const handleAgregarSubmit = (nuevoProveedor) => {
    const nuevoId = Math.max(...listaProveedores.map(p => p.id)) + 1;
    const proveedorConId = { 
      ...nuevoProveedor, 
      id: nuevoId,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    
    setListaProveedores([...listaProveedores, proveedorConId]);
    setShowAgregar(false);
  };

  const handleEditarSubmit = (proveedorActualizado) => {
    setListaProveedores(
      listaProveedores.map((proveedor) =>
        proveedor.id === proveedorActualizado.id ? proveedorActualizado : proveedor
      )
    );
    closeModal();
  };

  const handleEliminar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.id === id);
    if (proveedor) {
      setProveedorAEliminar(proveedor);
      setShowConfirmacion(true);
    }
  };

  const confirmarEliminacion = () => {
    if (proveedorAEliminar) {
      setListaProveedores(
        listaProveedores.filter((proveedor) => proveedor.id !== proveedorAEliminar.id)
      );
      setProveedorAEliminar(null);
      setShowConfirmacion(false);
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setProveedorAEliminar(null);
  };

  const mostrarVer = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.id === id);

    if (proveedor) {
      setFormData({
        id: proveedor.id,
        nombre: proveedor.nombre,
        contacto: proveedor.contacto,
        telefono: proveedor.telefono,
        tipoDocumento: proveedor.tipoDocumento,
        documento: proveedor.documento,
        estado: proveedor.estado,
        fechaCreacion: proveedor.fechaCreacion
      });
      setShowVer(true);
    }
  };

  const mostrarEditar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.id === id);

    if (proveedor) {
      setFormData({
        id: proveedor.id,
        nombre: proveedor.nombre,
        contacto: proveedor.contacto,
        telefono: proveedor.telefono,
        tipoDocumento: proveedor.tipoDocumento,
        documento: proveedor.documento,
        estado: proveedor.estado,
        fechaCreacion: proveedor.fechaCreacion
      });
      setShowEditar(true);
    }
  };

  const closeModal = () => {
    setShowEditar(false);
    setShowVer(false);
    setProveedorSeleccionado(null);
    setFormData({
      id: "",
      nombre: "",
      contacto: "",
      telefono: "",
      tipoDocumento: "",
      documento: "",
      estado: true,
      fechaCreacion: ""
    });
  };

  const getEstadoColor = (estado) => {
    return estado ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300";
  };

  const getTipoDocumentoColor = (tipoDocumento) => {
    return tipoDocumento === "NIT" ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-purple-100 text-purple-800 border-purple-300";
  };

  // Función para generar los números de página
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisible = 7; // Número máximo de páginas visibles
    
    if (totalPaginas <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      if (paginaActual <= 4) {
        // Mostrar las primeras páginas
        for (let i = 1; i <= 5; i++) {
          numeros.push(i);
        }
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        // Mostrar las últimas páginas
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        // Mostrar páginas alrededor de la actual
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
        <h2 className="text-2xl font-bold">Proveedores</h2>
      </section>
      <section className="col-span-2 flex justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <BotonAgregar action={() => setShowAgregar(true)} />
        </div>
        <div className="flex-shrink-0 w-80">
          <BarraBusqueda 
            ref={busquedaRef}
            placeholder="Buscar proveedores"
            value={terminoBusqueda}
            onChange={handleBusquedaChange}
          />
          {terminoBusqueda && (
            <p className="text-sm text-gray-600 mt-2 text-right">
              Mostrando {proveedoresFiltrados.length} de {listaProveedores.length} proveedores
            </p>
          )}
        </div>
      </section>
      <section className="col-span-2">
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <TablaAdmin
          listaCabecera={["Nombre", "Contacto", "Tipo Documento", "Documento", "Estado", "Acciones"]}
        >
          {proveedoresPaginados.length > 0 ? (
            proveedoresPaginados.map((element) => (
              <tr
                key={element.id}
                className="hover:bg-gray-100 border-t-2 border-gray-300"
              >
                <td className="py-2 px-4 font-medium">{element.nombre}</td>
                <td className="py-2 px-4 text-sm text-black max-w-xs truncate">
                  {element.contacto}
                </td>
                <td className="py-2 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getTipoDocumentoColor(element.tipoDocumento)}`}>
                    {element.tipoDocumento}
                  </span>
                </td>
                <td className="py-2 px-4 text-black">
                  {element.documento}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={element.estado ? "Activo" : "Inactivo"}
                    onChange={(e) => handleCambiarEstado(element.id, e.target.value === "Activo")}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${getEstadoColor(element.estado)} cursor-pointer hover:shadow-sm`}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <Icon
                    icon="material-symbols:visibility-outline"
                    width="24"
                    height="24"
                    className="text-green-700 cursor-pointer hover:text-green-800"
                    onClick={() => mostrarVer(element.id)}
                    title="Ver detalles"
                  />
                  <Icon
                    icon="material-symbols:edit-outline"
                    width="24"
                    height="24"
                    className="text-blue-700 cursor-pointer hover:text-blue-800"
                    onClick={() => mostrarEditar(element.id)}
                    title="Editar proveedor"
                  />
                  <Icon
                    icon="tabler:trash"
                    width="24"
                    height="24"
                    className="text-red-700 cursor-pointer hover:text-red-800"
                    onClick={() => handleEliminar(element.id)}
                    title="Eliminar proveedor"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                {terminoBusqueda ? 
                  `No se encontraron proveedores que coincidan con "${terminoBusqueda}"` : 
                  "No hay proveedores disponibles"
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

      <FormularioAgregarProveedor
        show={showAgregar}
        setShow={setShowAgregar}
        onSubmit={handleAgregarSubmit}
        titulo="Agregar Nuevo Proveedor"
      />

      <FormularioModificarProveedor
        show={showEditar}
        close={closeModal}
        formData={formData}
        onSubmit={handleEditarSubmit}
        titulo="Modificar Proveedor"
      />

      <FormularioVerProveedor
        show={showVer}
        close={closeModal}
        formData={formData}
        titulo="Detalles del Proveedor"
      />

      <ModalConfirmacion
        show={showConfirmacion}
        onClose={cerrarConfirmacion}
        onConfirm={confirmarEliminacion}
        titulo="Eliminar Proveedor"
        mensaje="¿Estás seguro de que deseas eliminar este proveedor?"
        detalles={proveedorAEliminar && (
          <>
            <div><strong>Nombre:</strong> {proveedorAEliminar.nombre}</div>
            <div><strong>Contacto:</strong> {proveedorAEliminar.contacto}</div>
            <div><strong>Tipo Documento:</strong> {proveedorAEliminar.tipoDocumento}</div>
            <div><strong>Documento:</strong> {proveedorAEliminar.documento}</div>
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

export default PaginaProveedores;