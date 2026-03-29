import apiClient from './client';
import { SERVICES_URLS } from './config';

export const borrowingService = {
  getAll: () => apiClient.get(`${SERVICES_URLS.BORROWINGS}/`),

  // Créer un emprunt via l'action dédiée du backend
  create: (data) => apiClient.post(`${SERVICES_URLS.BORROWINGS}/borrow/`, data),

  // Retourner un livre
  returnBook: (id) => apiClient.post(`${SERVICES_URLS.BORROWINGS}/${id}/return/`),

  // Récupérer les emprunts en retard via filtre de statut
  getOverdue: () => apiClient.get(`${SERVICES_URLS.BORROWINGS}/?status=active`)
};