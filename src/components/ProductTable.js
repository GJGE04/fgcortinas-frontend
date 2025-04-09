import React from "react";
import { Table, Button, Popconfirm, Switch } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ProductTable = ({ products, onEdit, onDelete, onToggleActiveStatus }) => {

  const handleEdit = (product) => {
    onEdit(product); // Llamar la función de editar pasada como prop
  };

  const handleDelete = (productId) => {
    onDelete(productId);  // Llamar la función de eliminar pasada como prop
  };

  // Formatear moneda en la tabla
  const formatCurrency = (value, currency) => {
    return currency === "USD" ? `$U${value}` : `$${value}`;
  };

  const columns = [
    {
      title: "Imagen",
      dataIndex: "image",
      render: (image) => <img src={image} alt="Producto" style={{ width: 50 }} />,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (_, record) => formatCurrency(record.price, record.currency),
    },
    {
      title: "Precio Costo",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (_, record) => formatCurrency(record.costPrice, record.currency),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Activo",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch checked={isActive} onChange={() => onToggleActiveStatus(record._id, isActive)} /> // Pasa el ID y el estado actual
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este producto?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="danger" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return <Table columns={columns} dataSource={products} rowKey="id" />;
};

export default ProductTable;
