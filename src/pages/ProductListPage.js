import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/productApi';
import { Link } from 'react-router-dom';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Lista de Productos</h1>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductListPage;
