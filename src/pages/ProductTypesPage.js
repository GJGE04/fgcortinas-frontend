import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message, AutoComplete, Tooltip } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import "../css/table.css";

const { Option } = Select;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/*
const initialData = [
    { id: 1, title: "Cortina Roller", format: "Ancho x Largo", active: true },
    { id: 2, title: "Cortina Veneciana", format: "Unidad", active: false },
  ]; */

const formats = ["Unidad", "Ancho x Largo", "Lado + Lado x Precio", "Unidad x Largo"];

const ProductTypesPage = () => {
// const [data, setData] = useState(initialData);
  const [data, setData] = useState([]); // Estado para almacenar los datos de la API. // Se cambia initialData por un estado vacío para cargar datos de la API
  const [filteredData, setFilteredData] = useState([]);     // Estado para almacenar los datos filtrados
  const [isModalOpen, setIsModalOpen] = useState(false);    // Estado para abrir/cerrar el modal
  const [editingItem, setEditingItem] = useState(null);     // Elemento que se está editando
  const [form] = Form.useForm();
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [isDuplicateTitle, setIsDuplicateTitle] = useState(false);    // estado local para guardar el error de título duplicado

  // Estado para almacenar los filtros
  const [filters, setFilters] = useState({
    title: "",
    format: "",
  });

  const [tableHeight, setTableHeight] = useState(window.innerHeight - 580);   // valor inicial

  useEffect(() => {
    const handleResize = () => {
      // Ajusta el espacio libre según el tamaño de la pantalla
      const heightOffset = window.innerWidth < 768 ? 580 : 440;
      const availableHeight = window.innerHeight - heightOffset;
      setTableHeight(Math.max(300, availableHeight)); // evita que sea muy chica
    };

    handleResize(); // al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar datos de la API al montar el componente
  useEffect(() => {
    // axios.get("/api/product-types")
    axios.get(`${API_URL}/product-types`)
      .then((response) => {
        setData(response.data);     // Almacenar los tipos de productos obtenidos de la API
        setFilteredData(response.data); // Establecer los datos filtrados con los mismos datos inicialmente
      })
      .catch((error) => {
        message.error("Error al cargar los tipos de productos.");
        console.error(error);
      });
  }, []);       // El array vacío asegura que esto solo se ejecute una vez cuando se monta el componente

  const updateDataStates = (newData) => {
    setData(newData);
    setFilteredData(applyCurrentFilters(newData));
  };

  const applyCurrentFilters = (items) => {
    let filtered = [...items];
    if (filters.title) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    if (filters.format) {
      filtered = filtered.filter(product =>
        product.format.toLowerCase().includes(filters.format.toLowerCase())
      );
    }
    return filtered;
  };  

  // Función para abrir el modal de edición
  const handleOpenModal = (record = null) => {
    setEditingItem(record);             // Si no es null, significa que estamos editando
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue(record);      // Si estamos editando, carga los datos del producto
    } else {
      form.resetFields();
    }
  };

  // Función para eliminar un tipo de producto
  const handleDelete = (id) => {
    console.log("handleDelete fue llamado con id:", id);    // Esto debe imprimirse si el botón se presiona
    const token = localStorage.getItem("token");            // Obtener el token
    console.log("TokenT:", token);                          // Verificar que el token sea válido
    if (!token) {
      message.error("No se encontró el token de autenticación.");
      return;
    }

    console.log("Deleting product with IDD:", id);

    // Eliminar directamente sin confirmación
    axios.delete(`${API_URL}/product-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
        console.log("API responseR:", response);
          if (response.status === 200) {

            const updatedData = data.filter(item => item._id !== id);
            updateDataStates(updatedData);

            message.success("Tipo de producto eliminado.");
          } else {
            message.error("Error al eliminar el tipo de producto.");
          }
        })
        .catch((error) => {
          console.error("Error en la eliminación:", error);
          message.error("Error al eliminar el tipo de producto.");
        });

    /*
    // Mostrar confirmación antes de proceder con la eliminación
    console.log("Mostrando confirmación...");
    confirm({
        title: "¿Estás seguro de eliminar este tipo de producto?",
        content: "Esta acción no se puede deshacer.",
        okText: "Sí, eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk() {
            console.log("Haciendo la solicitud DELETE...");  // Verifica que esto se imprime
            console.log(`URL: http://localhost:5000/api/product-types/${id}`);  // Verifica la URL antes de hacer la solicitud
            console.log("Deleting product with IDD:", id);          // Verificar que el id es correcto

            // axiosInstance.delete(`/product-types/${id}`)  // Solo la ruta relativa
            // Aquí se realiza la eliminación una vez que el usuario confirma
            axios.delete(`http://localhost:5000/api/product-types/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                console.log("API responseR:", response);    // Verifica la respuesta de la API
                if (response.status === 200) {              // Verifica si la respuesta tiene el código de éxito
                    setData(data.filter(item => item._id !== id));  // Filtramos el producto eliminado
                    message.success("Tipo de producto eliminado.");
                } else {
                    message.error("Error al eliminar el tipo de producto.");
                }
                })
                .catch((error) => {
                console.error("Error en la eliminación:", error);
                message.error("Error al eliminar el tipo de producto.");
                });
        },
        onCancel() {
        console.log("Eliminación cancelada");
        }
    });
    */
  };

  // Función para manejar la creación/actualización de productos
  const handleSubmit = () => {
    console.log("Intentando editar tipo de producto")
    form.validateFields().then(values => {
      const token = localStorage.getItem("token");      // Obtén el token de autenticación
      if (!token) {
        message.error("No se encontró el token de autenticación.");
        console.log("No se encontró el token de autenticación.");
        return;
      }

      const method = editingItem ? axios.put : axios.post;
      const url = editingItem ? `${API_URL}/product-types/${editingItem._id}` : `${API_URL}/product-types`;
      
      method(url, values, {
        headers: { Authorization: `Bearer ${token}` },      // Incluye el token en los headers
      })
        .then((response) => {
          let updatedData;

          if (editingItem) {
            updatedData = data.map(item =>
              item._id === editingItem._id ? { ...editingItem, ...values } : item
            );
            message.success("Tipo de producto actualizado.");
          } else {
            updatedData = [...data, response.data.product];
            message.success("Tipo de producto agregado.");
          }

          updateDataStates(updatedData); // ✅ Aplica cambios + filtros actuales
          setIsModalOpen(false);
        })
        .catch((error) => {
            console.log("Error recibido:", error);

            if (error.response && error.response.status === 403) {
              console.log("Mostrando modal de error personalizado...");
              setIsModalOpen(false); // Cierra el modal principal

              // Establece el mensaje del modal de error y lo muestra
              setErrorModalMessage('No tienes permiso para editar este tipo de producto. Asegúrate de tener los permisos adecuados.');
              setErrorModalVisible(true);
            } else {
              message.error("Error al guardar el tipo de producto.");
            }

             console.error(error);
          });
      });
    };

  // Función para activar/desactivar el estado de un producto
  const toggleActiveStatus = (id, currentStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
        message.error("No se encontró el token de autenticación.");
        return;
      }
    // setData(data.map(item => (item._id === id ? { ...item, active: !item.active } : item)));
    // Cambiar el estado localmente (actualiza el switch en la UI)
    const newStatus = !currentStatus;   // Si está marcado, desmarcarlo y viceversa
    setData(data.map(item => 
        item._id === id ? { ...item, active: newStatus } : item
      ));

    setFilteredData(filteredData.map(item => item._id === id ? { ...item, active: newStatus } : item));


    // Enviar la solicitud PUT para actualizar el estado "Activo" en la base de datos
    axios.put(`${API_URL}/product-types/${id}`, 
        { active: newStatus },  // Envía el nuevo valor de "active"
        { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
        message.success("Estado actualizado correctamente.");
    })
    .catch((error) => {
        // Si ocurre un error, revertir el cambio localmente
        setData(data.map(item => 
        item._id === id ? { ...item, active: currentStatus } : item
        ));
        setFilteredData(filteredData.map(item => item._id === id ? { ...item, active: currentStatus } : item));

        console.error("Error al actualizar el estado:", error);
        message.error("Error al actualizar el estado.");
    });
  };

  // Función para manejar el cambio de filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));

    // Filtrar los productos según el título y el formato
    let filteredProducts = [...data];

    if (value) {
      filteredProducts = filteredProducts.filter(product =>
        product[key].toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredData(filteredProducts);
  };

  // Función para manejar la ordenación de la tabla
  const handleTableChange = (pagination, filters, sorter) => {
    let sortedData = [...filteredData];
    if (sorter.order === 'ascend') {
      sortedData = sortedData.sort((a, b) => a[sorter.columnKey] > b[sorter.columnKey] ? 1 : -1);
    } else if (sorter.order === 'descend') {
      sortedData = sortedData.sort((a, b) => a[sorter.columnKey] < b[sorter.columnKey] ? 1 : -1);
    }
    setFilteredData(sortedData);
  };

  // Opciones para AutoComplete (lista de títulos únicos)
  const autocompleteOptions = data.map(item => ({
    value: item.title,
  }));

  //  función para verificar duplicados
  const checkDuplicateTitle = (value) => {
    const exists = data.some(item =>
      item.title.trim().toLowerCase() === value.trim().toLowerCase()
    );
    setIsDuplicateTitle(exists);
  };  

  // Definición de las columnas para la tabla
  const columns = [
    { title: "Título", dataIndex: "title", key: "title",
      sorter: true, // Permite la ordenación por esta columna
      ...filters.title ? {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div>
            <Input
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
            />
            <Button onClick={() => clearFilters()}>Limpiar</Button>
          </div>
        ),
        onFilter: (value, record) => record.title.toLowerCase().includes(value.toLowerCase()),
      } : {},
    },

    { title: "Formato", dataIndex: "format", key: "format", sorter: true, 
      filters: formats.map(format => ({
        text: format,
        value: format,
      })),
      onFilter: (value, record) => record.format === value,
    },

    {
      title: "Activo",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <Switch className="custom-switch" checked={active} onChange={() => toggleActiveStatus(record._id, active)} /> // Pasa el ID y el estado actual
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        /*
        <>
          <Button onClick={() => handleOpenModal(record)} style={{ marginRight: 10 }}>Editar</Button>
          <Button onClick={() => handleDelete(record._id)} danger>Eliminar</Button>
        </>
        */
        <>
        <Tooltip title="Editar">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            style={{ marginRight: 8 }}
          />
        </Tooltip>
        <Tooltip title="Eliminar">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Tooltip>
      </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Tipos de Productos</h2>
      {/* <div style={{ marginBottom: 20 }}></div> */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      <Input
        placeholder="Buscar por Título"
        value={filters.title}
        onChange={e => handleFilterChange("title", e.target.value)} // Cambia el filtro de título
        style={{ marginBottom: 20, width: 300, marginRight: 20 }}   // Añadir margen derecho para separarlo del botón
      />

      <Button type="primary" onClick={() => handleOpenModal()}>Agregar Tipo de Producto</Button>
      </div>
      {/* Scroll limitado solo a la tabla */}
      {/* <div className="scrollable-table-container"> */}
      {/* ✅ Tabla envuelta para scroll solo del cuerpo */}
      {/*<div className="table-scroll-wrapper"> */}
      <Table
        columns={columns}
        dataSource={filteredData} // Usa los datos filtrados
        rowKey="_id"
        // pagination={{ pageSize: 20 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        onChange={handleTableChange} // Agregado para manejar la ordenación
        style={{ marginTop: 20 }}
        size="middle"
        rowClassName={(record, index) => {
          if (!record.active) return 'inactive-row';
          return index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
        }}
        // scroll={{ y: 520 }}  // <--- 👈 Aquí el header queda fijo y el cuerpo hace scroll
        // scroll={{ y: '100%' }}  // Toma el 100% del contenedor padre
        sticky    // esto fija el encabezado
        // scroll={{ y: tableHeight }}
        scroll={{
          y: tableHeight,
          x: 'max-content', // 👉 esto habilita scroll horizontal si es necesario
        }}
      />
      {/* </div> */}
      {/* </div> */}
      <Modal
        /* title={editingItem ? "Editar Tipo de Producto" : "Agregar Tipo de Producto"} */
         title={<div className="custom-modal-title">{editingItem ? "Editar Tipo de Producto" : "Agregar Tipo de Producto"}</div>} /* */
      /*  title={
          <div className="custom-modal-title-wrapper">
            <div className="custom-modal-title-text">
              {editingItem ? "Editar Tipo de Producto" : "Agregar Tipo de Producto"}
            </div>
          </div>
        } */ 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Título"
            rules={[
              { required: true, message: "El título es obligatorio" },
              () => ({
                validator(_, value) {
                  if (!value || !isDuplicateTitle) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Este título ya existe."));
                }
              })
            ]}
          >
          {/*}  <Input
              onChange={(e) => {
                checkDuplicateTitle(e.target.value);
              }}
             /> */}
             {/* usar el componente AutoComplete de Ant Design en lugar de un Input simple */}
             <AutoComplete
              options={autocompleteOptions}
              onChange={(value) => {
                form.setFieldsValue({ title: value }); // sincroniza el valor en el formulario
                checkDuplicateTitle(value);
              }}
              onSearch={(value) => {
                checkDuplicateTitle(value);
              }}
              placeholder="Escribe o selecciona un título"
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().startsWith(inputValue.toLowerCase())
              }
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="format"
            label="Formato"
            rules={[{ required: true, message: "El formato es obligatorio" }]}
          >
            <Select>
              {formats.map((format) => (
                <Option key={format} value={format}>{format}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="active" label="Activo" valuePropName="checked">
            <Switch className="custom-switch" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Acceso Denegado"
        open={errorModalVisible}
        onOk={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        okText="Entendido"
      >
        <p>{errorModalMessage}</p>
      </Modal>

    </div>
  );
}

export default ProductTypesPage;
