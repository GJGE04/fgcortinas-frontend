// components/MobileFooter.js
import React from 'react';

/*
const MobileFooter = () => (
  <div style={{ background: "#333", color: "white", textAlign: "center", padding: "10px" }}>
    <p style={{ fontSize: "12px" }}>© {new Date().getFullYear()} FG Cortinas</p>
    <p style={{ fontSize: "12px" }}>📞 091 433 855 | 📞 098 114 921</p>
  </div>
);


/*
 const MobileFooter = () => (
  <div style={{ background: "#333", color: "white", textAlign: "center", padding: "10px 5px" }}>
    <p style={{ fontSize: "12px", margin: 0 }}>© {new Date().getFullYear()} FG Cortinas</p>
    <p style={{ fontSize: "12px", margin: 0 }}>
      📞 <a href="tel:+59891433855" style={{ color: "white" }}>091 433 855</a> |
      <a href="tel:+598098114921" style={{ color: "white", marginLeft: "5px" }}>098 114 921</a>
    </p>
  </div>
);
*/

import { Layout } from 'antd'; // ← Faltaba esto

const { Footer } = Layout; // ← Esto es necesario para poder usar <Footer>

const MobileFooter = () => {
    return (
      <Footer style={{ textAlign: "center", background: "#333", color: "white", padding: "20px 10px" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", fontSize: "12px" }}>
  
          {/* Nombre y descripción */}
          <h3 style={{ color: "#D32F2F", fontSize: "14px" }}>FG Cortinas</h3>
          <p>Instalación, venta y reparación de cortinas a medida</p>
  
          {/* Teléfonos */}
        {/*}  <p style={{ marginBottom: 4 }}>📞 <a href="tel:+59891433855" style={{ color: "white" }}>091 433 855</a></p>
          <p style={{ marginBottom: 10 }}>📞 <a href="tel:+598098114921" style={{ color: "white" }}>098 114 921</a></p> */}
  
          {/* WhatsApp */}
          <p style={{ marginBottom: 4 }}>
            💬 <a href="https://wa.me/59891433855" style={{ color: "white" }}>WhatsApp 091 433 855</a>
          </p>
          <p style={{ marginBottom: 10 }}>
            💬 <a href="https://wa.me/598098114921" style={{ color: "white" }}>WhatsApp 098 114 921</a>
          </p>
  
          {/* Emails */}
          <p style={{ marginBottom: 4 }}>📧 <a href="mailto:oficinafgcortinas@gmail.com" style={{ color: "white" }}>oficinafgcortinas@gmail.com</a></p>
          <p style={{ marginBottom: 4 }}>📧 <a href="mailto:agendafgcortinas@gmail.com" style={{ color: "white" }}>agendafgcortinas@gmail.com</a></p>
          <p style={{ marginBottom: 10 }}>📧 <a href="mailto:contactofgcortinas@gmail.com" style={{ color: "white" }}>contactofgcortinas@gmail.com</a></p>
  
          {/* Sitio Web */}
          <p>
            🌐 <a href="https://fgcortinas.com.uy" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>fgcortinas.com.uy</a>
          </p>
  
          {/* Derechos */}
          <div style={{ marginTop: "10px", fontSize: "11px" }}>
            © {new Date().getFullYear()} FG Cortinas
          </div>
        </div>
      </Footer>
    );
  };  


export default MobileFooter;
