// src/components/ProductTypeEdit.js o donde sea que quieras manejar la edición
import React, { useState, useEffect } from 'react';
import api from '../axios'; // Importa la configuración de Axios

const ProductTypeEdit = ({ productId }) => {
  const [productType, setProductType] = useState({
    title: '',
    format: '',
    isActive: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener los detalles del tipo de producto (GET)
    const fetchProductType = async () => {
      try {
        const response = await api.get(`/product-types/${productId}`);
        setProductType(response.data);
      } catch (err) {
        console.error('Error al obtener el tipo de producto:', err);
        setError('No se pudo obtener el tipo de producto.');
      }
    };
    
    fetchProductType();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // Obtén el token del localStorage o del estado global
      const response = await api.put(
        `/product-types/${productId}`, 
        productType,
        { headers: { Authorization: `Bearer ${token}` } } // Incluye el token en los headers
      );
      alert('Tipo de producto actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar el tipo de producto:', err);
      setError('Error al actualizar el tipo de producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductType({
      ...productType,
      [name]: value,
    });
  };

  return (
    <div>
      <h2>Editar Tipo de ProductoW</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Título:
          <input 
            type="text" 
            name="title" 
            value={productType.title} 
            onChange={handleChange} 
          />
        </label>
        <label>
          Formato:
          <input 
            type="text" 
            name="format" 
            value={productType.format} 
            onChange={handleChange} 
          />
        </label>
        <label>
          Activo:
          <input 
            type="checkbox" 
            name="isActive" 
            checked={productType.isActive} 
            onChange={(e) => setProductType({
              ...productType,
              isActive: e.target.checked,
            })}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Tipo'}
        </button>
      </form>
    </div>
  );
};

export default ProductTypeEdit;
