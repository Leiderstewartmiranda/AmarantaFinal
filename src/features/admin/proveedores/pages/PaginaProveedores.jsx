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
import TituloSeccion from "../../../../compartidos/Titulo/Titulos";
import Swal from "sweetalert2";

const PaginaProveedores = () => {
  // Lista de proveedores
  const [listaProveedores, setListaProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await GetProveedores();
        console.log("Datos recibidos de la API:", data);
        setListaProveedores(data);
        
        Swal.fire({
          icon: "success",
          title: "✅ Proveedores cargados",
          text: "Los proveedores se han cargado correctamente",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        Swal.fire({
          icon: "error",
          title: "❌ Error al cargar",
          text: "No se pudieron cargar los proveedores",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
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
        // Mostrar confirmación antes de cambiar estado
        Swal.fire({
          icon: "question",
          title: "🔄 Cambiar estado",
          html: `¿Estás seguro de que deseas <strong>${nuevoEstado ? 'activar' : 'desactivar'}</strong> este proveedor?<br><br>
                 <div class="text-left">
                   <p><strong>Proveedor:</strong> ${proveedor.nombreEmpresa}</p>
                   <p><strong>Estado actual:</strong> ${proveedor.estado ? "Activo" : "Inactivo"}</p>
                   <p><strong>Nuevo estado:</strong> ${nuevoEstado ? "Activo" : "Inactivo"}</p>
                 </div>`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
          showCancelButton: true,
          cancelButtonColor: "#6b7280",
          confirmButtonText: nuevoEstado ? 'Activar' : 'Desactivar',
          cancelButtonText: "Cancelar"
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
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

              Swal.fire({
                icon: "success",
                title: "✅ Estado actualizado",
                text: `El proveedor ha sido ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            } catch (error) {
              console.error("Error cambiando estado:", error);
              Swal.fire({
                icon: "error",
                title: "❌ Error al cambiar estado",
                text: "No se pudo cambiar el estado del proveedor",
                confirmButtonColor: "#b45309",
                background: "#fff8e7",
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al cambiar estado",
        text: "No se pudo cambiar el estado del proveedor",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const handleAgregarSubmit = async (nuevoProveedor) => {
    try {
      const proveedorCreado = await PostProveedor(nuevoProveedor);
      setRecarga(prev => prev + 1);
      setListaProveedores([...listaProveedores, proveedorCreado]);
      setShowAgregar(false);
      
      Swal.fire({
        icon: "success",
        title: "✅ Proveedor agregado",
        text: "El proveedor se ha agregado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error creando proveedor:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al agregar",
        text: "No se pudo agregar el proveedor",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
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
      
      Swal.fire({
        icon: "success",
        title: "✅ Proveedor actualizado",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    } catch (error) {
      console.error("Error actualizando proveedor:", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error al actualizar",
        text: "No se pudo actualizar el proveedor",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
    }
  };

  const handleEliminar = (id) => {
    const proveedor = listaProveedores.find((proveedor) => proveedor.idProveedor === id);
    if (proveedor) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Confirmar eliminación",
        html: `¿Estás seguro de eliminar este proveedor?<br><br>
               <div class="text-left">
                 <p><strong>Nombre:</strong> ${proveedor.nombreEmpresa}</p>
                 <p><strong>Correo:</strong> ${proveedor.correo}</p>
                 <p><strong>Tipo Documento:</strong> ${proveedor.nit}</p>
                 <p><strong>Documento:</strong> ${proveedor.representante}</p>
                 <p><strong>Estado:</strong> ${proveedor.estado ? "Activo" : "Inactivo"}</p>
               </div>`,
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          confirmarEliminacion(proveedor);
        }
      });
    }
  };

  const confirmarEliminacion = async (proveedor) => {
    if (!proveedor) {
      console.error("❌ Proveedor es null/undefined");
      return;
    }

    try {
      await DeleteProveedore(proveedor.idProveedor);
      setListaProveedores(
        listaProveedores.filter((p) => p.idProveedor !== proveedor.idProveedor)
      );
      
      Swal.fire({
        icon: "success",
        title: "✅ Proveedor eliminado",
        text: "El proveedor se ha eliminado correctamente",
        confirmButtonColor: "#b45309",
        background: "#fff8e7",
      });
      
      setProveedorAEliminar(null);
      setShowConfirmacion(false);
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      
      // Manejar específicamente el error de integridad referencial
      if (error.message.includes("REFERENCE constraint") || 
          error.message.includes("FK_Productos_Proveedores") ||
          error.message.includes("Error 500")) {
        
        Swal.fire({
          icon: "error",
          title: "❌ No se puede eliminar",
          html: `No se puede eliminar el proveedor <strong>"${proveedor.nombreEmpresa}"</strong> porque tiene productos asociados.<br><br>Primero debes eliminar o reasignar los productos de este proveedor.`,
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "❌ Error al eliminar",
          text: "Ocurrió un error al eliminar el proveedor",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
      }
      
      setProveedorAEliminar(null);
      setShowConfirmacion(false);
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
      if (!proveedor.estado) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Proveedor inactivo",
          text: "No se puede editar un proveedor inactivo",
          confirmButtonColor: "#b45309",
          background: "#fff8e7",
        });
        return;
      }

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
      <TituloSeccion titulo="Proveedores" />
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
                <td className="py-1 px-4">
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
                    className={`cursor-pointer transition-colors ${
                      element.estado 
                        ? "text-blue-700 hover:text-blue-800" 
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={() => mostrarEditar(element.idProveedor)}
                    title={element.estado ? "Editar proveedor" : "No editable (inactivo)"}
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
        proveedores={listaProveedores}
        titulo="Modificar Proveedor"
      />

      <FormularioVerProveedor
        show={showVer}
        close={closeModal}
        formData={proveedorSeleccionado}
        titulo="Detalles del Proveedor"
      />
    </>
  );
};

export default PaginaProveedores;