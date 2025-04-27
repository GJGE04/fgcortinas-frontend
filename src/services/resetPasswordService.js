// src/services/resetPasswordService.js
import axios from 'axios';

export const sendResetEmail = async (email) => {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al enviar el correo de recuperación.';
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`http://localhost:4000/api/auth/reset-password/${token}`, { newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al restablecer la contraseña.';
  }
};