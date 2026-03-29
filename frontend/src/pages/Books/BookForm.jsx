import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { bookService } from '../../api/bookService';

const BookForm = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    total_copies: 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookService.create(formData);
      onRefresh(); // Recharge la liste des livres
      onClose();   // Ferme la modale
    } catch (err) {
      alert("Erreur lors de l'ajout du livre. Vérifiez l'ISBN.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Ajouter un nouveau livre</h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du livre</label>
            <input 
              required
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: L'Intelligence Artificielle en Afrique"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
              <input 
                required
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nom de l'auteur"
                onChange={(e) => setFormData({...formData, author: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input 
                required
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: 978-..."
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'exemplaires</label>
            <input 
              required
              type="number"
              min="1"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.total_copies}
              onChange={(e) => setFormData({...formData, total_copies: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;