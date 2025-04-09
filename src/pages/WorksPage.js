import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Switch, Modal, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import WorkForm from '../components/WorkForm';
import BudgetForm from '../components/BudgetForm';  // Importamos BudgetForm
import moment from 'moment';
import { jsPDF } from 'jspdf'; // Importamos jsPDF

import logo from '../assets/logo.png';  // Importamos el logo desde la carpeta assets

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const WorkPage = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [visibleBudgetForm, setVisibleBudgetForm] = useState(false);

  const token = localStorage.getItem('token'); // Obtener el token de localStorage
  const [clients, setClients] = useState([]);  // Nuevo estado para clientes

  useEffect(() => {
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

    fetchWorks();
  }, [token]);
  

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      const url = editingItem ? `${API_URL}/works/${editingItem._id}` : `${API_URL}/works`;
      const method = editingItem ? 'put' : 'post';

      await axios({
        method,
        url,
        data: values,
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(editingItem ? 'Trabajo actualizado' : 'Trabajo creado');
      setVisible(false);
      setEditingItem(null);
      const response = await axios.get(`${API_URL}/works`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorks(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Ocurrió un error al guardar los datos');
      setLoading(false);
    }
  };

  const handleEdit = (work) => {
    setEditingItem(work);
    setVisible(true);
  };

  const handleDelete = async (workId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/works/${workId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Trabajo eliminado');
      const response = await axios.get(`${API_URL}/works`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorks(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Ocurrió un error al eliminar el trabajo');
      setLoading(false);
    }
  };

  const handleSwitchChange = async (checked, work) => {
    try {
      setLoading(true);
      const updatedWork = { ...work, activo: checked };
      await axios.put(`${API_URL}/works/${work._id}`, updatedWork, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Estado de activo actualizado');
      const response = await axios.get(`${API_URL}/works`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorks(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Error al actualizar estado de activo');
      setLoading(false);
    }
  };

  // Función para generar PDF
  const generatePDF = (work) => {
    const doc = new jsPDF();
    
    // Establecer márgenes y dimensiones del recuadro
    const marginLeft = 20;
    const marginTop = 20;
    const pageWidth = doc.internal.pageSize.width;
    const headerHeight = 70;  // Altura del recuadro con más espacio para el texto
    
    // Establecer el color de fondo para el recuadro (rojo)
    doc.setFillColor(255, 0, 0);  // Rojo
    
    // Dibujar el recuadro con bordes redondeados
    const roundedRectRadius = 10; // Radio de los bordes redondeados
    doc.roundedRect(marginLeft, marginTop, pageWidth - 2 * marginLeft, headerHeight, roundedRectRadius, roundedRectRadius, 'F');  // 'F' para relleno
    
    // Establecer la fuente para el texto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    
    // Establecer color blanco para el texto
    doc.setTextColor(255, 255, 255);  // Blanco
    
    // Agregar el título "PRESUPUESTO" (centrado)
    doc.text('PRESUPUESTO', (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 20, { align: 'center' });

    // Cambiar a una fuente más pequeña para el nombre y dirección
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Nombre del cliente (centrado)
    doc.text(work.clienteNombre, (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 35, { align: 'center' });

    // Dirección (centrado y en una línea separada)
    const direccion = Array.isArray(work.direccion) ? work.direccion : ['Dirección no disponible'];
    doc.text('DIRECCION:', (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 50, { align: 'center' });
    doc.text(direccion.join(', '), (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 60, { align: 'center' });

    // ** Agregar el logo centrado **
    const logoY = marginTop + headerHeight + 10;  // Justo debajo del header
    const logoWidth = 50; // Ancho de la imagen
    const logoHeight = 50; // Alto de la imagen
    const xPosition = (pageWidth - logoWidth) / 2;  // Calcular la posición horizontal para centrar el logo

    // Agregar logo (centrado)
    doc.addImage(logo, 'PNG', xPosition, logoY, logoWidth, logoHeight);   // xPosition centra el logo, y es la posición vertical

    // ** Agregar la tabla de productos **
    const tableY = logoY + logoHeight + 10;  // Posición de la tabla justo después del logo
    
    
    // Cabecera de la tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const tableHeaders = ['Producto', 'Cantidad', 'Ancho', 'Largo', 'Descuento', 'Total'];
    let tableColumnWidths = [40, 30, 30, 30, 30, 30];  // Ancho de las columnas
    
    // Dibujar los encabezados de la tabla
    tableHeaders.forEach((header, index) => {
      doc.text(header, marginLeft + tableColumnWidths[index] * index, tableY);
    });

    // ** Poner 4 filas de datos random **
    const products = [
      ['Cortina A', '10', '2m', '3m', '10%', '$300'],
      ['Cortina B', '5', '1.5m', '2.5m', '15%', '$200'],
      ['Cortina C', '8', '2.2m', '3.2m', '5%', '$250'],
      ['Cortina D', '12', '1.8m', '2.8m', '20%', '$350'],
    ];

    let yPosition = tableY + 10;  // Empezamos un poco después del encabezado de la tabla
    
    products.forEach((row) => {
      row.forEach((cell, index) => {
        doc.text(cell, marginLeft + tableColumnWidths[index] * index, yPosition);
      });
      yPosition += 10;  // Incrementar la posición vertical para la siguiente fila
    });
  
    // Guardar el PDF con el nombre adecuado
    doc.save(`${work.clienteNombre}_presupuesto.pdf`);
  };

  const handleCreateBudget = (work) => {
    // Aquí puedes manejar el formulario o mostrar un modal específico para crear el presupuesto.
    // Dependiendo de tu lógica, puede ser un formulario completo o redirigir a una página separada para crear el presupuesto.
    console.log('Abriendo modal de presupuesto para el trabajo:', work);

    // Verifica que `work` tenga un valor antes de pasarlo a BudgetForm
    console.log("En WorkPage, trabajando con:", work);

    // Establecer el trabajo seleccionado
    setEditingItem(work);  // Establecer el trabajo seleccionado
    // Aquí se puede abrir un modal, por ejemplo:
    setVisibleBudgetForm(true);  // Esta es una nueva variable de estado que abre el modal de presupuesto
    console.log('Modal de presupuesto debería estar visible ahora');
  };

  const handleCreateBudgetForm = (presupuesto) => {
    console.log('Presupuesto creado:', presupuesto);
    setVisibleBudgetForm(false);  // Cerrar el modal de presupuesto
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
        <Select defaultValue={direccion[0]} style={{ width: 200 }}>
          {direccion.map((dir, index) => (
            <Option key={index} value={dir}>
              {dir}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Teléfonos',
      dataIndex: 'telefonos',
      key: 'telefonos',
      render: (telefonos) => (
        <Select defaultValue={telefonos[0]} style={{ width: 200 }}>
          {telefonos.map((telefono, index) => (
            <Option key={index} value={telefono}>
              {telefono}
            </Option>
          ))}
        </Select>
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
          {/* Botón Editar */}
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {/* Botón Eliminar */}
          <Popconfirm
            title="¿Estás seguro de eliminar este trabajo?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} />
          </Popconfirm>
          {/* Botón Crear Presupuesto */}
          <Button
            type="default"
            style={{ marginLeft: 8 }}
            onClick={() => {
              // console.log('Botón Crear Presupuesto deshabilitado');
              handleCreateBudget(record);  // Llamamos a la función para crear el presupuesto
            }}
          >
            💰 {/* Crear Presupuesto */} 
          </Button>

          {/* Botón Generar PDF */}
          <Button
            type="default"
            style={{ marginLeft: 8 }}
            onClick={() => generatePDF(record)}  // Llamamos a la función para generar el PDF
          >
            📝 {/* Generar PDF */}
          </Button>
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
        pagination={{ pageSize: 10 }}
      />

      {/* Modal para editar o agregar trabajo */}
      <Modal
        title={editingItem ? 'Editar Trabajo' : 'Agregar Trabajo'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        destroyOnClose={true}  // Esto destruye el formulario al cerrar el modal
      >
        <WorkForm
          token={token}
          editingItem={editingItem}
          onCreate={handleCreate}  // Pasamos la función para guardar cambios
        />
      </Modal>

      {/* Modal para el presupuesto */}
      <Modal
        title="Crear PresupuestoX"
        open={visibleBudgetForm}  // Reemplazamos "visible" por "open"
        onCancel={() => {
          console.log('Cerrando modal de presupuesto');
          setVisibleBudgetForm(false);
        }}
        footer={null}
        destroyOnClose={true}   // Esto destruye el formulario al cerrar el modal
      >
        {/* Aquí iría el formulario para crear el presupuesto */}
        <BudgetForm 
          work={editingItem}                    // Pasamos el trabajo al formulario
          onSubmit={handleCreateBudgetForm}     // Pasamos la función que maneja la creación del presupuesto
        />
      </Modal>

    </div>
  );
};

export default WorkPage;
