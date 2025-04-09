import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message } from "antd";
import axios from "axios";

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
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal
  const [editingItem, setEditingItem] = useState(null); // Elemento que se está editando
  const [form] = Form.useForm();

  // Cargar datos de la API al montar el componente
  useEffect(() => {
    // axios.get("/api/product-types")
    axios.get(`${API_URL}/product-types`)
      .then((response) => {
        setData(response.data);     // Almacenar los tipos de productos obtenidos de la API
      })
      .catch((error) => {
        message.error("Error al cargar los tipos de productos.");
        console.error(error);
      });
  }, []);       // El array vacío asegura que esto solo se ejecute una vez cuando se monta el componente

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
            setData(data.filter(item => item._id !== id));
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
          if (editingItem) {
            setData(data.map(item => (item._id === editingItem._id ? { ...editingItem, ...values } : item)));
            message.success("Tipo de producto actualizado.");
          } else {
            setData([...data, response.data.product]);
            message.success("Tipo de producto agregado.");
          }
          setIsModalOpen(false);
        })
        .catch((error) => {
          message.error("Error al guardar el tipo de producto.");
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

    // Enviar la solicitud PUT para actualizar el estado "Activo" en la base de datos
    axios.put(`${API_URL}/product-types/${id}`, 
        { active: newStatus },  // Envía el nuevo valor de "active"
        { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((response) => {
        message.success("Estado actualizado correctamente.");
    })
    .catch((error) => {
        console.error("Error al actualizar el estado:", error);
        message.error("Error al actualizar el estado.");
        
        // Si ocurre un error, revertir el cambio localmente
        setData(data.map(item => 
        item._id === id ? { ...item, active: currentStatus } : item
        ));
    });
  };

  // Definición de las columnas para la tabla
  const columns = [
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Formato", dataIndex: "format", key: "format" },
    {
      title: "Activo",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <Switch checked={active} onChange={() => toggleActiveStatus(record._id, active)} /> // Pasa el ID y el estado actual
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleOpenModal(record)} style={{ marginRight: 10 }}>Editar</Button>
          <Button onClick={() => handleDelete(record._id)} danger>Eliminar</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Tipos de Productos</h2>
      <Button type="primary" onClick={() => handleOpenModal()}>Agregar Tipo de Producto</Button>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
      />

      <Modal
        title={editingItem ? "Editar Tipo de Producto" : "Agregar Tipo de Producto"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: "El título es obligatorio" }]}
          >
            <Input />
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
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductTypesPage;
