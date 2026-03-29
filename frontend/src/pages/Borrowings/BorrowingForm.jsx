import React, { useState, useEffect } from 'react';
import { bookService } from '../../api/bookService';
import { borrowingService } from '../../api/borrowingService';
import { X, CheckCircle } from 'lucide-react';

const BorrowingForm = ({ onClose, onRefresh }) => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ book_id: '', due_date: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNeededData = async () => {
      const resBooks = await bookService.getAll();
      // On ne montre que les livres disponibles
      setBooks(resBooks.data.filter(b => b.available_copies > 0));
    };
    fetchNeededData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await borrowingService.create(formData);
      onRefresh(); // Recharge la liste des emprunts
      onClose();
    } catch (err) {
      alert("Erreur lors de l'emprunt. Vérifiez si l'utilisateur n'a pas déjà trop d'emprunts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-orange-500 text-white">
          <h3 className="text-xl font-bold">Nouvel Emprunt</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Sélection du Livre (Data de 8001) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Livre à prêter</label>
            <select
              required
              className="w-full border-2 rounded-xl p-3 focus:border-orange-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, book_id: parseInt(e.target.value)})}
            >
              <option value="">Choisir un livre disponible...</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} - {b.author}</option>
              ))}
            </select>
          </div>

          {/* Date de retour prévue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de retour prévue</label>
            <input 
              type="date" 
              required
              className="w-full border-2 rounded-xl p-3 focus:border-orange-500 outline-none"
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors shadow-lg flex justify-center items-center gap-2"
          >
            <CheckCircle size={20} />
            {loading ? "Traitement..." : "Confirmer l'emprunt"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BorrowingForm;