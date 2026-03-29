import React, { useEffect, useState } from 'react';
import { memberService } from '../../api/memberService';
import { UserPlus, Search, Mail, Phone, GraduationCap } from 'lucide-react';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAll();
      setMembers(response.data);
    } catch (err) {
      console.error("Erreur microservice Users (8001)", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const filteredMembers = members.filter(m => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Chargement des membres...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un membre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition shadow-md">
          <UserPlus size={18} /> Nouveau Membre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Badge de rôle */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg ${
              member.user_type === 'PROFESSOR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {member.user_type}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
                {member.first_name[0]}{member.last_name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{member.first_name} {member.last_name}</h3>
                <p className="text-xs text-gray-500 font-mono">{member.student_id || 'ID Interne'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" /> {member.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" /> {member.phone || 'Non renseigné'}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <button className="text-xs font-semibold text-blue-600 hover:underline">Voir l'historique</button>
              <button className="text-xs font-semibold text-gray-400 hover:text-red-500">Modifier</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;