import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, DatePicker, Switch } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { Modal } from 'antd';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const OldWorkForm = ({ token, editingItem, onCreate }) => {
  const [form] = Form.useForm();
  const [tipos, setTipos] = useState([]);  // Para los valores posibles de 'tipo'
  const [estados, setEstados] = useState([]);  // Para los valores posibles de 'estado'
  const [clientes, setClientes] = useState([]);  // Para los valores posibles de 'cliente'
  const [errorMessage, setErrorMessage] = useState(null);

  // Cargar tipos, estados y clientes desde el backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('useEffect 1');
        // Cargar tipos y estados desde /api/works/work-options
        const responseOptions = await axios.get(`${API_URL}/oldworks/oldwork-options`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTipos(responseOptions.data.tipo);  // Guardamos los tipos
        setEstados(responseOptions.data.estado);  // Guardamos los estados

        // Cargar clientes desde /api/clients
        const responseClientes = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClientes(responseClientes.data);  // Guardamos los clientes

        console.log('useEffect 2');
      } catch (error) {
        console.error(error);
        message.error('Error al cargar opciones de trabajo');
      }
    };

    fetchOptions();
  }, [token]);

  useEffect(() => {
    console.log('useEffect 3');
    if (editingItem) {
      console.log('useEffect 4');
      form.setFieldsValue({
        cliente: editingItem.cliente ? editingItem.cliente._id : undefined,
        tipo: editingItem.tipo,
        estado: editingItem.estado,
        fechaCreacion: editingItem.fechaCreacion ? moment(editingItem.fechaCreacion) : undefined,
        fechaUltimoEstado: editingItem.fechaUltimoEstado ? moment(editingItem.fechaUltimoEstado) : undefined,  // Asignamos la fechaUltimoEstado si está disponible
        activo: editingItem.activo,
      });

      console.log('useEffect 5');
    }
  }, [editingItem, form]);

  const handleSubmit = (values) => {
    onCreate(values);
  };

  const handleSubmit2 = async (values) => {
    // Aseguramos que fechaCreacion sea un objeto Date antes de intentar convertirlo a ISO
    const defaultDate = "1970-01-01T00:00:00Z"; // La primera fecha posible en formato ISO

    // Asegúrate de que las fechas y otros valores se formateen correctamente
    const formattedValues = {
      ...values,
      fechaCreacion: values.fechaCreacion ? moment(values.fechaCreacion).toISOString() : defaultDate,
      fechaUltimoEstado: values.fechaUltimoEstado ? moment(values.fechaUltimoEstado).toISOString() : defaultDate,
    };

    // Verifica que el cliente está siendo enviado como el _id del cliente
    console.log('Cliente seleccionado:', values.cliente);           // Para verificar el valor del cliente
    console.log('Datos enviados al backend:', formattedValues);     // Verifica qué se está enviando

    try {
      // Llamada a la función onCreate que se pasa desde WorkPage.js para crear o actualizar el trabajo
      await onCreate(formattedValues);
    } catch (error) {
      console.error(error);
      // Aquí capturamos el error y mostramos el modal con el mensaje
      setErrorMessage(error.message || 'Hubo un error desconocido');
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit2}
      layout="vertical"
      initialValues={{
        tipo: '',  // Inicializa tipo con un valor vacío
        estado: '',  // Inicializa estado con un valor vacío
      }}
    >
      <Form.Item
        label="Cliente"
        name="cliente"
        rules={[{ required: true, message: 'Selecciona un cliente' }]}
      >
        <Select placeholder="Selecciona un cliente">
          {clientes.length > 0 ? (
            clientes.map((cliente) => (
              <Option key={cliente._id} value={cliente._id}>
                {cliente.nombre}  {/* Asumiendo que cada cliente tiene un _id y un nombre */}
              </Option>
            ))
          ) : (
            <Option value="">Cargando clientes...</Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        label="Tipo"
        name="tipo"
        rules={[{ required: true, message: 'Selecciona un tipo de trabajo' }]}
      >
        <Select placeholder="Selecciona un tipo">
          {tipos.length > 0 ? (
            tipos.map((tipo, index) => (
              <Option key={index} value={tipo}>
                {tipo}
              </Option>
            ))
          ) : (
            <Option value="">Cargando tipos...</Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        label="Estado"
        name="estado"
        rules={[{ required: true, message: 'Selecciona un estado' }]}
      >
        <Select placeholder="Selecciona un estado">
          {estados.length > 0 ? (
            estados.map((estado, index) => (
              <Option key={index} value={estado}>
                {estado}
              </Option>
            ))
          ) : (
            <Option value="">Cargando estados...</Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        label="Activo"
        name="activo"
        valuePropName="checked" // Esto es importante para que el valor del Switch se maneje correctamente
        initialValue={false}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="Fecha de Creación"
        name="fechaCreacion"
        rules={[{ required: true, message: 'Selecciona una fecha de creación' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="Selecciona la fecha"
          format="DD/MM/YYYY"
        />
      </Form.Item>

      <Form.Item
        label="Fecha de Último Estado"
        name="fechaUltimoEstado"
        rules={[{ required: true, message: 'Selecciona una fecha de último estado' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="Selecciona la fecha"
          format="DD/MM/YYYY"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {editingItem ? 'Actualizar Trabajo' : 'Crear Trabajo'}
        </Button>
      </Form.Item>

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

      {editingItem && (
        <Form.Item>
          <Button
            onClick={() => form.resetFields()}
            style={{ marginLeft: 8 }}
          >
            Cancelar
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default OldWorkForm;
