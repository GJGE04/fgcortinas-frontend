// src/services/authService.js
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';  

// Función para verificar si el token está presente y válido
export const isAuthenticated = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Verificar el token en el backend
    // const isValid = await verifyToken(token);
    const isValid = await verifyToken2(token);
    return isValid;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return false;
  }
};

// Función para obtener el rol del usuario
export const getUserRole = () => {
  console.log("invocando getUserRole...");
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("Token decodificado en getUserRole:", decoded);
      return decoded.role || null;
    } catch (error) {
      console.error("Error al decodificar el token en getUserRole:", error);
      return null;
    }
  }
  return null;
};

// Función para obtener el nombre de usuario
export const getUsername = () => {
  console.log("invocando getUsername...");
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("Token decodificado en getUsername:", decoded);
      return decoded.username || null;
    } catch (error) {
      console.error("Error al decodificar el token en getUsername:", error);
      return null;
    }
  }
  return null;
};

// Función para obtener el usuario actual
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

export const verifyToken2 = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return { valid: false };
  }

  try {
    const response = await axios.get('https://fgcortinas-backend.onrender.com/api/auth/verifytoken', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;  // Esto puede ser { valid: true/false, role: 'role' }
  } catch (error) {
    console.error("Error al verificar el Token", error);
    return { valid: false };
  }
};

// Función para cerrar sesión
export const logout = () => {
  // Elimina el token al hacer logout
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, role } = response.data; // Asumiendo que el backend devuelve el rol junto con el token

    // Almacena el token y el rol en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

// Función para verificar la validez del token (variante no haciendo la verificación en el backend, sino simplemente decodificando el token en el frontend usando una librería como jwt-decode y verificar su validez.)
export const isAuthenticated2 = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // en segundos
    return decoded.exp > now;
  } catch (error) {
    return false;
  }
};
