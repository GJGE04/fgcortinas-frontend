/*
import React from "react";

const ClientsPage = () => {
  return (
    <div>
      <h1>Clientes</h1>
      <p>Listado y gestión de clientes.</p>
    </div>
  );
};

export default ClientsPage;
*/

import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Switch, message } from "antd";
import axios from "axios";

const { confirm } = Modal;

const ClientePage = () => {
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // Cargar clientes desde la API
  useEffect(() => {
    axios.get('http://localhost:5000/api/clients')
      .then(response => setClientes(response.data))
      .catch(error => {
        message.error("Error al cargar los clientes.");
        console.error(error);
      });
  }, []);

  // Función para manejar la apertura del modal (agregar o editar cliente)
  const handleOpenModal = (record = null) => {
    setEditingItem(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const method = editingItem ? axios.put : axios.post;
      const url = editingItem ? `http://localhost:5000/api/clients/${editingItem._id}` : "http://localhost:5000/api/clients";
      
      method(url, values)
        .then(response => {
          if (editingItem) {
            setClientes(clientes.map(cliente => 
              cliente._id === editingItem._id ? { ...cliente, ...values } : cliente
            ));
            message.success("Cliente actualizado.");
          } else {
            setClientes([...clientes, response.data]);
            message.success("Cliente agregado.");
          }
          setIsModalOpen(false);
        })
        .catch(error => {
          message.error("Error al guardar el cliente.");
          console.error(error);
        });
    });
  };

  // Función para eliminar un cliente
  const handleDelete = (id) => {
    confirm({
      title: "¿Estás seguro de eliminar este cliente?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk() {
        axios.delete(`http://localhost:5000/api/clients/${id}`)
          .then(() => {
            setClientes(clientes.filter(cliente => cliente._id !== id));
            message.success("Cliente eliminado.");
          })
          .catch(error => {
            message.error("Error al eliminar el cliente.");
            console.error(error);
          });
      }
    });
  };

  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Direcciones", dataIndex: "direcciones", key: "direcciones", render: (text) => text.join(", ") },
    { title: "Teléfonos", dataIndex: "telefonos", key: "telefonos", render: (text) => text.join(", ") },
    { title: "Correos", dataIndex: "correos", key: "correos", render: (text) => text.join(", ") },
    {
      title: "Activo",
      dataIndex: "activo",
      key: "activo",
      render: (activo) => <Switch checked={activo} />,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <>
          <Button onClick={() => handleOpenModal(record)} style={{ marginRight: 10 }}>Editar</Button>
          <Button onClick={() => handleDelete(record._id)} danger>Eliminar</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => handleOpenModal()}>Agregar Cliente</Button>
      <Table
        columns={columns}
        dataSource={clientes}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
      />
      <Modal
        title={editingItem ? "Editar Cliente" : "Agregar Cliente"}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "El nombre es obligatorio" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="direcciones" label="Direcciones" rules={[{ required: true, message: "Las direcciones son obligatorias" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="telefonos" label="Teléfonos" rules={[{ required: true, message: "Los teléfonos son obligatorios" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="correos" label="Correos Electrónicos" rules={[{ required: true, message: "Los correos electrónicos son obligatorios" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="activo" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientePage;
