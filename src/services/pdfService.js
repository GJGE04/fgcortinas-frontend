// src/services/pdfService.js
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // ✅ Esta SÍ importa y registra el plugin correctamente
import logo from '../assets/logo.png'; // ⚠️ ajustá la ruta al logo. asegurate de importar la imagen como un módulo
import QRCode from 'qrcode';
import watermarkImage from '../assets/watermark_faint.jpeg'; // ✅ Marca de agua

export const generatePDFV1 = async (budgetData, shouldDownload = true) => { // vcersion sin marca de agua 
    console.log("Generando pdf del presupuesto........", budgetData);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  try{
        return new Promise((resolve, reject) => {
            // Cargamos el logo primero para que todo se haga después
            const img = new Image();
            img.src = logo;
        
            img.onload = () => {

              // 🔴 MARCA DE AGUA - FG CORTINAS v.1
           /*   doc.setFont("helvetica", "bold");
              doc.setFontSize(60);
              doc.setTextColor(211, 47, 47); // Rojo (como color corporativo)
              doc.text("FG CORTINAS", 35, 150, {
                angle: 45, // Diagonal
              }); */

              // Marca de agua: "FG CORTINAS" v.2
              /*
doc.setFontSize(50);
doc.setTextColor(220, 53, 69); // Rojo suave (puedes ajustar)
doc.setTextColor(150);         // Gris claro (alternativa)

// 🔁 Guardar estado antes de transformar
doc.saveGraphicsState();

// Rotar e imprimir en diagonal
doc.setTextColor(200, 0, 0);
doc.setFont("helvetica", "bold");
doc.setFontSize(60);
doc.setTextColor(211, 47, 47);  // Rojo corporativo

// Aplica transformación para rotar el texto en diagonal
doc.text("FG CORTINAS", 35, 150, {
  angle: 45,                    // Rotación
  opacity: 0.1,                 // No soportado directamente, se simula con color
});

// 🔁 Restaurar estado gráfico
doc.restoreGraphicsState();
*/

            // 🔴 1. Logo.    // 🔹 Logo.  
            const logoWidth = 50;
            const logoHeight = 35;
            doc.addImage(img, 'PNG', 10, 10, logoWidth, logoHeight);

            // 🔴 2. Encabezado
            doc.setFontSize(18);
            doc.setTextColor(211, 47, 47); // Rojo fuerte (similar a #D32F2F)
            doc.text('Presupuesto: ' + budgetData.name, pageWidth / 2, 20, { align: 'center' });

            // 🔴 Línea divisoria
            const lineY = 10 + logoHeight + 5;                // 10 es la Y original, + alto del logo, + pequeño espacio
            // doc.setDrawColor(200);                            // gris claro
            doc.setDrawColor(211, 47, 47);
            doc.setLineWidth(0.8);  // 0.5
            doc.line(10, lineY, pageWidth - 10, lineY);       // Línea de borde a borde con margen de 10
        
            // 🔴 3. Datos principales
            doc.setFontSize(12);
            // doc.setTextColor(100);
            doc.setTextColor(150, 0, 0); // Rojo oscuro
            doc.text(`Nombre: ${safeText(budgetData.name)}`, 10, lineY + 25);
            doc.text(`Cliente: ${safeText(budgetData.clienteName)}`, 10, lineY + 32);
            doc.text(`Técnico: ${safeText(budgetData.tecnicoName)}`, 10, lineY + 39);
            doc.text(`Dirección: ${safeText(budgetData.address)}`, 10, lineY + 46);
            doc.text(`Descripción: ${safeText(budgetData.description)}`, 10, lineY + 53);

            // 🔴 4. Tabla con productos 
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
                // headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },    // Azul corporativo
                headStyles: { fillColor: [211, 47, 47], textColor: 255, halign: 'center' }, // 🔴 Rojo. // 🔴 rojo fuerte
                bodyStyles: { halign: 'center' },
            });

            // 🔴 5. Totales
            const finalY = doc.lastAutoTable.finalY || 80;
            doc.setFontSize(12);
            // doc.setTextColor(0);
            doc.setTextColor(211, 47, 47); // Rojo fuerte
            doc.text(`Total UYU: $${budgetData.totals.UYU}`, 10, finalY + 10);      // budgetData.totalUYU
            doc.text(`Total USD: $${budgetData.totals.USD}`, 10, finalY + 17);        // budgetData.totalUSD

            // 6. Espacio para firma
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text('Firma del técnico:', 140, finalY + 35);
            doc.line(140, finalY + 37, 190, finalY + 37);         // Línea de firma

           // 7. Footer con fecha
            const date = new Date().toLocaleDateString();
            doc.setFontSize(10);
            doc.setTextColor(120);
            doc.text(`Fecha de generación: ${date}`, 10, 285);   // Pie de página
            
            // 🔴 8. QR -  Generar QR con información del presupuesto
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
                // doc.setTextColor(100);
                doc.setTextColor(150, 0, 0); // Rojo oscuro
                doc.text('Escaneá para más info', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' });
        
                // Guardar el PDF
                // const pdfData = doc.output('blob');  // Guardar el PDF como Blob para enviarlo por correo
                // resolve(pdfData);
                // doc.save(`${budgetData.name}.pdf`);     // Guardar el PDF en el sistema de archivos (opcional). // Descarga local

                // ✅ Descargar solo si se indica
                if (shouldDownload) {
                  doc.save(`${budgetData.name}.pdf`);
                }
        
                // ⬅️ base64 del PDF. // ✅ Siempre retornar base64 del PDF
                const pdfBase64 = doc.output('datauristring'); // esto devuelve el PDF en base64. // Para enviar por correo
                resolve(pdfBase64);
            });
          };
        
            img.onerror = (err) => reject(err);
        });
  }
  catch (error)
  {
    console.error("❌ Error generando pdf del presupuesto:", error);
  }
};

