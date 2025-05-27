// Este componente contiene el formulario con los campos de cliente, dirección, teléfono, técnicos, tipo y estado.
import React, { useEffect, useState } from 'react';
import { Form, Button, Select, message, Row, Col } from 'antd';  // Input, DatePicker, TimePicker, Switch, 
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

const WorkForm = ({ token, editingItem, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  const [tipos, setTipos] = useState([]);  // Para los valores posibles de 'tipo'
  const [estados, setEstados] = useState([]);  // Para los valores posibles de 'estado'
  const [clientes, setClientes] = useState([]);  // Para los valores posibles de 'cliente'
  const [tecnicos, setTecnicos] = useState([]); // Para los valores posibles de 'tecnicos'
  // const [hasTimeRange, setHasTimeRange] = useState(false); // Estado para el rango horario
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Cargar tipos, estados y clientes desde el backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Cargar tipos y estados desde /api/works/work-options
        const responseOptions = await axios.get(`${API_URL}/works/work-options`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Opciones de trabajo:', responseOptions.data); 

        // Cargar clientes desde /api/clients
        const responseClientes = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Clientes:', responseClientes.data);

        // Cargar técnicos desde /api/users (o la ruta correspondiente)
        const responseTecnicos = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Usuarios:', responseTecnicos.data);

        // Luego de obtener los datos, seteás los estados:
        setTipos(responseOptions.data.tipo);          // Guardamos los tipos
        setEstados(responseOptions.data.estado);      // Guardamos los estados
        setClientes(responseClientes.data);         	// Guardamos los clientes
        // setTecnicos(responseTecnicos.data.filter(user => user.role === 'TECNICO')); // Guardamos los técnicos
        setTecnicos(responseTecnicos.data.filter(user => user.role === 'Tecnico')); // coincidir con el string real

      } catch (error) {
        console.error(error);
        message.error('Error al cargar opciones de trabajo');
      }
    };

    fetchOptions();
  }, [token]);

  useEffect(() => {
    if (editingItem) {
      setClienteSeleccionado(editingItem.cliente); // 👈 importante
    /*  form.setFieldsValue({
        cliente: editingItem.cliente._id,
        // tecnico: editingItem.tecnico._id, // Asumimos que el técnico es un solo objeto
        tecnicos: editingItem.tecnicos.map(t => t._id),
        // direccion: editingItem.direccion[0],  // Suponiendo que dirección es un array
        // telefonos: editingItem.telefonos[0],  // Suponiendo que teléfonos es un array
        tipo: editingItem.tipo,
        estado: editingItem.estado,
        fechaCreacion: moment(editingItem.fechaCreacion),
        fechaUltimoEstado: editingItem.fechaUltimoEstado ? moment(editingItem.fechaUltimoEstado) : null,  // Asignamos la fechaUltimoEstado si está disponible
        fechaComienzo: moment(editingItem.fechaComienzo),
        fechaFinalizacion: moment(editingItem.fechaFinalizacion),
        horaComienzo: moment(editingItem.horaComienzo, 'HH:mm'),
        horaFinalizacion: moment(editingItem.horaFinalizacion, 'HH:mm'),
      }); */
      form.setFieldsValue({
        ...editingItem,
        cliente: editingItem.cliente?._id,
        tecnicos: editingItem.tecnicos?.map(t => t._id) || [],
        direccion: editingItem.direccion?.[0] || '',
        telefonos: editingItem.telefonos?.[0] || '',
        tipo: editingItem.tipo || '',
        estado: editingItem.estado || '',
        // fechaCreacion: editingItem.fechaCreacion ? moment(editingItem.fechaCreacion) : null,
        // fechaUltimoEstado: editingItem.fechaUltimoEstado ? moment(editingItem.fechaUltimoEstado) : null,
        fechaComienzo: editingItem.fechaComienzo ? moment(editingItem.fechaComienzo) : null,
        fechaFinalizacion: editingItem.fechaFinalizacion ? moment(editingItem.fechaFinalizacion) : null,
        horaComienzo: editingItem.horaComienzo ? moment(editingItem.horaComienzo, 'HH:mm') : null,
        horaFinalizacion: editingItem.horaFinalizacion ? moment(editingItem.horaFinalizacion, 'HH:mm') : null,
      });      
    }
  }, [editingItem, form]);

  const handleSubmit = async (values) => {
    console.log('Valores del formulario:', values);
    // Aseguramos que fechaCreacion sea un objeto Date antes de intentar convertirlo a ISO
    const formattedValues = {
      ...values,
      // fechaCreacion: values.fechaCreacion ? moment(values.fechaCreacion).toISOString() : null,
      // fechaUltimoEstado: values.fechaUltimoEstado ? moment(values.fechaUltimoEstado).toISOString() : null,
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
            <Select 
              placeholder="Selecciona un cliente"
              onChange={(clienteId) => {
                const cliente = clientes.find(c => c._id === clienteId);
                setClienteSeleccionado(cliente || null);

                // Si el cliente tiene direcciones o teléfonos, los seteamos como primeros valores por defecto
                if (cliente) {
                  form.setFieldsValue({
                    direccion: cliente.direcciones?.[0] || '',
                    telefonos: cliente.telefonos?.[0] || ''
                  });
                }
              }}
            >
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
            label="Técnicos"
            name="tecnicos"
            rules={[{ required: true, message: 'Selecciona al menos un técnico' }]}>
            <Select placeholder="Selecciona uno o más técnicos" mode="multiple">
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
  {/*    {clienteSeleccionado && (        */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label= "Direcciones del Cliente"  // "Dirección"
              name="direccion"
              // rules={[{ required: true, message: 'Ingresa una dirección' }]}
            >
              {/*<Input />*/}
              <Select // disabled 
                      placeholder="Dirección del cliente"
                      defaultValue={clienteSeleccionado?.direcciones?.[0]}
              >
                {clienteSeleccionado?.direcciones?.length > 0 ? (
                  clienteSeleccionado.direcciones.map((dir, i) => (
                    <Option key={i} value={dir}>{dir}</Option>
                  ))
                ) : (
                  <Option disabled value="no-dir">No hay direcciones</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Teléfonos del Cliente"
              name="telefonos"
              // rules={[{ required: true, message: 'Ingresa un teléfono' }]}
              >
              {/*<Input />*/}
              <Select // disabled 
                      placeholder="Teléfono del cliente"
                      defaultValue={clienteSeleccionado?.telefonos?.[0]}>
                {clienteSeleccionado?.telefonos?.length > 0 ? (
                  clienteSeleccionado.telefonos.map((tel, i) => (
                    <Option key={i} value={tel}>{tel}</Option>
                  ))
                ) : (
                  <Option disabled value="no-tel">No hay teléfonos</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>
  {/*    )}  */}
      {/* Tipos y Estado */}
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
{/* otra forma de uso si la api retorna en formato Key - Value
            <Select>
  {tipos.map(op => (
    <Option key={op.key} value={op.value}>
      {op.value}
    </Option>
  ))}
</Select>
*/}
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

{/*  // Esta parte del código es para la versión de seleccionar las fechas de comienzo y finalización del trabajo, así como el rango horario.
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
*/}
      {/* Botones */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingItem ? 'Guardar' : 'Guardar'}
            </Button>
          </Form.Item>
        </Col>
        <Col span={12}>
        {/*  {editingItem && ( */}
            <Form.Item>
              <Button
                onClick={() => {
                  form.resetFields();
                  if (onCancel) onCancel(); // Llama a la función del padre para cerrar el form
                }}
                style={{ marginLeft: 8 }}
              >
                Cancelar
              </Button>
            </Form.Item>
        {/*  )} */}
        </Col>
      </Row>
    </Form>
  );
};

export default WorkForm;
