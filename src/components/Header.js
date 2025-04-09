// Header.js
/*
export default function Header() {
    return <header>Header</header>;
  }
  */

  import React from 'react';
  import { Link } from 'react-router-dom'; // Importa Link de React Router

  function Header() {
    return (
      <header>
        <h1>Cortinas Store</h1>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li> {/* Enlace a la página de inicio */}
            <li><Link to="/catalog">Catálogo</Link></li> {/* Enlace al catálogo de productos */}
            <li><Link to="/order">Realizar pedido</Link></li> {/* Enlace a la página de pedidos */}
            <li><Link to="/admin">Admin</Link></li> {/* Enlace al panel de administración */}
          </ul>
        </nav>
      </header>
    );
  }

  export default Header;