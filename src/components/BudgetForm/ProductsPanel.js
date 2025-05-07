// Panel de productos (ProductsPanel) y sus filas (ProductRow)

// components/BudgetForm/ProductsPanel.jsx

import { Button, Row, Col, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProductRow from './ProductRow';

const ProductsPanel = ({
  products,
  availableProducts,
  handleProductChange,
  handleProductDetailChange,
  removeProduct,
  addProduct,
  totals,
}) => {
  return (
    <>
      <h3>Seleccionar Producto</h3>

      {products.map((product, index) => (
        <div style={{ overflowX: 'auto' }} key={index}>
          <ProductRow
            index={index}
            product={product}
            availableProducts={availableProducts}
            handleProductChange={handleProductChange}
            handleProductDetailChange={handleProductDetailChange}
            removeProduct={removeProduct}
          />
        </div>
      ))}

      <Row justify="end" style={{ marginTop: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addProduct}
          style={{
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            fontWeight: 'bold',
          }}
        >
          Agregar Producto
        </Button>
      </Row>

      <Row gutter={16} style={{ marginTop: 10 }}>
        <Col span={6}>
          <label><strong>Total (USD)</strong></label>
          <Input
            value={totals.USD.toFixed(2)}
            disabled
            addonBefore="$"
            style={{
              width: '100%',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              borderColor: '#4CAF50',
            }}
          />
        </Col>

        <Col span={6}>
          <label><strong>Total (UYU)</strong></label>
          <Input
            value={totals.UYU.toFixed(2)}
            disabled
            addonBefore="$U"
            style={{
              width: '100%',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              borderColor: '#2196F3',
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default ProductsPanel;
