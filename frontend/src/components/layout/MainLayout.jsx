import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-xl font-bold tracking-tight">Système de Gestion de Bibliothèque</span>
          <div className="space-x-4">
            <span className="text-sm opacity-80">EDP - Consultant AI</span>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

// CRITIQUE : L'export par défaut pour Rollup
export default MainLayout;