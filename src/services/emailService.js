import axios from 'axios';
import { jsPDF } from "jspdf";
import { message } from "antd";
import emailjs from 'emailjs-com';

const your_service_id = 'service_cy07ihd';
const your_template_id = 'template_7y6zdwl';
const your_user_id = 'G10RHxIwl7yP1iew5';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

// Función para enviar el correo con el archivo adjunto. // Enviar email desde el frontend
export const sendEmailWithPDF = (pdfData, budgetData) => {
    // Crear un formulario HTML "virtual"
    const emailForm = document.createElement('form');

    try{
        const formData = new FormData();
    
        // Añadimos el archivo PDF generado al FormData
        formData.append('file', pdfData, `${budgetData.name}.pdf`);   

        // Convertir el Blob en un archivo para adjuntar
        const file = new File([pdfData], `${budgetData.name}.pdf`, { type: 'application/pdf' });
        formData.append('file', file);

        // Añadir los datos del presupuesto (esto dependerá de tu plantilla en EmailJS)
        formData.append('clientName', budgetData.client);         // Ejemplo de campo para el nombre del cliente
        formData.append('budgetName', budgetData.name);            // Nombre del presupuesto
        formData.append('technician', budgetData.technician);      // Técnico asignado
        formData.append('description', budgetData.description);    // Descripción del presupuesto
        formData.append('totalUYU', budgetData.totalUYU);          // Total en UYU
        formData.append('totalUSD', budgetData.totalUSD);          // Total en USD

        // Crear campos en el formulario HTML para cada dato
        for (let [key, value] of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            emailForm.appendChild(input);   // Añadir los datos del FormData como un formulario HTML
        }
      
        // Usando emailjs para enviar el correo
        emailjs.sendForm(your_service_id, your_template_id, emailForm, your_user_id)
            .then((response) => {
            console.log('Email enviado con éxito:', response);
            }, (error) => {
            console.error('Error al enviar el correo:', error);
            });      
        } catch (error) {
            // Manejo de errores en caso de fallo en el envío del email
            console.error('Error al enviar el email', error);
            message.error('Error al enviar el email');
        }    
};

  // Enviar email desde el backend
export const sendBudgetEmail2 = async (budgetData, email) => {
    const doc = new jsPDF();
    doc.text("Presupuesto de Cortinas", 10, 10);
    doc.text(`Cliente: ${budgetData.cliente}`, 10, 20);
    doc.text(`Total: $${budgetData.total}`, 10, 30);

    const pdfBlob = doc.output("blob"); // o "bloburi" si querés verlo en navegador

    const formData = new FormData();
    formData.append("pdf", pdfBlob, "presupuesto.pdf");
    formData.append("to", email);
    formData.append("cliente", budgetData.cliente);

    try {
      const response = await axios.post(`${API_URL}/budget/send-email`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Presupuesto enviado correctamente:", response.data);
    } catch (error) {
      console.error("Error al enviar el presupuesto:", error);
    }
};

export const sendBudgetEmail = async (budgetData, pdfBase64) => {
  const response = await axios.post(`${API_URL}/send-budget-email`, {
    budgetData,
    pdfBase64,
  });

  return response.data;
};

const sendBudgetEmail3 = async ({ to, subject, body, attachment, filename }) => {
  return fetch("/api/budget/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject,
      body,
      attachment, // base64 del PDF
      filename,
    }),
  }).then((res) => {
    if (!res.ok) throw new Error("Error al enviar el correo");
    return res.json();
  });
};


export const sendPDFToBackend = async (pdfBase64, budgetData) => {

    console.log("budgetData", budgetData);
    // 1. Convertir base64 a Blob
    const base64ToBlob = (base64Data) => {
      const byteString = atob(base64Data.split(',')[1]);
      const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };
  
    const pdfBlob = base64ToBlob(pdfBase64);
  
    // 2. Preparar FormData. 
    const formData = new FormData();
    formData.append('to', budgetData.email);   // <- ajustá de dónde viene el email  // || 'gjuniorge@gmail.com'
    formData.append('pdf', pdfBlob, `${budgetData.name}.pdf`);

    formData.append('bodyHtml', '<strong>Este es el detalle del presupuesto solicitado...</strong>');
    formData.append('cliente', budgetData.clienteName); 

    // ✉️ Armar los datos para el backend
    /*  Varios remitarios
    const formData = new FormData();
    const recipients = Array.isArray(budgetData.email)
    ? budgetData.email
    : budgetData.email.split(',').map(e => e.trim());
    recipients.forEach(email => formData.append('to', email)); // permite múltiples correos

    formData.append('subject', budgetData.subject || `Presupuesto - ${budgetData.name}`);
  formData.append('message', budgetData.message || 'Adjuntamos su presupuesto en PDF.');
  formData.append('pdf', pdfBlob, `${budgetData.name}.pdf`);
  */
  
    // 3. Enviar al backend. 
    await fetch(`${API_URL}/send-budget-email`, {
      method: 'POST',
      body: formData,
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al enviar el presupuesto');
        return res.json();
      })
      .then(data => {
        console.log('✅ Respuesta del backend:', data);
      })
      .catch(error => {
        console.error('❌ Error al enviar al backend:', error);
      });
  };
  
