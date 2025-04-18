// frontend/src/pages/Home.js

// Ejemplo para HomePage.js
// import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';

function HomePage() {

  // const [isSuperadminExists, setIsSuperadminExists] = useState(false);
  // const [loading, setLoading] = useState(true);

  /*
  // Simulamos la verificación de la existencia de un Superadmin
  useEffect(() => {
    const checkSuperadmin = async () => {
      try {
        // Realizar la solicitud GET al backend para verificar si existe un superadmin
        const response = await axios.get('http://localhost:5000/api/auth/checkSuperadmin');
        if (response.data.exists) {
          setIsSuperadminExists(true);  // Si existe un superadmin, ocultamos el enlace
        } else {
          setIsSuperadminExists(false);  // Si no existe, mostramos el enlace
        }
      } catch (error) {
        console.error('Error al verificar el superadmin:', error);
        setIsSuperadminExists(false);  // Si ocurre un error, podemos asumir que no hay superadmin
      } finally {
        setLoading(false);  // Termina la carga
      }
    };

    checkSuperadmin();
  }, []);
  */

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Bienvenidos a FG Cortinas</h1>
      <p style={styles.subHeader}>Encuentra las mejores cortinas para tu hogar.</p>

      <div style={styles.linkContainer}>
        <Link to="/register" style={styles.link}>
          Registrarse
        </Link>
        <span style={styles.separator}>|</span>
        <Link to="/login" style={styles.link}>
          Iniciar sesión
        </Link>

        {/* Condicional para mostrar el enlace de registrar Superadmin solo si no existe */}
        {/*
        {!isSuperadminExists && (
          <>
            <span style={styles.separator}>|</span>
            <Link to="/register?role=superadmin" style={styles.link}>
              Registrar Superadmin
            </Link>
          </>
        )}
          */}
{/*
      {loading && <p>Cargando...</p>} */}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: 'auto',
  },
  header: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  subHeader: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '20px',
  },
  linkContainer: {
    marginTop: '20px',
  },
  link: {
    fontSize: '18px',
    color: '#007BFF',
    textDecoration: 'none',
    margin: '0 10px',
    fontWeight: '500',
    transition: 'color 0.3s',
  },
  separator: {
    fontSize: '18px',
    color: '#888',
  },
};

export default HomePage;
