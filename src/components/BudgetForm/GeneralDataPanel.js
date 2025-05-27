// components/GeneralDataPanel.jsx

import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input, Select } from 'antd';   // , Button
import { useWatch } from 'antd/es/form/Form';

const GeneralDataPanel = ({
  form,
  client,
  technicians,
  loadingProducts,
  //newQuote,
  //setNewQuote
}) => {
  const [addressOptions, setAddressOptions] = useState([]);
  const [emailOptions, setEmailOptions] = useState([]);
  const [phoneOptions, setPhoneOptions] = useState([]);
  const selectedTechnicians = useWatch('technicianIds', form);

  // Sincronizar datos del cliente al formulario cuando cambie
  useEffect(() => {
    if (client?.id) {
      console.log("🧩 Cliente recibido en GeneralDataPanel:", client);
      const nombreCliente = client.name || '';
      const direcciones = Array.isArray(client.direccion)
        ? client.direccion
        : client.direccion
        ? [client.direccion]
        : [];
      const emails = Array.isArray(client.email)
        ? client.email
        : client.email
        ? [client.email]
        : [];
      // const telefonos = client.phones?.join(', ') || '';
      const telefonos = Array.isArray(client.phones)
        ? client.phones
        : client.phones
        ? [client.phones]
        : [];
      // Establecer valores del formulario
      form.setFieldsValue({
        clientId: client.id,
        clientName: nombreCliente,
        name: `Presupuesto - ${nombreCliente}`,
        address: direcciones[0] || '',
        email: emails[0] || '',
        // phones: telefonos
        phones: telefonos || [],
      });
      setAddressOptions(direcciones);
      setEmailOptions(emails);
      setPhoneOptions(telefonos);
    }
  }, [client, form]); 
/*
  useEffect(() => {
    if (client?.id) {
      form.setFieldsValue(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
      }));
    }
  }, [client, form]); 
  */

  useEffect(() => {
    if (selectedTechnicians?.length > 0 && technicians?.length > 0) {
      const techNames = selectedTechnicians
        .map(id => technicians.find(t => t.value === id)?.label)
        .filter(Boolean)
        .join(' y ');
  
      // const autoDescription = `Trabajo técnico a realizar por ${techNames}. Las tareas se definirán en coordinación con el cliente. Para consultas, contactar con el personal asignado.`;
      const autoDescription = `Trabajo a realizar según lo acordado con el cliente. Será realizado por ${techNames} e incluye materiales y mano de obra básica. Para cualquier consulta, no dude en comunicarse con nuestro equipo técnico.`;
      
      form.setFieldsValue({
        description: autoDescription,
      });
    } else {
      // Si no hay técnicos seleccionados, limpiar descripción
      form.setFieldsValue({
        description: `Opcional — se completará como 'Sin descripción' si se deja vacío, y automáticamente si se seleccionan técnicos`,
      });
    }
  }, [selectedTechnicians, technicians, form]);  
  

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item 
            label="Presupuesto" 
            name="name" 
            rules={[
              { required: true, message: 'Por favor ingresa el nombre del presupuesto' },
              { max: 100, message: 'El nombre del presupuesto no puede exceder los 100 caracteres' }
            ]}
            tooltip="Este es el nombre del presupuesto que se mostrará en el sistema"
          >
            <Input placeholder="Nombre del presupuesto" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item 
            label="Técnicos" 
            name="technicianIds" 
            rules={[{ required: true, message: 'Selecciona al menos un técnico' }]}
          >
            <Select
              mode="multiple"
              showSearch
              allowClear
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={technicians}
              loading={loadingProducts}
              placeholder="Técnicos del trabajo seleccionado"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          {/* Campo oculto que se enviará en el submit */}
          <Form.Item name="clientId" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Campo visible para mostrar el nombre del cliente */}
          <Form.Item
            label="Cliente"
            name="clientName"
            // initialValue={client?.name}
          >
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Dirección" name="address">
            {/*<Input placeholder="Dirección" allowClear />*/}
            <Select 
              placeholder="Seleccioná una dirección"
              onChange={value => form.setFieldsValue({ address: value })}
              disabled={addressOptions.length === 0}
            >
              {addressOptions.map((addr, index) => (
                <Select.Option key={index} value={addr}>
                  {addr}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>  
        {/* 
        <Col xs={24} sm={12} md={8}>
          <input
            type="datetime-local"
            className="border rounded px-3 py-2"
            placeholder="Fecha y Hora de Visita Técnica"
            value={newQuote.visitDate}
            onChange={(e) => setNewQuote(prev => ({ ...prev, visitDate: e.target.value }))}
          />
        </Col>  */}

        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Email" name="email"
          /*  rules={[
              {
                type: 'email',
                message: 'Por favor ingresa un correo válido',
              },
            ]} */
            tooltip="Correo del cliente para enviar el presupuesto"
          >
          {/*  <Input placeholder="cliente@correo.com" allowClear /> */}
          <Select 
            // disabled={false}
            placeholder="Seleccioná un email"
            onChange={value => form.setFieldsValue({ email: value })}
            disabled={emailOptions.length === 0}
          >
            {emailOptions.map((email, index) => (
              <Select.Option key={index} value={email}>
                {email}
              </Select.Option>
            ))}
          </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item 
            label="Teléfono(s)" 
            name="phones"
            tooltip="Podés seleccionar uno o varios números" // "Podés agregar más de un número separados por coma"
          >
          {/*  <Input placeholder="099000000, 24000000" allowClear disabled /> */}
          <Select
              // mode="multiple"
              placeholder="Seleccioná teléfonos"
              onChange={(value) => form.setFieldsValue({ phones: value })}
              disabled={phoneOptions.length === 0}
            >
              {phoneOptions.map((tel, index) => (
                <Select.Option key={index} value={tel}>
                  {tel}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={20}>
          <Form.Item label="Descripción" name="description"
            // initialValue="Trabajo a realizar según lo acordado con el cliente. Los detalles específicos serán definidos en el transcurso del proyecto. Para cualquier consulta, no dude en comunicarse con nuestro equipo técnico."
            // initialValue="Trabajo a realizar según lo acordado con el cliente. Incluye materiales y mano de obra básica. Para cualquier consulta, no dude en comunicarse con nuestro equipo técnico."
          > 
              <Input.TextArea 
                placeholder="Opcional — se completará como 'Sin descripción' si se deja vacío, y automáticamente si se seleccionan técnicos" 
                autoSize={{ minRows: 3, maxRows: 6 }}
                //onChange={(e) => console.log("✍️ descripción cambiada:", e.target.value)}
                //allowClear 
              />     
               {/* placeholder="Descripción" */}
          </Form.Item>
        </Col>
      </Row>

      {/*<Button onClick={() => console.log(form.getFieldsValue())}>Ver estado</Button>*/}
    </>
  );
};

export default GeneralDataPanel;