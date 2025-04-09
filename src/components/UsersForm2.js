import React, { useState, useEffect } from 'react';
import { getUserById } from '../services/userService'; // Cambiar a getUserById
import { useParams } from 'react-router-dom';  // Si estás obteniendo un usuario por ID desde la URL

const UsersForm = ({ isEditMode }) => {
  const [user, setUser] = useState(null);
  const { id } = useParams(); // Si estás obteniendo el id del usuario desde la URL

  useEffect(() => {
    if (isEditMode && id) {
      // Si estamos en modo de edición, obtenemos los datos del usuario
      getUserById(id).then((data) => {
        setUser(data);
      }).catch((err) => {
        console.error("Error al obtener el usuario:", err);
      });
    }
  }, [isEditMode, id]);

  const handleSubmit = (event) => {
    // Lógica para manejar el formulario
  };

  return (
    <div>
      <h1>{isEditMode ? 'Editar Usuario2' : 'Crear Usuario'}</h1>
      {user && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre2</label>
            <input type="text" value={user.name} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={user.email} />
          </div>
          {/* Agrega más campos según lo necesario */}
          <button type="submit">{isEditMode ? 'Actualizar' : 'Crear'}</button>
        </form>
      )}
    </div>
  );
};

export default UsersForm;
