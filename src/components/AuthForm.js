// src/components/AuthForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Importa useNavigate

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Inicializa useNavigate para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage(''); // Limpiar mensaje previo

    try {
      // const response = await axios.post('http://localhost:5000/api/auth/login', {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      // Si el login es exitoso, se guarda el token en el localStorage o contexto
      // const token = response.data.token;
      // const { token, role } = response.data;  // Suponiendo que el backend te devuelve el rol también
      const { token, user } = response.data;
      const role = user.role;

      console.log('TokenT:', token);
      console.log('RoleR:', role);

      if (token && role) {
        localStorage.setItem('token', token);   // Guardar el token
        localStorage.setItem('role', role);     // Guardar el rol

      } else {
        console.error("Token o rol no válidos:", token, role);
        setMessage('Error en las credenciales, intenta de nuevo.');
      }

      // Llamamos a la función pasada como prop para informar al padre que el login fue exitoso
      onLoginSuccess();

      // Redirigir al usuario a la página /dashboard después de login exitoso
      navigate('/dashboard'); // Redirige a la página de dashboard
      
    } catch (error) {
      // Mostrar mensaje de error si ocurre un problema
      setMessage('Error en las credenciales, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>

        {/* ✅ Enlace para recuperar contraseña */}
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ fontSize: '14px', color: '#1976D2' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AuthForm;
