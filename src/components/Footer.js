/*
export default function Footer() {
    return <footer>Footer</footer>;
  }
  */

import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: "center", background: "#333", color: "white", padding: "10px 0px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        
        {/* Información de la empresa */}
        <div style={{ flex: "1", padding: "0 10px", minWidth: "200px" }}>
          <h3 style={{ color: "#D32F2F", fontSize: "16px" }}>FG Cortinas</h3>
          <p style={{ fontSize: "12px" }}>Instalación, venta y reparación de cortinas a medida</p>
          <p style={{ fontSize: "12px" }}>Teléfonos:</p> 
          <p style={{ fontSize: "12px" }}></p>
          <p>
            <a href="tel:+59891433855" style={{ color: "white", textDecoration: "none" }}>📞 091 433 855</a> |  
            <a href="tel:+59808114921" style={{ color: "white", textDecoration: "none", marginLeft: "10px" }}>📞 098 114 921</a>
          </p>
          <p style={{ fontSize: "12px" }}>Emails:</p>
          <p style={{ fontSize: "12px" }}>
            <a href="mailto:oficinafgcortinas@gmail.com" style={{ color: "white", textDecoration: "none" }}>📧 oficinafgcortinas@gmail.com</a><br />
            <a href="mailto:agendafgcortinas@gmail.com" style={{ color: "white", textDecoration: "none" }}>📧 agendafgcortinas@gmail.com</a><br />
            <a href="mailto:contactofgcortinas@gmail.com" style={{ color: "white", textDecoration: "none" }}>📧 contactofgcortinas@gmail.com</a>
          </p>
           
          <p style={{ fontSize: "12px" }}>Sitio Web: <a href="https://fgcortinas.com.uy" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>fgcortinas.com.uy</a></p>
        </div>

        {/* Enlaces de navegación */}
        <div style={{ flex: "1", padding: "0 10px", minWidth: "200px" }}>
          <h3 style={{ color: "#D32F2F", fontSize: "16px" }}>Navegación</h3>
          <p style={{ fontSize: "12px" }}><a href="/" style={{ color: "white", textDecoration: "none" }}>Inicio</a></p>
          <p style={{ fontSize: "12px" }}><a href="/catalog" style={{ color: "white", textDecoration: "none" }}>Catálogo</a></p>
          <p style={{ fontSize: "12px" }}><a href="/order" style={{ color: "white", textDecoration: "none" }}>Pedidos</a></p>
          <p style={{ fontSize: "12px" }}><a href="/admin" style={{ color: "white", textDecoration: "none" }}>Administración</a></p>
        </div>

        {/* Redes Sociales */}
        <div style={{ flex: "1", padding: "0 10px", minWidth: "200px" }}>
          <h3 style={{ color: "#D32F2F", fontSize: "16px" }}>Síguenos</h3>
          <p style={{ fontSize: "12px" }}><a href="https://www.facebook.com/CortinasFG" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>📘 Facebook: CortinasFG</a></p>
          <p style={{ fontSize: "12px" }}><a href="https://www.instagram.com/fgcortinas6" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>📸 Instagram: @fgcortinas6</a></p>
          <p style={{ fontSize: "12px" }}><a href="https://www.tiktok.com/@fgcortinas3" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>🎵 TikTok: @fgcortinas3</a></p>
          <p style={{ fontSize: "12px" }}><a href="https://wa.me/59891433855" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>💬 WhatsApp: 091 433 855</a></p>
          <p style={{ fontSize: "12px" }}><a href="https://wa.me/598098114921" target="_blank" rel="noopener noreferrer" style={{ color: "white", textDecoration: "none" }}>💬 WhatsApp: 098 114 921</a></p>
        </div>

      </div>

      <div style={{ marginTop: "10px", fontSize: "12px" }}>
        © {new Date().getFullYear()} FG Cortinas - Todos los derechos reservados.
      </div>
    </Footer>
  );
};

export default AppFooter;
