import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Switch, Collapse, Popover } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import BudgetForm from '../components/BudgetForm'; // Crear un formulario similar al de clientes para los presupuestos

const { Panel } = Collapse;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Obtener el token almacenado en el localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Cargar presupuestos de la base de datos
    const fetchBudgets = async () => {
      try {
        const response = await axios.get(`${API_URL}/budgetsdetail`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBudgets(response.data);
        setLoading(false);
      } catch (error) {
        message.error('No se pudieron cargar los presupuestos');
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [token]); // Dependencia del token para recargar si cambia

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      const url = editingItem ? `/api/budgets/${editingItem._id}` : '/api/budgets';
      const method = editingItem ? 'put' : 'post';

      // Enviar el token en las cabeceras de la solicitud
      await axios({
        method,
        url,
        data: values,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success(editingItem ? 'Presupuesto actualizado' : 'Presupuesto creado');
      setVisible(false);
      setEditingItem(null);
      const response = await axios.get('/api/budgetsdetail', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgets(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Ocurrió un error al guardar los datos');
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingItem(budget);
    setVisible(true);
  };

  const handleDelete = async (budgetId) => {
    console.log("Eliminando presupuestos...");
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/budget/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Presupuesto eliminado');
      console.log('Presupuesto eliminado correctamente: ' , budgetId);
      
      // Recargar los datos después de eliminar el cliente
      const response = await axios.get(`${API_URL}/budgetsdetail`, {
        headers: { Authorization: `Bearer ${token}` }  // Incluir el token en la cabecera
      });

      setBudgets(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Ocurrió un error al eliminar el presupuesto');
      console.error(error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nombre del Presupuesto',
      dataIndex: 'name',
      key: 'name',
    },
    {
        title: 'Cliente',
        dataIndex: 'client',
        key: 'client',
        render: (client) => {
          // Mostrar el nombre del cliente
          return client ? client.nombre : 'Cliente no encontrado';
        },
    },
    {
          title: 'Productos',
          dataIndex: 'products',
          key: 'products',
          render: (products) => (
            <Collapse>
                <Panel header={`Productos (${products.length})`} key="1">
                    {products.map((product, index) => {
                        const productDetails = product.product;  // Asignamos el producto

                        // Comprobamos si productDetails está presente
                        if (!productDetails) {
                            return <p key={index}>Producto no encontrado</p>; // Si no hay datos, mostramos un mensaje
                        }

                        const { name, price } = productDetails;  // Desestructuramos solo si el producto existe
                        const { quantity, width, length, discount, subtotal } = product;  // Datos adicionales del presupuesto
/*  v1
                        return (
                            <div key={index} style={{ marginBottom: '10px' }}>
                                <p><strong>Nombre:</strong> {name}</p>
                                <p><strong>Cantidad:</strong> {quantity}</p>
                                <p><strong>Ancho:</strong> {width}</p>
                                <p><strong>Largo:</strong> {length}</p>
                                <p><strong>Precio:</strong> USD {price} </p>
                                <p><strong>Descuento:</strong> {discount}%</p>
                                <p><strong>Subtotal:</strong> USD {subtotal}</p>
                                // { Agregar un separador visual entre productos }
                                {index < products.length - 1 && <hr />}
                            </div>
                        );
*/
                        // Detalles adicionales que mostrar en el Popover
                        const content = (
                            <div>
                            <p><strong>Cantidad:</strong> {quantity}</p>
                            <p><strong>Ancho:</strong> {width} m</p>
                            <p><strong>Largo:</strong> {length} m</p>
                            <p><strong>Precio:</strong> USD {price}</p>
                            <p><strong>Descuento:</strong> {discount}%</p>
                            <p><strong>Subtotal:</strong> USD {subtotal}</p>
                            </div>
                        );
            
                        return (
                            <div key={index} style={{ marginBottom: '10px' }}>
                            <Popover content={content} title={name} trigger="click">
                                <Button>{name}</Button>
                            </Popover>
                            </div>
                        );
                    
                    })}
                </Panel>
            </Collapse>
          ),
        },
    {
      title: 'Monto UYU',
      dataIndex: 'totalUYU',
      key: 'totalUYU',
      render: (text) => `UYU ${text}`,  // Mostramos el monto en UYU con el símbolo
    },
    {
        title: 'Monto USD',
        dataIndex: 'totalUSD',
        key: 'totalUSD',
        render: (text) => `USD ${text}`,  // Mostramos el monto en USD con el texto
    },
    {
        title: 'Técnico',
        dataIndex: 'technician',
        key: 'technician',
        render: (technician) => {
          // Mostrar el nombre del técnico
          return technician ? technician.username : 'Técnico no encontrado';
        },
    },
    {
        title: 'Fecha de Creación',
        dataIndex: 'creationDate',
        key: 'creationDate',
        render: (text) => {
            // Verificamos si la fecha está presente
            if (text) {
              return new Date(text).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false, // Usar formato de 24 horas
              });
            }
            return ''; // Retorna vacío si no hay fecha
          },
    },
    
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <span>
          {/* <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} /> */}
          <Popconfirm
            title="¿Estás seguro de eliminar este presupuesto?"
            onConfirm={() => handleDelete(record._id)}      // Llama a handleDelete cuando se confirma
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
      {/*
      <Button type="primary" onClick={() => setVisible(true)}>
        Agregar Presupuesto
      </Button>
      */}
      <Table
        columns={columns}
        dataSource={budgets}
        loading={loading}
        rowKey="_id"
      />
      
      {/* Mostrar el formulario solo cuando el estado "visible" es true */}
      {/*
      {visible && (
        <BudgetForm
          visible={visible}
          onCancel={() => setVisible(false)}
          onCreate={handleCreate}
          editingItem={editingItem}
          loading={loading} // Pasamos el estado loading al formulario
        />
      )}
        */}
    </div>
  );
};

export default BudgetsPage;
