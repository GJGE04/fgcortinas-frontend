// Register.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import '../css/Register.css';  // Asegúrate de tener el archivo CSS correcto

const { Option } = Select;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Inicializa useNavigate

  // Hacemos la solicitud para verificar los roles existentes
  useEffect(() => {
    const checkRoles = async () => {  
      try {
        const response = await axios.get(`${API_URL}/auth/check-roles`);
        const { superadminExists, adminExists } = response.data;

        // Si no existe Superadmin, agregamos esa opción
        // Si no existe Admin, agregamos esa opción
        const availableRoles = [];
        if (!superadminExists) availableRoles.push('Superadmin');
        if (!adminExists) availableRoles.push('Admin');
        availableRoles.push('Guest'); // Siempre está disponible el rol de guest

        setRoles(availableRoles);
      } catch (error) {
        message.error('Error al obtener los roles disponibles');
      }
    };

    checkRoles();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Enviar los datos del registro al backend
      await axios.post(`${API_URL}/auth/register`, values);
      message.success('Registro exitoso');

      // Redirige a la página principal después de un registro exitoso
      navigate('/');  // Esto redirige a la página principal (ajusta la ruta según lo necesario)
      
      form.resetFields();
    } catch (error) {
      message.error('Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Registro de Usuario</h1>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          label="Nombre de usuario"
          rules={[{ required: true, message: 'Por favor ingresa un nombre de usuario' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[{ required: true, message: 'Por favor ingresa un correo electrónico' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: true, message: 'Por favor ingresa una contraseña' }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirmar contraseña"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Por favor confirma tu contraseña' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Las contraseñas no coinciden'));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="role"
          label="Rol"
          rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
        >
          <Select>
            {roles.map((role) => (
              <Option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Registrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
