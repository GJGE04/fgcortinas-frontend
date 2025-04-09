// frontend/src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Form, Alert, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    console.log('Contraseña desde el frontend:', values.password);  // Esta línea imprime la contraseña
    console.log('Email desde el frontend:', values.email);  // Agrega este log para asegurarte de que el email está siendo enviado
    setLoading(true);
    setError('');

    try {
      // const response = await axios.post('http://localhost:5000/api/auth/login', {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { token, user } = response.data;
      console.log(response.data);  // Verifica la respuesta aquí

      // Guardar el token JWT en el localStorage (o usar otro almacenamiento seguro)
      localStorage.setItem('token', token);

      // Almacenar la información del usuario
      localStorage.setItem('user', JSON.stringify(user));

      // Redirigir al usuario a la página principal
      navigate('/');
    } catch (err) {
      console.log('Error en la solicitud:', err.response); // Agrega este log
      setError(err.response ? err.response.data.message : 'Error desconocido');
      console.error(err); // Imprime el error en la consola para obtener más información
      console.log('Error en la solicitud:', err.response ? err.response.data : err.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-form" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Iniciar Sesión2</h2>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ email, password }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email', message: 'Por favor ingresa un email válido' }]}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa una contraseña' }]}
        >
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loading}
            style={{ backgroundColor: '#D32F2F', borderColor: '#D32F2F' }}
          >
            {loading ? <Spin /> : 'Iniciar Sesión'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
