// src/axiosConfig.js
import axios from 'axios';

// Configura la URL base para todas las solicitudes. Configuración de Axios con la URL base del backend
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",  // URL base de tu API
  timeout: 10000,  // Tiempo máximo de espera para la respuesta (opcional)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
