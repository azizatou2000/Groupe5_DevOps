import React, { useState, useEffect } from 'react';
import { fetchUsers, createUser } from '../api/userService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        user_type: 'STUDENT'
    });

    // Charger les utilisateurs au démarrage
    const loadUsers = async () => {
        try {
            const response = await fetchUsers();
            // Si tu utilises la pagination DRF, les données sont dans response.data.results
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Gérer l'envoi du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUser(formData);
            alert("Utilisateur créé avec succès !");
            setFormData({ email: '', first_name: '', last_name: '', user_type: 'STUDENT' });
            loadUsers(); // Recharger la liste
        } catch (error) {
            console.error("Erreur de création:", error.response?.data || error.message);
            alert("Erreur lors de la création. Vérifiez la console.");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>🆕 Ajouter un Utilisateur</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Prénom" value={formData.first_name} 
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                <input type="text" placeholder="Nom" value={formData.last_name} 
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                <input type="email" placeholder="Email" value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <select value={formData.user_type} onChange={(e) => setFormData({...formData, user_type: e.target.value})}>
                    <option value="STUDENT">Étudiant</option>
                    <option value="PROFESSOR">Professeur</option>
                </select>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 15px' }}>
                    Enregistrer
                </button>
            </form>

            <hr />

            <h2>👥 Liste des Utilisateurs (Microservice 8000)</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map(u => (
                    <li key={u.id} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                        <strong>{u.first_name} {u.last_name}</strong> - {u.email} 
                        <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#666' }}>({u.user_type})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagement;