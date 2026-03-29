import apiClient from './client';
import { SERVICES_URLS } from './config';

export const bookService = {
    // Récupérer la liste de tous les livres
    getAll: () => {
        return apiClient.get(`${SERVICES_URLS.BOOKS}/`);
    },

    // Récupérer un livre spécifique par son ID
    getById: (id) => {
        return apiClient.get(`${SERVICES_URLS.BOOKS}/${id}/`);
    },

    // Ajouter un nouveau livre au catalogue
    create: (bookData) => {
        return apiClient.post(`${SERVICES_URLS.BOOKS}/`, bookData);
    },

    // Modifier les informations d'un livre
    update: (id, bookData) => {
        return apiClient.patch(`${SERVICES_URLS.BOOKS}/${id}/`, bookData);
    },

    // Supprimer un livre du catalogue
    delete: (id) => {
        return apiClient.delete(`${SERVICES_URLS.BOOKS}/${id}/`);
    }
};