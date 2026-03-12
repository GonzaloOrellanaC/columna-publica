import axios from "./axios";

export async function createUser(data: any) {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/users`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateUser(userId: string, data: any) {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/users/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
export async function getUserById(userId: string) {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;

}

export async function login(email: string, password: string) {
  const response = await axios.post(`/auth/login`, { email, password });
  return response.data;
}


export async function getUsers() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await axios.post(`/auth/forgot-password`, { email });
  return response.data;
}

export async function resetPassword(token: string, newPassword: string) {
  console.log('resetPassword called with token:', token, 'newPassword:', newPassword);
  const response = await axios.post(`/auth/reset-password`, { token, newPassword });
  return response.data;
}