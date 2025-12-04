// Servicio para cargar datos de ubicación desde api-colombia.com
import ubicacionData from '../data/ubicacion.json';

const API_BASE_URL = 'https://api-colombia.com/api/v1';

// Caché en memoria para mejorar rendimiento
const cache = {
  departamentos: null,
  municipiosPorDepartamento: {}
};

export class UbicacionService {
  /**
   * Obtiene todos los departamentos de Colombia
   * @returns {Promise<Array>} Array de objetos { id, name }
   */
  static async obtenerDepartamentos() {
    try {
      // Retornar desde caché si existe
      if (cache.departamentos) {
        return cache.departamentos;
      }

      // Llamar a la API
      const response = await fetch(`${API_BASE_URL}/Department`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const departamentos = await response.json();

      // Transformar a formato { id, name } y ordenar alfabéticamente
      const departamentosOrdenados = departamentos
        .map(dep => ({
          id: dep.id,
          name: dep.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Guardar en caché
      cache.departamentos = departamentosOrdenados;

      return departamentosOrdenados;

    } catch (error) {
      console.error('Error cargando departamentos desde API:', error);
      console.warn('Usando datos locales como fallback');

      // Fallback al JSON local
      try {
        const departamentos = Object.keys(ubicacionData);
        return departamentos.sort().map((name, index) => ({
          id: index + 1,
          name: name
        }));
      } catch (fallbackError) {
        console.error('Error cargando departamentos desde JSON local:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Obtiene los municipios de un departamento específico
   * @param {string|number} departamento - Nombre o ID del departamento
   * @returns {Promise<Array>} Array de objetos { id, name }
   */
  static async obtenerMunicipios(departamento) {
    try {
      // Si departamento es un string, buscar su ID
      let departamentoId = departamento;

      if (typeof departamento === 'string') {
        const departamentos = await this.obtenerDepartamentos();
        const depEncontrado = departamentos.find(
          dep => dep.name.toLowerCase() === departamento.toLowerCase()
        );

        if (!depEncontrado) {
          console.warn(`Departamento "${departamento}" no encontrado`);
          return [];
        }

        departamentoId = depEncontrado.id;
      }

      // Verificar caché
      const cacheKey = `dep_${departamentoId}`;
      if (cache.municipiosPorDepartamento[cacheKey]) {
        return cache.municipiosPorDepartamento[cacheKey];
      }

      // Llamar a la API
      const response = await fetch(`${API_BASE_URL}/Department/${departamentoId}/cities`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const municipios = await response.json();

      // Transformar a formato { id, name } y ordenar alfabéticamente
      const municipiosOrdenados = municipios
        .map(mun => ({
          id: mun.id,
          name: mun.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Guardar en caché
      cache.municipiosPorDepartamento[cacheKey] = municipiosOrdenados;

      return municipiosOrdenados;

    } catch (error) {
      console.error('Error cargando municipios desde API:', error);
      console.warn('Usando datos locales como fallback');

      // Fallback al JSON local
      try {
        const municipiosLocal = ubicacionData[departamento] || [];
        return municipiosLocal.map((name, index) => ({
          id: index + 1,
          name: name
        }));
      } catch (fallbackError) {
        console.error('Error cargando municipios desde JSON local:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Carga todos los datos de ubicación (mantener compatibilidad)
   * @returns {Promise<Object>} Objeto con departamentos y municipios
   */
  static async cargarTodosLosDatos() {
    try {
      const departamentos = await this.obtenerDepartamentos();
      const datos = {};

      for (const dep of departamentos) {
        const municipios = await this.obtenerMunicipios(dep.id);
        datos[dep.name] = municipios.map(m => m.name);
      }

      return datos;
    } catch (error) {
      console.error('Error cargando datos de ubicación:', error);
      return ubicacionData;
    }
  }

  /**
   * Limpia el caché (útil para testing o forzar recarga)
   */
  static limpiarCache() {
    cache.departamentos = null;
    cache.municipiosPorDepartamento = {};
  }
}