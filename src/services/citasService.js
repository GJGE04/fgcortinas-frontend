// services/citasService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

export const getCitas = async () => {
    const res = await fetch(`${API_URL}/citas`);
    return await res.json();
  };
  
  export const crearCita = async (data) => {
    const res = await fetch(`${API_URL}/citas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  };
  
  // Y así para updateCita, deleteCita...
  