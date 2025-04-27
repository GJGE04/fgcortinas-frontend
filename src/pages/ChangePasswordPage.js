import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  // Función para manejar el cambio de contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword) {
      setError('Ambos campos son obligatorios');
      return;
    }

    try {
      // Obtén el token JWT del almacenamiento local o del contexto de autenticación
      const token = localStorage.getItem('token'); // O el método que utilices para obtener el token

      // Realiza la solicitud PUT para cambiar la contraseña 
      const response = await axios.put(
        `${API_URL}/auth/change-password`, // Asegúrate de que la URL sea la correcta
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Enviar el token en los headers
          },
        }
      );

      // setSuccessMessage(response.data.message);
      setSuccessMessage('Contraseña actualizada correctamente. Serás redirigido a la página de bienvenida...');
      setError('');
      setCurrentPassword('');
      setNewPassword('');

      // Cerrar sesión
      localStorage.removeItem('token');

      // Esperar 2 segundos y redirigir al login
      setTimeout(() => {
      navigate('/'); // ajustá la ruta si es distinta en tu app
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Hubo un error al cambiar la contraseña');
    }
  };

  return (
    <div className="change-password-form">
      <h2>Cambiar Contraseña</h2>
      <form onSubmit={handlePasswordChange}>
        <div>
          <label>Contraseña Actual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nueva Contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit">Cambiar Contraseña</button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
