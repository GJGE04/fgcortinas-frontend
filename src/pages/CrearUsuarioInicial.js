// frontend/src/pages/CrearUsuarioInicial.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, Spin, Alert } from 'antd';

const CrearUsuarioInicial = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('superadmin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
        const { email, password, role } = values; // Obtienes los valores directamente
        const response = await axios.post('http://localhost:5000/api/admin/create-initial-user', {
            email, 
            password, 
            role 
        });

        alert('Usuario creado con éxito');
        console.log(response.data);           // Verifica la respuesta en la consola
        alert('Usuario creado con éxito');

        // const token = response.data.token;
        // localStorage.setItem('token', token); // Guarda el token en el navegador
    } catch (err) {
        setError(err.response ? err.response.data.message : 'Error desconocido');
        console.error(err); // Revisa los detalles del error en la consola
    }

    setLoading(false);
  };

  return (
    <div className="form-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Crear Usuario Inicial</h2>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ email, password, role }}
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

        <Form.Item
          label="Rol"
          name="role"
          rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
        >
          <Select
            value={role}
            onChange={(value) => setRole(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="superadmin">Superadmin</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loading}
            style={{ backgroundColor: '#D32F2F', borderColor: '#D32F2F' }}
          >
            {loading ? <Spin /> : 'Crear Usuario'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CrearUsuarioInicial;
