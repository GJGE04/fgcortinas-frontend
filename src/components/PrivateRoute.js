import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/authService'; // Asegúrate de que tienes la función para verificar la autenticación

const PrivateRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();             // Verifica si el token es válido
      if (isAuth) {
        const userRole = getUserRole();                   // Obtén el rol desde localStorage
        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true);                          // El usuario tiene el rol adecuado
        } else {
          setIsAuthorized(false);                         // El usuario no tiene el rol adecuado
        }
      } else {
        setIsAuthorized(false);                           // No está autenticado
      }
      setLoading(false);
    };

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no está autorizado, redirige a login
  return isAuthorized ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
