import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, Select, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { getProductTypes } from "../api/productApi";

const { Option } = Select;

const ProductForm = ({ product, onSave }) => {
  const [form] = useForm();
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    // Cargar los tipos de productos al cargar el componente
    const fetchProductTypes = async () => {
      try {
        const types = await getProductTypes(); // Obtener los tipos de productos
        setProductTypes(types); // Guardar los tipos de productos en el estado
      } catch (error) {
        console.error('Error al obtener tipos de productos', error);
      }
    };

    fetchProductTypes();

    if (product) {
      console.log("Producto cargado en el formulario:", product); // Verifica qué contiene el producto
      form.setFieldsValue({
        name: product.name,
        code: product.code,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        currency: product.currency,
        productType: product.productType ? product.productType._id : undefined,
        isActive: product.isActive,
      });
    } else {
      form.resetFields();  // Si no hay producto (modo crear), resetea los campos
    }
  }, [product, form]);

  const handleSave = async () => {
    try {
      // Obtenemos los valores del formulario
      const updatedProduct = form.getFieldsValue();
      console.log("Producto actualizado:", updatedProduct); // Verificar los valores del formulario
  
      // Asegúrate de que el _id esté presente
      if (product && product._id) {
        updatedProduct._id = product._id; // Añadir el _id al objeto actualizado
      } else {
        console.log("Creando un nuevo producto, no se necesita _id");
      }

      console.log("Enviando el producto actualizado:", updatedProduct);  // Verifica los datos antes de enviarlos
  
      // Llamar a onSave para actualizar el producto
      await onSave(updatedProduct);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="Nombre" name="name" rules={[{ required: true, message: "Por favor ingrese el nombre del producto" }]}>
        <Input />
      </Form.Item>
      
      <Form.Item label="Código" name="code" rules={[{ required: true, message: "Por favor ingrese el código del producto" }]}>
        <Input />
      </Form.Item>
      
      <Form.Item label="Precio" name="price" rules={[{ required: true, message: "Por favor ingrese el precio" }]}>
        <InputNumber min={0} />
      </Form.Item>
      
      <Form.Item label="Precio Costo" name="costPrice" rules={[{ required: true, message: "Por favor ingrese el precio de costo" }]}>
        <InputNumber min={0} />
      </Form.Item>
      
      <Form.Item label="Stock" name="stock" rules={[{ required: true, message: "Por favor ingrese el stock" }]}>
        <InputNumber min={0} />
      </Form.Item>
      
      <Form.Item label="Moneda" name="currency" rules={[{ required: true, message: "Por favor seleccione la moneda" }]}>
        <Select>
          <Option value="USD">USD</Option>
          <Option value="UYU">UYU</Option>
        </Select>
      </Form.Item>
      
      <Form.Item label="Tipo de Producto" name="productType" rules={[{ required: true, message: "Por favor seleccione el tipo de producto" }]}>
        <Select>
          {productTypes.map((type) => (
            <Option key={type._id} value={type._id}>
              {type.title}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item label="Activo" name="isActive" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
