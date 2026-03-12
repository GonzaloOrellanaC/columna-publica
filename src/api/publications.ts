import axios from './axios';

export async function getPublications() {
  const response = await axios.get('/publications');
  return response.data;
}
