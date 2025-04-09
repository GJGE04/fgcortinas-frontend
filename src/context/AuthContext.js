// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../services/authService'; // Función que obtendrá el usuario actual de la API

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser(); // Llama a la API para obtener el usuario actual
        setUser(currentUser);
      } catch (error) {
        setUser(null); // Si no se puede obtener el usuario, ponemos el estado a null
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
