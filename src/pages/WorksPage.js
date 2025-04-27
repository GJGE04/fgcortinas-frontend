import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Switch, Modal, Select, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import WorkForm from '../components/WorkForm';
import BudgetForm from '../components/BudgetForm';  // Importamos BudgetForm
import moment from 'moment';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const WorkPage = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  const token = localStorage.getItem('token'); // Obtener el token de localStorage

  useEffect(() => { /*
    const fetchWorks = async () => {
      try {
        const response = await axios.get(`${API_URL}/works`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const worksWithClients = await Promise.all(
          response.data.map(async (work) => {
            let clienteNombre = 'Cliente no encontrado1';  // Valor por defecto
            console.log('LLEGO1');
            if (work.cliente) {  // Verificamos que la referencia cliente no esté vacía
              try {     
                console.log('LLEGO2 ' + work.cliente);
                const clientResponse = await axios.get(`${API_URL}/clients/search/${work.cliente._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });  
                console.log('LLEGO3');
                clienteNombre = clientResponse.data.nombre || 'Cliente no encontrado2';
              } catch (error) {
                console.error(error);
                clienteNombre = 'Cliente no encontrado3 ' + error.message;  // Si ocurre un error, lo mostramos como "no encontrado"
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
        setLoading(false);
      }
    };
*/
    fetchWorks();
  }, [token]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/works`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const enrichedWorks = await Promise.all(data.map(async (work) => {
        let clienteNombre = 'Cliente no encontrado';
        if (work.cliente?._id) {
          try {
            const clientRes = await axios.get(`${API_URL}/clients/search/${work.cliente._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            clienteNombre = clientRes.data?.nombre || clienteNombre;
          } catch (err) {
            console.warn('Error al buscar cliente:', err.message);
          }
        }
        return { ...work, clienteNombre };
      }));

      setWorks(enrichedWorks);
    } catch (err) {
      message.error('Error al cargar trabajos');
    } finally {
      setLoading(false);
    }
  };

  const saveWork = async (values) => {
    const isEdit = Boolean(selectedWork);
    const url = isEdit ? `${API_URL}/works/${selectedWork._id}` : `${API_URL}/works`;
    const method = isEdit ? 'put' : 'post';

    try {
      await axios({ method, url, data: values, headers: { Authorization: `Bearer ${token}` } });
      message.success(isEdit ? 'Trabajo actualizado' : 'Trabajo creado');
      closeWorkModal();
      fetchWorks();
    } catch (err) {
      message.error('Error al guardar trabajo');
    }
  };

  const deleteWork = async (id) => {
    try {
      await axios.delete(`${API_URL}/works/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Trabajo eliminado');
      fetchWorks();
    } catch (err) {
      message.error('Error al eliminar trabajo');
    }
  };

  const toggleActivo = async (checked, work) => {
    try {
      await axios.put(`${API_URL}/works/${work._id}`, {
        ...work, activo: checked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Estado actualizado');
      fetchWorks();
    } catch (err) {
      message.error('Error al actualizar estado');
    }
  };

  const openEditModal = (work) => {
    setSelectedWork(work);
    setIsWorkModalOpen(true);
  };

  const openBudgetModal = (work) => {
    setSelectedWork(work);
    setIsBudgetModalOpen(true);
  };

  const closeWorkModal = () => {
    setSelectedWork(null);
    setIsWorkModalOpen(false);
  };

  const closeBudgetModal = () => {
    setSelectedWork(null);
    setIsBudgetModalOpen(false);
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'clienteNombre',  // Ahora estamos usando el nuevo campo que tiene el nombre del cliente
      key: 'clienteNombre',
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (direccion) => (
        direccion.length > 1 ? (
          <Select defaultValue={direccion[0]} style={{ width: 200 }}>
            {direccion.map((dir, index) => (
              <Option key={index} value={dir}>
                {dir}
              </Option>
            ))}
          </Select>
        ) : (
          <span>{direccion[0]}</span>
        )
      ),
    },
    {
      title: 'Teléfonos',
      dataIndex: 'telefonos',
      key: 'telefonos',
      render: (telefonos) => (
        telefonos.length > 1 ? (
          <Select defaultValue={telefonos[0]} style={{ width: 200 }}>
            {telefonos.map((telefono, index) => (
              <Option key={index} value={telefono}>
                {telefono}
              </Option>
            ))}
          </Select>
        ) : (
          <span>{telefonos[0]}</span>
        )
      ),
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
        /*<Switch checked={activo} onChange={(checked) => handleSwitchChange(checked, record)} />*/
        <Switch checked={activo} onChange={(val) => toggleActivo(val, record)} />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="middle">
          {/* Botón Editar */}
          {/*<Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /> */}
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />

          {/* Botón Eliminar */}
          <Popconfirm
            title="¿Eliminar este trabajo?"
            // onConfirm={() => handleDelete(record._id)}
            onConfirm={() => deleteWork(record._id)}
            okText="Sí" cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
          
          {/* Botón Crear Presupuesto */}
          <Button
            icon={<span role="img" aria-label="presupuesto">💰</span>}
            // console.log('Botón Crear Presupuesto deshabilitado');
            // Llamamos a la función para crear el presupuesto. Entonces, record (cada fila de la tabla) es pasado como argumento y se convierte en work en la función. Así se transfiere.
            // onClick={() => handleCreateBudget(record)}
            onClick={() => openBudgetModal(record)}
          > {/* Crear Presupuesto */} 
          </Button>

          {/* Botón Generar PDF 
          <Button
            type="default"
            style={{ marginLeft: 8 }}
            onClick={() => generatePDF(record)}  // Llamamos a la función para generar el PDF
          >  */}
          {/*  📝  Generar PDF 
          </Button>  */}

        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<EditOutlined />} 
      // onClick={() => setVisible(true)} 
      onClick={() => setIsWorkModalOpen(true)}
      style={{ marginBottom: 16 }} >
        Nuevo Trabajo
      </Button>
      <Table
        columns={columns}
        dataSource={works}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal para editar o agregar trabajo */}
      <Modal
        // title={editingItem ? 'Editar Trabajo' : 'Agregar Trabajo'}
        title={selectedWork ? 'Editar Trabajo' : 'Agregar Trabajo'}
        // visible={visible}
        // onCancel={() => setVisible(false)}
        open={isWorkModalOpen}
        onCancel={closeWorkModal}
        footer={null}
        destroyOnClose={true}  // Esto destruye el formulario al cerrar el modal
      >
        <WorkForm
          token={token}
          // editingItem={editingItem}
          // onCreate={handleCreate}  // Pasamos la función para guardar cambios
          editingItem={selectedWork}
          onCreate={saveWork}
        />
      </Modal>

      {/* Modal para el formulario de presupuesto 
      <Modal
        title={`Presupuesto para ${selectedWork?.clienteNombre || 'Trabajo'}`}
        open={isBudgetModalOpen}
        onCancel={() => setIsBudgetModalOpen(false)}
        footer={null}
        destroyOnClose={true}
      >
        <BudgetForm
          work={selectedWork}
          token={token}
          onClose={() => setIsBudgetModalOpen(false)}
        />
      </Modal>

      {/* Modal para editar o agregar trabajo */}
      <Modal
        title='Crear Presupuesto FG'
        open={isBudgetModalOpen}
        onCancel={closeBudgetModal}
        footer={null}
        destroyOnClose={true}  // Esto destruye el formulario al cerrar el modal
        width={1000} // porbar quitar
      >
        <BudgetForm
          work={selectedWork}
          token={token}
          onClose={() => setIsBudgetModalOpen(false)}
        />
      </Modal>
    
    
    
    </div>
  );
};

export default WorkPage;
