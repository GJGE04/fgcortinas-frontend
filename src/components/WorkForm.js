import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, DatePicker, TimePicker, Switch, Row, Col } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const WorkForm = ({ token, editingItem, onCreate }) => {
  const [form] = Form.useForm();
  const [tipos, setTipos] = useState([]);  // Para los valores posibles de 'tipo'
  const [estados, setEstados] = useState([]);  // Para los valores posibles de 'estado'
  const [clientes, setClientes] = useState([]);  // Para los valores posibles de 'cliente'
  const [tecnicos, setTecnicos] = useState([]); // Para los valores posibles de 'tecnicos'
  const [hasTimeRange, setHasTimeRange] = useState(false); // Estado para el rango horario

  // Cargar tipos, estados y clientes desde el backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Cargar tipos y estados desde /api/works/work-options
        const responseOptions = await axios.get(`${API_URL}/works/work-options`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTipos(responseOptions.data.tipo);  // Guardamos los tipos
        setEstados(responseOptions.data.estado);  // Guardamos los estados

        // Cargar clientes desde /api/clients
        const responseClientes = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClientes(responseClientes.data);  // Guardamos los clientes

        // Cargar técnicos desde /api/users (o la ruta correspondiente)
        const responseTecnicos = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTecnicos(responseTecnicos.data);  // Guardamos los técnicos

      } catch (error) {
        console.error(error);
        message.error('Error al cargar opciones de trabajo');
      }
    };

    fetchOptions();
  }, [token]);

  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue({
        cliente: editingItem.cliente._id,
        tecnico: editingItem.tecnico._id, // Asumimos que el técnico es un solo objeto
        direccion: editingItem.direccion[0],  // Suponiendo que dirección es un array
        telefonos: editingItem.telefonos[0],  // Suponiendo que teléfonos es un array
        tipo: editingItem.tipo,
        estado: editingItem.estado,
        fechaCreacion: moment(editingItem.fechaCreacion),
        fechaUltimoEstado: editingItem.fechaUltimoEstado ? moment(editingItem.fechaUltimoEstado) : null,  // Asignamos la fechaUltimoEstado si está disponible
        fechaComienzo: moment(editingItem.fechaComienzo),
        fechaFinalizacion: moment(editingItem.fechaFinalizacion),
        horaComienzo: moment(editingItem.horaComienzo, 'HH:mm'),
        horaFinalizacion: moment(editingItem.horaFinalizacion, 'HH:mm'),
      });
    }
  }, [editingItem, form]);

  const handleSubmit = async (values) => {
    // Aseguramos que fechaCreacion sea un objeto Date antes de intentar convertirlo a ISO
    const formattedValues = {
      ...values,
      fechaCreacion: values.fechaCreacion ? moment(values.fechaCreacion).toISOString() : null,
      fechaUltimoEstado: values.fechaUltimoEstado ? moment(values.fechaUltimoEstado).toISOString() : null,
      fechaComienzo: values.fechaComienzo ? moment(values.fechaComienzo).toISOString() : null,
      fechaFinalizacion: values.fechaFinalizacion ? moment(values.fechaFinalizacion).toISOString() : null,
      horaComienzo: values.horaComienzo ? values.horaComienzo.format('HH:mm') : null,
      horaFinalizacion: values.horaFinalizacion ? values.horaFinalizacion.format('HH:mm') : null,
    };

    try {
      // Llamada a la función onCreate que se pasa desde WorkPage.js para crear o actualizar el trabajo
      await onCreate(formattedValues);
    } catch (error) {
      console.error(error);
      message.error('Hubo un error al guardar el trabajo');
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={{
        tipo: '',  // Inicializa tipo con un valor vacío
        estado: '',  // Inicializa estado con un valor vacío
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
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
        </Col>
        
        <Col span={12}>
          <Form.Item
            label="Técnico"
            name="tecnico"
            rules={[{ required: true, message: 'Selecciona un técnico' }]}>
            <Select placeholder="Selecciona un técnico">
              {tecnicos.length > 0 ? (
                tecnicos.map((tecnico) => (
                  <Option key={tecnico._id} value={tecnico._id}>
                    {tecnico.username}  {/* Asumiendo que cada técnico tiene un _id y un nombre */}
                  </Option>
                ))
              ) : (
                <Option value="">Cargando técnicos...</Option>
              )}
            </Select>
          </Form.Item>
        </Col>
        </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Dirección"
            name="direccion"
            rules={[{ required: true, message: 'Ingresa una dirección' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Teléfonos"
            name="telefonos"
            rules={[{ required: true, message: 'Ingresa un teléfono' }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
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
        </Col>
        <Col span={12}>
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
        </Col>
      </Row>
  {/*
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Fecha de Creación"
            name="fechaCreacion"
            rules={[{ required: true, message: 'Selecciona una fecha de creación' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Fecha de Último Estado"
            name="fechaUltimoEstado"
            rules={[{ required: true, message: 'Selecciona una fecha de último estado' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
*/}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Fecha de Comienzo"
            name="fechaComienzo"
            rules={[{ required: true, message: 'Selecciona una fecha de comienzo' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Fecha de Finalización"
            name="fechaFinalizacion"
            rules={[{ required: true, message: 'Selecciona una fecha de finalización' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Rango Horario"
        name="hasTimeRange"
        valuePropName="checked">
        <Switch onChange={(checked) => setHasTimeRange(checked)} />
      </Form.Item>

      {hasTimeRange && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Hora de Comienzo"
                name="horaComienzo"
                rules={[{ required: hasTimeRange, message: 'Selecciona la hora de comienzo' }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Hora de Finalización"
                name="horaFinalizacion"
                rules={[{ required: hasTimeRange, message: 'Selecciona la hora de finalización' }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingItem ? 'Guardar' : 'Guardar'}
            </Button>
          </Form.Item>
        </Col>
        <Col span={12}>
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
        </Col>
      </Row>
    </Form>
  );
};

export default WorkForm;
