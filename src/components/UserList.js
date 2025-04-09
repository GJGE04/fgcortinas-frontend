// src/components/UserList.js
import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../services/userService';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error al cargar los usuarios', error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user._id !== id)); // Filtra el usuario eliminado
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
    }
  };

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.activo ? 'Sí' : 'No'}</td>
              <td>
                <button>
                  <Link to={`/edit/${user._id}`}>Editar</Link>
                </button>
                <button onClick={() => handleDelete(user._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button>
        <Link to="/create">Agregar Usuario</Link>
      </button>
    </div>
  );
};

export default UserList;
