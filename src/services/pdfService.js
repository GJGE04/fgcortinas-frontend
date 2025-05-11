// src/services/pdfService.js
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // ✅ Esta SÍ importa y registra el plugin correctamente
import logo from '../assets/logo.png'; // ⚠️ ajustá la ruta al logo. asegurate de importar la imagen como un módulo
import QRCode from 'qrcode';

export const generatePDF = async (budgetData) => {
    console.log("Generando pdf del presupuesto........", budgetData);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  try{
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
            doc.text('Presupuesto: ' + budgetData.name, pageWidth / 2, 20, { align: 'center' });
                // Línea divisoria
            const lineY = 10 + logoHeight + 5;                // 10 es la Y original, + alto del logo, + pequeño espacio
            doc.setDrawColor(200);                            // gris claro
            doc.setLineWidth(0.5);
            doc.line(10, lineY, pageWidth - 10, lineY);       // Línea de borde a borde con margen de 10
        
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Nombre: ${safeText(budgetData.name)}`, 10, lineY + 25);
            doc.text(`Cliente: ${safeText(budgetData.clienteName)}`, 10, lineY + 32);
            doc.text(`Técnico: ${safeText(budgetData.tecnicoName)}`, 10, lineY + 39);
            doc.text(`Dirección: ${safeText(budgetData.address)}`, 10, lineY + 46);
            doc.text(`Descripción: ${safeText(budgetData.description)}`, 10, lineY + 53);
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
                product.currency,
            ]);
        
            const tableStartY = lineY + 63;       // posición después del último texto
            autoTable(doc, {
                head: [[
                '#', 'Producto', 'Cantidad', 'Ancho', 'Largo', 'Precio', 'Descuento (%)', 'Subtotal', 'Moneda',
                ]],
                body: tableData,
                startY: tableStartY,        // 80
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },    // Azul corporativo
                bodyStyles: { halign: 'center' },
            });
                // 4. Totales
            const finalY = doc.lastAutoTable.finalY || 80;
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Total UYU: $${budgetData.totals.UYU}`, 10, finalY + 10);      // budgetData.totalUYU
            doc.text(`Total USD: $${budgetData.totals.USD}`, 10, finalY + 17);        // budgetData.totalUSD
                // 5. Espacio para firma
            doc.setFontSize(11);
            doc.text('Firma del técnico:', 140, finalY + 35);
            doc.line(140, finalY + 37, 190, finalY + 37);         // Línea de firma
                // 6. Footer con fecha
            const date = new Date().toLocaleDateString();
            doc.setFontSize(10);
            doc.setTextColor(120);
            doc.text(`Fecha de generación: ${date}`, 10, 285);   // Pie de página
                // 7. Generar QR con información del presupuesto
            const qrData = `
                📄 Presupuesto: ${safeText(budgetData.name)}
                🆔 ID: ${safeText(budgetData.id)}
                👤 Cliente: ${safeText(budgetData.clienteName)}
                🧑‍🔧 Técnico: ${safeText(budgetData.tecnicoName)}
                💲 Total UYU: $${safeText(budgetData.totalUYU)}
                💲 Total USD: $${safeText(budgetData.totalUSD)}
                📍 Dirección: ${safeText(budgetData.address)}
                📝 Descripción: ${safeText(budgetData.description)}
                🔗 Ver online: https://miempresa.com/presupuestos/${safeText(budgetData.id)}
            `;
        
            QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' }, (err, url) => {
                if (err) return reject(err);
        
                // Agregar el QR al PDF – en una posición más baja (abajo a la derecha)
                const qrX = pageWidth - 60;
                const qrY = 220;        // bajamos el QR
                const qrSize = 50;
        
                doc.addImage(url, 'PNG', qrX, qrY, qrSize, qrSize);
                // Agregamos texto debajo del QR
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('Escaneá para más info', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' });
        
                // Guardar el PDF
                // const pdfData = doc.output('blob');  // Guardar el PDF como Blob para enviarlo por correo
                doc.save(`${budgetData.name}.pdf`);     // Guardar el PDF en el sistema de archivos (opcional). // Descarga local
                // resolve(pdfData);
        
                // ⬅️ base64 del PDF
                const pdfBase64 = doc.output('datauristring'); // esto devuelve el PDF en base64. // Para enviar por correo
                resolve(pdfBase64);
            });
            };
        
            img.onerror = (err) => reject(err);
        });
  }
  catch (error)
  {
    console.error("Error generando pdf del presupuesto...");
  }
};

const safeText = (value, fallback = '-') => {
    return value !== undefined && value !== null && value !== '' ? value : fallback;
  };
  


