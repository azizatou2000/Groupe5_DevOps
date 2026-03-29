import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Appel au microservice Users (Port 8000)
        axios.get('http://localhost:8000/api/users/')
            .then(response => {
                // DRF renvoie souvent { results: [] } si tu as la pagination
                const data = response.data.results || response.data;
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur API:", err);
                setError("Impossible de charger les utilisateurs.");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Chargement des utilisateurs...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h2>Liste des Utilisateurs (Microservice Users)</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th>Nom Complet</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.first_name} {user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.user_type}</td>
                            <td>{user.is_active ? "✅ Actif" : "❌ Inactif"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;