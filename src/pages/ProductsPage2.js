import React, { useState, useEffect } from "react";
import { getProducts, deleteProduct, updateProduct, createProduct } from "../api/productApi";  // Asumiendo que ya tienes las funciones de la API configuradas.
import ProductTable from "../components/ProductTable";  // Importar el componente de la tabla
import ProductForm from "../components/ProductForm";   // Importar el componente del formulario
import { Modal, Button, message, Input, Select } from "antd";
const { Option } = Select;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);  // Estado para saber si estamos creando o editando
  const [filters, setFilters] = useState({ name: "", isActive: null });  // Filtros por título y estado
  const [sortedInfo, setSortedInfo] = useState({ order: null, columnKey: null });
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useEffect(() => {
    // Cargar los productos desde la base de datos al cargar el componente
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        console.log("Productos obtenidos:", productsData);  // Ver los datos
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Función para actualizar los filtros
  const handleFilterChange = (key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Función para aplicar los filtros a la lista de productos
  const applyFilters = (items) => {
    let filtered = [...items];
    if (filters.name) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.name.toLowerCase())     // Asegúrate de que el campo es correcto, como "title" o "name"
      );
    }
    if (filters.isActive !== null) {
      filtered = filtered.filter(product => product.isActive === filters.isActive);
    }
    return filtered;
  };

  // Función para manejar la ordenación de la tabla
  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    let sortedData = [...products];
    if (sorter.order) {
      sortedData = sortedData.sort((a, b) =>
        sorter.order === "ascend"
          ? a[sorter.columnKey] > b[sorter.columnKey]
            ? 1
            : -1
          : a[sorter.columnKey] < b[sorter.columnKey]
          ? 1
          : -1
      );
    }
    setProducts(sortedData);
  };

  // Mostrar modal y cargar producto en el formulario
  const handleEdit = (product) => {   // Lógica para editar el producto, puedes mostrar un formulario de edición
    // Asegúrate de que el producto tiene _id antes de pasarlo
    console.log("Producto para editar:", product); // Verifica que el producto tiene un _id
    if (product && product._id) {
      console.log("Producto: " + product._id);
      setEditingProduct(product);
      setIsCreating(false);  // Estamos editando, no creando
      setIsModalVisible(true);
    } else {
      console.error("Producto no tiene un _id válido para editar");
    }
  };

  // Cerrar el modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  const handleCreate = () => {
    setEditingProduct(null);  // No hay producto para editar
    setIsCreating(true);  // Estamos creando un nuevo producto
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    setIsCreating(false);
  };

  // Eliminar producto
  const handleDelete = async (productId) => {
    // Lógica para eliminar el producto, por ejemplo, actualizando el estado

    console.log("productId en el frontend:", productId); // Verifica si el ID es correcto

    try{
        // Hacer una solicitud DELETE a la API para eliminar el producto
        await deleteProduct(productId);

        // Si la eliminación es exitosa, actualizamos la lista de productos
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
        message.success("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el producto1:", error);
      message.error("Error al eliminar el producto.");
      alert(`Error: ${error.response?.data?.message || "Error desconocido"}`);
    }  
  };

  const handleSave = async (updatedProduct) => {
    try {
      console.log("Entrando en handleSave en ProductsPage.js");
      console.log("ID del producto a actualizar:", updatedProduct._id); // Verifica si el ID está presente
      
      if (isCreating) {
        // Si estamos creando un nuevo producto, llamamos a la función de crear
        await createProduct(updatedProduct);
      } else {
        // Si estamos editando, llamamos a la función de actualizar
        await updateProduct(updatedProduct._id, updatedProduct);      // Usamos editingProduct._id en lugar de product._id
      }
    
      // Después de la actualización, obtenemos los productos actualizados
      const productsData = await getProducts();
      setProducts(productsData);    // Actualizamos la lista de productos
      setIsModalVisible(false);     // Cerramos el modal
    } catch (error) {
      // alert(`Error: ${error.message || "Error desconocido"}`);

      console.log("Error recibido al guardar el producto:", error);
      if (error.response && error.response.status === 403) {
        console.log("Mostrando modal de error personalizado...");
        // Establece el mensaje del modal de error y lo muestra
        setErrorModalMessage('No tienes permiso para editar este producto. Asegúrate de tener los permisos adecuados.');
        setErrorModalVisible(true);
      }
      else {
              message.error("Error al guardar el producto.");
          }
    }
  };  
  
  const handleToggleActiveStatus = async (id, currentStatus) => {
    try {
      await updateProduct(id, { isActive: !currentStatus });
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, isActive: !currentStatus } : product
        )
      );
    } catch (error) {
      console.error("Error al actualizar estado activo:", error);
    }
  };
  

  return (
    <div>
      <h2>Productos</h2>

      {/* Filtros */}
      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Buscar por nombre"
          value={filters.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
          style={{ width: 200, marginRight: 20 }}
        />
        <Select
          value={filters.isActive}
          onChange={(value) => handleFilterChange("isActive", value)}
          style={{ width: 200 }}
          placeholder="Filtrar por estado"
        >
          <Option value={null}>Todos</Option>
          <Option value={true}>Activo</Option>
          <Option value={false}>Inactivo</Option>
        </Select>
      </div>

      {/* Botón para abrir el modal de creación de producto */}
      <Button type="primary" onClick={handleCreate} style={{ marginBottom: 20 }}>
        Crear Producto
      </Button>

      <ProductTable
        products={applyFilters(products)}  // Aplica filtros antes de pasar los productos a la tabla
        onEdit={handleEdit}
        // Otras props necesarias
        onDelete={handleDelete}
        onToggleActiveStatus={handleToggleActiveStatus}  // Asegúrate de pasar esta función
        onChange={handleTableChange}  // Para la ordenación
        sortedInfo={sortedInfo}  // Para la ordenación
      />
      
      <Modal
        title={isCreating ? "Crear Producto" : "Editar Producto"}  // Cambiar el título según si estamos creando o editando
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null} // Para no tener los botones predeterminados
      >
        <ProductForm
          product={editingProduct}
          // onSave={handleCloseModal}
          // Otras funciones que necesites
          onSave={handleSave} 
        />
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
};

export default ProductsPage;
