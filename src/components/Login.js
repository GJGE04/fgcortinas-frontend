// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Form, Alert, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error desconocido');
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon />}
      <Form onFinish={handleSubmit}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Contraseña" name="password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Iniciar sesiónS</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
