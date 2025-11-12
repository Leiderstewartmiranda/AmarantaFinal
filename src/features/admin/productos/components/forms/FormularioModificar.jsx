import { useState, useEffect } from "react";
import ModalBase from "../../../../../compartidos/modal/modalbase";
import { ActualizarProducto, GetProductos } from "../../../../../services/productoService";
import { Icon } from "@iconify/react";

const FormularioModificarProducto = ({
  show,
  close,
  producto,
  setListaProductos,
  categorias = [],
}) => {
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    estado: false,
    imagen: null,
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [productosExistentes, setProductosExistentes] = useState([]);

  // 🔹 Cargar los productos y datos actuales al abrir
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await GetProductos();
        setProductosExistentes(data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (producto && show) {
      setForm({
        nombre: producto.nombreProducto || "",
        categoria: producto.idCategoria || "",
        precio: producto.precio || "",
        stock: producto.stock || "",
        estado: producto.estado || false,
        imagen: null,
      });
      setErrores({});
    }
  }, [producto, show]);

  const validar = () => {
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
    const nuevosErrores = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (!regexLetras.test(form.nombre.trim()))
      nuevosErrores.nombre = "Solo se permiten letras y espacios";
    else if (form.nombre.length < 3)
      nuevosErrores.nombre = "Debe tener al menos 3 caracteres";

    if (!form.categoria) nuevosErrores.categoria = "Selecciona una categoría";
    if (!form.precio || form.precio <= 0)
      nuevosErrores.precio = "Debe ser un valor positivo";
    if (form.stock < 0) nuevosErrores.stock = "Debe ser igual o mayor a 0";

    if (form.imagen && !["image/jpeg", "image/png"].includes(form.imagen.type))
      nuevosErrores.imagen = "Solo se permiten imágenes JPG o PNG";
    if (form.imagen && form.imagen.size > 2 * 1024 * 1024)
      nuevosErrores.imagen = "No debe superar los 2MB";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setCargando(true);

    try {
      // 🔸 Verificar si ya existe otro producto con el mismo nombre
      const existeDuplicado = productosExistentes.some(
        (p) =>
          p.nombreProducto.toLowerCase() === form.nombre.trim().toLowerCase() &&
          p.codigoProducto !== producto.codigoProducto
      );

      if (existeDuplicado) {
        setErrores({ nombre: "Ya existe un producto con ese nombre" });
        setCargando(false);
        return;
      }

      const productoEditado = {
        NombreProducto: form.nombre.trim(),
        IdCategoria: parseInt(form.categoria),
        Precio: parseFloat(form.precio),
        Stock: parseInt(form.stock),
        Imagen: form.imagen,
        Estado: form.estado,
      };

      await ActualizarProducto(producto.codigoProducto, productoEditado);

      // 🔹 Actualizar lista visual sin recargar
      setListaProductos((prev) =>
        prev.map((p) =>
          p.codigoProducto === producto.codigoProducto
            ? { ...p, ...productoEditado }
            : p
        )
      );

      close();
    } catch (error) {
      console.error("❌ Error al editar producto:", error);
      alert("Hubo un error al editar el producto");
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = () => {
    setErrores({});
    close();
  };

  return (
    <ModalBase show={show} setShow={close} title="Editar producto" onClose={handleCancelar}>
      <form onSubmit={handleSubmit} className="formulario-modal">
        {/* Nombre */}
        <div className="campo">
          <label>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Shampoo herbal"
            className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.nombre && (
            <span className="mensaje-error">{errores.nombre}</span>
          )}
        </div>

        {/* Categoría */}
        <div className="campo">
          <label>Categoría *</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.categoria ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nombreCategoria}
              </option>
            ))}
          </select>
          {errores.categoria && (
            <span className="mensaje-error">{errores.categoria}</span>
          )}
        </div>

        {/* Precio y Stock */}
        <div className="campo-doble">
          <div>
            <label>Precio *</label>
            <input
              name="precio"
              type="number"
              value={form.precio}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.precio ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.precio && (
              <span className="mensaje-error">{errores.precio}</span>
            )}
          </div>
          <div>
            <label>Stock *</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.stock ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errores.stock && (
              <span className="mensaje-error">{errores.stock}</span>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div className="campo">
          <label>Imagen (opcional)</label>
          <input
            name="imagen"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className={`bg-white`}
          />
          {errores.imagen && (
            <span className="mensaje-error">{errores.imagen}</span>
          )}
        </div>

        {/* Estado */}
        <div className="campo flex items-center gap-3">
          <label>Estado</label>
          <label className="switch">
            <input
              type="checkbox"
              name="estado"
              checked={form.estado}
              onChange={handleChange}
              className={`bg-white`}
            />
            <span className="slider"></span>
          </label>
          <span className="texto-estado">
            {form.estado ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Botones */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={handleCancelar}
            className="btn btn-secondary"
          >
             Cancelar
          </button>
          <button
            type="submit"
            className="btn"
            disabled={cargando}
          >
            {cargando ? (
              <span className="flex items-center gap-2">
                <Icon icon="mdi:loading" className="animate-spin" /> Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                 Guardar
              </span>
            )}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioModificarProducto;
