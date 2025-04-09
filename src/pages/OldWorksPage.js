import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Switch, Modal, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import OldWorkForm from '../components/OldWorkForm';
import moment from 'moment';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const OldWorkPage = () => {
  const [works, setWorks] = useState([]);                   // Estado para los trabajos
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);   // Nuevo estado para el mensaje de error

  const token = localStorage.getItem('token');              // Obtener el token de localStorage

  // Función para mostrar el modal de error
  const showErrorModal = (error) => {
    setErrorMessage(error);
  };

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await axios.get(`${API_URL}/oldworks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Datos de trabajos recibidos:', response.data);  // Agrega este log para verificar la respuesta

        const worksWithClients = await Promise.all(
          response.data.map(async (work) => {
            let clienteNombre = 'Cliente no encontrado';  // Valor por defecto
            console.log('LLEGO1');

            if (work.cliente) {  // Verificamos que la referencia cliente no esté vacía
              try {     
                console.log('LLEGO2 ' + work.cliente);
                // const clientResponse = await axios.get(`/api/clients/search/${work.cliente._id}`, {
                 // headers: { Authorization: `Bearer ${token}` },
                //});  
                // console.log('LLEGO3');

                // Asegúrate de que 'work.cliente' tenga el nombre del cliente aquí
                clienteNombre = work.cliente.nombre || 'Cliente no encontrado';
              } catch (error) {
                console.error(error);
                clienteNombre = 'Cliente no encontrado ' + error.message;  // Si ocurre un error, lo mostramos como "no encontrado"
              }
            }

            return {
              ...work,
              clienteNombre,
            };
          })
        );

        setWorks(worksWithClients);
        setLoading(false);
      } catch (error) {
        console.error(error);
        message.error('No se pudieron cargar los trabajos');
        showErrorModal('No se pudieron cargar los trabajos');
        setLoading(false);
      }
    };

    fetchWorks();   // Llamar a la función para obtener los datos
  }, [token]);      // Dependencia de `token` para ejecutar la carga de datos
  

  const handleCreate = async (values) => {
    try {
      setLoading(true);

      // Asegurarnos que 'cliente' sea el _id del cliente
      const updatedValues = {
        ...values,
        cliente: values.cliente,            // Asegúrate de que cliente esté pasando correctamente el _id
        activo: values.activo || false,     // Aseguramos que 'activo' esté correctamente
      };

      const url = editingItem ? `${API_URL}/oldworks/${editingItem._id}` : `${API_URL}/oldworks`;
      const method = editingItem ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: updatedValues,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Respuesta del backend:', response);  // Verifica lo que devuelve el backend

      message.success(editingItem ? 'Trabajo actualizado' : 'Trabajo creado');
      setVisible(false);
      setEditingItem(null);
      
      // Recargar los trabajos actualizados
      const responseList = await axios.get(`${API_URL}/oldworks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const worksWithClients = await Promise.all(
        responseList.data.map(async (work) => {
          let clienteNombre = 'Cliente no encontrado';

          if (work.cliente) {
            clienteNombre = work.cliente.nombre || 'Cliente no encontrado';
          }

          return {
            ...work,
            clienteNombre,  // Actualizar el nombre del cliente en la respuesta
          };
        })
      );

      // setWorks(responseList.data);
      setWorks(worksWithClients);  // Actualizar la tabla con los datos más recientes
      setLoading(false);

    } catch (error) {
      handleError(error);  // Invocamos el método que maneja el error
      showErrorModal('Ocurrió un error al guardar los datos');
      setLoading(false);
    }
  };

  const handleEdit = (work) => {
    setEditingItem(work);
    setVisible(true);
  };

  // Eliminación de un trabajo
  const handleDelete = async (workId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/oldworks/${workId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Trabajo eliminado');

      // Recargar los trabajos después de eliminar
      const response = await axios.get(`${API_URL}/oldworks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const worksWithClients = await Promise.all(
        response.data.map(async (work) => {
          let clienteNombre = 'Cliente no encontrado';

          if (work.cliente) {
            clienteNombre = work.cliente.nombre || 'Cliente no encontrado';
          }

          return {
            ...work,
            clienteNombre,
          };
        })
      );

      // setWorks(response.data);
      setWorks(worksWithClients);
      setLoading(false);
    } catch (error) {
      message.error('Ocurrió un error al eliminar el trabajo');
      console.error(error);
      showErrorModal('Ocurrió un error al eliminar el trabajo');
      setLoading(false);
    }
  };

  // Manejo del cambio de estado 'activo' de un trabajo. // Actualización del estado 'activo' de un trabajo
  const handleSwitchChange = async (checked, work) => {
    try {
      setLoading(true);
      const updatedWork = { ...work, activo: checked };
      await axios.put(`${API_URL}/oldworks/${work._id}`, updatedWork, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Estado de activo actualizado');

      const worksWithClients = await Promise.all(
        works.map(async (item) => {
          if (item._id === work._id) {
            return { ...item, activo: checked };  // Actualizar el estado activo solo en el trabajo modificado
          }
          return item;
        })
      );

      // Actualizar localmente la tabla con el nuevo valor de 'activo'
      setWorks((prevWorks) =>
        prevWorks.map((item) =>
          item._id === work._id ? { ...item, activo: checked } : item
        )
      );

      setWorks(worksWithClients);
      setLoading(false);
    } catch (error) {
      showErrorModal('Error al actualizar estado de activo');
      setLoading(false);
    }
  };

  const handleError = (error) => {
    
    message.error('Ocurrió un error al guardar los datos');

    // Mostrar el error en la consola
    if (error instanceof Error) {
      console.error('Error Message:', error.message);  // Imprime el mensaje del error
      console.error('Error Stack:', error.stack);      // Imprime el stack trace del error
    } else {
      console.error('Error:', error);                  // Imprime el error tal cual
    }
  
    // Mostrar la ventana modal con el mensaje del error
    showErrorModal('Ocurrió un error: ' + (error.message || error));
  
    // Si necesitas hacer algo después (como detener la carga, etc.)
    setLoading(false);
  };
  

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'clienteNombre',  // Ahora estamos usando el nuevo campo que tiene el nombre del cliente
      key: 'clienteNombre',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      render: (date) => {
      // Aseguramos que la fecha sea válida antes de llamar a format()
      const formattedDate = moment(date);
      return formattedDate.isValid() ? formattedDate.format('DD/MM/YYYY') : '-';  // Si la fecha no es válida, mostramos un guion
    },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
    },
    {
      title: 'Fecha de Último Estado',
      dataIndex: 'fechaUltimoEstado',
      key: 'fechaUltimoEstado',
      render: (fecha) => {
      const formattedDate = moment(fecha);
      return formattedDate.isValid() ? formattedDate.format('DD/MM/YYYY') : '-';  // Igual que para fechaCreacion
    },
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
            title="¿Estás seguro de eliminar este trabajo?"
            onConfirm={() => handleDelete(record._id)}
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
        Agregar Trabajo
      </Button>
      <Table
        columns={columns}
        dataSource={works}
        loading={loading}
        rowKey="_id"
      />

      {/* Modal para editar o agregar trabajo */}
      <Modal
        title={editingItem ? 'Editar Trabajo' : 'Agregar Trabajo'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        destroyOnClose={true}  // Esto destruye el formulario al cerrar el modal
      >
        <OldWorkForm
          token={token}
          editingItem={editingItem}
          onCreate={handleCreate}  // Pasamos la función para guardar cambios
        />
      </Modal>

      {/* Modal de error */}
      {errorMessage && (
        <Modal
          title="Error"
          visible={true}
          onCancel={() => setErrorMessage(null)}  // Cuando el modal se cierra, limpiamos el error
          footer={[
            <Button key="close" onClick={() => setErrorMessage(null)}>
              Cerrar
            </Button>,
          ]}
        >
          <p>{errorMessage}</p>
        </Modal>
      )}
    </div>
  );
};

export default OldWorkPage;
