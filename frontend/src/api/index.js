import axios from 'axios';

// Instances Axios pour chaque microservice
const usersApi = axios.create({ baseURL: 'http://localhost:8000/api/users/' });
const booksApi = axios.create({ baseURL: 'http://localhost:8001/api/books/' });

export const api = {
    // Appels pour le service USERS
    getUsers: () => usersApi.get(''),
    createUser: (data) => usersApi.post('', data),

    // Appels pour le service BOOKS
    getBooks: () => booksApi.get(''),
    createBook: (data) => booksApi.post('', data),
};