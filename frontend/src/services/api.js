import axios from 'axios';

const apiUsers = axios.create({ baseURL: import.meta.env.VITE_API_USERS });
const apiBooks = axios.create({ baseURL: import.meta.env.VITE_API_BOOKS });

export const getUsers = () => apiUsers.get('/');
export const getBooks = () => apiBooks.get('/');