import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const showConfirmationModalAntd = ({ title = 'Confirmar acción', content = '¿Estás seguro?', onOk }) => {
  confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: 'Sí',
    cancelText: 'No',
    onOk,
  });
};

export default showConfirmationModalAntd;