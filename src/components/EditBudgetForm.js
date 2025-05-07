// src/components/EditBudgetForm.jsx
import React from 'react';
import { Modal, Form, Input } from 'antd';

const EditBudgetForm = ({ visible, onCancel, onSubmit, editingBudget, form }) => {
  return (
    <Modal
      title="Editar presupuesto"
      visible={visible}
      onCancel={onCancel}
      onOk={onSubmit}
    >
      <Form form={form} layout="vertical" initialValues={editingBudget}>
        <Form.Item label="Nombre" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="Dirección" name="address">
          <Input />
        </Form.Item>
        {/* Más campos si es necesario */}
      </Form>
    </Modal>
  );
};

export default EditBudgetForm;

