// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';  

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/current-user`);
    return response.data;
  } catch (error) {
    throw new Error('No se pudo obtener el usuario');
  }
};

// Función para verificar el token en el backend
export const verifyToken = async (token) => {
  try {
    console.log("Invocando verifyToken");
    const response = await axios.get(`${API_URL}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.isValid;
  } catch (error) {
    console.error("Error al verificar el Token:", error);
    return false;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  // Si existe el token, el usuario está autenticado
  return token !== null;
};

export const logout = () => {
  // Elimina el token al hacer logout
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};
