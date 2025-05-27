import React, { useState, useEffect } from "react";
// import axios from "axios";
import { Form, Button, Row, Col, message, Space, Modal, Checkbox, Collapse, Tooltip } from "antd";  // Input, 
import { PlusOutlined, LoadingOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';      // DeleteOutlined, 
import "jspdf-autotable";  // Asegúrate de importar el plugin de autoTable
import { notification } from 'antd';
import 'primereact/resources/themes/lara-light-indigo/theme.css';   // Tema de PrimeReact
import 'primereact/resources/primereact.min.css';                   // Estilos generales de PrimeReact
import 'primeicons/primeicons.css';                                 // Iconos de PrimeReact
// import ProductsPanel from './components/BudgetForm/ProductsPanel';
import ProductsPanel from './BudgetForm/ProductsPanel';             // arreglar url en verison final
import SchedulePanel from './BudgetForm/VisitSchedulingPanel';
import GeneralDataPanel from './BudgetForm/GeneralDataPanel';
import ResumenPanel from './BudgetForm/ResumenPanel';               // ajusta el path si es necesario
import EventModal from './BudgetForm/EventModal'; 
import { getProducts } from "../api/productApi"; 
import { getTechnicians } from "../services/apiService";  
import { generatePDF } from '../services/pdfService';               // ajustá la ruta si es necesario
import { sendPDFToBackend } from "../services/emailService"; 
import { createBudget } from "../services/budgetService";
// import { sendWhatsAppMessage } from '../services/whatsappService';
import { calculateSubtotal } from "../utils/calculos";  
import "../css/CalendarioVisitas.css";

// import { useCallback } from "react";    // useCallback es un hook de React que te permite memorizar una función, es decir, evitar que se cree una nueva versión de esa función en cada render. 
                                        // Esto es útil en dos casos principales:
                                            // 1. Cuando pasás funciones como props a componentes hijos que dependen de referencialidad (optimización).
                                            // 2. Cuando querés evitar warnings como el que estás viendo, porque React puede "saber" si esa función cambió o no.

// import esLocale from '@fullcalendar/core/locales/es';        
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';                               
const { Panel } = Collapse;

// const clientIdgoogle = '624383334135-n745f2bncl6ucgsmnls4hlvujmmohk51.apps.googleusercontent.com';  // Reemplaza con tu Client ID de Google
// Inicializamos EmailJS con tu Public Key (User ID)
// emailjs.init('G10RHxIwl7yP1iew5');  // Aquí va tu public key

const BudgetForm = ({ work, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados de selección de cliente y técnicos
  // const [client, setClient] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  // 1. Estado global para budgetData
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pendingBudgetData, setPendingBudgetData] = useState(null);
  // 2. Opciones seleccionadas por el usuario
  const [generatePDFOption, setGeneratePDFOption] = useState(false);  // true
  const [sendEmailOption, setSendEmailOption] = useState(false);      // true
  // const [sendWhatsAppOption, setSendWhatsAppOption] = useState(false);

  // Row Productos
  const [products, setProducts] = useState([{ 
    productId: "", quantity: 1, width: 0, length: 0, price: 0, discount: 0, subtotal: 0, format: null, currency: '',  // 👍 Ya bien seteado
    habilitado: { quantityC: false, widthC: false, lengthC: false, priceC: false, discountC: false},
   }]);
  //const [totalUSD, setTotalUSD] = useState(0);
  //const [totalUYU, setTotalUYU] = useState(0);
  const [totals, setTotals] = useState({ USD: 0, UYU: 0 });
  const [availableProducts, setAvailableProducts] = useState([]); 

   // Al principio de tu componente, nuevos estados:
   const [calendarEvents, setCalendarEvents] = useState([]);
   const [selectedEvent, setSelectedEvent] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   // Estados necesarios
  const [activePanelKey, setActivePanelKey] = useState(1); // 1 = Panel 1, 2 = Panel 2
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [newQuote, setNewQuote] = useState({
    visitDate: "",
    // podés agregar más campos si los necesitás
  });
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  
  console.log("work en BudgetForm:", work);     // Verifica que work no sea undefined   
  const workId = work ? work._id : null;        // Aquí accedes al ID del trabajo. // console.log("ID del trabajo:", workId); console.log("ID del cliente:", clienteId);
  const client = work?.cliente ? { 
    id: work.cliente._id, 
    name: work.cliente.nombre,
    direccion: work.cliente?.direcciones?.[0] || '',
    // address: work.cliente.direccion || '',
    email: work.cliente?.correos || '',
    phones: work.cliente.telefonos || []
  } : null;

  // Asegúrate de que workId no sea undefined antes de intentar usarlo
  if (!workId) {
    // Maneja el error si el trabajo no tiene un ID
    console.error("No se encontró el ID del trabajo");
  }

  // Técnicos
  // En BudgetForm.jsx
  // const [description, setDescription] = useState('');
  // const [client, setClient] = useState(null); // o cliente ya cargado

  // Función para calcular los subtotales y el total de todos los productos. // ✅ Función memorizada para evitar warning en useEffect
  /*const calculateTotals = useCallback((productsList = products) => {   // ✅ ¿Cómo evitar que React lo considere “nueva” cada vez?
                                                                      // Usando useCallback, que "memoriza" esa función y evita que se cree una nueva si no cambian sus dependencias.
    console.log('Entrando en calculateTotals:');
    let totalUSD = 0; let totalUYU = 0;

    // Recorremos los productos para calcular los totales
    productsList.forEach(product => {
      if (product.currency === 'USD') {
        totalUSD += product.subtotal; // O usa la lógica que ya tengas para calcular el subtotal
      } else {
        totalUYU += product.subtotal; // Lo mismo aquí para UYU
      }
    });
    console.log("A : " + totalUSD);   console.log("B : " + totalUYU);
    // Actualizamos los valores de los totales
    setTotalUSD(totalUSD);  setTotalUYU(totalUYU);
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

  // Efecto para cargar técnicos y productos al montar
  useEffect(() => {
    // console.log("Componente montado");
    const fetchData = async () => {
      try{
        const tecnicosData = await getTechnicians();      // Técnicos
        // setTechnicians(tecnicosData || []);
        setTechnicians(tecnicosData.map(user => ({ value: user._id, label: `${user.username}` })));  // ó label: user.username

        // Productos
        setLoadingProducts(true);  // Empieza la carga
        const productsData = await getProducts();           // Esta es la llamada que hace la API a productApi.js
        // console.log('Datos de productos desde la API:', productsData);      // Verifica si los productos vienen de la API correctamente
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
              // productType: product.productType ? product.productType.title : 'Desconocido',  // Título del tipo de producto
              // format: product.productType ? product.productType.format : 'Desconocido'
              productType: product.productType?.title || 'Desconocido',
              format: product.productType?.format || 'Desconocido'
            }
          });
          setAvailableProducts(transformedProducts); 
          // console.log("Productos disponibles:", transformedProducts);
        } else {
            message.error("La respuesta de la API no contiene los productos.");
            console.error("No se encontraron productos.");
        }
      } catch (error) {
        console.error("Error al cargar los técnicos o los productos:", error);

        // Manejo de errores
        if (error.response && error.response.status === 401) {
          message.error("No autorizado. Por favor, inicia sesión nuevamente.");
          console.error("Respuesta de error:", error.response);
        } else {
            message.error("No se pudo cargar los productos o los técnicos.");
            console.error("Error sin respuesta de la API:", error);
        } 
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchData();    // Call to fetch technicians and products
    // TEST: forzar un modal al cargar
/*  Modal.confirm({
    title: "Test Modal",
    content: "¿Funciona esto?",
    okText: "Sí",
    cancelText: "No",
  }); */
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/calendar/events`);  
        const data = await res.json();
  
        const formattedEvents = data.events.map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          description: event.description,
          backgroundColor: "#1976d2", // o el color que prefieras
        }));
  
        setCalendarEvents(formattedEvents);
        console.log("📅 Eventos cargados:", formattedEvents);
      } catch (error) {
        console.error("❌ Error cargando eventos:", error);
      }
    };
  
    fetchEvents();
  }, []);

  /* agregar temporalmente esto en el componente principal para depurar. Form.useWatch("description", form) para inspeccionar si description realmente cambia
  const watchedDescription = Form.useWatch('description', form);
  useEffect(() => {
    console.log("👀 description actualizado:", watchedDescription);
  }, [watchedDescription]);
*/
  // EFECTO NUEVO: Cuando cambian work o technicians, actualizo el cliente y seteo los valores del formulario
/*  useEffect(() => {
    if (work) {
      // Setear cliente en estado local para poder pasar como prop
      if (work.cliente) {
        setClient({ id: work.cliente._id, name: work.cliente.nombre });
      }

      // Setear técnicos seleccionados en el formulario (ejemplo, si work tiene técnicos asignados)
      if (work.tecnicos && technicians.length > 0) {
        // Aquí convierto IDs o datos del work a la estructura que espera el form
        const selectedTechs = technicians.filter(t => work.tecnicos.includes(t.value));
        form.setFieldsValue({
          clientId: work.cliente?._id || null,
          technicians: selectedTechs.map(t => t.value),
          // Aquí otros campos que quieras autocompletar
          visitDate: work.visitDate || null,
          description: work.description || '',
          products: work.products || [],  // si aplicara
        });
      } else {
        // Si no hay técnicos o work.tecnicos, seteo cliente y demás igualmente
        form.setFieldsValue({
          clientId: work.cliente?._id || null,
          visitDate: work.visitDate || null,
          description: work.description || '',
          products: work.products || [],
        });
      }
    }
  }, [work, technicians, form]); */
  // ✅ Cuando se abre el formulario con un trabajo seleccionado
  useEffect(() => {
    /*
    if (work && form && work?.tecnicos?.length > 0) {
      const techIds = work.tecnicos.map(t => t._id);
      form.setFieldsValue({
        cliente: client?.name || '',
        name: `Presupuesto - ${client.name}`,
        direccion: client?.direccion || '',
        email: client?.email || '',
        technicianIds: techIds
      });
    } */
      if (client) {
        console.log("Cliente en BudgetForm:", work);
        const clientAddresses = work?.cliente?.direcciones || [];
        const clientEmails = work?.cliente?.correos || [];
        const clientPhones = work?.cliente?.telefonos || [];
    
        form.setFieldsValue({
          clientId: client.id,
          clientName: client.name,
          name: `Presupuesto ${client.name}`,
          technicianIds: work?.tecnicos?.map(t => t._id) || [],
          address: clientAddresses[0] || '',
          email: clientEmails[0] || '',
          phones: clientPhones.join(', ') || ''  // Campo nuevo
        });
      }
  }, [work, client, form]);

  // ✅ Manejo de cambios por campo. // Función para manejar los cambios en los valores de cantidad, ancho, largo, descuento
  // ✅ Paso 1: Cada vez que cambiás un campo de un producto, actualizás el estado
  const handleProductDetailChange = (index, field, value) => {    // Cuando cambia un detalle del producto
    // console.log('Entrando en handleProductDetailChange:');
    // const safeValue = field === 'quantity' ? Math.max(1, value || 1) : value;

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
        [field]: value    // = safeValue
      };
      updatedProducts[index].subtotal = calculateSubtotal(updatedProducts[index]);    // Calcular el nuevo subtotal
      return updatedProducts;
    });
  };
  // ✅ useEffect que calcula subtotales solo cuando cambia la data (previniendo loops infinitos)
  // ✅ Paso 2: useEffect recalcula subtotales automáticamente
  useEffect(() => {   // Se dispara cada vez que products cambia
    console.log("recalcular el subtotal cada vez que los productos cambien...");  
  /*  const updatedProducts = products.map(product => {
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
    // console.log("USD", totalUSD);   console.log("UYU", totalUYU);
  }, [products]); // ✅ ¿Y cómo se activa eso?  ->  Cada vez que cambiás un valor en el formulario: (handleProductDetailChange)
  
  // funcion que sustituye el useEffect anterior para optimizar para recalcular solo el producto modificado, en lugar de recalcular todo el array de productos.
/*  const updateProduct = (updatedProduct) => {
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
  };  */

  // Función que maneja los cambios en los productos
  const handleProductChange = (index, field, value) => {
    const foundProduct = availableProducts.find(product => product.value === value);
    if (!foundProduct) return;

    // ✅ Mostrar el título y el formato del tipo de producto
      console.log("ProductType title:", foundProduct.productType);
      console.log("ProductType format:", foundProduct.format); // 🎯 esto es lo que querés
  
    const updatedProducts = [...products];    // Crea una copia del estado de productos
    updatedProducts[index] = {
      ...updatedProducts[index],
      productId: value,
      name: foundProduct.label,
      price: foundProduct.price,
      currency: foundProduct.currency || 'USD',
      format: foundProduct.format || null,
      habilitado: {     // Primero, deshabilitamos todo
        quantityC: false,
        widthC: false,
        lengthC: false,
        priceC: false,
        discountC: false,
      },
    };
  
    switch (foundProduct.format) {
      case "Unidad":
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        break;
      case "Ancho x Largo":
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        updatedProducts[index].habilitado.widthC = true;
        updatedProducts[index].habilitado.lengthC = true;
        break;
      case "Lado * Lado x Precio":
      case "Unidad x Largo":
        updatedProducts[index].habilitado.quantityC = true;
        updatedProducts[index].habilitado.priceC = true;
        updatedProducts[index].habilitado.discountC = true;
        updatedProducts[index].habilitado.lengthC = true;
        break;
      default:
        console.warn(`Formato no reconocido: ${foundProduct.format}`);
    }
  
    // Recalcular subtotal
    const q = updatedProducts[index].quantity ?? 1;
    const w = updatedProducts[index].width ?? 1;
    const l = updatedProducts[index].length ?? 1;
    const p = updatedProducts[index].price ?? 0;
    const d = updatedProducts[index].discount ?? 0;
  
    let area = 1;
    switch (foundProduct.format) {
      case "Ancho x Largo":
        area = w * l;
        break;
      case "Lado * Lado x Precio":
      case "Unidad x Largo":
        area = l;
        break;
      default:
        area = 1;
    }
  
    const subtotal = q * area * p * (1 - d / 100);
    updatedProducts[index].subtotal = parseFloat(subtotal.toFixed(2));
  
    setProducts(updatedProducts);     // Actualiza el estado de los productos
    // calculateTotals(updatedProducts);
  };  

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
    console.log("Cancelando el modal de crear presupuesto..."); 
    form.resetFields();
    setProducts([{ productId: "", quantity: 0, width: 0, length: 0, price: 0, discount: 0, subtotal: 0 }]);
    //setTotalUSD(0);   //setTotalUYU(0);
    setShowPDFModal(false);
    setPdfError(false); // ✅ También borramos el estado de error si el usuario cancela
    onClose();
  };

  const handleSubmit = async (values) => {
    console.log("📥 Enviar formulario con valores:", values);
    // Recopilamos todos los datos del formulario
        // const { name, address, description, technicianId } = values;
        //const {name} = values;
       // console.log ("Tecnicos: " , technicians); 
        //console.log(name);
        //console.log ("VALUES: " , values); 

    console.log("🟢 Entrando en handleSubmit con valores:", values);  // Acá deberías ver description
    console.log("✅ Formulario válido. Procesando datos...");  
    // console.log("🔍 Antes de validación, descripción:", values.description); 
    console.log("🧪 Campos del formulario:", form.getFieldsValue());
    // console.log("🧪 descriptionTest:", values.descriptionTest);
  
    // 1. Validación general...
    // 1.1 🔍 Validar que haya visita técnica. // Verificamos que tenga fecha/hora
    if (!newQuote.start || !newQuote.end) {
      message.error("Debes seleccionar una fecha y hora para la visita.");
        // alert("❗ Debes agendar una visita técnica antes de continuar.");
      return;
    }

    // 1.2 Asegurar descripción
    if (!values.description || values.description.trim() === "") {
      values.description = "Sin descripción";
      console.log("⚠️ Descripción estaba vacía, se reemplazó");
    }

    // const descripcionFinal = values.description?.trim() || "Sin descripción4";
    // console.log("descripcionFinal:", descripcionFinal);
  
    // 1.3 Validación de productos
    if (products.length === 0 || products.some(p => !p.productId)) {
      message.warning("Debe agregar al menos un producto válido al presupuesto.");
        console.error("Debe agregar al menos un producto válido al presupuesto.");
      return;
    }

    // 1.4 Reforzar cantidad mínima en productos. Asegurar que los productos tengan cantidad >= 1
    const productosValidados = products.map(p => ({
      ...p,
      quantity: p.quantity >= 1 ? p.quantity : 1
    }));
  
    try {
      // 2. Crear evento en Google Calendar
      await createCalendarEvent(newQuote);

      // continuar con guardar presupuesto, generar PDF, etc...
  
      // 3. Armar el presupuesto completo
      console.log ("VALUES: " , values);
      // const budgetData = buildBudgetData(values);
      const budgetData = buildBudgetData({
        ...values,
        products: productosValidados,
      });
      console.log("📦 Datos del presupuesto:", budgetData);
  
      // 4. Guardar presupuesto en la base de datos
      // const savedBudget = await handleSaveBudget(budgetData);
      // alert("✅ Presupuesto creado correctamente");
      await handleSaveBudget(budgetData);   
      // Opcional: resetear el formulario
  
      // 5. Guardar en estado para usarlo en el PDF
      // setPendingBudgetData(savedBudget);
      setPendingBudgetData(budgetData);   // ó  setPendingBudgetData(savedBudget);
  
      // 6. Mostrar modal de confirmación o ejecutar directamente
      // ✅ Mostrar modal solo si se marcó el checkbox
      if (generatePDF || sendEmailOption) {
        setShowPDFModal(true);      // 🔸 Muestra el modal de confirmación. // Abrimos modal o continuamos directo con processBudget
      } else {
        message.success("Presupuesto guardado correctamente.");   // 🔸 Guarda directo sin PDF
        onClose?.(); // o lo que uses para cerrar
      }
  
      message.success("✅ Visita agendada y presupuesto listo y registrado con éxito");
      // handleCancel(); // cerrar formulario
      // setShowPDFModal(false)
    } catch (error) {
      console.error("❌ Error en handleSubmit al enviar formulario:", error);
      message.error("Ocurrió un error al procesar el presupuesto.");
      alert("❌ Falló al guardar el presupuesto.");
    }
  };

  const createCalendarEvent = async (quote) => {
    console.log("Entrando en createCalendarEvent: " , quote);
    const tecnicoSeleccionadoId = form.getFieldValue('technicianId');
    const tecnicoSeleccionado = technicians.find(t => t.value === tecnicoSeleccionadoId);
    const tecnicoName = tecnicoSeleccionado?.label || 'Sin técnico';
    console.log("Tecnico: " , tecnicoName);      
    try{
      // (technicians.find(t => t.value === form.getFieldValue('technicianId')))?.label || 'Sin técnico'
      const eventData = {
        summary: 'Visita técnica',     // summary: `Visita técnica - ${clientName}`,
        // description: 'Agendada desde el formulario completo de FG Cortinas',
        description: `Visita técnica agendada para el cliente: ${client.name}, atendida por el técnico: ${tecnicoName}.`,
        // description: `Visita técnica para el cliente ${values.nombreCliente || 'sin nombre'}`,
        start: quote.start,
        end: quote.end,
      };
      console.log("eventData: " , eventData);
      // await axios.post('/api/calendar/create-event', eventData);  
      const result = await fetch(`${API_URL}/calendar/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!result.ok) {
        throw new Error(`Error HTTP: ${result.status}`);
      }
      
      const data = await result.json();
      console.log('✅ Evento agendado:', data);
      
      // console.log('✅ Evento agendado:', result.data);
    }
    catch (error) {
      console.error('❌ Error al agendar visita:', error);
      message.error('No se pudo agendar la visita técnica');
      return; // Evitamos continuar si falla
    }
  };

  const buildBudgetData = (values) => {
    /*
    const budgetData2 = {
      ...values,
      products,
      totals: {
        UYU: (totals.UYU && !isNaN(totals.UYU)) ? totals.UYU.toFixed(2) : '0.00',   // totalUYU,
        USD: (totals.USD && !isNaN(totals.USD)) ? totals.USD.toFixed(2) : '0.00',   // totalUSD,
      }, 
      
      // 🔹 Agregamos la visita técnica
      visita: {
        start: newQuote.start,
        end: newQuote.end,
      },
    }; 
    */
    return {
      work: workId,
      name: values.name,
      address: values.address,
      description: values.description,
      client: values.clientId,
      technician: values.technicianIds,
      clienteName: client?.name,          // Asegúrate de tener estos IDs en tu form
      tecnicoName: (technicians.find(t => t.value === form.getFieldValue('technicianId')))?.label || 'Sin técnico',
      totalUYU: Number(totals.UYU),
      totalUSD: Number(totals.USD),
      totals: {
        UYU: (totals.UYU && !isNaN(totals.UYU)) ? totals.UYU.toFixed(2) : '0.00',   // totalUYU,
        USD: (totals.USD && !isNaN(totals.USD)) ? totals.USD.toFixed(2) : '0.00',   // totalUSD,
      }, 
      creationDate: new Date().toISOString(),
      products: products.map(p => ({
        product: p.productId,
        quantity: p.quantity,
        width: p.width,
        length: p.length,
        discount: p.discount || 0,
        subtotal: p.subtotal || 0,
      })), 
      email: values.email,
  /*    clientPhone: values.clientPhone,
      // 🔹 Agregamos la visita técnica
      visita: {
        start: newQuote.start,
        end: newQuote.end, 
      } */
    };
  };

  const handleSaveBudget = async (data) => {
    try {
      const saved = await createBudget(data);
      console.log("✅ Presupuesto guardado:", saved);
      return saved;
    } catch (error) {
      console.error("❌ Error al guardar presupuesto:", error.response?.data || error.message);
      throw error;
    }
  };

  const handleGeneratePDF = async () => { 
    console.log("📝 Confirmado: generar PDF!!!!"); 
      setShowPDFModal(false);
      setLoading(true);
      try {
        console.log("📄 Generando PDF para presupuesto. PendingBudgetData:", pendingBudgetData);
        await processBudget(pendingBudgetData);
        message.success("Presupuesto generado correctamente.");

        // Si el envío fue exitoso:
        form.resetFields();   // <-- Esto limpia todos los campos
        // handleCancel();    // o lo que uses para cerrar el form
        onClose();            // <-- Esto cierra el modal principal
      } catch (error) {
        console.error("❌ Error al generar PDF del presupuesto:", error);
        message.error("Error al generar el presupuesto.");
      } finally {
        setLoading(false);
        setPendingBudgetData(null);   // limpiar
      }
    };

    const processBudget = async (budgetData) => {
      setPdfProcessing(true); // 🔄 Mostrar spinner
      setPdfError(false); // 🔄 Resetear estado de error al comenzar
      let pdfBase64 = null;

      // Si la opción de generar PDF está activada. // Generar PDF y obtener el pdfData (Blob)
      try{
        // 1. 🔹 Generar PDF si se seleccionó
        if (generatePDFOption || sendEmailOption) {
          console.log("📄 1234... invocando generatePDF...", generatePDFOption, sendEmailOption);
          pdfBase64  = await generatePDF(budgetData, generatePDFOption);  // true: descarga local
        } 
       
        // 2. 🔹 Guardar presupuesto en DB
        // await handleSaveBudget2(budgetData);
      
        // 3. Si la opción de enviar por correo está activada. // Enviar por correo si se seleccionó la opción que corresponde
         // const email = form.getFieldValue("email");
        const email = budgetData.email;
        console.log(generatePDFOption, sendEmailOption, email );
        if (sendEmailOption && pdfBase64 && email) {   
          await sendPDFToBackend(pdfBase64, budgetData);
        }
        // o 
        /* await sendBudgetEmail({
          to: email,
          subject: "Presupuesto generado",
          body: "Adjunto encontrará el presupuesto solicitado.",
          attachment: pdfBase64,
          filename: "presupuesto.pdf",
        }); */

        notification.success({
          message: 'Operación completada',
          description: `${
            generatePDFOption ? "PDF generado." : ""
          } ${sendEmailOption ? "Correo enviado." : ""}`,
        });
        message.success(`📧 Presupuesto enviado a ${email}`);

        // 4. Otras acciones (descargar, WhatsApp) aquí si querés
        /* if (sendWhatsAppOption && pdfBase64 && budgetData.clientPhone) {
          await sendWhatsAppMessage(budgetData.clientPhone, pdfBase64);
        } */

        message.success("Presupuesto generado y enviado correctamente.");
      } catch (error) {
        // console.error("❌ Error enviando el email:", error); console.error("❌ Error en generación del pdf:", error);
        console.error("❌ Error:", error);
        setPdfError(true); // ⚠️ Mostrar botón "Reintentar"
        message.error("Error al procesar."); // message.error("Error al enviar el presupuesto por correo."); message.error("Ocurrió un error al generar el pdf.");
        notification.error({
          message: 'Error al procesar',
          description: `No se pudo completar la operación: ${error.message || 'Error desconocido'}`,
        });
        // No cerramos el modal
      } finally {
        setPdfProcessing(false); // ✅ Ocultar spinner
      }
    };
        // sendEmailWithPDF(pdfData, budgetData);   (envío desde el frontend)  o  sendBudgetEmail(budgetData, pdfBase64);     (envio desde el backend)  
        // varios remitentes:
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
    
    const handleCancelPDF = () => {
      setShowPDFModal(false);
      setPendingBudgetData(null);
      // setPdfError(false);
    };  

    const handlePreviewPDF = () => {
      // lógica para generar el PDF sin enviarlo
      console.log("Vista previa PDF generada");
      console.log("📄 Vista previa PDF no implementada todavía");
      // exportToPDF({ preview: true }); // si querés diferenciar
    }; 

    const handleSaveBudget2 = async (rawBudgetData) => {
      console.log("🟢 Entrando en handleSaveBudget en BudgetForm.js");
    
      try {
        // Transformar los datos al formato requerido por el backend
        const transformedBudget = {
          work: rawBudgetData.workId,  // <- Asegúrate de pasar este campo desde el form o estado
          name: rawBudgetData.name,
          address: rawBudgetData.address,
          description: rawBudgetData.description,
          client: rawBudgetData.clientId,          // ID del cliente
          technician: rawBudgetData.technicianId,  // ID del técnico
          totalUYU: Number(rawBudgetData.totals?.UYU) || 0,
          totalUSD: Number(rawBudgetData.totals?.USD) || 0,
          creationDate: new Date().toISOString(),  // Puedes usar la fecha actual o una del form
          products: rawBudgetData.products.map(p => ({
            product: p.productId,        // El backend espera `product`
            quantity: p.quantity || 1,
            width: p.width || 0,
            length: p.length || 0,
            discount: p.discount || 0,
            subtotal: p.subtotal || 0,
          }))
        };
    
        // Verificar la estructura de budgetData y para ver exactamente qué se está enviando.
        console.log("📤 Enviando al backend:", JSON.stringify(transformedBudget, null, 2));   
    
        const response = await createBudget(transformedBudget);
    
        console.log("✅ Presupuesto guardado con éxito:", response);
        message.success("Presupuesto guardado en la base de datos.");
      } catch (error) {
        console.error("❌ Error guardando el presupuesto:", error.response?.data || error.message);
        message.error(`Error al guardar el presupuesto: ${error.response?.data?.message || error.message}`);
      }
    };    

    // Función para manejar cambios en las opciones de generar PDF y enviar correo
    const handleGeneratePDFChange = (e) => setGeneratePDFOption(e.target.checked);
    const handleSendEmailChange = (e) => setSendEmailOption(e.target.checked);

    // Calendario
    // Función que se dispara al hacer click en la celda
    const handleCellClick1 = (dateTimeFromCell) => {
      const selectedDate = new Date(dateTimeFromCell.dateStr);    // forzamos a Date nativo
      console.log('Se hizo click en: ', selectedDate);

      // Formatear la fecha para el input datetime-local (yyyy-MM-ddTHH:mm)
      const formattedDate = selectedDate.toISOString().substring(0, 16);  // toISOString() genera una fecha como: 2025-04-28T18:30:00.000Z  ; 
                                                                      // .slice(0,16) te deja justo el formato yyyy-MM-ddTHH:mm que es el que pide el input datetime-local.

      setSelectedDateTime(selectedDate); // Guardás la fecha propuesta
      setNewQuote(prev => ({ ...prev, visitDate: formattedDate }));
      setActivePanelKey('2'); // Cambiás al Panel 2
    };    

    const handleCellClick2 = async (info) => {
      const start = info.dateStr;
      const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString(); // duración 1 hora
    
      const event = {
        summary: 'Visita Técnica',
        description: 'Agenda de visita técnica para el cliente',
        start,
        end,
      };
    
      try {
        const response = await fetch('http://localhost:3001/api/calendar/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
    
        const result = await response.json();
        console.log('Evento creado:', result);
      } catch (error) {
        console.error('Error al crear evento:', error);
      }
    };   
    
    // 🔹 Agendar visita (desde clic en celda vacía)
    const handleCellClick = async (arg) => {
      const confirmed = window.confirm(`¿Confirmar visita técnica para el ${arg.dateStr}?`);
      if (!confirmed) return;

      const selectedStart = new Date(arg.date);
      const selectedEnd = new Date(selectedStart.getTime() + 60 * 60 * 1000); // 1 hora después

      setNewQuote((prev) => ({
        ...prev,
        start: selectedStart.toISOString(),
        end: selectedEnd.toISOString(),
      }));

      // Activamos el siguiente panel
      message.success(`📅 Seleccionaste: ${selectedStart.toLocaleString()}`);
      setActivePanelKey("2"); // Ir al próximo paso (Datos Generales)
      alert(`📅 Visita técnica seleccionada para el ${selectedStart.toLocaleString()}. Ahora completa los demás datos.`);

      // Marcar temporalmente la visita que seleccionó el usuario (pero que aún no se confirmó como evento real en Google Calendar)
      const tempEvent = {
        id: "temp-visit", // un id único temporal
        title: "Visita Técnica (pendiente)",
        start: selectedStart,
        end: selectedEnd,
        backgroundColor: "#FFC107", // amarillo (para destacar que está pendiente)
        borderColor: "#FFC107",
      };
      
      setCalendarEvents((prev) => {
        // Eliminamos cualquier evento temporal anterior y agregamos el nuevo
        const filtered = prev.filter((e) => e.id !== "temp-visit");
        return [...filtered, tempEvent];
      });      
    };

    // 🔹 Click sobre un evento existente
    const handleEventClick = (clickInfo) => {
      setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        description: clickInfo.event.extendedProps.description || "",
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        backgroundColor: clickInfo.event.backgroundColor || "#1976d2",
      });
      setIsModalOpen(true);
    };

    const toISO = (value) =>
      typeof value === "string" ? value : value.toISOString();

    // 🔹 Guardar evento (nuevo o editado)
    const handleSaveEvent = async (eventData) => {
      const isNew = !eventData.id;

      if (new Date(eventData.end) <= new Date(eventData.start)) {
        alert("❌ La hora de finalización debe ser posterior a la de inicio.");
        return;
      }      
    
      try {
        const url = isNew
          ? "/api/calendar/create-event"
          : `/api/calendar/update-event/${eventData.id}`;
        const method = isNew ? "POST" : "PUT";
    
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: eventData.title,
            description: eventData.description,
            start: toISO(eventData.start),
            end: toISO(eventData.end),
          }),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar');
        }        
    
        const result = await response.json();
    
        if (isNew) {
          setCalendarEvents((prev) => [
            ...prev,
            { ...eventData, id: result.event.id },
          ]);
        } else {
          setCalendarEvents((prev) =>
            prev.map((e) => (e.id === eventData.id ? { ...e, ...eventData } : e))
          );
        }
    
        setIsModalOpen(false);
        alert(`✅ Evento ${isNew ? "creado" : "actualizado"}`);
      } catch (error) {
        console.error(error);
        alert("❌ No se pudo guardar el evento");
      }
    };    
    
    // 🔹 Eliminar evento
    const handleDeleteEvent = async () => {
      if (!selectedEvent) return;
    
      const confirmed = window.confirm(`¿Eliminar evento "${selectedEvent.title}"?`);
      if (!confirmed) return;
    
      try {
        const res = await fetch(`/api/calendar/delete-event/${selectedEvent.id}`, {
          method: "DELETE",
        });
    
        if (!res.ok) throw new Error("Error al eliminar");
    
        setCalendarEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
        setIsModalOpen(false);
        alert("✅ Evento eliminado");
      } catch (err) {
        console.error(err);
        alert("❌ Falló la eliminación");
      }
    };    

    // 🔹 Mover o redimensionar eventos (arrastrar o cambiar duración)
    const handleEventDropOrResize = async (info) => {
      const event = info.event;
    
      const updatedEvent = {
        id: event.id,
        title: event.title,
        description: event.extendedProps.description || "",
        start: event.start,
        end: event.end || new Date(event.start.getTime() + 60 * 60 * 1000),
        backgroundColor: event.backgroundColor || "#1976d2",
      };
    
      try {
        const res = await fetch(`/api/calendar/update-event/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: updatedEvent.title,
            description: updatedEvent.description,
            start: updatedEvent.start.toISOString(),
            end: updatedEvent.end.toISOString(),
          }),
        });
    
        if (!res.ok) throw new Error("Error al actualizar");
    
        alert("✅ Evento actualizado");
      } catch (err) {
        console.error(err);
        alert("❌ No se pudo actualizar el evento");
        info.revert(); // Revertir movimiento si falla
      }
    };      


    const handleEditEvent = (event) => {
      setSelectedEvent({
        id: event.id,
        title: event.title,
        description: event.extendedProps.description || "",
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor || "#1976d2",
      });
      setIsModalOpen(true);
    };  

    const modalTitle = (() => {
      if (generatePDFOption && sendEmailOption) {
        return "¿Generar PDF y enviar por correo?";
      } else if (generatePDFOption) {
        return "¿Generar PDF del presupuesto?";
      } else if (sendEmailOption) {
        return "¿Enviar presupuesto por correo?";
      } else {
        return "¿Proceder con la operación?";
      }
    })();    

    const modalDescription = (() => {
      if (generatePDFOption && sendEmailOption)
        return "Se generará el PDF del presupuesto y se enviará por correo al cliente.";
      if (generatePDFOption)
        return "Se generará y descargará el PDF del presupuesto.";
      if (sendEmailOption)
        return "Se enviará el presupuesto por correo.";
      return "No hay ninguna acción seleccionada.";
    })();
    
    const okButtonText = (() => {
      if (generatePDFOption && sendEmailOption) return "Sí, generar y enviar";
      if (generatePDFOption) return "Sí, generar";
      if (sendEmailOption) return "Sí, enviar";
      return "Sí, proceder";
    })();

    const shouldDisableOkButton = !generatePDFOption && !sendEmailOption;
     
  return (
    <div>
        <Form form={form} layout="vertical" onFinish={handleSubmit} >    {/* Aquí la invocación automática de handleSubmit */}
          {/* Scroll horizontal en pantallas chicas */}
          <div style={{ overflowX: 'auto' }}>
          {/*  <Collapse defaultActiveKey={['1', '2']} accordion>  */}
          <Collapse activeKey={activePanelKey} onChange={(key) => setActivePanelKey(key)} accordion>

            {/* Visit Scheduling Panel */}
            <Panel header="Agendar Visita Técnica" key="1"> 
              <SchedulePanel 
                events={calendarEvents}
                handleCellClick={handleCellClick}  
                handleEventClick={handleEventClick} 
                handleEventDrop={handleEventDropOrResize}
                handleEventResize={handleEventDropOrResize}
                handleEditEvent={handleEditEvent}
              />
            </Panel>

            {/* Datos generales */}
            <Panel header="Datos Generales del Presupuesto" key="2">  
              <GeneralDataPanel
                form={form}
                client={client} // 👈 aquí pasas el cliente
                technicians={technicians}
                //newQuote={newQuote}
                //setNewQuote={setNewQuote}
                //description={description}
                //onDescriptionChange={setDescription}
              />
            </Panel>
              
             {/*ProductsPanel */}
             
             <Panel header="Productos Seleccionados" key="3">
              <ProductsPanel
                products={products}
                availableProducts={availableProducts}
                handleProductChange={handleProductChange}
                handleProductDetailChange={handleProductDetailChange}
                removeProduct={removeProduct}
                addProduct={addProduct}
                totals={totals}
              />
            </Panel>
              
              {/* Opciones adicionales */}
              <Panel header="Opciones Adicionales" key="4">  

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
                  {/*
                  <Col>
                    <Form.Item label="Email (opcional)" name="email">
                      <Input placeholder="ejemplo@correo.com" />
                    </Form.Item>
                  </Col>  
                  */}
                </Row>
              </Panel>
              

              {/* Resumen del Presupuesto */}
              <Panel header="Resumen del Presupuesto" key="5">
                <ResumenPanel products={products} totals={totals} newQuote={newQuote} />
              </Panel>  
              

          </Collapse>

            <Space style={{ marginTop: 16 }} align="center" size="large">
              <Button onClick={handleCancel} icon={<CloseOutlined />} size="large" style={{ width: "120px", backgroundColor: "#f44336", color: "white" }}>
                Cancelar
              </Button>

              <Button type="primary" htmlType="submit" 
                // onClick={showConfirmationModal} 
                // onClick={() => {setShowPDFModal(); }} 
                /*onClick={() => {
                  if (generatePDFOption) {
                    setShowPDFModal(true); // Mostrar el modal
                  } else {
                    form.submit(); // Ejecutar el submit directamente o lo que quieras que pase si no se genera PDF
                    // ó await handleSaveBudget(...); // o lo que necesites hacer
                  }
                }} */ // ⚠️ No uses onClick={...} aquí, ya que queremos que el formulario ejecute onFinish={handleSubmit} por sí solo.
                icon={loading ? <LoadingOutlined /> : <PlusOutlined />} 
                size="large" style={{ width: "290px" }}>
                {loading ? 'Cargando' : 'Confirmar y Generar Presupuesto'}
              </Button>
{/*
              <Button
                onClick={handlePreviewPDF}
                icon={<EyeOutlined />}
                size="large"
                style={{ width: "160px", backgroundColor: "#1976D2", color: "white" }}
              >
                Vista Previa PDF
              </Button> */}
{/*
<Form.Item label="Descripción (test)" name="descriptionTest">
  <Input.TextArea />
</Form.Item>
*/}
            </Space>
          </div>
        </Form>

      {/* 🔻 Agregás el modal acá, al final del return */}
      <Modal
        title={modalTitle}
        open={showPDFModal}
        // icon: <ExclamationCircleOutlined />,
        // content= "Esto es solo una prueba."
        onOk={handleGeneratePDF}      // onOk: () => console.log("OK"),
        onCancel={handleCancelPDF}    // onCancel: () => console.log("Cancelado"),    
        okText={okButtonText}
        cancelText="Cancelar"
        confirmLoading={pdfProcessing} // 🔄 Esto activa el spinner
        okButtonProps={{ disabled: shouldDisableOkButton }}
      >
        <p>
          {/*}
          {generatePDFOption && sendEmailOption
            ? "Se generará el PDF y se enviará por correo."
            : generatePDFOption
            ? "Se generará y descargará el PDF del presupuesto."
            : sendEmailOption
            ? "Se enviará el presupuesto por correo."
            : "No hay ninguna acción seleccionada."} */}
            {modalDescription}
        </p>

        {pdfError && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: 'red' }}>Ocurrió un error. Puede reintentar la operación.</p>
            <Button
              type="primary"
              onClick={handleGeneratePDF}
              loading={pdfProcessing}
            >
              Reintentar
            </Button>
          </div>
        )}
      </Modal>

      {/* Agregás el modal al final */}
      <EventModal
        open={isModalOpen}
        event={selectedEvent}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

    </div>
    );
};

export default BudgetForm;

/*
✅ Funcionalidades a ejecutar
Cuando se envía el formulario, pueden ocurrir hasta 4 acciones:

✅ Guardar el presupuesto en la base de datos

📨 Enviar un PDF por email

📂 Guardar el PDF localmente (descargar o en sistema de archivos)

💬 Enviar un mensaje de WhatsApp con el presupuesto

✅ Orden propuesto:
// Al enviar el formulario
1. Validar los datos del formulario
2. Guardar el presupuesto en la base de datos
3. Generar el PDF del presupuesto
4. Si el usuario eligió enviar por email → Enviar el PDF por email
5. Si el usuario eligió guardar localmente → Descargar o guardar el PDF
6. Si el usuario eligió enviar por WhatsApp → Enviar el PDF o un link vía WhatsApp

✔️ Ventajas de esta estructura
Código limpio y mantenible: Cada acción es una función separada.

Evita duplicaciones: PDF solo se genera una vez.

Ejecución segura: Si guardar falla, no se intenta nada más.

Flexible: Se adapta fácilmente si luego agregás Telegram, Google Drive, etc.

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
                  *

*/

/*
Con esto tenés:

🎯 Texto adaptado a las opciones activas.

✅ Botón de acción desactivado si no se elige nada.

🔄 Loader durante el proceso.

🔔 Notificaciones de éxito o error.

📌 El modal se cierra solo si todo sale bien.


Esto hace que:

🔁 Si ocurre un error, se muestre un mensaje y un botón para reintentar.

🔒 El modal no se cierra, así que el usuario no pierde el contexto.

🔄 Si el usuario hace clic en “Reintentar”, se ejecuta el mismo flujo.

*/