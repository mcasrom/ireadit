import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, BookOpen } from 'lucide-react';

export default function TrendingBooks() {
  const [period, setPeriod] = useState<'daily'|'weekly'|'monthly'>('weekly');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trending/${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Libros Trending</h2>
          <span className="text-xs text-slate-400 font-mono">vía Open Library</span>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['daily','weekly','monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${period === p ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {p === 'daily' ? 'Hoy' : p === 'weekly' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_,i) => (
            <div key={i} className="bg-slate-100 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && data?.works && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.works.map((book: any, i: number) => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  #{i+1}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight">{book.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{book.author}</p>
                {book.firstPublished && (
                  <p className="text-xs text-slate-400 font-mono mt-1">{book.firstPublished}</p>
                )}
                {book.openLibraryKey && (
                  <a href={`https://openlibrary.org${book.openLibraryKey}`} target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    Ver en Open Library <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6 font-mono">
        Datos: Open Library · Actualizado en tiempo real · No afiliados
      </p>
    </div>
  );
}
