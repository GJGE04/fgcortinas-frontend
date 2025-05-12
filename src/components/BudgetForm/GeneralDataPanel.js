// components/GeneralDataPanel.jsx

import React, { useEffect } from 'react';
import { Row, Col, Form, Input, Select, Button } from 'antd';

const GeneralDataPanel = ({
  form,
  client,
  technicians,
  loadingProducts,
  //newQuote,
  //setNewQuote
}) => {

  // Sincronizar datos del cliente al formulario cuando cambie
  useEffect(() => {
    if (client?.id) {
      form.setFieldsValue({
        clientId: client.id,
        clientName: client.name
      });
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

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item 
            label="Nombre" 
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
            label="Técnico" 
            name="technicianId" 
            rules={[{ required: true, message: 'Selecciona un técnico' }]}
          >
            <Select
              showSearch
              allowClear
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={technicians}
              loading={loadingProducts}
              placeholder="Selecciona un técnico"
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
            <Input placeholder="Dirección" allowClear />
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
          <Form.Item 
            label="Email" 
            name="email"
            rules={[
              {
                type: 'email',
                message: 'Por favor ingresa un correo válido',
              },
            ]}
            tooltip="Correo del cliente para enviar el presupuesto"
          >
            <Input placeholder="cliente@correo.com" allowClear />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={20}>
          <Form.Item label="Descripción" name="description"> 
              <Input.TextArea 
                placeholder="Opcional — se completará como 'Sin descripción' si se deja vacío" 
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