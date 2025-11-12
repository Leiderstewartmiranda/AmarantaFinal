import { useRef, useState } from "react";
import { CrearProducto } from "../../../../../services/productoService";
import ModalBase from "../../../../../compartidos/modal/modalbase";
// import "./formProducto.css"; // si deseas estilos extra

const FormularioAgregarProducto = ({
  show,
  setShow,
  categorias,
  setListaProductos,
  listaProductos,
}) => {
  const nombreRef = useRef();
  const categoriaRef = useRef();
  const precioRef = useRef();
  const stockRef = useRef();
  const [imagen, setImagen] = useState(null);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const handleCancelar = () => {
    setErrores({});
    setImagen(null);
    setShow(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;
    const nuevosErrores = {};

    const nombreIngresado = nombreRef.current.value.trim();

    // Validaciones básicas
    if (!nombreIngresado) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (!regexLetras.test(nombreIngresado))
      nuevosErrores.nombre = "Solo se permiten letras y espacios";
    else if (nombreIngresado.length < 3)
      nuevosErrores.nombre = "Debe tener al menos 3 caracteres";

    // Validación de nombre duplicado
    const nombreExiste = listaProductos.some(
      (p) => p.nombreProducto.toLowerCase() === nombreIngresado.toLowerCase()
    );
    if (nombreExiste) {
      nuevosErrores.nombre = "Ya existe un producto con este nombre";
    }

    if (!categoriaRef.current.value)
      nuevosErrores.categoria = "Selecciona una categoría";

    const precio = parseFloat(precioRef.current.value);
    if (isNaN(precio) || precio < 1000 || precio > 1000000)
      nuevosErrores.precio = "El precio debe estar entre 1,000 y 1,000,000";

    const stock = parseInt(stockRef.current.value);
    if (isNaN(stock) || stock < 0 || stock > 1000)
      nuevosErrores.stock = "El stock debe estar entre 0 y 1000";

    if (!imagen) nuevosErrores.imagen = "Debes subir una imagen";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setCargando(false);
      return;
    }

    try {
      const nuevoProducto = {
        NombreProducto: nombreIngresado,
        IdCategoria: categoriaRef.current.value,
        Precio: precio,
        Stock: stock,
        Imagen: imagen,
      };

      const res = await CrearProducto(nuevoProducto);
      console.log("✅ Producto creado:", res);

      if (res) {
        setListaProductos([...listaProductos, res]);
        setShow(false);
      } else {
        alert("Error al crear el producto (sin respuesta)");
      }
    } catch (error) {
      console.error("❌ Error al crear producto:", error);
      alert("Error al crear el producto");
    } finally {
      setCargando(false);
    }
  };

  const handleImageChange = (e) => {
    setImagen(e.target.files[0]);
  };

  return (
    <ModalBase show={show} setShow={setShow} title="Agregar Producto" onClose={handleCancelar}>
      <form onSubmit={handleSubmit} className="formulario-producto">
        {/* Nombre */}
        <div className="campo">
          <label>Nombre *</label>
          <input
            ref={nombreRef}
            type="text"
            placeholder="Nombre del producto"
            className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.nombre && <p className="error-text">{errores.nombre}</p>}
        </div>

        {/* Categoría */}
        <div className="campo">
          <label>Categoría *</label>
          <select className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.categoria ? 'border-red-500' : 'border-gray-300'}`} ref={categoriaRef} defaultValue="">
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nombreCategoria}
              </option>
            ))}
          </select>
          {errores.categoria && <p className="error-text">{errores.categoria}</p>}
        </div>

        {/* Precio */}
        <div className="campo">
          <label>Precio *</label>
          <input
            ref={precioRef}
            type="number"
            min="1000"
            max="1000000"
            placeholder="Precio del producto"
            className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.precio ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.precio && <p className="error-text">{errores.precio}</p>}
        </div>

        {/* Stock */}
        <div className="campo">
          <label>Stock *</label>
          <input
            ref={stockRef}
            type="number"
            min="0"
            max="1000"
            placeholder="Cantidad disponible"
            className={`mt-1 block w-full border rounded p-2 focus:border-orange-500 focus:outline-none bg-white ${errores.stock ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errores.stock && <p className="error-text">{errores.stock}</p>}
        </div>

        {/* Imagen */}
        <div className="campo">
          <label>Imagen *</label>
          <input className={`bg-white`} type="file" accept="image/*" onChange={handleImageChange} />
          {errores.imagen && <p className="error-text">{errores.imagen}</p>}
          {imagen && (
            <p className="imagen-seleccionada">✓ {imagen.name}</p>
          )}
        </div>

        {/* Botones */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn " disabled={cargando}>
            {cargando ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default FormularioAgregarProducto;
