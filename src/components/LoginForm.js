// components/LoginForm.js
import React from 'react';
import { Form, Input, Button } from 'antd';

const LoginForm = ({ onFinish }) => (
  <Form onFinish={onFinish}>
    <Form.Item
      label="Correo electrónico"
      name="email"
      rules={[{ required: true, message: 'Por favor ingresa tu correo electrónico' }]}
    >
      <Input type="email" />
    </Form.Item>
    <Form.Item
      label="Contraseña"
      name="password"
      rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
    >
      <Input.Password />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" block>
        Iniciar sesiónF
      </Button>
    </Form.Item>
  </Form>
);

export default LoginForm;
