import axios from './axios';

export async function getUserByFullName(fullName: string) {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/users/by-name/${encodeURIComponent(fullName)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}