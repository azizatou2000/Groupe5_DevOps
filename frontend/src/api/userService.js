import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users/';

export const fetchUsers = () => axios.get(API_URL);
export const createUser = (userData) => axios.post(API_URL, userData);