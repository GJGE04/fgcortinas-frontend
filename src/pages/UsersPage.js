/*
import React from "react";

const UsersPage = () => {
  return (
    <div>
      <h1>Usuarios</h1>
      <p>Gestión de usuarios del sistema.</p>
    </div>
  );
};
*/

import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Switch, Select, message } from "antd";
import bcrypt from 'bcryptjs'; // Asegúrate de instalar bcryptjs para hashing de contraseñas

const { confirm } = Modal;
const { Option } = Select;

const initialUsers = [
  { id: 1, username: "juan", email: "juan@correo.com", active: true },
  { id: 2, username: "maria_lopez", email: "maria@correo.com", active: false },
];

const roles = ["superadmin", "admin", "invitado"]; // Aquí se podrían agregar roles personalizados

const UsersPage = () => {
  const [data, setData] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Función para abrir el modal
  const handleOpenModal = (record = null) => {
    setEditingUser(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // Función para eliminar un usuario
  const handleDelete = (id) => {
    confirm({
      title: "¿Estás seguro de eliminar este usuario?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
        setData(data.filter(user => user.id !== id));
        message.success("Usuario eliminado.");
      },
    });
  };

  // Función para manejar la creación o edición del usuario
  const handleSubmit = () => {
    form.validateFields().then(values => {
      // Si se está editando un usuario existente
      if (editingUser) {
        // Si la contraseña fue modificada, realizar un hash
        if (values.password) {
          values.password = bcrypt.hashSync(values.password, 10);
        }
        setData(data.map(user => (user.id === editingUser.id ? { ...editingUser, ...values } : user)));
      } else {
         // Si es un nuevo usuario, asignamos un id único
         const newUser = {
          id: data.length + 1,
          createdAt: new Date().toISOString().split('T')[0], // Fecha de creación
          lastAccess: new Date().toISOString().split('T')[0], // Fecha de último acceso
          password: bcrypt.hashSync(values.password, 10), // Realizamos el hash de la contraseña
          ...values,
        };
        // setData([...data, { id: data.length + 1, ...values }]);
        setData([...data, newUser]);
      }
      setIsModalOpen(false);
      message.success(editingUser ? "Usuario actualizado." : "Usuario agregado.");
    });
  };

  // Función para activar o desactivar un usuario
  const toggleActiveStatus = (id) => {
    setData(data.map(user => (user.id === id ? { ...user, active: !user.active } : user)));
  };

  // Columnas de la tabla
  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Rol", dataIndex: "role", key: "role" },
    { title: "Fecha de Creación", dataIndex: "createdAt", key: "createdAt" },
    { title: "Último Acceso", dataIndex: "lastAccess", key: "lastAccess" },
    {
      title: "Activo",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <Switch checked={active} onChange={() => toggleActiveStatus(record.id)} />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleOpenModal(record)} style={{ marginRight: 10 }}>Editar</Button>
          <Button onClick={() => handleDelete(record.id)} danger>Eliminar</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Usuarios</h2>
      <Button type="primary" onClick={() => handleOpenModal()}>Agregar Usuario</Button>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
      />

      <Modal
        title={editingUser ? "Editar Usuario" : "Agregar Usuario"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "El username es obligatorio" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "El email es obligatorio" }, { type: 'email', message: "El email no es válido" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "El rol es obligatorio" }]}
          >
            <Select>
              {roles.map((role) => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: !editingUser, message: "La contraseña es obligatoria" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="active" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UsersPage;
