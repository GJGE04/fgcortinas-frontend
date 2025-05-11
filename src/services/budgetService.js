// API calls (crear presupuesto, etc.)
// # API call para crear presupuesto (POST)

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';  // `${API_URL}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');      // Recuperar el token del localStorage
  // console.log("Token en getAUthHeader: " + token);
  return token ? { Authorization: `Bearer ${token}` } : {};     // Si hay token, lo agrega al header
};

// Funciones CRUD para los presupuestos
/*
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos', error);
    throw error;
  }
}; */

export const createBudget = async (budgetData) => {
  try {
    const response = await axios.post(`${API_URL}/budget`, budgetData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear producto', error);
    throw error;
  }
};

