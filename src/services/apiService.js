// src/services/apiService.js
// Técnicos, usuarios por rol, etc.

import axios from 'axios';
import { message } from "antd";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const getAuthHeader = () => {
    const token = localStorage.getItem('token');      // Recuperar el token del localStorage
    // console.log("Token en getAUthHeader: " + token);
    return token ? { Authorization: `Bearer ${token}` } : {};     // Si hay token, lo agrega al header
  };

// Fetch technicians from the backend
export const getTechnicians = async () => {
    console.log('Cargando los técnicos desde la API:');
    
    try {
      const response = await axios.get(`${API_URL}/users/role/tecnicos`, {
        headers: getAuthHeader(),
      }); 
      return response.data
    } catch (error) {
      console.error("Error al obtener técnicos:", error);
      message.error("No se pudo cargar los técnicos");
    }
};

// Fetch clients from the backend
export const getClients = async () => {
  console.log('Cargando los clientes desde la API:');
  
  try {
    const response = await axios.get(`${API_URL}/clients/getClient`, {
      headers: getAuthHeader(),
    }); 
    return response.data
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    message.error("No se pudo cargar los clientes");
  }
};


