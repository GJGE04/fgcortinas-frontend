import React, { useState, useEffect } from "react";
// import axios from "axios";
import { Form, Input, Button, Select, InputNumber, Row, Col, message, Space, Modal, Checkbox, Collapse, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import "jspdf-autotable";  // Asegúrate de importar el plugin de autoTable

import { getProducts } from "../api/productApi"; 
import { getTechnicians } from "../services/apiService";  
import { sendPDFToBackend } from "../services/emailService"; 
import { generatePDF } from '../services/pdfService'; // ajustá la ruta si es necesario
import { calculateSubtotal } from "../utils/calculos";
// import { useCallback } from "react";    // useCallback es un hook de React que te permite memorizar una función, es decir, evitar que se cree una nueva versión de esa función en cada render. 
                                        // Esto es útil en dos casos principales:
                                            // 1. Cuando pasás funciones como props a componentes hijos que dependen de referencialidad (optimización).
                                            // 2. Cuando querés evitar warnings como el que estás viendo, porque React puede "saber" si esa función cambió o no.

const { Panel } = Collapse;

// Inicializamos EmailJS con tu Public Key (User ID)
// emailjs.init('G10RHxIwl7yP1iew5');  // Aquí va tu public key

const BudgetForm = ({ work }) => {
    // Verifica que work no sea undefined
  console.log("work en BudgetForm:", work);  
  const workId = work ? work._id : null;     // Aquí accedes al ID del trabajo
  const clienteId = work ? work.cliente._id : null;
  const clienteName = work ? work.cliente.nombre : null;
  console.log("ID del trabajo:", workId); console.log("ID del cliente:", clienteId);

  // Asegúrate de que workId no sea undefined antes de intentar usarlo
  if (!workId) {
    // Maneja el error si el trabajo no tiene un ID
    console.error("No se encontró el ID del trabajo");
  }

  const [form] = Form.useForm();
  const [products, setProducts] = useState([{ productId: "", quantity: 0, width: 0, length: 0, price: 0, discount: 0, subtotal: 0, format: null, currency: '',
    habilitado: { quantityC: false, widthC: false, lengthC: false, priceC: false, discountC: false},
   }]);
  //const [totalUSD, setTotalUSD] = useState(0);
  //const [totalUYU, setTotalUYU] = useState(0);
  const [totals, setTotals] = useState({ USD: 0, UYU: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [technicians, setTechnicians] = useState([]);  // Técnicos

  const [cantidadHabilitado, setCantidadHabilitado] = useState(false);
  const [anchoHabilitado, setAnchoHabilitado] = useState(false);
  const [largoHabilitado, setLargoHabilitado] = useState(false);
  const [precioHabilitado, setPrecioHabilitado] = useState(false);
  const [descuentoHabilitado, setDescuentoHabilitado] = useState(false);

  const [generatePDFOption, setGeneratePDFOption] = useState(false);
  const [sendEmailOption, setSendEmailOption] = useState(false);
  
  // 1. Estado global para budgetData
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pendingBudgetData, setPendingBudgetData] = useState(null);

  // Función para calcular los subtotales y el total de todos los productos. // ✅ Función memorizada para evitar warning en useEffect
  /*const calculateTotals = useCallback((productsList = products) => {   // ✅ ¿Cómo evitar que React lo considere “nueva” cada vez?
                                                                      // Usando useCallback, que "memoriza" esa función y evita que se cree una nueva si no cambian sus dependencias.
    console.log('Entrando en calculateTotals:');
    let totalUSD = 0;
    let totalUYU = 0;

    // Recorremos los productos para calcular los totales
    productsList.forEach(product => {
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
  }, [products]);   */  // Asegúrate de incluir lo que uses dentro. // Se volverá a crear solo si cambia 'products'

  // El comportamiento exacto de cuándo se invoca useEffect depende de cómo lo configures:

  // 1. Por defecto (sin dependencias). 
  // Si useEffect se invoca sin un array de dependencias, se ejecuta después de cada renderizado del componente, 
  // es decir, cada vez que el componente se renderiza (incluyendo actualizaciones de estado y props).
  /*  Evitar useEffect sin dependencias innecesarias. En este caso el componente se renderice en cada cambio
  useEffect(() => {
    console.log("Componente renderizado");
  });  */

  // 2. Con dependencias específicas
  // Si le pasas un array de dependencias como segundo argumento a useEffect, este solo se ejecutará cuando alguna de esas dependencias cambie.
  // ✅ Efecto que se ejecuta cuando cambia 'products'
  /* useEffect(() => {
    console.log("El estado o props han cambiado");

    calculateTotals();
  }, [products, calculateTotals]);  */ // Recalcular totales cada vez que los productos cambian. 
  //                                // Aunque conceptualmente parece que calculateTotals no cambia, React no lo sabe hasta que lo memorices con useCallback. Por eso la incluimos en el array de dependencias del useEffect.

  // 3. Solo al montar y desmontar
  // Si el array de dependencias está vacío [], useEffect solo se ejecutará una vez, después de que el componente se haya montado, 
  // y no se ejecutará en actualizaciones posteriores. Este comportamiento es útil para realizar tareas como obtener datos solo una vez.
  useEffect(() => {
    console.log("Componente montado");

    const fetchData = async () => {
      try{
        // Técnicos
        const tecnicosData = await getTechnicians();
        // setTechnicians(tecnicosData || []);
        setTechnicians(tecnicosData.map(user => ({ value: user._id, label: `${user.username}` })));

        // Productos
        setLoadingProducts(true);  // Empieza la carga
        const productsData = await getProducts();           // Esta es la llamada que hace la API a productApi.js
        console.log('Datos de productos desde la API:', productsData);      // Verifica si los productos vienen de la API correctamente

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
              productType: product.productType ? product.productType.title : 'Desconocido',  // Título del tipo de producto
              format: product.productType ? product.productType.format : 'Desconocido'
            }
          });
          setAvailableProducts(transformedProducts); 
          console.log("Productos disponibles:", transformedProducts);
        } else {
            message.error("La respuesta de la API no contiene los productos.");
            console.error("Error al cargar los productos:");
        }
      } catch (error) {
        console.error("Error al cargar los técnicos o los productos:", error);

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
    }
    fetchData();    // Call to fetch technicians and products

    // TEST: forzar un modal al cargar
  Modal.confirm({
    title: "Test Modal",
    content: "¿Funciona esto?",
    okText: "Sí",
    cancelText: "No",
  });

  }, []);

  // ✅ Manejo de cambios por campo. // Función para manejar los cambios en los valores de cantidad, ancho, largo, descuento
  // ✅ Paso 1: Cada vez que cambiás un campo de un producto, actualizás el estado
  const handleProductDetailChange = (index, field, value) => {    // Cuando cambia un detalle del producto
    console.log('Entrando en handleProductDetailChange:');

    // Crea una copia del estado de productos
 /*   const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    const productToUpdate = products[index]; 
    if (!productToUpdate) return;

    updateProduct(productToUpdate);
    console.log("ProductsOut: ", products);

    // ó
*/
    setProducts(prevProducts => {   // prevProducts es el estado anterior (el array de productos actual).
      const updatedProducts = [...prevProducts];

      // Actualizar el campo cambiado
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value
      };

      // Calcular el nuevo subtotal
      updatedProducts[index].subtotal = calculateSubtotal(updatedProducts[index]);

      return updatedProducts;
    });
    console.log("ProductsOut: ", products);

  };

  // ✅ useEffect que calcula subtotales solo cuando cambia la data (previniendo loops infinitos)
  // ✅ Paso 2: useEffect recalcula subtotales automáticamente
  useEffect(() => {   // Se dispara cada vez que products cambia
    console.log("recalcular el subtotal cada vez que los productos cambien...");  /*
    const updatedProducts = products.map(product => {
      const area = product.width * product.length;
      const discount = product.discount || 0;
      const subtotal = ((product.price * area * product.quantity) * (1 - discount / 100)).toFixed(2); 
      console.log("Area", area);  console.log("Disc.", discount);   console.log("subtotal.", subtotal); 

      return { ...product, subtotal: isNaN(subtotal) ? 0 : parseFloat(subtotal) };
    }); 
    console.log("updatedProducts: ", updatedProducts)

    // ⚠️ Solo actualizamos si realmente cambió el subtotal para evitar loops
    const isDifferent = JSON.stringify(products) !== JSON.stringify(updatedProducts);
    if (isDifferent) setProducts(updatedProducts);    // <- solo actualiza si realmente cambió
    console.log("Different", isDifferent);  */


    const totalUSD = products.filter(p => p.currency === "USD").reduce((acc, p) => acc + p.subtotal, 0);
    const totalUYU = products.filter(p => p.currency === "UYU").reduce((acc, p) => acc + p.subtotal, 0);
    setTotals({ USD: totalUSD, UYU: totalUYU });  
    console.log("USD", totalUSD);   console.log("UYU", totalUYU);
  }, [products]); // ✅ ¿Y cómo se activa eso?  ->  Cada vez que cambiás un valor en el formulario: (handleProductDetailChange)
  

  // funcion que sustituye el useEffect anterior para optimizar para recalcular solo el producto modificado, en lugar de recalcular todo el array de productos.
  const updateProduct = (updatedProduct) => {

    console.log("updatedProduct", updatedProduct);
    const subtotal = calculateSubtotal(updatedProduct);
  
    const newProduct = { 
      ...updatedProduct, 
      subtotal: isNaN(subtotal) ? 0 : parseFloat(subtotal) 
    };     
    console.log("ID", newProduct.productId);  console.log("NewProduct", newProduct); console.log("Product1: ", products);
  
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.productId === newProduct.productId ? newProduct : product
      )
    );
  };
  
  // Función que maneja los cambios en los productos
  const handleProductChange = (index, field, value) => {
    console.log('Entrando en handleProductChange:');

    const foundProduct = availableProducts.find(product => product.value === value);
    console.log("FoundProduct: ", foundProduct);
    // setSelectedProduct(foundProduct); // sigue actualizando el estado global si lo necesitás
    console.log("ProductType title:", foundProduct.productType);
    console.log("ProductType format:", foundProduct.format);

    // Crea una copia del estado de productos
    const updatedProducts = [...products];  
    console.log(...products);
    console.log("updatedProducts: ", updatedProducts);

    updatedProducts[index].productId = value;
    updatedProducts[index].price = foundProduct.price;
    updatedProducts[index].currency = foundProduct.currency || 'USD';
    updatedProducts[index].format = foundProduct.format || 'null';

    // Actualiza el estado de los productos
    setProducts(updatedProducts);
    console.log("updatedProducts: ", updatedProducts)

    // habilitarCantidad(); habilitarPrecio(); habilitarDescuento(); 
    // Primero, deshabilitamos todo
    updatedProducts[index].habilitado = {
      quantityC: false,
      widthC: false,
      lengthC: false,
      priceC: false,
      discountC: false,
    };   // priceC: false, discountC
    
    switch (foundProduct.format) {
      case "Unidad":
        // subtotal = price * quantity;
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        break;
      case "Ancho x Largo":
        //habilitarAncho();
        //habilitarLargo();
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        updatedProducts[index].habilitado.widthC = true;
        updatedProducts[index].habilitado.lengthC = true;
        break;
      case "Lado * Lado x Precio":
        //habilitarLargo();
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        updatedProducts[index].habilitado.lengthC = true;
        break;
      case "Unidad x Largo":
        //habilitarLargo();
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        updatedProducts[index].habilitado.lengthC = true;
        break;
      default:
        console.warn(`Formato no reconocido: ${foundProduct.format}`);
        // subtotal = 0;
        break;
    }

    // Calcular el subtotal por producto
    //updatedProducts[index].subtotal = 5; //= calculateSubtotal(updatedProducts[index]);

    setProducts(updatedProducts);
    
    /*
    // calculateTotals(updatedProducts);
    calculateTotals();
    */
  };

  // Función que maneja los cambios en los productos
  const handleProductChangeOld = (index, field, value) => {
    console.log('Entrando en handleProductChange:');
    // Crea una copia del estado de productos
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    // Si el campo es productId, actualiza también el precio y la moneda
    if (field === 'productId') {
      const selectedProduct = availableProducts.find(product => product.value === value);
      updatedProducts[index].price = selectedProduct ? selectedProduct.price : 0; // Ajusta según la estructura del producto
      updatedProducts[index].currency = selectedProduct ? selectedProduct.currency : 'USD';

      // console.log(availableProducts);
      // ✅ Mostrar el título y el formato del tipo de producto
     // if (selectedProduct?.productType && selectedProduct?.format) {
        console.log("ProductType title:", selectedProduct.productType);
        console.log("ProductType format:", selectedProduct.format); // 🎯 esto es lo que querés
      //}
    }
    // Actualiza el estado de los productos
    setProducts(updatedProducts);
    
    // calculateTotals(updatedProducts);
    // calculateTotals();
  };

  const habilitarCantidad = () => { setCantidadHabilitado(true); };
  const habilitarAncho = () => { setAnchoHabilitado(true); };
  const habilitarLargo = () => { setLargoHabilitado(true); };
  const habilitarPrecio = () => { setPrecioHabilitado(true); };
  const habilitarDescuento = () => { setDescuentoHabilitado(true); };   

  // Función para agregar un nuevo producto
  const addProduct = () => {
    setProducts([
      ...products,
      { productId: "", quantity: 0, width: 0, length: 0, price: 0, discount: 0, subtotal: 0, 
        habilitado: { quantityC: false, widthC: false, lengthC: false, priceC: false, discountC: false}, }
    ]);
  };

  // Función para eliminar un producto
  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    // calculateTotals(updatedProducts);
  };

  // Handle cancel and close the modal
  const handleCancel = () => {
    form.resetFields();
    setProducts([{ productId: "", quantity: 1, width: 0, length: 0, price: 0, discount: 0, subtotal: 0 }]);
    //setTotalUSD(0);
    //setTotalUYU(0);
  };

    const handleSubmit = async (values) => {
      console.log("Ejecutando handleSubmit...");  
      console.log ("Values: " , values);        // Asegúrate de recibir los valores correctamente
      // Recopilamos todos los datos del formulario
      // const { name, address, description, technicianId } = values;
      const {name} = values;

      console.log ("Tecnicos: " , technicians); 
      console.log(name);
      const tecnicoSeleccionadoId = form.getFieldValue('technicianId');
      const tecnicoSeleccionado = technicians.find(t => t.value === tecnicoSeleccionadoId);
      const tecnicoName = tecnicoSeleccionado.label
      console.log("Tecnico: " , tecnicoName);

      if (products.length === 0 || products.some(p => !p.productId)) {
        console.error("Debe agregar al menos un producto válido al presupuesto.");
        message.warning("Debe agregar al menos un producto válido al presupuesto.");
        setLoading(false);
        return;
      }      

      // if (loading) return;
      // setLoading(true);

      const budgetData = {
        ...values,
        products,
        totals: {
          UYU: (totals.UYU && !isNaN(totals.UYU)) ? totals.UYU.toFixed(2) : '0.00',   // totalUYU,
          USD: (totals.USD && !isNaN(totals.USD)) ? totals.USD.toFixed(2) : '0.00',   // totalUSD,
        }, 
        clienteName,
        tecnicoName
      };

      console.log("BudgetData: ", budgetData);
      console.log(showPDFModal);
      // Mostramos modal de confirmación
      setPendingBudgetData(budgetData);   // Guardamos fuera del scope
      setShowPDFModal(true);              // Mostramos el modal
    };

    const handleSubmit2 = () => {
      form.validateFields().then(values => {
        if (products.length === 0) {
          return message.warning("Agrega al menos un producto.");
        }
  
        const invalid = products.some(p => p.width <= 0 || p.length <= 0 || p.price <= 0);
        if (invalid) {
          return message.warning("Todos los productos deben tener dimensiones y precios válidos.");
        }
  
        if (generatePDFOption) {
          console.log("Generar PDF con:", { values, products });
          message.success("PDF generado.");
        }
  
        if (sendEmailOption) {
          if (!values.email) {
            return message.warning("Debes ingresar un correo electrónico.");
          }
          console.log("Enviar correo con:", { email: values.email, products });
          message.success("Correo enviado.");
        }
      }).catch(() => {
        message.error("Faltan campos obligatorios.");
      });
    }; 

    const handleGeneratePDF = async () => { 
      console.log(" generar PDF!!!!")
      setShowPDFModal(false);
      setLoading(true);
      try {
        console.log("PendingBudgetData");
        console.log(pendingBudgetData);
        await processBudget(pendingBudgetData);
        message.success("Presupuesto generado correctamente.");
        form.resetFields();
        handleCancel(); // o lo que uses para cerrar el form
      } catch (error) {
        console.error("Error al generar PDF:", error);
        message.error("Error al generar el presupuesto.");
      } finally {
        setLoading(false);
        setPendingBudgetData(null);
      }
    };
    
    const handleCancelPDF = () => {
      setShowPDFModal(false);
      setPendingBudgetData(null);
    };  

    const processBudget = async (budgetData) => {
      let pdfBase64 = null;
      // Si la opción de generar PDF está activada. // Generar PDF y obtener el pdfData (Blob)
      if (generatePDFOption) {
        console.log(budgetData);
        console.log("1234... invocando  generatePDF...")
        pdfBase64  = await generatePDF(budgetData);
      }   
      // Si la opción de enviar por correo está activada. // Enviar por correo si se seleccionó la opción
      if (sendEmailOption && pdfBase64 && budgetData.email) {
        await sendPDFToBackend(pdfBase64, budgetData);

        // sendEmailWithPDF(pdfData, budgetData);   (envío desde el frontend)  o  sendBudgetEmail(budgetData, pdfBase64);     (envio desde el backend)  

        // vrios remitentes:
            /*
            await sendPDFToBackend(pdfBase64, {
              ...budgetData,
              email: values.emails,           // puede ser string separado por comas o array
              subject: values.subject,        // asunto personalizado desde un input
              message: values.message,        // mensaje opcional
            }); */

            /*  Tu frontend podrá ahora llamar:
            await sendPDFToBackend(pdfBase64, {
              email: 'cliente1@gmail.com, cliente2@gmail.com',
              subject: 'Presupuesto para su proyecto',
              message: '¡Gracias por confiar en nosotros! Adjunto presupuesto.',
              name: 'Presupuesto #124',
            });
            */  
      }
    
      message.success("Presupuesto guardado y enviado correctamente!");
      form.resetFields();
      handleCancel();
    };   

    const handlePreviewPDF = () => {
      // lógica para generar el PDF sin enviarlo
      console.log("Vista previa PDF generada");
      // exportToPDF({ preview: true }); // si querés diferenciar
    };    

    // Función para manejar cambios en las opciones de generar PDF y enviar correo
    const handleGeneratePDFChange = (e) => setGeneratePDFOption(e.target.checked);
    const handleSendEmailChange = (e) => setSendEmailOption(e.target.checked);
    
  return (
    <div>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>    {/* Aquí la invocación automática de handleSubmit */}
          {/* Scroll horizontal en pantallas chicas */}
          <div style={{ overflowX: 'auto' }}>
            <Collapse defaultActiveKey={['1', '2']} accordion>
              {/* Datos generales */}
              <Panel header="Datos Generales del Presupuesto" key="1">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item 
                      label="Nombre" 
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
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Dirección" name="address">
                      <Input placeholder="Dirección" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item 
                      label="Email" 
                      name="email"
                      rules={[
                        {
                          type: 'email',
                          message: 'Por favor ingresa un correo válido',
                        },
                      ]}
                      tooltip="Correo del cliente para enviar el presupuesto"
                    >
                      <Input placeholder="cliente@correo.com" />
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
              </Panel>
              
              {/* Productos */}
              <Panel header="Productos Seleccionados" key="2">
                {/* Aquí todo lo relacionado a productos, addProduct, subtotal, total, etc */}
                <h3>Seleccionar Producto</h3>
                {products.map((product, index) => (
                  //<div key={index} style={{ marginBottom: 24 }}>   sección de productos sea scrollable en pantallas chicas:
                  <div style={{ overflowX: 'auto' }}>  
                    {/*<Row gutter={16} align="middle">*/}
                    {/*<Row gutter={16} wrap={false} style={{ minWidth: 800 }}>*/}
                    <Row gutter={16} key={index} style={{ minWidth: 800, marginBottom: 16 }}>
                      {/* Producto y otros controles */}
                      <Col span={5}>
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
                            onChange={(value) => handleProductDetailChange(index, 'quantity', value)} // Eso modifica el producto en la lista → se actualiza products → se dispara el useEffect → se recalcula subtotal y totales automáticamente.
                            min={1}
                            style={{ width: "100%" }}
                            // disabled={!cantidadHabilitado}
                            disabled={!(product.habilitado && product.habilitado.quantityC)}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item label="Ancho (m)">
                          <InputNumber
                            value={product.width}
                            onChange={(value) => handleProductDetailChange(index, 'width', value)}
                            min={0}
                            style={{ width: "100%" }}
                            addonAfter={'mts'}
                            // disabled={!anchoHabilitado}
                            disabled={!(product.habilitado && product.habilitado.widthC)}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item label="Largo (m)">
                          <InputNumber
                            value={product.length}
                            onChange={(value) => handleProductDetailChange(index, 'length', value)}
                            min={0}
                            style={{ width: "100%" }}
                            addonAfter={'mts'}
                            // disabled={!largoHabilitado}
                            disabled={!(product.habilitado && product.habilitado.lengthC)}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item label="Precio / m²" required>
                          <InputNumber
                            // value={`${product.price} ${product.currency === 'USD' ? 'USD' : 'UYU'}`} // Muestra la moneda
                            value={product.price}
                            onChange={(value) => handleProductDetailChange(index, 'price', value)}    // Este es el caso si quieres que el precio sea editable
                            min={0}
                            style={{ width: "100%" }}
                            // disabled={true}  // Dejarlo como "true" si no quieres que el usuario lo modifique, pero lo mantienes actualizado.
                            addonAfter={product.currency === 'USD' ? 'USD' : 'UYU'}
                            // disabled={!precioHabilitado}
                            disabled={!(product.habilitado && product.habilitado.priceC)}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item label="Desc. (%)">
                          <InputNumber
                            value={product.discount}
                            onChange={(value) => handleProductDetailChange(index, 'discount', value)}
                            min={0}
                            max={100}
                            style={{ width: "100%" }}
                            addonAfter={'%'}
                            // disabled={!descuentoHabilitado}
                            disabled={!(product.habilitado && product.habilitado.discountC)}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                          <Form.Item label="Subtotal">
                              <Input
                                  value={product.subtotal} 
                                  disabled
                                  style={{ width: '100%' }}
                                  addonAfter={product.currency === 'USD' ? 'USD' : 'UYU'}
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

                {/* Botón para agregar producto */}
                <Row justify="end" style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addProduct}
                    style={{
                      backgroundColor: '#4CAF50',
                      borderColor: '#4CAF50',
                      fontWeight: 'bold',
                    }}
                  >
                    Agregar Producto
                  </Button>
                </Row>

                <Row gutter={16} style={{ marginTop: 10 }}>
                  {/* Total en USD */}
                  <Col span={6}>
                    <label style={{ fontWeight: '500' }}><strong>Total (USD)</strong></label>
                    <Input
                      value={totals.USD.toFixed(2)}    // totalUSD
                      disabled
                      addonBefore="$"
                      style={{
                        width: '100%',
                        textAlign: 'right',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: '#f5f5f5',
                        borderColor: '#4CAF50',
                      }}
                    />
                  </Col>

                  {/* Total en UYU */}
                  <Col span={6}>
                    <label style={{ fontWeight: '500' }}><strong>Total (UYU)</strong></label>
                    <Input
                      value={totals.UYU.toFixed(2)}   // totalUYU
                      disabled
                      addonBefore="$U"
                      style={{
                        width: '100%',
                        textAlign: 'right',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: '#f5f5f5',
                        borderColor: '#2196F3',
                      }}
                    />
                  </Col>
                </Row>
              </Panel>
              
              {/* Opciones adicionales */}
              <Panel header="Opciones Adicionales" key="3">

                {/* Opciones de generar PDF y enviar por correo */}
                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col>
                    <Checkbox onChange={handleGeneratePDFChange}>Generar PDF</Checkbox>
                  </Col>
                  <Col>
                    <Tooltip title={!form.getFieldValue('email') ? 'Ingresa un correo para poder enviar' : ''}>
                      <Checkbox
                        onChange={handleSendEmailChange}
                        disabled={!form.getFieldValue('email')}
                      >
                        Enviar por correo
                      </Checkbox>
                    </Tooltip>
                  </Col>
                  <Col>
                    <Form.Item label="Email (opcional)" name="email">
                      <Input placeholder="ejemplo@correo.com" />
                    </Form.Item>
                  </Col>
                </Row>

              </Panel>

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

            </Collapse>

            <Space style={{ marginTop: 16 }} align="center" size="large">
              <Button onClick={handleCancel} icon={<CloseOutlined />} size="large" style={{ width: "120px", backgroundColor: "#f44336", color: "white" }}>
                Cancelar
              </Button>

              <Button type="primary" htmlType="submit" 
              // onClick={showConfirmationModal} 
              onClick={() => {setShowPDFModal(); }} 
              icon={loading ? <LoadingOutlined /> : <PlusOutlined />} 
                size="large" style={{ width: "120px" }}>
                {loading ? 'Cargando' : 'Presupuestar'}
              </Button>

              <Button
                onClick={handlePreviewPDF}
                icon={<EyeOutlined />}
                size="large"
                style={{ width: "160px", backgroundColor: "#1976D2", color: "white" }}
              >
                Vista Previa PDF
              </Button>
            </Space>
          </div>
        </Form>

      {/* 🔻 Agregás el modal acá, al final del return */}
      <Modal
        title="¿Generar PDF del presupuesto?"
        open={showPDFModal}
        // icon: <ExclamationCircleOutlined />,
        // content= "Esto es solo una prueba."
        onOk={handleGeneratePDF}      // onOk: () => console.log("OK"),
        onCancel={handleCancelPDF}    // onCancel: () => console.log("Cancelado"),
        okText="Sí, generar"
        cancelText="Cancelar"
      >
        <p>¿Desea generar y descargar el presupuesto en PDF?</p>
      </Modal>

    </div>
    );
};

export default BudgetForm;