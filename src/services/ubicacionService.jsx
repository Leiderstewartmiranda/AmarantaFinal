// Servicio para cargar datos de ubicación
import ubicacionData from '../data/ubicacion.json';

export class UbicacionService {
  static async obtenerDepartamentos() {
    try {
      const departamentos = Object.keys(ubicacionData);
      return departamentos.sort();
    } catch (error) {
      console.error('Error cargando departamentos:', error);
      return [];
    }
  }

  static async obtenerMunicipios(departamento) {
    try {
      return ubicacionData[departamento] || [];
    } catch (error) {
      console.error('Error cargando municipios:', error);
      return [];
    }
  }

  static async cargarTodosLosDatos() {
    try {
      return ubicacionData;
    } catch (error) {
      console.error('Error cargando datos de ubicación:', error);
      return {};
    }
  }
}