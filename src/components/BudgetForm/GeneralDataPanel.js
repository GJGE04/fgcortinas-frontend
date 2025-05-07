// components/GeneralDataPanel.jsx

import React from 'react';
import { Row, Col, Form, Input, Select } from 'antd';

const GeneralDataPanel = ({
  form,
  technicians,
  loadingProducts,
  newQuote,
  setNewQuote
}) => {
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
            <Input placeholder="Nombre del presupuesto" />
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
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
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
          <Form.Item label="Dirección" name="address">
            <Input placeholder="Dirección" />
          </Form.Item>
        </Col>

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
            <Input placeholder="cliente@correo.com" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <input
            type="datetime-local"
            className="border rounded px-3 py-2"
            placeholder="Fecha y Hora de Visita Técnica"
            value={newQuote.visitDate}
            onChange={(e) => setNewQuote(prev => ({ ...prev, visitDate: e.target.value }))}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={20}>
          <Form.Item label="Descripción" name="description">
            <Input.TextArea placeholder="Descripción" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default GeneralDataPanel;