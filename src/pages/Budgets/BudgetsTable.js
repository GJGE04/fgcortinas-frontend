import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Row, Col, Input, Space, Tag, Collapse } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

import EditBudgetForm from '../../components/EditBudgetForm';
import { useEditBudget } from '../../hooks/useEditBudget';
/* COn el uso de este formulario y los hooks:
✅ Separás la UI (EditBudgetForm)
✅ Separás la lógica (useEditBudget)
✅ El componente BudgetsTable queda limpio y mantenible
*/

const { Panel } = Collapse;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

const BudgetsTable = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchTechnician, setSearchTechnician] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/allbudgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
    } catch (error) {
      message.error('Error al obtener presupuestos');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const {
    isModalVisible,
    editingBudget,
    form,
    openEditModal,
    closeModal,
    submitEditForm,
  } = useEditBudget(fetchBudgets);    // le pasamos el callback para refrescar

  const handleFilterChange = (value, type) => {
    switch (type) {
      case 'client':
        setSearchClient(value);
        break;
      case 'address':
        setSearchAddress(value);
        break;
      case 'technician':
        setSearchTechnician(value);
        break;
      case 'product':
        setSearchProduct(value);
        break;
      case 'status':
        //setStatusFilter(value);
        break;
      case 'dateRange':
        //setDateRange(value);
        break;
     /* case 'code':
        setCodeFilter(value);
        break;*/
      default:
        break;
    }
  };

  const filteredBudgets = budgets.filter((budget) => {
    
    // Asegurarse de que el filtro también pase si el cliente tiene "Sin asignar"
    const clientName = budget.client?.nombre || 'Sin asignar';  // Establecer un valor por defecto si no existe nombre
    const matchesClient = clientName.toLowerCase().includes(searchClient.toLowerCase().trim()) || searchClient.trim() === '';

    const matchesAddress = budget.address?.toLowerCase().includes(searchAddress.toLowerCase());

    const technicianName = budget.technician?.username || 'Sin asignar';
    const matchesTechnician = technicianName.toLowerCase().includes(searchTechnician.toLowerCase().trim()) || searchTechnician.trim() === '';

    // Extraer nombres de productos
    const productNames = budget.products?.map(p => p?.product?.name || '') || [];
    const productsMatch = productNames.some(name => name.toLowerCase().includes(searchProduct.toLowerCase().trim()));

    // Filtro general
    const term = searchTerm.toLowerCase().trim();
    if (!term) // return true; // si el input está vacío, mostrar todo
      return matchesClient && matchesAddress && matchesTechnician && productsMatch;

      const clientNameT = `${budget.client?.nombre || ''} ${budget.client?.apellidos || ''}`;
      const technicianNameT = budget.technician?.username || '';
      const address = budget.address || '';
      const description = budget.description || '';
      const budgetName = budget.name || '';
      const productNamesT = budget.products?.map(p => p?.product?.name || '') || [];
      const productsMatchT = productNamesT.some(name => name.toLowerCase().includes(term));
    
      return (
        clientNameT.toLowerCase().includes(term) ||
        technicianNameT.toLowerCase().includes(term) ||
        address.toLowerCase().includes(term) ||
        description.toLowerCase().includes(term) ||
        budgetName.toLowerCase().includes(term) ||
        productsMatchT
      );
  });
/*
  const filteredBudgets = budgets.filter(budget => {
    return (
      budget.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.client?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }); */

  const handleDeleteBudget = async (id) => {
    try {
      await axios.delete(`${API_URL}/budget/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Presupuesto eliminado');
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch {
      message.error('Error al eliminar presupuesto');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      render: (client) => client ? `${client.nombre} ${client.apellidos || ''}` : 'Sin asignar',
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Técnico',
      dataIndex: 'technician',
      key: 'technician',
      render: (technician) => technician ? technician.username : 'Sin asignar',
    },
    {
      title: 'Productos1',
      key: 'products',
      render: (_, record) =>
        record.products?.length > 0
          ? record.products.map((item, index) => (
              // <Tag key={index} color={item?.product?.name ? 'blue' : 'red'}>
              <Tag key={index} color={item ? 'blue' : 'red'}>
                {/* {item?.product?.name || 'Producto eliminado'} */}
                {item?.product?.name || 'Producto no encontrado'}
              </Tag>
            ))
          : <Tag color="default">Sin productos</Tag>,
    },
      {
            title: 'Productos3',
            dataIndex: 'products',
            key: 'products',
            sorter: (a, b) => (a.products?.length || 0) - (b.products?.length || 0),
            // sortOrder: sortedInfo.columnKey === 'products' && sortedInfo.order,
            render: (products = []) => (
              <Collapse>
                <Panel header={`Productos (${products.length})`} key="1">
                  {products.map((item, index) => (
                    <p key={index}>{item?.product?.name || 'Producto no encontrado'}</p>
                  ))}
                </Panel>
              </Collapse>
            ),
          },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="¿Eliminar este presupuesto?"
            onConfirm={() => handleDeleteBudget(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={4}>
          <Input
            placeholder="Buscar Cliente..."
            //value={searchTerm}
            //onChange={(e) => setSearchTerm(e.target.value)}
            onChange={e => handleFilterChange(e.target.value, 'client')}
          />
        </Col>
        <Col span={4}>
          <Input
            placeholder="Dirección"
            onChange={e => handleFilterChange(e.target.value, 'address')}
            //onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
        </Col>
        <Col span={4}>
          <Input
            placeholder="Filtrar por Técnico"
            onChange={e => handleFilterChange(e.target.value, 'technician')}
            //onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
          />
        </Col>
        <Col span={4}>
          <Input
            placeholder="Filtrar por productos"
            onChange={e => handleFilterChange(e.target.value, 'product')}
            //onChange={(e) => setFilters({ ...filters, product: e.target.value })}
          />
        </Col>
        <Col span={5}>
          <Input
            placeholder="Búsqueda general"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {/* Mensaje si no hay presupuestos */}
      {filteredBudgets.length === 0 && !loading && (
        <p style={{ color: 'red' }}>⚠️ No se encontraron presupuestos.</p>
      )}

      <Table
        columns={columns}
        dataSource={filteredBudgets}    /* Mostrar los presupuestos filtrados */
        rowKey="_id"
        loading={loading}
        expandable={{
          expandedRowRender: (budget) => (
            <div>
              <h4>Productos:</h4>
              <Table
                columns={[
                  {
                    title: 'Producto',
                    key: 'product',
                    render: (_, record) => record.product?.name || 'Producto eliminado',
                  },
                  
                  
                  {
                    title: 'Cantidad',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Ancho (m)',
                    dataIndex: 'width',
                    key: 'width',
                  },
                  {
                    title: 'Alto (m)',
                    dataIndex: 'length',
                    key: 'length',
                  },
                  {
                    title: 'Descuento (%)',
                    dataIndex: 'discount',
                    key: 'discount',
                  },
                  {
                    title: 'Subtotal',
                    dataIndex: 'subtotal',
                    key: 'subtotal',
                    render: (val) => `$U ${val.toLocaleString('es-UY')}`
                  },
                ]}
                dataSource={budget.products}
                pagination={false}
                // rowKey="_id"
                rowKey={(record) => record._id || `${record.product?._id}-${record.quantity}`}  // fallback
                size="small"
              />
            </div>
          )
        }}
      />

      <EditBudgetForm
        visible={isModalVisible}
        onCancel={closeModal}
        onSubmit={submitEditForm}
        editingBudget={editingBudget}
        form={form}
      />
    </div>
  );
};

export default BudgetsTable;

/*
🧠 2. ¿Cómo funciona esta solución?
🔹 Separación en tres capas:
1. BudgetsTable.jsx
Contiene la UI principal: tabla, filtros, y llama al modal de edición.
No tiene lógica de negocio compleja.

2. EditBudgetForm.jsx
Es solo la interfaz visual del formulario de edición.
Recibe props para controlar apertura, cierre y envío.

3. useEditBudget.js
Encapsula la lógica de edición:

Abre y cierra el modal

Maneja el formulario de antd

Envía el PATCH a la API

Llama al callback para refrescar los datos

*/

/*
✅ Resultado: Ventajas
Mantenibilidad: cada archivo hace solo una cosa.

Reusabilidad: podés usar EditBudgetForm o useEditBudget en otro módulo.

Escalabilidad: cuando agregues más lógica (como validaciones o más campos), el código no se vuelve inmanejable.
*/