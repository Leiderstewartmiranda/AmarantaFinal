// FormularioAgregar.jsx (Categorías - con ModalBase moderno)
import React, { useState, useEffect } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import { PostCProducto, GetCProductos } from "../../../../../services/categoriaService";

const validarSoloLetras = (valor) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/.test(valor);

const FormularioAgregar = ({
  show,
  setShow,
  onSubmit,
  nombreRef,
  descripcionRef,
  errores,
  setErrores,
}) => {
  const [categorias, setCategorias] = useState([]);

  // Cargar todas las categorías existentes para validar duplicados
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await GetCProductos();
        setCategorias(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  const close = () => setShow(false);

  // Función de envío con validación adicional
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombre = nombreRef.current.value.trim();
    const descripcion = descripcionRef.current.value.trim();

    // Validaciones locales
    if (!nombre) {
      setErrores({ ...errores, nombreCategoria: "El nombre es obligatorio" });
      return;
    }
    if (!descripcion) {
      setErrores({ ...errores, descripcion: "La descripción es obligatoria" });
      return;
    }
    if (!validarSoloLetras(nombre)) {
      setErrores({
        ...errores,
        nombreCategoria: "Solo se permiten letras y espacios",
      });
      return;
    }

    // 🔍 Validación de nombre duplicado
    const existeCategoria = categorias.some(
      (cat) => cat.nombreCategoria.toLowerCase() === nombre.toLowerCase()
    );

    if (existeCategoria) {
      setErrores({
        ...errores,
        nombreCategoria: "Ya existe una categoría con este nombre",
      });
      return;
    }

    // Si pasa todas las validaciones, ejecutar el submit original
    await onSubmit(e);
  };

  return (
    <ModalBase show={show} title={"Agregar Categoría"} onClose={close}>
      <form onSubmit={handleSubmit}>
        

        <div className="detalle-categoria">
          <div>
            <label className="detalle-label">Nombre *</label>
            <input
              type="text"
              ref={nombreRef}
              placeholder="Nombre de la categoría"
              onChange={(e) => {
                const valor = e.target.value;
                if (validarSoloLetras(valor)) {
                  setErrores({ ...errores, nombreCategoria: "" });
                } else {
                  setErrores({
                    ...errores,
                    nombreCategoria: "Solo se permiten letras y espacios",
                  });
                }
              }}
              className={`w-full border rounded p-2 bg-white ${
                errores.nombreCategoria ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.nombreCategoria && (
              <span className="error-text">{errores.nombreCategoria}</span>
            )}
          </div>

          <div>
            <label className="detalle-label">Descripción *</label>
            <textarea
              ref={descripcionRef}
              rows="3"
              placeholder="Descripción de la categoría"
              onChange={() => setErrores({ ...errores, descripcion: "" })}
              className={`w-full border rounded p-2 resize-none bg-white ${
                errores.descripcion ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errores.descripcion && (
              <span className="error-text">{errores.descripcion}</span>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={close}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" className="btn">
            Agregar
          </button>
          
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioAgregar;
