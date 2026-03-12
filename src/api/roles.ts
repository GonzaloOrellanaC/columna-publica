import axios from './axios';

export async function getRoles() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${(import.meta as any).env.VITE_API_URL}/roles`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}