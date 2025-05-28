// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // Usamos el hook useNavigate para redirigir al dashboard

  // Verificar si el usuario ya tiene un token en el localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');  // Recuperar el rol almacenado

    if (token && role) {
      // Aquí podrías hacer una llamada para verificar si el token es válido en el backend. (...)
      setIsLoggedIn(true); // Si el token existe, el usuario está logueado
      navigate('/dashboard');
    }
  }, []);

  // Redirige a la página principal si el usuario está autenticado
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/dashboard'); // Puedes redirigir a la página que prefieras después del login exitoso
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token del localStorage
    localStorage.removeItem('role'); // Eliminar también el rol
    setIsLoggedIn(false); // Actualiza el estado a no logueado
    navigate('/login'); // Redirige al usuario de vuelta a la página de login
  };

  // Función para redirigir al dashboard directamente sin cerrar sesión
  const redirectToDashboard = () => {
    navigate('/dashboard'); // Redirige al dashboard si el usuario ya está logueado
  };

  return (
    <div className="login-page">
      {isLoggedIn ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2>Bienvenido! Ya estás logueado.</h2>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            {/* Botón para cerrar sesión */}
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#D32F2F',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.background = '#B71C1C')}
              onMouseLeave={(e) => (e.target.style.background = '#D32F2F')}
            >
              Cerrar sesión
            </button>
            {/* Botón para ir al dashboard */}
            <button
              onClick={redirectToDashboard}
              style={{
                backgroundColor: '#1976D2',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.background = '#1565C0')}
              onMouseLeave={(e) => (e.target.style.background = '#1976D2')}
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      ) : (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default LoginPage;