const safeText = (value, fallback = '-') => {
    return value !== undefined && value !== null && value !== '' ? value : fallback;
  };
  
  // version con imagen de marca de agua
  export const generatePDF = async (budgetData, shouldDownload = true) => {
    console.log("BudgetData:", budgetData);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    return new Promise((resolve, reject) => {
      const watermark = new Image();
      watermark.src = watermarkImage;
  
      watermark.onload = () => {
        // ✅ Marca de agua: fondo completo, translúcida
        doc.addImage(watermark, 'JPEG', 0, 0, pageWidth, pageHeight, '', 'FAST');   // fondo completo

        // 🔺 Encabezado principal
        doc.setFontSize(13);
        doc.setTextColor(80);
        doc.text(`CLIENTE: ${safeText(budgetData.clienteName)}`, pageWidth / 2, 32, { align: 'center' });

        // Fecha (centrado debajo)
        const fecha = new Date().toLocaleDateString();
        doc.text(`Fecha: ${fecha}`, pageWidth / 2, 39, { align: 'center' });

        // 🔢 ID (alineado a la derecha)
        const presupuestoId = `FGC-${new Date().getFullYear()}-${String(budgetData.id || 1).padStart(5, '0')}`;
        doc.setFontSize(11);
        doc.setTextColor(192, 0, 0); // rojo
        doc.text(`N°: ${presupuestoId}`, pageWidth - 20, 25, { align: 'right' });

        // 🔺 Línea divisoria roja
        const lineY = 50;
        doc.setDrawColor(200, 0, 0); // rojo
        doc.setLineWidth(0.5);
        doc.line(10, lineY, pageWidth - 10, lineY);

        // 🔖 Subtítulo de tabla (centrado, rojo)
        doc.setFontSize(12);
        doc.setTextColor(192, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`Presupuesto - ${safeText(budgetData.name)}`, pageWidth / 2, lineY + 10, { align: 'center' });
        // doc.text(`Presupuesto - ${safeText(budgetData.clienteName)}`, 14, lineY + 10);

        // 🔹 Tabla de productos
        const tableStartY = lineY + 18;
        const tableData = budgetData.products.map((product, index) => {
          // const symbol = product.currency === 'USD' ? '$' : 'UYU';
          return [
            index + 1,
            product.product,
            product.quantity,
            product.width || '-',
            product.length || '-',
            product.discount || 0,
            // `${symbol} ${product.subtotal}`,
            `${product.subtotal}`,
          ];
        });

        autoTable(doc, {
          head: [['#', 'Producto', 'Cantidad', 'Ancho', 'Largo', 'Descuento (%)', 'Subtotal']],
          body: tableData,
          startY: tableStartY,
          theme: 'plain', // elimina bordes automáticos
          styles: {
            fontSize: 10,
            cellPadding: 3,
            textColor: [0, 0, 0],
            fillColor: false, // sin fondo
          },
          headStyles: {
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fillColor: false, // sin fondo
            halign: 'center',
          },
          bodyStyles: {
            halign: 'center',
            fillColor: false, // sin fondo
          },
          didDrawCell: (data) => {
            if (data.section === 'body' || data.section === 'head') {
              const { doc, cell } = data;
              doc.setDrawColor(192, 0, 0); // rojo
              doc.setLineWidth(0.5);
              doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height); // línea inferior
            }
          },
        });        

        // 🔹 Totales finales (alineados a la derecha)
      /*  const finalY = doc.lastAutoTable.finalY || 80;
        doc.setFontSize(12);
        doc.setTextColor(0);
        const rightAlignX = pageWidth - 70;
        // doc.text(`TOTAL FINAL EN UYU: $${budgetData.totals.UYU}`, pageWidth - 10, finalY + 10, { align: 'right' });
        // doc.text(`TOTAL FINAL EN USD: $${budgetData.totals.USD}`, pageWidth - 10, finalY + 17, { align: 'right' });

        
        doc.text(`TOTAL FINAL EN UYU:`, rightAlignX, finalY + 10);
        doc.text(`$${budgetData.totals.UYU}`, rightAlignX + 45, finalY + 10);

        doc.text(`TOTAL FINAL EN USD:`, rightAlignX, finalY + 17);
        doc.text(`$${budgetData.totals.USD}`, rightAlignX + 45, finalY + 17); */

        // 🔹 Totales finales alineados con el borde derecho de la tabla
const finalY = doc.lastAutoTable.finalY || 80;
doc.setFontSize(12);
doc.setTextColor(0);

const marginRight = 10; // igual al margen de la tabla
const textBlockWidth = 100; // ancho estimado para el texto descriptivo

const amountX = pageWidth - marginRight; // monto alineado al borde derecho
const labelX = amountX - textBlockWidth; // texto alineado a la izquierda del monto

// Total UYU
doc.text(`TOTAL FINAL EN UYU:`, labelX, finalY + 10, { align: 'left' });
doc.text(`$${budgetData.totals.UYU}`, amountX, finalY + 10, { align: 'right' });

// Total USD
doc.text(`TOTAL FINAL EN USD:`, labelX, finalY + 17, { align: 'left' });
doc.text(`$${budgetData.totals.USD}`, amountX, finalY + 17, { align: 'right' });

/*

        // 🔴 Sección de proceso del proyecto
        const processTitleY = finalY + 30;
        doc.setFontSize(12);
        doc.setTextColor(192, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('PROCESO DEL PROYECTO', pageWidth / 2, processTitleY, { align: 'center' });

        // 🔧 Icono de técnicos y cantidad (valor constante por ahora)
        const iconsY = processTitleY + 30;
        const colWidth = pageWidth / 3;

        const drawIconWithText = (x, icon, label) => {
          doc.setFontSize(20);
          doc.text(icon, x + colWidth / 2, iconsY, { align: 'center' });

          doc.setDrawColor(192, 0, 0);
          doc.setLineWidth(0.5);
          doc.roundedRect(x + colWidth / 2 - 10, iconsY + 5, 20, 10, 2, 2);
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.text(label, x + colWidth / 2, iconsY + 13, { align: 'center' });
        };

        drawIconWithText(0, '👷', '2');
        drawIconWithText(colWidth, '🪟', '6');
        drawIconWithText(colWidth * 2, '⏱️', '5h'); */

        // 🔹 Footer con fecha
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Fecha de generación: ${fecha}`, 10, 285);

        // 🔹 QR
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
        
                  doc.addImage(url, 'PNG', pageWidth - 60, 200, 50, 50);  // 220
                  doc.setFontSize(10);
                  doc.setTextColor(100);
                  doc.text('Escaneá para más info', pageWidth - 35, 276, { align: 'center' });
        
                  if (shouldDownload) {
                    doc.save(`${budgetData.name}.pdf`);
                  }
        
                  const pdfBase64 = doc.output('datauristring');
                  resolve(pdfBase64);
                });
              };

        watermark.onerror = reject;
    });
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