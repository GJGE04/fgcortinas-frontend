import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export const createUser = (userData) => {
  return axios.post(API_URL, userData);
};

export const getUsers = () => {
  return axios.get(API_URL);
};

export const getUserById = (userId) => {
  return axios.get(`${API_URL}/${userId}`);
};

export const updateUser = (userId, userData) => {
  return axios.put(`${API_URL}/${userId}`, userData);
};

export const deleteUser = (userId) => {
  return axios.delete(`${API_URL}/${userId}`);
};
