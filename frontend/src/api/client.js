import axios from 'axios';

// Création de l'instance Axios
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
    // Optionnel : timeout de 5 secondes pour éviter les requêtes infinies
    timeout: 5000 
});

// Intercepteur pour gérer les erreurs globales (Optionnel mais recommandé)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Erreur API détaillée:', error.response || error.message);
        return Promise.reject(error);
    }
);

// LE PLUS IMPORTANT : Export par défaut pour éviter l'erreur Rollup
export default apiClient;