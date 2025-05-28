// pages/LoginPage.js
import React, { useState } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';  // Importa el formulario

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', values);
      
      const { token, user } = response.data;

      // Guardar el token JWT en el localStorage (o usar otro almacenamiento seguro)
      localStorage.setItem('token', token);

      // Almacenar la información del usuario
      localStorage.setItem('user', JSON.stringify(user));

      // Decodificar el JWT (opcionalmente para obtener el rol)
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userRole = decodedToken.role;       // Supongamos que el JWT tiene el rol del usuario

      // Redirigir según el rol
      /*
      if (userRole === 'admin') {
        navigate.push('/admin');
      } else if (userRole === 'superadmin') {
        navigate.push('/superadmin');
      } else if (userRole === 'user') {
        navigate.push('/dashboard');
      } else {
        navigate.push('/guest');
      }
        */

      // Redirigir al usuario a la página principal
      navigate('/');

    } catch (error) {
      // setError('Credenciales incorrectas');
      setError(error.response ? error.response.data.message : 'Error desconocido');
      message.error('Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Iniciar sesión1</h2>
      <LoginForm onFinish={onFinish} /> {/* Usamos el componente de LoginForm */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default LoginPage;



/* v1
// Página de login

import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Hacer una solicitud POST al backend para hacer login
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      const { token } = response.data;

      // Guardar el token en localStorage
      localStorage.setItem('token', token); // Guarda el token recibido

      console.log('Token guardado:', response.data.token);  // response.data.token = token

      // Redirige o maneja el estado de login exitoso
      console.log('Login exitoso');

      // Redirigir o hacer cualquier otra acción que necesites
    } catch (error) {
      console.error('Error de login:', error);
      setError('Error en las credenciales');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Usuario:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Iniciar sesión</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default LoginForm;
*/
