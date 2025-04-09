// ProductCard.js           -   Este componente ProductCard recibirá un producto como prop y mostrará su nombre, descripción e imagen.
import React from 'react';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <button>Ver más</button>
    </div>
  );
}

export default ProductCard;
