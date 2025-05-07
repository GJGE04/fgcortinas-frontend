// src/hooks/useEditBudget.js
import { useState } from 'react';
import { message, Form } from 'antd';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');

export const useEditBudget = (onUpdateSuccess) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form] = Form.useForm();

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    form.setFieldsValue(budget);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingBudget(null);
    form.resetFields();
  };

  const submitEditForm = async () => {
    try {
      const values = await form.validateFields();

      await axios.patch(`${API_URL}/budget/${editingBudget._id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success('Presupuesto actualizado correctamente');
      closeModal();
      onUpdateSuccess();
    } catch (error) {
      console.error('Error actualizando presupuesto:', error);
      message.error('Error al actualizar el presupuesto');
    }
  };

  return {
    isModalVisible,
    editingBudget,
    form,
    openEditModal,
    closeModal,
    submitEditForm,
  };
};
