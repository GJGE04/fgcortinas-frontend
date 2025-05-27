import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, message, Modal, Form, Input, Select, Switch } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import debounce from 'lodash.debounce';

const { Option } = Select;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UsersPage2 = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para mostrar el modal. // Modal de edición
  const [isCreating, setIsCreating] = useState(false); // Controla si estamos creando un nuevo usuario
  const [editingUser, setEditingUser] = useState(null); // Estado para el usuario que estamos editando
  const [form] = Form.useForm(); // Formulario de Ant Design
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ username: "", role: "" });
  const [sortedInfo, setSortedInfo] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);

/*
  const ROLES = {
    SUPERADMIN: 'Superadmin',
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VENDEDOR: 'Vendedor',
    TECNICO: 'Tecnico',
    GUEST: 'Guest',
  };
*/

  // Obtener el token almacenado en el localStorage
  const token = localStorage.getItem('token');

  // Lista de roles disponibles (podrías también traerla desde el backend si prefieres)
  // const availableRoles = ['Superadmin', 'Admin', 'Vendedor', 'Editor', 'Guest', 'Tecnico'];  // Ejemplo de roles, estos roles pueden cambiar según tus necesidades

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // const { data } = await axios.get(`${API_URL}/roles`, {
        const { data } = await axios.get(`${API_URL}/roles/available`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // setAvailableRoles(data.roles);
        setAvailableRoles(data); // [{ value: "tecnico", label: "Técnico" }, ...]
      } catch (error) {
        console.error('Error al cargar los roles:', error);
      }
    };

    fetchRoles();
  }, [token]); 
  // }, []);

  // Función para obtener los usuarios de la API
  const fetchUsuarios = async () => {
    // const token = localStorage.getItem('token');
    if (!token) {
      console.log("Token no encontrado");
      return;
    }

    try {
      console.log("Haciendo petición para obtener usuarios...");
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Usuarios obtenidos:", response.data);
      setUsuarios(response.data); // Asume que la API te devuelve una lista de usuarios
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      message.error('Error al obtener los usuarios');
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Llamada a la API cuando el componente se monta
  useEffect(() => {
    console.log("Entré en la página de Usuarios");
    fetchUsuarios();

    // Cerrar sesión al cerrar la ventana o recargar la página
    const handleBeforeUnload = () => {
      localStorage.removeItem('token'); // Borra el token almacenado
      console.log("Sesión cerrada al cerrar o recargar la página.");
    };

    // Añadimos el listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Limpiamos el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Función para eliminar un usuario
  const deleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("Token de autenticación no encontrado");
      return;
    }

    try {
      console.log(`Eliminando usuario con ID: ${userId}...`);
      // Realiza la solicitud de eliminación
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respuesta del servidor para eliminar:", response);  // Log para verificar la respuesta

      // Verifica si la eliminación fue exitosa
      if (response.status === 200) {
        // Actualizar el estado para quitar el usuario eliminado de la lista
        setUsuarios(usuarios.filter((usuario) => usuario._id !== userId));
        message.success('Usuario eliminado con éxito');
      } else {
        message.error('No se pudo eliminar el usuario');
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      message.error('Error al eliminar el usuario');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const applyFilters = (users) => {
    return users.filter((user) =>
      (!filters.username || user.username.toLowerCase().includes(filters.username.toLowerCase())) &&
      (!filters.role || user.role === filters.role)
    );
  };


  // Función para mostrar el modal de edición y cargar los datos del usuario
  const handleEdit = (user) => {
    setEditingUser(user); // Establecer el usuario a editar
    form.setFieldsValue({ ...user }); // Cargar los datos del usuario en el formulario
    setIsCreating(false); // No estamos creando un usuario
    setIsModalVisible(true); // Mostrar el modal
  };

  // Crear nuevo usuario
  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsCreating(true); // Estamos creando un usuario
    setIsModalVisible(true);
  };

  // Función para guardar los cambios en un usuario editado
  const handleSave = async () => {
    try {
      const values = await form.validateFields();   // Obtener los valores del formulario
      console.log("Valores del formulario:", values);  // Verifica los valores
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Token no encontrado");
        return;
      }

      // 🔽 Normalizamos el email
      if (values.email) {
        values.email = values.email.trim().toLowerCase();
      }

      let response;

      if (isCreating) {
        // Crear un nuevo usuario
        console.log("Creando un nuevo usuario con valores:", values);  
        response = await axios.post(`${API_URL}/users`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Respuesta del servidor al crear:", response);
        if (response.status === 201) {
          setUsuarios([...usuarios, response.data]);      // Agregar el nuevo usuario a la lista
          message.success('Usuario creado con éxito');
          setIsModalVisible(false);
        } else {
          message.error('No se pudo crear el usuario');
        }
      } else {
        // Actualizar un usuario existente
        console.log("Actualizando usuario con ID:", editingUser._id);
        response = await axios.put(`${API_URL}/users/${editingUser._id}`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Respuesta del servidor al actualizar:", response);
        if (response.status === 200) {
          setUsuarios(usuarios.map((usuario) =>
            usuario._id === editingUser._id ? { ...usuario, ...values } : usuario
          ));
          message.success('Usuario actualizado con éxito');
          setIsModalVisible(false);
        } else {
          message.error('No se pudo actualizar el usuario');
        }
      }

      //setIsModalVisible(false);
      //setEditingUser(null);
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    /*  if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message); // Muestra el mensaje del backend
      } else {
        message.error('Error al guardar el usuario');
      } */
       // Mostrar error específico si es por email duplicado
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message === 'El email ya está registrado por otro usuario'
      ) {
        message.error('El email ya está registrado por otro usuario');
      } else {
        message.error('Error al guardar el usuario');
      }
    }
  };

  // Función de cierre de sesión manual (opcional)
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token
    window.location.reload(); // Recarga la página para redirigir al usuario al estado de "sin sesión"
    message.success('Has cerrado sesión con éxito');
  };

  const handleSwitchChange = async (checked, user) => {
    try {
      setLoading(true);  // Activamos la carga antes de actualizar el estado
      const updatedUser = { ...user, activo: checked };
      await axios.put(`${API_URL}/users/${user._id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Estado de activo actualizado');
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsuarios(response.data);
      message.success('Estado actualizado');
    } catch (error) {
      message.error('Error al actualizar estado de activo');     
    } finally {
      setLoading(false);    // Desactivamos la carga después de actualizar
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username', // Asegúrate de que la API te devuelve 'nombre'
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sortedInfo.columnKey === 'username' && sortedInfo.order,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role', // Asegúrate de que la API te devuelve 'role'
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortOrder: sortedInfo.columnKey === 'role' && sortedInfo.order,
    },
    {
      title: 'Activo',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo, record) => (
        <Switch
          checked={activo}
          onChange={(checked) => handleSwitchChange(checked, record)}
        />
      ),
    },
        
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => handleEdit(record)} // Llamar a la función handleEdit
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => deleteUser(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="danger" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };  
/*
  const formatRoleLabel = (role) =>
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(); */
/*
  const roleLabels = {
    superadmin: 'Superadmin',
    admin: 'Admin',
    editor: 'Editor',
    vendedor: 'Vendedor',
    tecnico: 'Técnico',
    guest: 'Invitado',
  }; */

  const checkEmailExists = debounce(async (email, callback) => {
    try {
      const response = await axios.get(`${API_URL}/users/check-email/${email}`);
      if (response.data.exists) {
        callback('El email ya está registrado');
      } else {
        callback(); // todo bien
      }
    } catch (error) {
      console.error('Error verificando el email:', error);
      callback('No se pudo verificar el email');
    }
  }, 500); // 500ms de retardo
  

  return (
    <div>
      <h1>Lista de Usuarios</h1>

      {/* Filtros */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <Input
          placeholder="Buscar por nombre"
          value={filters.username}
          onChange={(e) => handleFilterChange("username", e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={filters.role}
          onChange={(value) => handleFilterChange("role", value)}
          style={{ width: 200 }}
          placeholder="Filtrar por rol"
          allowClear
        >
          {availableRoles.map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>
      </div>


      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ marginBottom: 16 }}>
        Crear Usuario
      </Button>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={columns}
          dataSource={applyFilters(usuarios)}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          onChange={handleTableChange}
        />
      )}

      {/* Modal para editar o crear un usuario */}
      <Modal
        title={isCreating ? "Crear Usuario" : "Editar Usuario"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText={isCreating ? "Crear" : "Guardar"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Formato de email no válido' },
              {
                validator: (_, value) =>
                  new Promise((resolve, reject) => {
                    if (!value) return resolve();

                    const normalizedValue = value.trim().toLowerCase();
                    const originalEmail = editingUser?.email?.toLowerCase();

                    if (!isCreating && normalizedValue === originalEmail) {
                      return resolve(); // no se ha cambiado el email
                    }
                    checkEmailExists(value, (errorMessage) => {
                      if (errorMessage) {
                        reject(errorMessage);
                      } else {
                        resolve();
                      }
                    });
                  }),
              },
            ]}
          >
            <Input />
          </Form.Item>

            {/* Mostrar el campo de contraseña solo cuando se está creando un nuevo usuario */}
            {isCreating && (
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[{ required: true, message: 'Por favor ingrese la contraseña' }]}
              >
                <Input.Password />
              </Form.Item>
            )}

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione el rol' }]}
          >
            <Select placeholder="Seleccionar rol">
              {/*
              {availableRoles.map((role) => (
                <Option key={role} value={role}>{role}</Option>  // {formatRoleLabel(role)}
              ))}
               */}
               {/*
               {Object.entries(roleLabels).map(([value, label]) => (
                  <Option key={value} value={value}>
                    {label} {/* ✅ Esto es texto, no un objeto */} {/*
                  </Option>
                ))} */}
                {/*  */}
                {availableRoles.map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
                
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage2;
