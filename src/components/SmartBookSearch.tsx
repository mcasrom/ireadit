import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, BookOpen, Sparkles, X } from 'lucide-react';

export interface BookCandidate {
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  openLibraryKey?: string;
}

interface SmartBookSearchProps {
  onSelect: (book: BookCandidate) => void;
  onManual: () => void;
}

export default function SmartBookSearch({ onSelect, onManual }: SmartBookSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<BookCandidate | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const search = async (q: string) => {
    if (q.trim().length < 3) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true); setAiSuggestion(null);
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(q));
      const data = await res.json();
      setResults(data.results || []);
      if (data.aiSuggestion) setAiSuggestion(data.aiSuggestion);
    } catch { setResults([]); } finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (book: BookCandidate) => {
    onSelect(book); setQuery(''); setResults([]); setSearched(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input ref={inputRef} type="text" value={query} onChange={handleChange}
          placeholder="Busca por titulo, autor o tema... ej: kafka metamorfosis"
          className="w-full pl-9 pr-9 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition" />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando en Open Library...
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {results.map((book, i) => (
            <button key={i} type="button" onClick={() => handleSelect(book)}
              className="w-full flex items-center gap-3 p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-900 hover:shadow-sm transition text-left group">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title}
                  className="w-10 h-14 object-cover rounded-md shrink-0 shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-10 h-14 bg-slate-100 rounded-md shrink-0 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{book.title}</p>
                <p className="text-xs text-slate-500 truncate">{book.author}</p>
                {book.year && <p className="text-xs text-slate-400 mt-0.5">{book.year}</p>}
              </div>
              <span className="ml-auto text-xs text-slate-400 group-hover:text-slate-900 shrink-0">Añadir →</span>
            </button>
          ))}
        </div>
      )}

      {!loading && aiSuggestion && results.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Sugerencia IA (Gemini)</span>
          </div>
          <button type="button" onClick={() => handleSelect(aiSuggestion)}
            className="w-full flex items-center gap-3 p-2 bg-white border border-amber-200 rounded-lg hover:border-amber-400 transition text-left">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{aiSuggestion.title}</p>
              <p className="text-xs text-slate-500">{aiSuggestion.author}</p>
            </div>
            <span className="ml-auto text-xs text-amber-600 shrink-0">Usar este →</span>
          </button>
        </div>
      )}

      {!loading && searched && results.length === 0 && !aiSuggestion && (
        <div className="text-xs text-slate-400 px-1">No se encontraron resultados. Prueba con otro termino.</div>
      )}

      <div className="text-center pt-1">
        <button type="button" onClick={onManual}
          className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition">
          Introducir manualmente sin buscar
        </button>
      </div>
    </div>
  );
}
