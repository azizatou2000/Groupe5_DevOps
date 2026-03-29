import apiClient from './client';
import { SERVICES_URLS } from './config';

export const memberService = {
  getAll: () => apiClient.get(`${SERVICES_URLS.USERS}/`),
  getOne: (id) => apiClient.get(`${SERVICES_URLS.USERS}/${id}/`),
  create: (data) => apiClient.post(`${SERVICES_URLS.USERS}/`, data),
  update: (id, data) => apiClient.patch(`${SERVICES_URLS.USERS}/${id}/`, data),
  delete: (id) => apiClient.delete(`${SERVICES_URLS.USERS}/${id}/`)
};