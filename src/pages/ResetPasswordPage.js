// src/pages/ResetPasswordPage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ResetPasswordPage = () => {
  const { token } = useParams();        // Token de la URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
        setMessage('❌ Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {   

      // v.1  si se pasa el token en el body
      /*
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password: newPassword,
      }); */

      /*  v.2  si se pasa el token en la URL  */
      const res = await axios.post(
        // `http://localhost:5000/api/auth/reset-password/${token}`,
        `${API_URL}/auth/reset-password/${token}`,
        { newPassword }
      );

      setMessage(res.data.message || "✅ Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 3000); // Redirige al login en 3 seg
    } catch (err) {
        console.error(err);
      setMessage(err.response?.data?.message || "❌ Error al restablecer contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Restablecer Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Actualizando...' : 'Restablecer'}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default ResetPasswordPage;