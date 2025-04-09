// src/components/ProductTypeDelete.js o donde sea que manejes la eliminación
import React, { useState } from 'react';
import api from '../axios'; // Importa la configuración de Axios

const ProductTypeDelete = ({ productId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Obtén el token del localStorage o estado global
      const response = await api.delete(
        `/product-types/${productId}`, 
        { headers: { Authorization: `Bearer ${token}` } } // Incluye el token en los headers
      );
      alert('Tipo de producto eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar el tipo de producto:', err);
      setError('Error al eliminar el tipo de producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Eliminar Tipo de Producto</h2>
      {error && <p>{error}</p>}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Eliminando...' : 'Eliminar Tipo'}
      </button>
    </div>
  );
};

export default ProductTypeDelete;
