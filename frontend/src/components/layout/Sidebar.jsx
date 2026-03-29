import React from 'react';
import { 
  Book, 
  Users, 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'books', icon: Book, label: 'Catalogue' },
    { id: 'users', icon: Users, label: 'Communauté' },
    { id: 'loans', icon: BookOpen, label: 'Flux Emprunts' },
    { id: 'ai', icon: Sparkles, label: 'Intelligence IA' },
  ];

  return (
    <div className="fixed h-screen w-72 bg-[#020617] border-r border-slate-800/60 flex flex-col z-50">
      {/* Header avec Gradient */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Book className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">KingMoussa</h1>
            <p className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">Library OS</p>
          </div>
        </div>
      </div>

      {/* Navigation Stylisée */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              {/* Barre de sélection lumineuse */}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              )}
              
              <item.icon 
                size={20} 
                className={`${isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "group-hover:scale-110 transition-transform"}`} 
              />
              <span className="font-semibold text-sm tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800/50">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200">
          <LogOut size={18} />
          <span className="text-sm font-bold">Quitter la session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;