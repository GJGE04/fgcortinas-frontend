// src/pages/DashboardPage.js
import React from 'react';
import { Carousel } from "antd";
import promocion1 from "../assets/01_FGCortinas.jpeg"; // Asegúrate de tener la imagen en esa ruta
import promocion2 from "../assets/02_FGCortinas.jpeg";
import promocion3 from "../assets/03_FGCortinas.jpeg";

const DashboardPage = () => {

    const promotions = [
        { image: promocion1 },
        { image: promocion2 },
        { image: promocion3 },
      ];
      
  return (
    <div className="dashboard-page">
      <h2>Bienvenido al Dashboard</h2>
      <p>¡Esta es la página principal a la que accedes después de iniciar sesión!</p>
      <Carousel autoplay
        autoplaySpeed={5000} // Tiempo en milisegundos entre cada imagen (5 segundos) 
      >
        {promotions.map((promo, index) => (
          <div key={index}>
            <div
              style={{
                background: `url(${promo.image}) no-repeat center center`,
                backgroundSize: "contain", // Asegura que la imagen se ajuste sin perder proporciones
                backgroundPosition: "center", // Centra la imagen en el contenedor
                height: "300px", // Ajusta la altura
                borderRadius: "10px", // Bordes redondeados si lo deseas
                width: "100%", // El ancho ocupará todo el espacio disponible
                display: "flex", // Usa flexbox para centrar las imágenes
                justifyContent: "center", // Centra las imágenes horizontalmente
                alignItems: "center", // Centra las imágenes verticalmente
                // backgroundColor: "#000", // Añade un color de fondo si la imagen no cubre completamente el espacio
              }}
            ></div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default DashboardPage;