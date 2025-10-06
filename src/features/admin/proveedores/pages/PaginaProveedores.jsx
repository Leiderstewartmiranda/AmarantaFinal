import { Icon } from "@iconify/react/dist/iconify.js";
import BotonAgregar from "../../../../compartidos/buttons/BotonAgregar";
import BarraBusqueda from "../../../../compartidos/inputs/BarraBusqueda";
import TablaAdmin from "../../../../compartidos/tablas/TablaAdmin";
import { useRef, useState, useMemo, useEffect } from "react";
import { GetProveedores, PostProveedor, PutProveedor, DeleteProveedore } from "../../../../services/proveedorService";
import FormularioAgregarProveedor from "../components/forms/FormularioAgregar";
import FormularioModificarProveedor from "../components/forms/FormularioModificar";
import FormularioVerProveedor from "../components/forms/FormularioVer";
import ModalConfirmacion from "../../../../compartidos/confirmacion/Confirmacion";
import Paginacion from "../../../../compartidos/paginacion/Paginacion";

const PaginaProveedores = () => {
  // Lista de proveedores
  const [listaProveedores, setListaProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetProveedores();
        console.log("Datos recibidos de la API:", data);
        setListaProveedores(data);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [recarga]);

  const [showAgregar, setShowAgregar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const proveedoresPorPagina = 5;
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const busquedaRef = useRef();

  // Filtrar proveedores basado en el término de búsqueda
  const proveedoresFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return listaProveedores;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    
    return listaProveedores.filter((proveedor) => {
      const nombreEmpresa = proveedor.nombreEmpresa?.toLowerCase() || '';
      const correo = proveedor.correo?.toLowerCase() || '';
      const tipoDocumento = proveedor.nit?.toLowerCase() || '';
      const documento = proveedor.representante?.toLowerCase() || '';
      const telefono = proveedor.telefono ? proveedor.telefono.toLowerCase() : "";

      return (
        nombreEmpresa.includes(termino) ||
        correo.includes(termino) ||
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
    setPaginaActual(1);
  };

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Función para cambiar estado del proveedor
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const proveedor = listaProveedores.find(p => p.idProveedor === id);
      if (proveedor) {
        const datosActualizados = {
          ...proveedor,
          estado: nuevoEstado
        };
        
        await PutProveedor(id, datosActualizados);
        
        setListaProveedores(
          listaProveedores.map((proveedor) =>
            proveedor.idProveedor === id ? { ...proveedor, estado: nuevoEstado } : proveedor
          )
        );
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleAgregarSubmit = async (nuevoProveedor) => {
    try {
      const proveedorCreado = await PostProveedor(nuevoProveedor);
      setRecarga(prev => prev + 1);
      setListaProveedores([...listaProveedores, proveedorCreado]);
      setShowAgregar(false);
    } catch (error) {
      console.error("Error creando proveedor:", error);
    }
  };

  const handleEditarSubmit = async (proveedorActualizado) => {
    try {
      await PutProveedor(proveedorActualizado.idProveedor, proveedorActualizado);
      setRecarga(prev => prev + 1);
      
      // Actualizar la lista local
      setListaProveedores(
        listaProveedores.map((proveedor) =>
          proveedor.idProveedor === proveedorActualizado.idProveedor ? proveedorActualizado : proveedor
        )
      );
      
      closeModal();
    } catch (error) {
      console.error("Error actualizando proveedor:", error);
    }
  };

  const handleEliminar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);
    if (proveedor) {
      setProveedorAEliminar(proveedor);
      setShowConfirmacion(true);
    }
  };

  const confirmarEliminacion = async () => {
    if (proveedorAEliminar) {
      try {
        await DeleteProveedore(proveedorAEliminar.idProveedor);
        setListaProveedores(
          listaProveedores.filter((proveedor) => proveedor.idProveedor !== proveedorAEliminar.idProveedor)
        );
        setProveedorAEliminar(null);
        setShowConfirmacion(false);
      } catch (error) {
        console.error("Error eliminando proveedor:", error);
      }
    }
  };

  const cerrarConfirmacion = () => {
    setShowConfirmacion(false);
    setProveedorAEliminar(null);
  };

  const mostrarVer = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);

    if (proveedor) {
      setProveedorSeleccionado({
        idProveedor: proveedor.idProveedor,
        nombreEmpresa: proveedor.nombreEmpresa,
        correo: proveedor.correo,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        representante: proveedor.representante,
        estado: proveedor.estado,
        fechaCreacion: proveedor.fechaCreacion
      });
      setShowVer(true);
    }
  };

  const mostrarEditar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);

    if (proveedor) {
      setProveedorSeleccionado({
        idProveedor: proveedor.idProveedor,
        nombreEmpresa: proveedor.nombreEmpresa,
        correo: proveedor.correo,
        telefono: proveedor.telefono,
        nit: proveedor.nit,
        representante: proveedor.representante,
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
  };

  const getEstadoColor = (estado) => {
    return estado ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300";
  };

  const getTipoDocumentoColor = (nit) => {
    return nit === "NIT" ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-purple-100 text-purple-800 border-purple-300";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center col-span-2 h-64">
        <p>Cargando proveedores...</p>
      </div>
    );
  }

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
                key={element.idProveedor}
                className="hover:bg-gray-100 border-t-2 border-gray-300"
              >
                <td className="py-2 px-4 font-medium">{element.nombreEmpresa}</td>
                <td className="py-2 px-4 text-sm text-black max-w-xs truncate">
                  {element.correo}
                </td>
                <td className="py-2 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getTipoDocumentoColor(element.nit)}`}>
                    {element.nit}
                  </span>
                </td>
                <td className="py-2 px-4 text-black">
                  {element.representante}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={element.estado ? "Activo" : "Inactivo"}
                    onChange={(e) => handleCambiarEstado(element.idProveedor, e.target.value === "Activo")}
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
                    onClick={() => mostrarVer(element.idProveedor)}
                    title="Ver detalles"
                  />
                  <Icon
                    icon="material-symbols:edit-outline"
                    width="24"
                    height="24"
                    className="text-blue-700 cursor-pointer hover:text-blue-800"
                    onClick={() => mostrarEditar(element.idProveedor)}
                    title="Editar proveedor"
                  />
                  <Icon
                    icon="tabler:trash"
                    width="24"
                    height="24"
                    className="text-red-700 cursor-pointer hover:text-red-800"
                    onClick={() => handleEliminar(element.idProveedor)}
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
        formData={proveedorSeleccionado}
        onProveedorActualizado={handleEditarSubmit}
        titulo="Modificar Proveedor"
      />

      <FormularioVerProveedor
        show={showVer}
        close={closeModal}
        formData={proveedorSeleccionado}
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
            <div><strong>Nombre:</strong> {proveedorAEliminar.nombreEmpresa}</div>
            <div><strong>Correo:</strong> {proveedorAEliminar.correo}</div>
            <div><strong>Tipo Documento:</strong> {proveedorAEliminar.nit}</div>
            <div><strong>Documento:</strong> {proveedorAEliminar.representante}</div>
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