export const generateBudgetPDF = async (work, products, totalUSD, totalUYU) => {
    const doc = new jsPDF();
  
    doc.addImage(logo, 'PNG', 15, 10, 50, 20);
    doc.text("Presupuesto", 15, 40);
  
    autoTable(doc, {
      startY: 50,
      head: [['Producto', 'Cantidad', 'Medidas', 'Precio', 'Subtotal']],
      body: products.map(p => [
        p.label,
        p.quantity,
        `${p.width}x${p.length}`,
        `$${p.price}`,
        `$${p.subtotal}`
      ]),
    });
  
    doc.text(`Total USD: $${totalUSD}`, 15, doc.autoTable.previous.finalY + 10);
    doc.text(`Total UYU: $U${totalUYU}`, 15, doc.autoTable.previous.finalY + 20);
  
    return doc;
};

// Función para exportar el presupuesto a PDF
/*
export const exportToPDF = () => {
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
    doc.line(10, 85, 200, 85);  */
    
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
    /*
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
  */

  // Función para generar PDF  (primer version probada)
  const generatePDFOld = (work) => {
    const doc = new jsPDF();
    
    // Establecer márgenes y dimensiones del recuadro
    const marginLeft = 20;
    const marginTop = 20;
    const pageWidth = doc.internal.pageSize.width;
    const headerHeight = 70;  // Altura del recuadro con más espacio para el texto
    
    // Establecer el color de fondo para el recuadro (rojo)
    doc.setFillColor(255, 0, 0);  // Rojo
    
    // Dibujar el recuadro con bordes redondeados
    const roundedRectRadius = 10; // Radio de los bordes redondeados
    doc.roundedRect(marginLeft, marginTop, pageWidth - 2 * marginLeft, headerHeight, roundedRectRadius, roundedRectRadius, 'F');  // 'F' para relleno
    
    // Establecer la fuente para el texto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    
    // Establecer color blanco para el texto
    doc.setTextColor(255, 255, 255);  // Blanco
    
    // Agregar el título "PRESUPUESTO" (centrado)
    doc.text('PRESUPUESTO', (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 20, { align: 'center' });

    // Cambiar a una fuente más pequeña para el nombre y dirección
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Nombre del cliente (centrado)
    doc.text(work.clienteNombre, (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 35, { align: 'center' });

    // Dirección (centrado y en una línea separada)
    const direccion = Array.isArray(work.direccion) ? work.direccion : ['Dirección no disponible'];
    doc.text('DIRECCION:', (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 50, { align: 'center' });
    doc.text(direccion.join(', '), (pageWidth - marginLeft * 2) / 2 + marginLeft, marginTop + 60, { align: 'center' });

    // ** Agregar el logo centrado **
    const logoY = marginTop + headerHeight + 10;  // Justo debajo del header
    const logoWidth = 50; // Ancho de la imagen
    const logoHeight = 50; // Alto de la imagen
    const xPosition = (pageWidth - logoWidth) / 2;  // Calcular la posición horizontal para centrar el logo

    // Agregar logo (centrado)
    doc.addImage(logo, 'PNG', xPosition, logoY, logoWidth, logoHeight);   // xPosition centra el logo, y es la posición vertical

    // ** Agregar la tabla de productos **
    const tableY = logoY + logoHeight + 10;  // Posición de la tabla justo después del logo
    
    
    // Cabecera de la tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const tableHeaders = ['Producto', 'Cantidad', 'Ancho', 'Largo', 'Descuento', 'Total'];
    let tableColumnWidths = [40, 30, 30, 30, 30, 30];  // Ancho de las columnas
    
    // Dibujar los encabezados de la tabla
    tableHeaders.forEach((header, index) => {
      doc.text(header, marginLeft + tableColumnWidths[index] * index, tableY);
    });

    // ** Poner 4 filas de datos random **
    const products = [
      ['Cortina A', '10', '2m', '3m', '10%', '$300'],
      ['Cortina B', '5', '1.5m', '2.5m', '15%', '$200'],
      ['Cortina C', '8', '2.2m', '3.2m', '5%', '$250'],
      ['Cortina D', '12', '1.8m', '2.8m', '20%', '$350'],
    ];

    let yPosition = tableY + 10;  // Empezamos un poco después del encabezado de la tabla
    
    products.forEach((row) => {
      row.forEach((cell, index) => {
        doc.text(cell, marginLeft + tableColumnWidths[index] * index, yPosition);
      });
      yPosition += 10;  // Incrementar la posición vertical para la siguiente fila
    });
  
    // Guardar el PDF con el nombre adecuado
    doc.save(`${work.clienteNombre}_presupuesto.pdf`);
  };