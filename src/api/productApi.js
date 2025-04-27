// debería ser : src/services/productService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';  // `${API_URL}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');      // Recuperar el token del localStorage
  // console.log("Token en getAUthHeader: " + token);
  return token ? { Authorization: `Bearer ${token}` } : {};     // Si hay token, lo agrega al header
};

// Funciones CRUD para los productos
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
};

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear producto', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    console.log("LLegó a updateProduct en productApi.js " + productId);
    const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
      headers: getAuthHeader(),
    });
    console.log("Finalizando updateProduct en productApi.js");
    return response.data;
  } catch (error) {
    console.error('Error al actualizar producto', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    if (!productId) {
      console.error("ID de producto no válido:", productId);
      return;
    }
    console.log("LLegó a deleteProduct en productApi.js")
    const response = await axios.delete(`${API_URL}/products/${productId}`, {
      headers: getAuthHeader(),
    });
    console.log("Finalizando deleteProduct en productApi.js");
    return response.data;
  } catch (error) {
    console.error('Error al eliminar producto2', error);
    throw error;
  }
};

// Inside productApi.js

export const getProductById = (id) => {
  // Implement the function to fetch a product by its ID
  return fetch(`${API_URL}/products/${id}`)
    .then(response => response.json())
    .catch(error => console.error('Error fetching product:', error));
};

// Función para obtener los tipos de productos
export const getProductTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/product-types`, {
      headers: getAuthHeader(),
    });
    return response.data; // Devuelve una lista de tipos de productos
  } catch (error) {
    console.error('Error al obtener tipos de productos', error);
    throw error;
  }
};

