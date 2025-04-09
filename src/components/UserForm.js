// src/components/UserForm.js
import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../services/userService';
import { useHistory, useParams } from 'react-router-dom';

const UserForm = ({ isEditMode }) => {
  const { id } = useParams(); // Usado solo si estamos editando
  const history = useHistory();

  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    activo: true,
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchUser = async () => {
        try {
          //const response = await getUsers(id); // Aquí deberías modificar el endpoint
          //setUser(response);
        } catch (error) {
          console.error('Error al cargar el usuario', error);
        }
      };
      fetchUser();
    }
  }, [isEditMode, id]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateUser(id, user);
      } else {
        await createUser(user);
      }
      history.push('/'); // Redirige a la lista de usuarios
    } catch (error) {
      console.error('Error al guardar el usuario', error);
    }
  };

  return (
    <div>
      <h2>{isEditMode ? 'Editar Usuario1' : 'Crear Usuario'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={user.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Contraseña"
        />
        <select name="role" value={user.role} onChange={handleChange}>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <label>
          Activo
          <input
            type="checkbox"
            name="activo"
            checked={user.activo}
            onChange={() => setUser({ ...user, activo: !user.activo })}
          />
        </label>
        <button type="submit">{isEditMode ? 'Actualizar' : 'Crear'}</button>
      </form>
    </div>
  );
};

export default UserForm;
