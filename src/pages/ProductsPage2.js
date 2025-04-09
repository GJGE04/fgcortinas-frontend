import React, { useState, useEffect } from "react";
import { getProducts, deleteProduct, updateProduct, createProduct } from "../api/productApi";  // Asumiendo que ya tienes las funciones de la API configuradas.
import ProductTable from "../components/ProductTable";  // Importar el componente de la tabla
import ProductForm from "../components/ProductForm";   // Importar el componente del formulario
import { Modal, Button } from "antd";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);  // Estado para saber si estamos creando o editando

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
      console.error("Producto no tiene un _id válido");
      console.error("El producto no tiene un _id válido para editar");
    }
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
    } catch (error) {
      console.error("Error al eliminar el producto1:", error);
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
    
      // Cerramos el modal
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert(`Error: ${error.message || "Error desconocido"}`);
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

      {/* Botón para abrir el modal de creación de producto */}
      <Button type="primary" onClick={handleCreate} style={{ marginBottom: 20 }}>
        Crear Producto
      </Button>

      <ProductTable
        products={products}
        onEdit={handleEdit}
        // Otras props necesarias
        onDelete={handleDelete}
        onToggleActiveStatus={handleToggleActiveStatus}  // Asegúrate de pasar esta función
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
    </div>
  );
};

export default ProductsPage;
