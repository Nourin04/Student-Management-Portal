import axios from 'axios';

// Use environment variables for production, fallback to localhost for development
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/students';

export const getStudents = async (search = '') => {
  const response = await axios.get(`${API_URL}?search=${search}`);
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await axios.post(API_URL, studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await axios.put(`${API_URL}/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const sendChatMessage = async (message, history = []) => {
  const aiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:5002/chat';
  const response = await axios.post(aiUrl, { message, history });
  return response.data;
};
