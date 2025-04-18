import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Switch, Collapse, Input, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import ClientForm from '../components/ClientForm';
import dayjs from 'dayjs'; // instalar con: npm install dayjs
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Esta SÍ importa y registra el plugin correctamente
import moment from 'moment'; // Importamos moment.js para formatear las fechas

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sortedInfo, setSortedInfo] = useState({ order: null, columnKey: null });
  const [filters, setFilters] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    activo: null,
    createdAt: null,
    updatedFrom: null,
  });    

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
      } catch (error) {
        message.error('No se pudieron cargar los clientes');
      } finally {
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
    } catch (error) {
      message.error('Ocurrió un error al guardar los datos');
    } finally {
      setLoading(false);  // Desactivamos la carga después de la solicitud
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
      message.success('Cliente eliminado');
    } catch (error) {
      message.error('Ocurrió un error al eliminar el cliente');
    } finally {
      setLoading(false);  // Actualizar el estado de carga a false después de la respuesta o en caso de error
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
      message.success('Estado actualizado');
    } catch (error) {
      message.error('Error al actualizar estado de activo');     
    } finally {
      setLoading(false);    // Desactivamos la carga después de actualizar
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };  

  const handleActivoFilterChange = (checked) => {
    setFilters((prev) => ({
      ...prev,
      activo: checked,
    }));
  };  

  const handleDateChange = (dates) => {
    setFilters((prev) => ({ ...prev, createdAt: dates }));
  }; 

  const clearFilters = () => {
    setFilters({ nombre: '', apellidos: '', email: '', telefono: '', activo: null, createdAt: null, });
  };  

  const applyFilters = (data) => {
    let filtered = [...data];
  
    if (filters.nombre) {
      filtered = filtered.filter((item) =>
        item.nombre?.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    if (filters.apellidos) {
      filtered = filtered.filter((item) =>
        item.apellidos?.toLowerCase().includes(filters.apellidos.toLowerCase())
      );
    }
  
    if (filters.email) {
      filtered = filtered.filter((item) =>
        item.correos?.some((correo) =>
          correo.toLowerCase().includes(filters.email.toLowerCase())
        )
      );
    }
  
    if (filters.telefono) {
      filtered = filtered.filter((item) =>
        item.telefonos?.some((tel) =>
          tel.toLowerCase().includes(filters.telefono.toLowerCase())
        )
      );
    }
  
    if (filters.activo !== null) {
      filtered = filtered.filter((item) => item.activo === filters.activo);
    }

    if (filters.createdAt && filters.createdAt.length === 2) {
      const [start, end] = filters.createdAt;
      filtered = filtered.filter((item) => {
        const createdDate = new Date(item.createdAt);
        return createdDate >= start.startOf('day').toDate() &&
               createdDate <= end.endOf('day').toDate();
      });
    } 
    
    if (filters.updatedFrom) {
      const updatedFromDate = dayjs(filters.updatedFrom).startOf('day');
      filtered = filtered.filter((item) =>
        item.updatedAt && dayjs(item.updatedAt).isAfter(updatedFromDate.subtract(1, 'minute'))
      );
    }             
  
    return filtered;
  };  
  
  const handleTableChange = (_, __, sorter) => {
    setSortedInfo(sorter);
  };

  /* Botones de exportación */

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Nombre: item.nombre,
        Apellidos: item.apellidos,
        Direcciones: item.direcciones?.join(', '),
        Teléfonos: item.telefonos?.join(', '),
        Correos: item.correos?.join(', '),
        Activo: item.activo ? 'Sí' : 'No',
        'Fecha de Creación': new Date(item.createdAt).toLocaleDateString(),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'clientes.xlsx');
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();

    console.log('autoTable está disponible:', typeof doc.autoTable); // 👈 AÑADE ESTA LÍNEA
  
    const tableColumn = [
      'Nombre',
      'Apellidos',
      'Direcciones',
      'Teléfonos',
      'Correos',
      'Activo',
      'Fecha de Creación',
    ];
  
    const tableRows = data.map((item) => [
      item.nombre,
      item.apellidos,
      item.direcciones?.join(', '),
      item.telefonos?.join(', '),
      item.correos?.join(', '),
      item.activo ? 'Sí' : 'No',
      new Date(item.createdAt).toLocaleDateString(),
    ]);
  
    // ✅ Esta llamada debe funcionar si el import es correcto
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });    
  
    doc.save('clientes.pdf');
  };  
  
  
  const caseInsensitiveSorter = (a, b, key) =>
    a[key]?.toLowerCase().localeCompare(b[key]?.toLowerCase());

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
      sortOrder: sortedInfo.columnKey === 'nombre' && sortedInfo.order,
    },
    {
      title: 'Apellidos',
      dataIndex: 'apellidos',
      key: 'apellidos',
      sorter: (a, b) => a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' }),
      sortOrder: sortedInfo.columnKey === 'apellidos' && sortedInfo.order,
    },
    {
      title: 'Direcciones',
      dataIndex: 'direcciones',
      key: 'direcciones',
      sorter: (a, b) => (a.direcciones?.length || 0) - (b.direcciones?.length || 0),
      sortOrder: sortedInfo.columnKey === 'direcciones' && sortedInfo.order,
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
      sorter: (a, b) => (a.correos?.length || 0) - (b.correos?.length || 0),
      sortOrder: sortedInfo.columnKey === 'correos' && sortedInfo.order,
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
      title: 'Fecha de creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
      render: (date) => new Date(date).toLocaleString(),
    },  
    {
      title: 'Actualizado',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => moment(updatedAt).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => moment(a.updatedAt).valueOf() - moment(b.updatedAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'updatedAt' && sortedInfo.order,
    },
         
    {
      title: 'Activo',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo, record) => (
        <Switch checked={activo} onChange={(checked) => handleSwitchChange(checked, record)} />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="¿Seguro que quieres eliminar este cliente?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Clientes</h2>
  
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Input
          placeholder="Buscar por nombre"
          name="nombre"
          value={filters.nombre}
          onChange={handleFilterChange}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Buscar por apellidos"
          name="apellidos"
          value={filters.apellidos}
          onChange={handleFilterChange}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Buscar por email"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Buscar por teléfono"
          name="telefono"
          value={filters.telefono}
          onChange={handleFilterChange}
          style={{ width: 200 }}
        />
        <RangePicker
          onChange={handleDateChange}
          value={filters.createdAt}
          style={{ width: 280 }}
        />
        <DatePicker
          placeholder="Actualizados desde..."
          value={filters.updatedFrom}
          onChange={(date) =>
            setFilters((prev) => ({ ...prev, updatedFrom: date }))
          }
          style={{ width: 200 }}
          allowClear // 👈 para permitir borrar la fecha
        />



        <Switch
          checked={filters.activo}
          onChange={handleActivoFilterChange}
          checkedChildren="Activos"
          unCheckedChildren="Inactivos"
        />
        <Button onClick={clearFilters}>Limpiar Filtros</Button>
        <Button onClick={() => exportToExcel(applyFilters(clients))}>Exportar a Excel</Button>
        <Button onClick={() => exportToPDF(applyFilters(clients))}>Exportar a PDF</Button>
      </div>
  
      <Button type="primary" onClick={() => setVisible(true)} style={{ marginBottom: 16 }}>
        Agregar Cliente
      </Button>
  
      <Table
        columns={columns}
        dataSource={applyFilters(clients)}
        loading={loading}
        rowKey="_id"
        onChange={handleTableChange}
      />
  
      {visible && (
        <ClientForm
          visible={visible}
          onCancel={() => setVisible(false)}
          onCreate={handleCreate}
          editingItem={editingItem}
          loading={loading}
        />
      )}
    </div>
  );
  
};

export default ClientsPage;
