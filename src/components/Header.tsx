import React from 'react';
import { BookReview } from '../types';
import { BookOpen, Star, Sparkles, Shield, RefreshCw, TrendingUp } from 'lucide-react';

interface HeaderProps {
  books: BookReview[];
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export default function Header({ books, onRefresh, activeTab, setActiveTab, onOpenAddModal }: HeaderProps) {
  const totalBooks = books.length;
  const avgRating = totalBooks > 0
    ? (books.reduce((acc, b) => acc + b.rating, 0) / totalBooks).toFixed(1)
    : "0.0";

  const tabs = [
    { id: 'mural',      label: '🌀 Mural',        color: 'slate' },
    { id: 'populares',  label: '🔥 Populares',     color: 'slate' },
    { id: 'bento',      label: '🔲 Bento',         color: 'slate' },
    { id: 'viajeros',   label: '✈ Viajeros',       color: 'indigo' },
    { id: 'trending',   label: '📈 Trending',      color: 'emerald' },
    { id: 'gdpr',       label: '🛡 RGPD',          color: 'red' },
  ];

  const tabClass = (tab: typeof tabs[0]) => {
    const active = activeTab === tab.id;
    const colors: Record<string, string> = {
      slate:   active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
      indigo:  active ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200',
      emerald: active ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200',
      red:     active ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50 border border-dotted border-red-200',
    };
    return `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${colors[tab.color]}`;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top bar — logo + stats + action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">

          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 bg-slate-900 text-white rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Ireadit</span>
              <span className="ml-2 text-xs text-slate-400 hidden sm:inline font-mono">mural literario</span>
            </div>
          </div>

          {/* Stats — inline, compactas */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-500 border-l border-slate-100 pl-4">
            <span><strong className="text-slate-900">{totalBooks}</strong> leídos</span>
            <span className="flex items-center gap-0.5">
              <strong className="text-slate-900">{avgRating}</strong>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <button onClick={onRefresh}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Anotar</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabClass(tab)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
