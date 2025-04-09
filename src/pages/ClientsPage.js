import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Switch, Collapse } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import ClientForm from '../components/ClientForm';

const { Panel } = Collapse;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Obtener el token almacenado en el localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Cargar clientes de la base de datos
    const fetchClients = async () => {
      try {
        console.log("Obteniendo los clientes...")
        const response = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` }  // Enviar el token en los headers
        });
        setClients(response.data);
        setLoading(false);
      } catch (error) {
        message.error('No se pudieron cargar los clientes');
        setLoading(false);
      }
    };
    fetchClients();
  }, [token]);    // Dependencia del token para recargar si cambia

  const handleCreate = async (values) => {
    try {
      setLoading(true);  // Activamos la carga antes de hacer la solicitud
      const url = editingItem ? `${API_URL}/clients/${editingItem._id}` : `${API_URL}/clients`;
      const method = editingItem ? 'put' : 'post';

      // Enviar el token en las cabeceras de la solicitud
      await axios({
        method,
        url,
        data: values,
        headers: {
          Authorization: `Bearer ${token}`,  // Incluir el token en la cabecera
        },
      });
      
      message.success(editingItem ? 'Cliente actualizado' : 'Cliente creado');
      setVisible(false);
      setEditingItem(null);
      const response = await axios.get(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(response.data);
      setLoading(false);  // Desactivamos la carga después de la solicitud
    } catch (error) {
      message.error('Ocurrió un error al guardar los datos');
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingItem(client);
    setVisible(true);
  };

  const handleDelete = async (clientId) => {
    try {
      setLoading(true);  // Establecer el estado de carga a true antes de realizar la eliminación
      await axios.delete(`${API_URL}/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }  // Incluir el token en la cabecera
      });
      message.success('Cliente eliminado');

      // Recargar los datos después de eliminar el cliente
      const response = await axios.get(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }  // Incluir el token en la cabecera
      });

      setClients(response.data);  // Actualizar la lista de clientes
      setLoading(false);  // Actualizar el estado de carga a false después de la respuesta
    } catch (error) {
      message.error('Ocurrió un error al eliminar el cliente');
      setLoading(false);  // Asegurarse de que el estado de carga se actualice a falso en caso de error
    }
  };

  const handleSwitchChange = async (checked, client) => {
    try {
      setLoading(true);  // Activamos la carga antes de actualizar el estado
      const updatedClient = { ...client, activo: checked };
      await axios.put(`${API_URL}/clients/${client._id}`, updatedClient, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Estado de activo actualizado');
      const response = await axios.get(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(response.data);
      setLoading(false);  // Desactivamos la carga después de actualizar
    } catch (error) {
      message.error('Error al actualizar estado de activo');
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Apellidos',
      dataIndex: 'apellidos',
      key: 'apellidos',
    },
    {
      title: 'Direcciones',
      dataIndex: 'direcciones',
      key: 'direcciones',
      render: (direcciones) => (
        <Collapse>
          <Panel header={`Direcciones (${direcciones.length})`} key="1">
            {direcciones.map((direccion, index) => (
              <p key={index}>{direccion}</p>
            ))}
          </Panel>
        </Collapse>
      ),
    },
    {
      title: 'Teléfonos',
      dataIndex: 'telefonos',
      key: 'telefonos',
      render: (telefonos) => (
        <Collapse>
          <Panel header={`Teléfonos (${telefonos.length})`} key="1">
            {telefonos.map((telefono, index) => (
              <p key={index}>{telefono}</p>
            ))}
          </Panel>
        </Collapse>
      ),
    },
    {
      title: 'Correos',
      dataIndex: 'correos',
      key: 'correos',
      render: (correos) => (
        <Collapse>
          <Panel header={`Correos (${correos.length})`} key="1">
            {correos.map((correo, index) => (
              <p key={index}>{correo}</p>
            ))}
          </Panel>
        </Collapse>
      ),
    },
    {
      title: 'Activo',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo, record) => (
        <Switch
          checked={activo}
          onChange={(checked) => handleSwitchChange(checked, record)}
        />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="¿Estás seguro de eliminar este cliente?"
            onConfirm={() => handleDelete(record._id)}      // Asegurarte de que el ID se pase correctamente
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setVisible(true)}>
        Agregar Cliente
      </Button>
      <Table
        columns={columns}
        dataSource={clients}
        loading={loading}
        rowKey="_id"
      />
      
      {/* Mostrar el formulario solo cuando el estado "visible" es true */}
      {visible && (
        <ClientForm
          visible={visible}
          onCancel={() => setVisible(false)}
          onCreate={handleCreate}
          editingItem={editingItem}
          loading={loading} // Pasamos el estado loading al formulario
        />
      )}
    </div>
  );
};

export default ClientsPage;
