import React, { useState, useEffect } from 'react';
import { api } from '../api';

const LibraryDashboard = () => {
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [userForm, setUserForm] = useState({ email: '', first_name: '', last_name: '', user_type: 'STUDENT' });

    // Charger toutes les données
    const refreshData = async () => {
        try {
            const [resUsers, resBooks] = await Promise.all([api.getUsers(), api.getBooks()]);
            setUsers(resUsers.data.results || resUsers.data);
            setBooks(resBooks.data.results || resBooks.data);
        } catch (err) {
            console.error("Erreur de chargement des microservices", err);
        }
    };

    useEffect(() => { refreshData(); }, []);

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createUser(userForm);
            setUserForm({ email: '', first_name: '', last_name: '', user_type: 'STUDENT' });
            refreshData();
            alert("Utilisateur ajouté !");
        } catch (err) { alert("Erreur lors de l'ajout."); }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
            <h1 style={{ color: '#2c3e50' }}>🛠️ Dashboard Microservices - Groupe 5</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* SECTION UTILISATEURS */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h2 style={{ color: '#2980b9' }}>👥 Gestion des Utilisateurs (Port 8000)</h2>
                    
                    <form onSubmit={handleUserSubmit} style={{ marginBottom: '20px' }}>
                        <input type="text" placeholder="Prénom" style={inputStyle} value={userForm.first_name} onChange={e => setUserForm({...userForm, first_name: e.target.value})} required />
                        <input type="text" placeholder="Nom" style={inputStyle} value={userForm.last_name} onChange={e => setUserForm({...userForm, last_name: e.target.value})} required />
                        <input type="email" placeholder="Email" style={inputStyle} value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required />
                        <button type="submit" style={btnStyle}>Ajouter l'Utilisateur</button>
                    </form>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {users.map(u => (
                            <li key={u.id} style={itemStyle}>
                                <strong>{u.first_name} {u.last_name}</strong> <br/>
                                <small>{u.email} — <span style={{color: '#16a085'}}>{u.user_type}</span></small>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* SECTION LIVRES */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h2 style={{ color: '#e67e22' }}>📚 Catalogue des Livres (Port 8001)</h2>
                    <p>Total des livres disponibles : <strong>{books.length}</strong></p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {books.map(b => (
                            <li key={b.id} style={itemStyle}>
                                📖 <strong>{b.title}</strong> <br/>
                                <small>Auteur : {b.author} | ISBN: {b.isbn}</small>
                            </li>
                        ))}
                    </ul>
                    <button onClick={refreshData} style={{...btnStyle, backgroundColor: '#95a5a6'}}>Actualiser les Livres</button>
                </div>

            </div>
        </div>
    );
};

// Styles rapides en ligne
const inputStyle = { display: 'block', width: '90%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const btnStyle = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const itemStyle = { padding: '10px', backgroundColor: '#f9f9f9', marginBottom: '8px', borderRadius: '4px', borderLeft: '4px solid #3498db' };

export default LibraryDashboard;