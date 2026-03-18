import axios from './axios';

export const getTags = async () => {
  const response = await axios.get('/tags');
  return response.data;
}

export default { getTags };
