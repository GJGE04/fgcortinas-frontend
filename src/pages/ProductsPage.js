// Usando Mocks
import React, { useState } from "react";
import { Table, Switch, Button, Modal, InputNumber, Popconfirm, Form, Input, Select, Upload} from "antd";
import { DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import mockProducts from "../mock/mockProducts";
import mockProductTypes from "../mock/mockProductTypes"; // Mock de tipos de productos

const { Option } = Select;

  const ProductsPage = () => {
    const [products, setProducts] = useState(mockProducts);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

  // Cambiar el estado "Activo" de un producto
  const toggleActive = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, active: !product.active } : product
      )
    );
  };

  // Eliminar producto con confirmación
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  // Mostrar el modal y cargar los datos del producto seleccionado
  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({ ...product, image: product.image }); // Cargar valores del producto en el formulario, incluida la imagen
    setIsModalVisible(true);
  };
  

  // Guardar cambios en el producto editado
  const handleSave = () => {
    form.validateFields().then((values) => {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProduct.id ? { ...product, ...values, image: editingProduct.image } : product
        )
      );
      setIsModalVisible(false);
      setEditingProduct(null);
    });
  };

  // Formatear moneda en la tabla
  const formatCurrency = (value, currency) => {
    return currency === "USD" ? `$${value}` : `$U${value}`;
  };

  // Manejar el cambio de imagen
  /*
  const handleImageChange = (info) => {
    if (info.file.status === "done" || info.file.originFileObj) {
      const newImageUrl = URL.createObjectURL(info.file.originFileObj);
      form.setFieldsValue({ image: newImageUrl });
    }
  };
  */

  const handleImageChange = (info) => {
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;
      const newImageUrl = URL.createObjectURL(file);
  
      // Actualizar el estado del producto en edición
      setEditingProduct((prev) => {
        const updatedProduct = { ...prev, image: newImageUrl };  // Actualizamos la imagen
        form.setFieldsValue({ ...updatedProduct, image: newImageUrl }); // Asegurarnos de que el formulario también se actualice
        return updatedProduct;
      });
    }
  };
  
  

  const columns = [
    {
      title: "Imagen",
      dataIndex: "image",
      key: "image",
      // render: (image) => <img src={image} alt="Producto" style={{ width: 50 }} />,
      render: (image) => image ? <img src={image} alt="Producto" style={{ width: 50 }} /> : "Sin imagen",
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
      // render: (price) => `$${price}`,
      render: (_, record) => formatCurrency(record.price, record.currency),
    },
    {
      title: "Precio Costo",
      dataIndex: "costPrice",
      key: "costPrice",
      // render: (costPrice) => `$${costPrice}`,
      render: (_, record) => formatCurrency(record.costPrice, record.currency),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Moneda",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Tipo de Producto",
      dataIndex: "productType",
      key: "productType",
    },
    {
      title: "Activo",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <Switch checked={active} onChange={() => toggleActive(record.id)} />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="primary" icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="¿Estás seguro de eliminar este producto?"
            onConfirm={() => deleteProduct(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="danger" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Productos</h2>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal para editar productos */}
      <Modal
        title="Editar Producto"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productType" label="Tipo de Producto" rules={[{ required: true, message: "El tipo de producto es obligatorio" }]}>
            <Select>
              {mockProductTypes.map((type) => (
                <Option key={type.id} value={type.name}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "El nombre es obligatorio" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Código" rules={[{ required: true, message: "El código es obligatorio" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Precio" rules={[{ required: true, message: "El precio es obligatorio" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="costPrice" label="Precio Costo" rules={[{ required: true, message: "El precio costo es obligatorio" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="currency" label="Moneda" rules={[{ required: true, message: "La moneda es obligatoria" }]}>
            <Select>
              <Option value="USD">USD</Option>
              <Option value="UYU">UYU</Option>
            </Select>
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true, message: "El stock es obligatorio" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="active" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="image" label="Imagen">
            <Upload beforeUpload={() => false} onChange={handleImageChange} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Subir Imagen</Button>
            </Upload>
            {editingProduct?.image && (
              <img src={editingProduct.image} alt="Producto" style={{ width: 100, marginTop: 10 }} />
            )}
          </Form.Item>


        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
