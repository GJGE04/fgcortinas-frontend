import React, { useState, useEffect } from 'react';
// import { Modal, Form, Input, Button, Switch, InputNumber } from 'antd';
import { Modal, Form, Input, Button, Switch, Space, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const ClientForm = ({ visible, onCancel, onCreate, editingItem }) => {
  const [form] = Form.useForm();
  const [direcciones, setDirecciones] = useState([]);
  const [telefonos, setTelefonos] = useState([]);
  const [correos, setCorreos] = useState([]);

  // Llenar el formulario con los datos del cliente cuando se edita
  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue({
        nombre: editingItem.nombre,
        apellidos: editingItem.apellidos,
        //direcciones: editingItem.direcciones || [],
        //telefonos: editingItem.telefonos || [],
        //correos: editingItem.correos || [],
        activo: editingItem.activo,
      });

      // Inicializamos los arrays de direcciones, teléfonos y correos
      setDirecciones(editingItem.direcciones || []);
      setTelefonos(editingItem.telefonos || []);
      setCorreos(editingItem.correos || []);
    }
  }, // [editingItem, form]);
  [editingItem, form, visible]);

  const handleAddDireccion = () => {
    setDirecciones([...direcciones, '']);
  };

  const handleRemoveDireccion = (index) => {
    const newDirecciones = direcciones.filter((_, i) => i !== index);
    setDirecciones(newDirecciones);
  };

  const handleDireccionChange = (e, index) => {
    const newDirecciones = [...direcciones];
    newDirecciones[index] = e.target.value;
    setDirecciones(newDirecciones);
  };

  const handleAddTelefono = () => {
    setTelefonos([...telefonos, '']);
  };

  const handleRemoveTelefono = (index) => {
    const newTelefonos = telefonos.filter((_, i) => i !== index);
    setTelefonos(newTelefonos);
  };

  const handleTelefonoChange = (e, index) => {
    const newTelefonos = [...telefonos];
    newTelefonos[index] = e.target.value;
    setTelefonos(newTelefonos);
  };

  const handleAddCorreo = () => {
    setCorreos([...correos, '']);
  };

  const handleRemoveCorreo = (index) => {
    const newCorreos = correos.filter((_, i) => i !== index);
    setCorreos(newCorreos);
  };

  const handleCorreoChange = (e, index) => {
    const newCorreos = [...correos];
    newCorreos[index] = e.target.value;
    setCorreos(newCorreos);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const clientData = {
        ...values,
        direcciones,
        telefonos,
        correos,
      };
      onCreate(clientData);  // Asegúrate de que 'activo' está incluido en los valores
    }).catch((info) => {
      message.error('Por favor completa todos los campos');
    });
  };  

  return (
    <Modal
      title={editingItem ? 'Editar Cliente' : 'Agregar Cliente'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        name="clientForm"
        initialValues={{
          nombre: '',
          apellidos: '',
          activo: true,
        }}
      >
        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="apellidos"
          label="Apellidos"
          rules={[{ required: true, message: 'Por favor ingresa los apellidos' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
            name="activo"
            label="Activo"
            valuePropName="checked"  // Asegura que el valor del Switch se mapea correctamente
            initialValue={editingItem ? editingItem.activo : true}  // Si estamos editando, el valor inicial debe ser el de editingItem
        >
            <Switch />
        </Form.Item>


        {/* Direcciones */}
        <Form.Item label="Direcciones">
          {direcciones.map((direccion, index) => (
            <Space key={index} style={{ marginBottom: 8 }} align="baseline">
              <Input
                value={direccion}
                onChange={(e) => handleDireccionChange(e, index)}
                placeholder="Dirección"
                style={{ width: '80%' }}
              />
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveDireccion(index)}
              />
            </Space>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddDireccion}>
            Agregar Dirección
          </Button>
        </Form.Item>

        {/* Teléfonos */}
        <Form.Item label="Teléfonos">
          {telefonos.map((telefono, index) => (
            <Space key={index} style={{ marginBottom: 8 }} align="baseline">
              <Input
                value={telefono}
                onChange={(e) => handleTelefonoChange(e, index)}
                placeholder="Teléfono"
                style={{ width: '80%' }}
              />
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveTelefono(index)}
              />
            </Space>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddTelefono}>
            Agregar Teléfono
          </Button>
        </Form.Item>

        {/* Correos */}
        <Form.Item label="Correos Electrónicos">
          {correos.map((correo, index) => (
            <Space key={index} style={{ marginBottom: 8 }} align="baseline">
              <Input
                value={correo}
                onChange={(e) => handleCorreoChange(e, index)}
                placeholder="Correo electrónico"
                style={{ width: '80%' }}
              />
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveCorreo(index)}
              />
            </Space>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddCorreo}>
            Agregar Correo
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClientForm;
