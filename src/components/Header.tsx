import React from 'react';
import { BookReview } from '../types';
import { BookOpen, Star, Sparkles, Shield, RefreshCw } from 'lucide-react';

interface HeaderProps {
  books: BookReview[];
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export default function Header({ books, onRefresh, activeTab, setActiveTab, onOpenAddModal }: HeaderProps) {
  // Compute Stats
  const totalBooks = books.length;
  const avgRating = totalBooks > 0 
    ? (books.reduce((acc, b) => acc + b.rating, 0) / totalBooks).toFixed(1)
    : "0.0";
  
  // Calculate top read category
  const categories: Record<string, number> = {};
  books.forEach(b => {
    categories[b.category] = (categories[b.category] || 0) + 1;
  });
  
  let topCategory = "Ninguna";
  let maxCount = 0;
  Object.entries(categories).forEach(([cat, num]) => {
    if (num > maxCount) {
      maxCount = num;
      topCategory = cat;
    }
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl shadow-md flex items-center justify-center">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Ireadit</h1>
                <span className="px-2 py-0.5 text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Mural Activo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Wallboard literario para Devs & Tech Enthusiasts • Anti-Spam IA + RGPD compliance
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg w-full md:w-auto">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
              <span className="block text-2xs text-slate-400 font-mono uppercase tracking-wider">Leídos</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{totalBooks}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
              <span className="block text-2xs text-slate-400 font-mono uppercase tracking-wider">Valoración Media</span>
              <span className="text-lg font-bold text-slate-900 font-mono flex items-center justify-center gap-1">
                {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
              <span className="block text-2xs text-slate-400 font-mono uppercase tracking-wider">Tema Líder</span>
              <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5" title={topCategory}>
                {topCategory}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={onRefresh}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition duration-150"
              title="Sincronizar Mural"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium shadow-sm transition duration-150 font-sans"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Anotar Lectura</span>
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-t border-slate-100 mt-4 pt-3 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('mural')}
            className={`px-4 py-2 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition duration-150 ${
              activeTab === 'mural'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            🌀 Mural Excéntrico (Del Centro Afuera)
          </button>
          <button
            onClick={() => setActiveTab('populares')}
            className={`px-4 py-2 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition duration-150 ${
              activeTab === 'populares'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            🔥 Los Más Leídos e Impactantes
          </button>
          <button
            onClick={() => setActiveTab('bento')}
            className={`px-4 py-2 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition duration-150 ${
              activeTab === 'bento'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            🔲 Mosaico Bento (Por Categorías)
          </button>
          <button
            onClick={() => setActiveTab('viajeros')}
            className={`px-4 py-2 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition duration-150 ${
              activeTab === 'viajeros'
                ? 'bg-indigo-650 text-white shadow-sm'
                : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 border border-indigo-150'
            }`}
          >
            ✈️ Traveller Books / Libros de Viaje
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-2 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition duration-150 ${
              activeTab === 'trending'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            📈 Trending Books
          </button>
          <button
            onClick={() => setActiveTab('gdpr')}
            className={`ml-auto px-4 py-2 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition duration-150 flex items-center gap-1.5 ${
              activeTab === 'gdpr'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-red-650 hover:text-red-700 bg-red-50/50 hover:bg-red-50 border border-dotted border-red-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Derecho al Olvido (RGPD)</span>
          </button>
        </div>

      </div>
    </header>
  );
}
