import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, deleteProduct } from '../api/productApi';
import { useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (error) {
        console.error('Error al obtener el producto:', error);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    try {
      await deleteProduct(productId);
      alert('Producto eliminado');
      navigate('/products');
    } catch (error) {
      alert('Error al eliminar el producto');
    }
  };

  if (!product) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Detalles del Producto</h1>
      <p>Nombre: {product.name}</p>
      <p>Código: {product.code}</p>
      <p>Precio: {product.price}</p>
      {/* Más detalles aquí */}
      <button onClick={handleDelete}>Eliminar Producto</button>
    </div>
  );
};

export default ProductDetailPage;