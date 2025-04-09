// frontend/src/pages/CrearUsuario.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, Spin, Alert } from 'antd';

const CrearUsuario = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/create-user',
        { email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      alert('Usuario creado con éxito');
    } catch (err) {
      setError(err.response.data.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Crear Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default CrearUsuario;
