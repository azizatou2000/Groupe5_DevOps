import React, { useEffect, useState } from 'react';
import { bookService } from '../../api/bookService';
import { Plus, Search, Trash2, Edit, Loader2 } from 'lucide-react';
import BookForm from './BookForm'; // Importation du formulaire de création

const BooksList = () => {
  // --- 1. États (States) ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour la modale

  // --- 2. Chargement des données ---
  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur de connexion au microservice Books (Port 8002).");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // --- 3. Logique de filtrage ---
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  // --- 4. Rendu de chargement ---
  if (loading && books.length === 0) return (
    <div className="flex flex-col justify-center items-center py-20">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <span className="text-gray-600 font-medium">Accès au catalogue...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Barre d'actions supérieure */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par titre, auteur ou ISBN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          />
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          <span className="font-semibold">Nouveau Livre</span>
        </button>
      </div>

      {/* Message d'erreur si le microservice est HS */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Ici vous pouvez ajouter la suite de votre affichage (Tableau ou Grille de livres) */}
      
    </div>
  );
};

export default BooksList;