import axios from './axios';

export async function getPublications(params?: { author?: string; skip?: number; limit?: number }) {
  const response = await axios.get('/publications', {
    params: {
      author: params?.author,
      skip: params?.skip,
      limit: params?.limit,
    }
  });
  return response.data;
}

export async function getPublicationsToEditor(params?: { author?: string; skip?: number; limit?: number }) {
  const response = await axios.get('/publications/editor', {
    params: {
      author: params?.author,
      skip: params?.skip,
      limit: params?.limit,
    }
  });
  return response.data;
}

export const getPublicationById = async (id: string) => {
  const response = await axios.get(`/publications/${id}`);
  return response.data;
}

export const getPublicationByFullName = async (fullName: string) => {
  const response = await axios.get(`/publications/author/${encodeURIComponent(fullName)}`);
  return response.data;
}

export const getPublicationByAuthorId = async (authorId: string) => {
  const response = await axios.get(`/publications/author-id/${authorId}`);
  return response.data;
}

export const postPublication = async (publication: any, file?: File) => {
  const fd = new FormData();
  fd.append('title', publication.title);
  fd.append('author', publication.author);
  fd.append('content', publication.content);
  fd.append('status', publication.status);
  if (publication.tags) fd.append('tags', typeof publication.tags === 'string' ? publication.tags : JSON.stringify(publication.tags));
  if (file) fd.append('image', file);
  console.log('Posting publication with data:', fd);
  const token = localStorage.getItem('token');
  const response = await axios.post('/publications', fd, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export const approvePublication = async (publication: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/publications/${publication.id || publication._id}/approve`, {...publication}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export const rejectPublication = async (publication: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/publications/${publication.id || publication._id}/reject`, {...publication}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export const updatePublication = async (id: string, publication: any, file?: File) => {
  const fd = new FormData();
  if (publication.title) fd.append('title', publication.title);
  if (publication.content) fd.append('content', publication.content);
  if (publication.status) fd.append('status', publication.status);
  if (publication.publicationDate) fd.append('publicationDate', publication.publicationDate);
  if (publication.tags) fd.append('tags', typeof publication.tags === 'string' ? publication.tags : JSON.stringify(publication.tags));
  if (file) fd.append('image', file);
  const token = localStorage.getItem('token');
  const response = await axios.put(`/publications/${id}`, fd, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
