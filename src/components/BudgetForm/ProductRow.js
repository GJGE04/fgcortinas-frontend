// components/BudgetForm/ProductRow.jsx

import { Row, Col, Form, InputNumber, Select, Input, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const ProductRow = ({
  index,
  product,
  availableProducts,
  handleProductChange,
  handleProductDetailChange,
  removeProduct,
}) => {
  return (
    <Row gutter={16} style={{ minWidth: 800, marginBottom: 16 }}>
      {/* Producto */}
      <Col span={5}>
        <Form.Item label="Producto" required>
          <Select
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            value={product.productId}
            onChange={(value) => handleProductChange(index, 'productId', value)}
            options={availableProducts}
            placeholder="Seleccione un producto"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>

      {/* Cantidad */}
      <Col span={2}>
        <Form.Item label="Cantidad">
          <InputNumber
            value={product.quantity}
            onChange={(value) => handleProductDetailChange(index, 'quantity', value)}
            min={1}
            style={{ width: "100%" }}
            disabled={!(product.habilitado && product.habilitado.quantityC)}
          />
        </Form.Item>
      </Col>

      {/* Ancho */}
      <Col span={3}>
        <Form.Item label="Ancho (m)">
          <InputNumber
            value={product.width}
            onChange={(value) => handleProductDetailChange(index, 'width', value)}
            min={0}
            style={{ width: "100%" }}
            addonAfter="mts"
            disabled={!(product.habilitado && product.habilitado.widthC)}
          />
        </Form.Item>
      </Col>

      {/* Largo */}
      <Col span={3}>
        <Form.Item label="Largo (m)">
          <InputNumber
            value={product.length}
            onChange={(value) => handleProductDetailChange(index, 'length', value)}
            min={0}
            style={{ width: "100%" }}
            addonAfter="mts"
            disabled={!(product.habilitado && product.habilitado.lengthC)}
          />
        </Form.Item>
      </Col>

      {/* Precio */}
      <Col span={3}>
        <Form.Item label="Precio / m²">
          <InputNumber
            value={product.price}
            onChange={(value) => handleProductDetailChange(index, 'price', value)}
            min={0}
            style={{ width: "100%" }}
            addonAfter={product.currency === 'USD' ? 'USD' : 'UYU'}
            disabled={!(product.habilitado && product.habilitado.priceC)}
          />
        </Form.Item>
      </Col>

      {/* Descuento */}
      <Col span={3}>
        <Form.Item label="Desc. (%)">
          <InputNumber
            value={product.discount}
            onChange={(value) => handleProductDetailChange(index, 'discount', value)}
            min={0}
            max={100}
            style={{ width: "100%" }}
            addonAfter="%"
            disabled={!(product.habilitado && product.habilitado.discountC)}
          />
        </Form.Item>
      </Col>

      {/* Subtotal */}
      <Col span={4}>
        <Form.Item label="Subtotal">
          <Input
            value={product.subtotal}
            disabled
            style={{ width: '100%' }}
            addonAfter={product.currency === 'USD' ? 'USD' : 'UYU'}
          />
        </Form.Item>
      </Col>

      {/* Botón Eliminar */}
      <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => removeProduct(index)}
          shape="circle"
          style={{ marginTop: 24 }}
        />
      </Col>
    </Row>
  );
};

export default ProductRow;