import React, { useEffect, useState } from 'react';
import { borrowingService } from '../../api/borrowingService';
import { Clock, CheckCircle2, AlertCircle, RotateCcw, Plus } from 'lucide-react';
import BorrowingForm from './BorrowingForm';

const BorrowingsList = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadBorrowings = async () => {
    try {
      setLoading(true);
      const response = await borrowingService.getAll();
      setBorrowings(response.data);
    } catch (err) {
      console.error("Erreur microservice Borrowings (8002)", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBorrowings(); }, []);

  // Fonction pour gérer le retour d'un livre
  const handleReturn = async (id) => {
    if (window.confirm("Confirmer le retour de cet ouvrage ?")) {
      try {
        await borrowingService.returnBook(id);
        loadBorrowings(); // Rafraîchir la liste
      } catch (err) {
        alert("Erreur lors du retour.");
      }
    }
  };

  // Logique pour vérifier si un emprunt est en retard
  const isOverdue = (dueDate, returnedAt) => {
    if (returnedAt) return false; // Déjà rendu
    return new Date(dueDate) < new Date(); // Date passée
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Analyse des emprunts en cours...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestion des Flux</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition shadow-lg"
        >
          <Plus size={20} /> Nouvel Emprunt
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">Lecteur / Livre</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Date d'emprunt</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Retour prévu</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Statut</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {borrowings.map((b) => {
              const overdue = isOverdue(b.due_date, b.returned_at);

              return (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{b.user_email || `Utilisateur #${b.user_id}`}</div>
                    <div className="text-xs text-slate-500">{b.book_title || `Livre #${b.book_id}`}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{new Date(b.borrowed_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm">
                    <span className={overdue ? "text-red-600 font-bold flex items-center gap-1" : "text-slate-600"}>
                      {overdue && <AlertCircle size={14} />}
                      {new Date(b.due_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {b.returned_at ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={12} /> Rendu le {new Date(b.returned_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${overdue ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                        <Clock size={12} /> {overdue ? 'EN RETARD' : 'En cours'}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!b.returned_at && (
                      <button 
                        onClick={() => handleReturn(b.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <RotateCcw size={14} /> Enregistrer le retour
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && <BorrowingForm onClose={() => setIsModalOpen(false)} onRefresh={loadBorrowings} />}
    </div>
  );
};

export default BorrowingsList;