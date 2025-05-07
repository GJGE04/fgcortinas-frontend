import React from 'react';
import { Table, Typography, Divider } from 'antd';

const ResumenPanel = ({ products = [], totals = {}, newQuote }) => {
  const columns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Precio Unitario',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${(price ?? 0).toFixed(2)}`,
    },
    {
      title: 'Descuento (%)',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount) => `${discount ?? 0}%`,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (value, record) => {
        const symbol = record.currency === 'USD' ? 'USD' : 'UYU';
        return new Intl.NumberFormat('es-UY', {
          style: 'currency',
          currency: symbol,
        }).format(value ?? 0);
      },
    },
  ];

  const formatCurrency = (amount, currency) =>
    new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency,
    }).format(amount);


  return (
    <div>
      <Typography.Title level={5}>Resumen de Productos</Typography.Title>
      <Table
        dataSource={products}
        columns={columns}
        pagination={false}
        rowKey={(record, index) => record.id || record.name || index}
      />

      <Divider />

      <Typography.Text strong>Total USD: </Typography.Text>
      <Typography.Text>{formatCurrency(totals?.USD ?? 0, 'USD')}</Typography.Text>
      <br />
      <Typography.Text strong>Total UYU: </Typography.Text>
      <Typography.Text>{formatCurrency(totals?.UYU ?? 0, 'UYU')}</Typography.Text>

      <Divider />

      <p>
        <strong>Visita técnica:</strong>{" "}
        {newQuote.start
            ? `${new Date(newQuote.start).toLocaleString()} - ${new Date(newQuote.end).toLocaleTimeString()}`
            : "No seleccionada"}
      </p>

    </div>
  );
};

export default ResumenPanel;
