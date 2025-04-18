import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Input, Button, Select, InputNumber, Row, Col, message, Space, Modal, Checkbox } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { jsPDF } from "jspdf";
import "jspdf-autotable";  // Asegúrate de importar el plugin de autoTable
import logo from '../assets/logo.png'; // ⚠️ asegurate de importar la imagen como un módulo
import autoTable from 'jspdf-autotable'; // ✅ Esta SÍ importa y registra el plugin correctamente
import QRCode from 'qrcode'; // Necesitamos el paquete qrcode para generar el QR
import emailjs from 'emailjs-com';
import { getProducts } from "../api/productApi"; 
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 
const your_service_id = 'service_cy07ihd';
const your_template_id = 'template_7y6zdwl';
const your_user_id = 'G10RHxIwl7yP1iew5';
// Inicializamos EmailJS con tu Public Key (User ID)
// emailjs.init('G10RHxIwl7yP1iew5');  // Aquí va tu public key

const BudgetForm = (work) => {

    // Verifica que work no sea undefined
  console.log("work en BudgetForm:", work);
    // Aquí accedes al ID del trabajo
  const workId = work ? work.work._id : null;
  const clienteId = work ? work.work.cliente._id : null;

  console.log("ID del trabajo:", workId);
  console.log("ID del cliente:", clienteId);

  // Asegúrate de que workId no sea undefined antes de intentar usarlo
  if (!workId) {
    // Maneja el error si el trabajo no tiene un ID
    console.error("No se encontró el ID del trabajo");
  }

  const [form] = Form.useForm();
  const [products, setProducts] = useState([{ productId: "", quantity: 1, width: 0, length: 0, price: 0, discount: 0, subtotal: 0 }]);
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalUYU, setTotalUYU] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [technicians, setTechnicians] = useState([]);  // Técnicos
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false); // Estado para mostrar el modal de confirmación
  const [generatePDFOption, setGeneratePDFOption] = useState(false);
  const [sendEmailOption, setSendEmailOption] = useState(false);


  // El comportamiento exacto de cuándo se invoca useEffect depende de cómo lo configures:

  // 1. Por defecto (sin dependencias). 
  // Si useEffect se invoca sin un array de dependencias, se ejecuta después de cada renderizado del componente, 
  // es decir, cada vez que el componente se renderiza (incluyendo actualizaciones de estado y props).
  useEffect(() => {
    console.log("Componente renderizado");
  });  

  // 2. Con dependencias específicas
  // Si le pasas un array de dependencias como segundo argumento a useEffect, este solo se ejecutará cuando alguna de esas dependencias cambie.
  // Llama a esta función cuando cambie el producto
  useEffect(() => {
    console.log("El estado o props han cambiado");
    calculateTotals();
  }, [products]);  // Recalcular totales cada vez que los productos cambian

  // 3. Solo al montar y desmontar
  // Si el array de dependencias está vacío [], useEffect solo se ejecutará una vez, después de que el componente se haya montado, 
  // y no se ejecutará en actualizaciones posteriores. Este comportamiento es útil para realizar tareas como obtener datos solo una vez.
  useEffect(() => {
    console.log("Componente montado");
    getTechnicians(); // Call to fetch technicians
    fetchProductsForBudget();
  }, []);

  // Fetch technicians from the backend
  const getTechnicians = async () => {
    console.log('Cargando los técnicos desde la API:');
    try {
      const response = await axios.get(`${API_URL}/users?role=technician`);
      setTechnicians(response.data.map(user => ({ value: user._id, label: `${user.username}` })));
    } catch (error) {
      console.error("Error al obtener técnicos:", error);
      message.error("No se pudo cargar los técnicos");
    }
  };

  // Fetch available products
  const fetchProductsForBudget = async () => {
    console.log('Cargando los productos desde la API:');  // Verifica si los productos vienen de la API correctamente
    try {
      setLoadingProducts(true);  // Empieza la carga

      const productsData = await getProducts();           // Esta es la llamada que hace la API a productApi.js
      console.log('Datos de la API:', productsData);      // Verifica si los productos vienen de la API correctamente

      // Llamamos a la API y obtenemos los productos           
      // Si necesitas autenticación, agrega el token aquí
      //const token = localStorage.getItem('authToken');  // Asegúrate de obtener el token si lo necesitas

      // const response = await axios.get("http://localhost:5000/api/products", {
          // headers: { Authorization: `Bearer ${token}`, // Si es necesario incluir el token
      // } });
      
      if (productsData && productsData.length > 0) {
        // Extraemos el _id, name y price, pero puedes incluir más si lo necesitas
        const transformedProducts = productsData.map(product => {
          if (!product.productType) {
            console.log('Producto sin productType:', product);
          }
          return{
            value: product._id,                     // Asegúrate de que `_id` sea el identificador correcto
            label: `${product.name}`,               // `product.name` es el nombre del producto
            price: product.price,                   // Asegúrate de incluir el precio en cada producto
            currency: product.currency || 'USD',    // Suponiendo que los productos tienen una moneda asociada
            productType: product.productType ? product.productType.title : 'Desconocido'  // Título del tipo de producto
          }
        });
        console.log("Productos disponibles:", availableProducts);
        setAvailableProducts(transformedProducts);
      } else {
          message.error("La respuesta de la API no contiene los productos.");
      }
      // setLoadingProducts(false);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      
      // Manejo de errores
      if (error.response && error.response.status === 401) {
        message.error("No autorizado. Por favor, inicia sesión nuevamente.");
        console.error("Respuesta de error:", error.response);
      } else {
          message.error("No se pudo cargar los productos.");
          console.error("Error sin respuesta de la API:", error);
      } 
    } finally {
      setLoadingProducts(false);
    }
  };

  // Función para manejar los cambios en los valores de cantidad, ancho, largo, descuento
  const handleProductDetailChange = (index, field, value) => {

    console.log('Entrando en handleProductDetailChange:');

    // Crea una copia del estado de productos
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    // Calcular el subtotal por producto
    updatedProducts[index].subtotal = calculateSubtotal(updatedProducts[index]);
    setProducts(updatedProducts);
  };

  // Función para calcular el subtotal de un producto
  const calculateSubtotal = (product) => {

    console.log('Entrando en calculateSubtotal:');

    const { quantity, width, length, price, discount } = product;
    const area = width * length;
    const total = price * quantity * area;
    const discountAmount = total * (discount / 100);
    return total - discountAmount;
  };


  // Función que maneja los cambios en los productos
  const handleProductChange = (index, field, value) => {

    console.log('Entrando en handleProductChange:');

    // Crea una copia del estado de productos
    const updatedProducts = [...products];

    updatedProducts[index][field] = value;

    // Si el campo es productId, actualiza también el precio y la moneda
    if (field === 'productId') {
      const selectedProduct = availableProducts.find(product => product.value === value);
      updatedProducts[index].price = selectedProduct ? selectedProduct.price : 0; // Ajusta según la estructura del producto
      updatedProducts[index].currency = selectedProduct ? selectedProduct.currency : 'USD';
    }
    // Actualiza el estado de los productos
    setProducts(updatedProducts);
    
    calculateTotals(updatedProducts);
  };

  // Función para calcular los subtotales y el total de todos los productos
  const calculateTotals = () => {

    console.log('Entrando en calculateTotals:');

    let totalUSD = 0;
    let totalUYU = 0;

    // Recorremos los productos para calcular los totales
    products.forEach(product => {
      if (product.currency === 'USD') {
        totalUSD += product.subtotal; // O usa la lógica que ya tengas para calcular el subtotal
      } else {
        totalUYU += product.subtotal; // Lo mismo aquí para UYU
      }
    });

    console.log("A : " + totalUSD);
    console.log("B : " + totalUYU);
    // Actualizamos los valores de los totales
    setTotalUSD(totalUSD);
    setTotalUYU(totalUYU);
  };

  // Función para agregar un nuevo producto
  const addProduct = () => {
    setProducts([
      ...products,
      { productId: "", quantity: 1, width: 0, length: 0, price: 0, discount: 0, subtotal: 0 },
    ]);
  };

  // Función para eliminar un producto
  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    calculateTotals(updatedProducts);
  };

  

  // Handle cancel and close the modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setProducts([{ productId: "", quantity: 1, width: 0, length: 0, price: 0, discount: 0, subtotal: 0 }]);
    setTotalUSD(0);
    setTotalUYU(0);
  };

        /*
        // Actualización de la tasa de cambio y recalcular total en UYU
        const handleExchangeRateChange = (value) => {
            setExchangeRate(value);
            recalculateTotalUYU(value); // Recalcular el total en UYU cuando la tasa cambia
        };
        */
        /*
        useEffect(() => {
            // Asegúrate de recalcular el total en UYU cuando se actualiza totalUSD
            recalculateTotalUYU(exchangeRate);
          }, [totalUSD, exchangeRate]); // Recalcular cuando cambia totalUSD o exchangeRate
          */
        /*
          // Función para recalcular el total en UYU cuando se cambia la tasa de cambio
        const recalculateTotalUYU = (newExchangeRate) => {
          const newTotalUYU = totalUSD * newExchangeRate;
          setTotalUYU(newTotalUYU);
        };
        */

    // Función para exportar el presupuesto a PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        // doc.text("Presupuesto: " + form.getFieldValue('name'), 10, 10);
        
        // Agrega más detalles del presupuesto aquí
        // Título del presupuesto
        const title = form.getFieldValue('name');
        const address = form.getFieldValue('address');
        const description = form.getFieldValue('description');
        const technician = form.getFieldValue('technicianId');
        
        doc.setFont("helvetica", "normal");

        // Título del presupuesto
        doc.setFontSize(16);
        doc.text("Presupuesto: " + title, 10, 20);
        
        // Dirección
        doc.setFontSize(12);
        doc.text("Dirección: " + address, 10, 30);
        
        // Descripción
        doc.text("Descripción: " + description, 10, 40);
        
        // Técnico asignado
        doc.text("Técnico: " + technician, 10, 50);
        
        doc.text(`Total en USD: $${totalUSD.toFixed(2)}`, 10, 60);
        doc.text(`Total en UYU: $${totalUYU.toFixed(2)}`, 10, 70);
        doc.text(`Tasa de Cambio: ${exchangeRate}`, 10, 80);
        
        // Agregar una línea de separación
        doc.setLineWidth(0.5);
        doc.line(10, 85, 200, 85);
        
        /*
        // Productos
        doc.text("Productos:", 10, 90);
        let yPosition = 100;

        // Tabla de productos
        products.forEach((product, index) => {
        const productDetails = `${product.productId} - Cantidad: ${product.quantity} - Precio: $${product.price} - Subtotal: $${product.subtotal.toFixed(2)}`;
        doc.text(productDetails, 10, yPosition);
        yPosition += 10;
        });
        */

        // Agregar tabla de productos con autoTable
        const tableData = products.map(product => [
          product.productId, 
          product.quantity, 
          product.price.toFixed(2), 
          product.subtotal.toFixed(2)
        ]);

        const tableColumns = [
          { title: "Producto", dataKey: "productId" },
          { title: "Cantidad", dataKey: "quantity" },
          { title: "Precio Unitario", dataKey: "price" },
          { title: "Subtotal", dataKey: "subtotal" }
        ];

        doc.autoTable({
          head: [tableColumns.map(col => col.title)],  // Cabecera de la tabla
          body: tableData,                            // Datos de la tabla
          startY: 90,                                 // Empezamos a dibujar la tabla desde la posición 90 en el eje Y
          theme: 'grid',                              // Puedes cambiar el tema a 'striped' o 'plain'
          margin: { top: 10 },                        // Ajusta el margen de la tabla
        });

        // Exportar PDF
        // doc.save("presupuesto.pdf");
        doc.save(`${title}_presupuesto.pdf`);
      };

    const handleSave = () => {
      // Mostrar el modal de confirmación
      setIsConfirmationVisible(true);
    };    
    
    // Función para manejar el submit (cuando confirmamos en el modal)
    const handleSubmit1 = async (values) => {
      // Lógica de guardado (aquí puedes hacer la llamada a la API o cualquier otra lógica)
      console.log("Ejecutando handleSubmit...");
      // Asegúrate de recibir los valores correctamente
      console.log ("Values: " , values);
      // Recopilamos todos los datos del formulario
      // const { name, address, description, technicianId } = values;

      try{
        setLoading(true); // Iniciar la carga mientras enviamos la solicitud

        // Para cada producto en la lista de productos, calculamos la información del producto
        const productsWithDetails = products.map(product => {
            return {
            product: product.productId,
            quantity: product.quantity,
            width: product.width,
            length: product.length,
            discount: product.discount,
            // price: product.price,
            // currency: product.currency,
            subtotal: product.subtotal,
            };
        });

        // Datos del presupuesto para enviar al backend   
          const budgetData = {
            work: workId,  // Aquí pasamos el `workId` del parámetro de la URL
            name: values.name,
            address: values.address,
            technician: values.technicianId,
            description: values.description,
            products: productsWithDetails,
            totalUYU: totalUYU + 1,
            totalUSD: totalUSD + 1,
            client: clienteId,
            creationDate: new Date().toISOString(),  // Fecha de creación
        };

        console.log("productsWithDetails:", productsWithDetails);
        console.log("Data para invocar API: ", budgetData);

        // Realizar la solicitud POST a la API. Aquí estamos enviando el presupuesto completo a la API
        const response = await axios.post(`${API_URL}/budget`, budgetData);
        console.log("Respuesta de la API:", response);

        // Verificar si la solicitud fue exitosa
        if (response.status === 200) {
          // Si es exitoso, mostrar un mensaje y cerrar el modal
          message.success('Presupuesto guardado con éxito');
          setIsModalVisible(false);
        } else {
          // Si no es exitoso, mostrar un mensaje de error
          message.error('Error al guardar el presupuesto');
        }

        // Generar PDF y obtener el pdfData (Blob)
        let pdfData;
        if (generatePDFOption) {
          pdfData = await generatePDF(budgetData);
        }
      
        // Enviar por correo si se seleccionó la opción
        if (sendEmailOption && pdfData) {
          sendEmailWithPDF(pdfData, budgetData);
        }

        // form.resetFields(); // Resetea los campos del formulario
        // handleCancel();     // Cerrar el formulario después de guardar

      } catch (error) {
        // Manejo de errores en caso de fallo en la solicitud
        console.error('Error al enviar la solicitud', error);
        message.error('Error al guardar el presupuesto');

        if (error.response) {
          console.error("Error del servidor:", error.response.data);  // Ver contenido detallado del error
          message.error(`Error: ${error.response.data.message}`);
        } else {
          message.error("Hubo un error al crear el presupuesto. Por favor intente nuevamente.");
        }
      } finally {
        setLoading(false); // Detener el estado de carga al finalizar
      }
    };

    const handleSubmit = async (values) => {
      const budgetData = {
        ...values,
        products,
        totalUYU,
        totalUSD,
      };
  
      try {
        // Si la opción de generar PDF está activada
        if (setGeneratePDFOption) {
          const pdfData = await generatePDF(budgetData);
          
          // Si la opción de enviar por correo está activada
          if (setSendEmailOption) {
            sendEmailWithPDF(pdfData, budgetData);
          }
        }

        message.success('Presupuesto guardado y enviado correctamente!');
        handleCancel(); // Cerrar modal
    
        // Aquí puedes agregar otras acciones como guardar el presupuesto en una base de datos
        handleSave(values);
      } catch (error) {
        console.error('Error al generar el PDF o enviar el correo:', error);
        message.error('Hubo un error al generar el PDF o enviar el correo');
      }
    };

    // Función para manejar cambios en las opciones de generar PDF y enviar correo
    const handleGeneratePDFChange = (e) => setGeneratePDFOption(e.target.checked);
    const handleSendEmailChange = (e) => setSendEmailOption(e.target.checked);

    const generatePDF2 = (budgetData) => {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text("Presupuesto: " + budgetData.name, 10, 10);

      // Información del presupuesto
      doc.setFontSize(12);
      // doc.text(`Cliente: ${budgetData.client}`, 10, 20);
      // doc.text(`Técnico: ${budgetData.technician}`, 10, 30);
      doc.text(`Dirección: ${budgetData.address}`, 10, 40);
      doc.text(`Descripción: ${budgetData.description}`, 10, 50);

  
      // Tabla de productos
      let yPosition = 60;
      doc.text("Productos:", 10, yPosition);
      yPosition += 10;

      budgetData.products.forEach((product, index) => {
        doc.text(`Producto ${index + 1}: ${product.product}`, 10, yPosition);
        doc.text(`Cantidad: ${product.quantity}`, 10, yPosition + 10);
        doc.text(`Subtotal: ${product.subtotal}`, 10, yPosition + 20);
        yPosition += 30;
      });

      // Totales
      doc.text(`Total UYU: ${budgetData.totalUYU}`, 10, yPosition);
      doc.text(`Total USD: ${budgetData.totalUSD}`, 10, yPosition + 10);

      // Productos
      yPosition += 30;
      doc.text("Detalles de Productos:", 10, yPosition);
      
      // Tabla de productos
      products.forEach((product, index) => {
      const productDetails = `${product.productId} - Cantidad: ${product.quantity} - Precio: $${product.price} - Subtotal: $${product.subtotal.toFixed(2)}`;
      // doc.text(productDetails, 10, yPosition + 10 + (index * 10));
      // yPosition += 10;
      doc.text(productDetails, 10, yPosition + 10 + (index * 10));
      });

      // Guardar el PDF como Blob para enviarlo por correo
      const pdfData = doc.output('blob');
      // Guardar el PDF en el sistema de archivos (opcional)
      doc.save(`${budgetData.name}.pdf`);

      return pdfData;  // Retornamos el PDF como un Blob
    };

    const generatePDF = async (budgetData) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      return new Promise((resolve, reject) => {
        // Cargamos el logo primero para que todo se haga después
        const img = new Image();
        img.src = logo;
      
        img.onload = () => {
          // 1. Logo
          const logoWidth = 50;
          const logoHeight = 35;
          doc.addImage(img, 'PNG', 10, 10, logoWidth, logoHeight);

          // 2. Encabezado
          doc.setFontSize(18);
          doc.text('Presupuesto', pageWidth / 2, 20, { align: 'center' });

          // Línea divisoria
          const lineY = 10 + logoHeight + 5; // 10 es la Y original, + alto del logo, + pequeño espacio
          doc.setDrawColor(200); // gris claro
          doc.setLineWidth(0.5);
          doc.line(10, lineY, pageWidth - 10, lineY); // Línea de borde a borde con margen de 10
      
          doc.setFontSize(12);
          doc.setTextColor(100);
          doc.text(`Nombre: ${budgetData.name}`, 10, lineY + 25);
          doc.text(`Cliente: ${budgetData.client}`, 10, lineY + 32);
          doc.text(`Técnico: ${budgetData.technician}`, 10, lineY + 39);
          doc.text(`Dirección: ${budgetData.address}`, 10, lineY + 46);
          doc.text(`Descripción: ${budgetData.description}`, 10, lineY + 53);
      
          // 3. Tabla con productos
          const tableData = budgetData.products.map((product, index) => [
            index + 1,
            product.product,
            product.quantity,
            product.width || '-',
            product.length || '-',
            product.price,
            product.discount || 0,
            product.subtotal,
            product.currency
          ]); 
      
          const tableStartY = lineY + 53 + 10; // posición después del último texto
          autoTable(doc, {
            head: [[
              '#', 'Producto', 'Cantidad', 'Ancho', 'Largo', 'Precio', 'Descuento (%)', 'Subtotal', 'Moneda'
            ]],
            body: tableData,
            startY: tableStartY, // 80
            styles: {
              fontSize: 10,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [41, 128, 185], // Azul corporativo
              textColor: 255,
              halign: 'center',
            },
            bodyStyles: {
              halign: 'center',
            },
          });
      
          // 4. Totales
          const finalY = doc.lastAutoTable.finalY || 80;
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text(`Total UYU: $${budgetData.totalUYU}`, 10, finalY + 10);
          doc.text(`Total USD: $${budgetData.totalUSD}`, 10, finalY + 17);
      
          // 5. Espacio para firma
          doc.setFontSize(11);
          doc.text('Firma del técnico:', 140, finalY + 35);
          doc.line(140, finalY + 37, 190, finalY + 37); // Línea de firma
      
          // 6. Footer con fecha
          const date = new Date().toLocaleDateString();
          doc.setFontSize(10);
          doc.setTextColor(120);
          doc.text(`Fecha de generación: ${date}`, 10, 285); // Pie de página

          // 7. Generar QR con información del presupuesto
          const qrData = `
          📄 Presupuesto: ${budgetData.name}
          🆔 ID: ${budgetData.id}
          👤 Cliente: ${budgetData.client}
          🧑‍🔧 Técnico: ${budgetData.technician}
          💲 Total UYU: $${budgetData.totalUYU}
          💲 Total USD: $${budgetData.totalUSD}
          📍 Dirección: ${budgetData.address}
          📝 Descripción: ${budgetData.description}
          🔗 Ver online: https://miempresa.com/presupuestos/${budgetData.id}
          `;

          QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' }, (err, url) => {
            if (err) throw err;
          
            // Agregar el QR al PDF – en una posición más baja (abajo a la derecha)
            const qrX = pageWidth - 60;
            const qrY = 220; // bajamos el QR
            const qrSize = 50;
          
            doc.addImage(url, 'PNG', qrX, qrY, qrSize, qrSize);
          
            // Agregamos texto debajo del QR
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Escaneá para más info', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' });
          
            // Guardar el PDF
            const pdfData = doc.output('blob');
            doc.save(`${budgetData.name}.pdf`);
            resolve(pdfData);
          });  
        };      
      });
    };
    
           
    
    

    // Función para enviar el correo con el archivo adjunto
    const sendEmailWithPDF = (pdfData, budgetData) => {

      // Crear un formulario HTML "virtual"
      const emailForm = document.createElement('form');

      try{
        const formData = new FormData();
      
        // Añadimos el archivo PDF generado al FormData
        formData.append('file', pdfData, `${budgetData.name}.pdf`);   // form.getFieldValue('technicianId');

        // Convertir el Blob en un archivo para adjuntar
        const file = new File([pdfData], `${budgetData.name}.pdf`, { type: 'application/pdf' });
        formData.append('file', file);

        /* const file = new File([pdfData], `${budgetData.name}.pdf`, { type: 'application/pdf' });
        formData.append('file', file); */

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

  return (
    <div>
      <Modal
        title="Crear Presupuesto FG"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>    {/* Aquí la invocación automática de handleSubmit */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                label="Nombre del presupuesto" 
                name="name" 
                rules={[
                            { required: true, message: 'Por favor ingresa el nombre del presupuesto' },
                            { max: 100, message: 'El nombre del presupuesto no puede exceder los 100 caracteres' }
                        ]}
                    tooltip="Este es el nombre del presupuesto que se mostrará en el sistema"
                >
                <Input placeholder="Nombre del presupuesto" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Dirección" name="address">
                <Input placeholder="Dirección" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Técnico" name="technicianId" rules={[{ required: true, message: 'Selecciona un técnico' }]}>
              <Select
                    showSearch
                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                    options={technicians}
                    loading={loadingProducts}
                    placeholder="Selecciona un técnico"
                    style={{ width: '100%' }}
              />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={20}>
              <Form.Item label="Descripción" name="description">
                <Input.TextArea placeholder="Descripción" />
              </Form.Item>
            </Col>
          </Row>

          <h3>Seleccionar Producto</h3>
          {products.map((product, index) => (
            <div key={index} style={{ marginBottom: 24 }}>
              <Row gutter={16} align="middle">
                {/* Producto y otros controles */}
                <Col span={6}>
                    <Form.Item label="Producto" required>
                        <Select
                            showSearch
                            filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                            // value={{ label: product.productId, value: product.productId }}
                            // value={product.productId}
                            onChange={(value) => handleProductChange(index, 'productId', value)}             // Actualiza el productId
                            options={availableProducts}
                            loading={loadingProducts}
                            placeholder="Seleccione un producto"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>

                {/* Nueva disposición más cómoda para cantidad, ancho, largo, descuento, y precio */}
                <Col span={2}>
                  <Form.Item label="Cantidad">
                    <InputNumber
                      value={product.quantity}
                      onChange={(value) => handleProductDetailChange(index, 'quantity', value)}
                      min={1}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item label="Ancho">
                    <InputNumber
                      value={product.width}
                      onChange={(value) => handleProductDetailChange(index, 'width', value)}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item label="Largo">
                    <InputNumber
                      value={product.length}
                      onChange={(value) => handleProductDetailChange(index, 'length', value)}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item label="Descuento">
                    <InputNumber
                      value={product.discount}
                      onChange={(value) => handleProductDetailChange(index, 'discount', value)}
                      min={0}
                      max={100}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item label="Precio" required>
                    <InputNumber
                      value={`${product.price} ${product.currency === 'USD' ? 'USD' : 'UYU'}`} // Muestra la moneda
                      onChange={(value) => handleProductDetailChange(index, 'price', value)}    // Este es el caso si quieres que el precio sea editable
                      min={0}
                      style={{ width: "100%" }}
                      // disabled={true}  // Dejarlo como "true" si no quieres que el usuario lo modifique, pero lo mantienes actualizado.
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                    <Form.Item label="Subtotal">
                        <Input
                            value={`${product.subtotal} ${product.currency === 'USD' ? 'USD' : 'UYU'}`} // Muestra la moneda
                            disabled
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>

                {/* Botón de eliminar producto */}
                <Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => removeProduct(index)}
                    shape="circle"
                    style={{ marginTop: 24 }}
                  />
                </Col>
              </Row>
            </div>
          ))}

          <Row gutter={16} align="middle" style={{ marginTop: 20 }}>
            {/* Total en USD */}
            <Col span={4}>
                <Form.Item label="Total en USD" style={{ textAlign: 'center' }}>
                <Input
                    value={totalUSD}
                    disabled
                    style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '14px',  // Reducción del tamaño de la fuente
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    borderColor: '#4CAF50',
                    }}
                />
                </Form.Item>
            </Col>

            {/* Tasa de cambio 
            <Col span={4}>
                <Form.Item label="Tasa de Cambio" style={{ textAlign: 'center' }}>
                <InputNumber
                    value={exchangeRate}
                    // onChange={(value) => setExchangeRate(value)}
                    onChange={handleExchangeRateChange} // Actualiza la tasa de cambio
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01} // Permite valores decimales
                    precision={2} // Limita a 2 decimales
                    placeholder="Tasa de Cambio"
                />
                </Form.Item>
            </Col>
            */}

            {/* Total en UYU */}
            <Col span={4}>
                <Form.Item label="Total en UYU" style={{ textAlign: 'center' }}>
                <Input
                    value={totalUYU}
                    disabled
                    style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '14px',  // Reducción del tamaño de la fuente
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    borderColor: '#2196F3',
                    }}
                />
                </Form.Item>
            </Col>

            {/* Botón de agregar producto como icono al final de la lista */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Button
                icon={<PlusOutlined />}
                onClick={addProduct}
                shape="circle"
                size="large"
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  fontSize: '24px',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
              />
            </div>

            {/* Opciones de generar PDF y enviar por correo */}
              <Row gutter={16} align="middle" style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Form.Item label="Generar PDF" valuePropName="checked">
                    <Checkbox onChange={handleGeneratePDFChange} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Enviar por correo" valuePropName="checked">
                    <Checkbox onChange={handleSendEmailChange} />
                  </Form.Item>
                </Col>
              </Row>
          </Row>

          <Space style={{ marginTop: 16 }} align="center" size="large">
            <Button onClick={handleCancel} icon={<CloseOutlined />} size="large" style={{ width: "120px", backgroundColor: "#f44336", color: "white" }}>
              Cancelar
            </Button>

            <Button type="primary" htmlType="submit" onClick={handleSave} icon={loading ? <LoadingOutlined /> : <PlusOutlined />} 
              size="large" style={{ width: "120px" }}>
              {loading ? 'Cargando' : 'Guardar'}
            </Button>
            {/*
            <Button type="primary" onClick={exportToPDF} icon={<PlusOutlined />} size="large">
              Exportar PDF
            </Button> */}
          </Space>
        </Form>
      </Modal>

      <Modal
        title="Confirmación"
        visible={isConfirmationVisible}
        onCancel={() => setIsConfirmationVisible(false)} // Cerrar el modal
        onOk={() => {
          // Llamar a handleSubmit con los valores del formulario directamente
          form.submit(); // Esto activa el onFinish
          setIsConfirmationVisible(false); // Cerrar el modal después de hacer la acción
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que quieres guardar el presupuesto?</p>
      </Modal>

    </div>
  );
};

export default BudgetForm;
