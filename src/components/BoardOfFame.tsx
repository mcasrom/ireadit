import React, { useState, useEffect } from 'react';
import { BookReview } from '../types';
import { Heart, ThumbsDown, Recycle, Star, Trash2, Shield, Search, Award, Compass, HelpCircle, BookOpen, Download, ExternalLink, Globe, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface BoardOfFameProps {
  books: BookReview[];
  onReact: (id: string, type: 'like' | 'dislike') => void;
  onDelete: (id: string) => void;
  userToken: string;
  activeTab: string;
  onRefresh?: () => void;
}

export default function BoardOfFame({ books, onReact, onDelete, userToken, activeTab, onRefresh }: BoardOfFameProps) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [gutenbergLang, setGutenbergLang] = useState<'all' | 'es' | 'en'>('all');
  const [importingId, setImportingId] = useState<number | null>(null);
  const [gutenbergClassicsList, setGutenbergClassicsList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/gutenberg/classics')
      .then(r => r.json())
      .then(data => setGutenbergClassicsList(data))
      .catch(() => {});
  }, []);

  const filteredGutenbergClassics = gutenbergClassicsList.filter(c => {
    if (gutenbergLang === 'all') return true;
    return c.language === gutenbergLang;
  });

  const handleImportClassic = async (id: number) => {
    setImportingId(id);
    try {
      const res = await fetch('/api/gutenberg/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gutenbergId: id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "¡Importado correctamente!");
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "Fallo en la importación de Project Gutenberg.");
      }
    } catch (err) {
      alert("Error al contactar con el servidor.");
    } finally {
      setImportingId(null);
    }
  };

  const allCategories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  const categoryThemeMap: Record<string, string> = {
    Linux: "bg-amber-100 border-amber-200 text-amber-800",
    IA: "bg-purple-100 border-purple-200 text-purple-800",
    "Soft Dev": "bg-emerald-100 border-emerald-200 text-emerald-800",
    RRSS: "bg-sky-100 border-sky-200 text-sky-800",
    Novela: "bg-rose-100 border-rose-200 text-rose-800",
    Viaje: "bg-indigo-100 border-indigo-200 text-indigo-900 font-bold",
    Otros: "bg-slate-100 border-slate-200 text-slate-700"
  };

  const getCatTheme = (cat: string) => categoryThemeMap[cat] || "bg-slate-100 border-slate-200 text-slate-700";

  const containerColors: Record<string, string> = {
    slate: "bg-slate-50 border-slate-200 text-slate-850",
    red: "bg-red-50 border-red-200 text-red-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-950",
    sky: "bg-sky-50 border-sky-200 text-sky-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900"
  };

  const getCoverColor = (color: string) => containerColors[color] || "bg-slate-50 border-slate-200 text-slate-850";

  const filteredBooks = books.filter(b => {
    const matchesCat = filterCategory === 'All' || b.category === filterCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const popularBooks = [...books].sort((x, y) => {
    const valX = (x.likes || 0) + (x.rating * 3);
    const valY = (y.likes || 0) + (y.rating * 3);
    return valY - valX;
  });

  // ── TAB: POPULARES ──────────────────────────────────────────────────────────
  if (activeTab === 'populares') {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
        <div className="border-b border-slate-100 pb-5">
          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-700 border border-rose-200 font-mono text-2xs font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
            Los Más Leídos e Impactantes
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-500" />
            Lecturas de Mayor Tracción e Impacto
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Ponderado según el total de valoraciones positivas brindadas por la comunidad.
          </p>
        </div>
        {popularBooks.length === 0 ? (
          <p className="text-center py-12 text-xs text-slate-400 font-mono">No hay lecturas registradas.</p>
        ) : (
          <div className="space-y-4">
            {popularBooks.map((book, index) => {
              const score = (book.likes || 0) + (book.rating * 3);
              return (
                <div key={book.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-2xl transition duration-150">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm tracking-tight font-mono shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{book.emoji}</span>
                        <h3 className="font-bold text-slate-900">{book.title}</h3>
                        <span className={`px-2 py-0.5 text-3xs font-mono rounded-full font-bold ${getCatTheme(book.category)}`}>
                          {book.category}
                        </span>
                      </div>
                      <p className="text-2xs text-slate-500 font-mono">Escrito por {book.author}</p>
                      <p className="text-xs text-slate-650 mt-1 italic font-sans max-w-xl">&rdquo;{book.comment}&rdquo;</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-200 pt-2.5 sm:pt-0 shrink-0">
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Puntuación Global</span>
                      <span className="text-sm font-bold font-mono text-indigo-700">{score} pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onReact(book.id, 'like')} className="bg-white hover:bg-slate-150 text-slate-700 px-2.5 py-1.5 rounded-lg text-2xs font-mono font-bold flex items-center gap-1 border border-slate-200 transition">
                        <Heart className="w-3" /><span>{book.likes || 0}</span>
                      </button>
                      {book.editToken === userToken && (
                        <button onClick={() => onDelete(book.id)} className="bg-red-50 hover:bg-red-100 text-red-650 px-2.5 py-1.5 rounded-lg text-2xs transition border border-red-200 font-semibold" title="Purga inmediata (RGPD)">
                          <Trash2 className="w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── TAB: VIAJEROS ───────────────────────────────────────────────────────────
  if (activeTab === 'viajeros') {
    const travelBooks = books.filter(b => b.category === 'Viaje');
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-205 shadow-sm space-y-8 animate-fade-in" id="traveller-books-panel">
        <div className="border-b border-slate-100 pb-5">
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-2xs font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
            ✈ Ecosistema viajeinteligencia.com
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                Travellers Books / Libros de Viaje
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Espacio curado de literatura de aventura, crónicas y geopolítica del viajero.
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-1 rounded-lg border border-emerald-200">● API Widget Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              📖 Catálogo Activo ({travelBooks.length} libros)
            </h3>
            {travelBooks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-150 rounded-2xl">
                <p className="text-xs text-slate-400 font-mono">No hay libros en categoría "Viaje" aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travelBooks.map((book) => (
                  <div key={book.id} className="p-5 bg-gradient-to-tr from-indigo-50/20 to-white border border-indigo-150 rounded-2xl flex flex-col justify-between shadow-3xs hover:-translate-y-0.5 hover:shadow-xs transition duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-100/40">
                        <span className="text-2xl">{book.emoji || "✈"}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded">Traveller Book</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight font-sans">{book.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Por {book.author}</p>
                      <p className="text-xs text-slate-755 mt-3 italic font-sans leading-relaxed bg-white/60 p-2.5 rounded-lg border border-indigo-100/20">
                        &ldquo;{book.comment}&rdquo;
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-indigo-50/60 flex items-center justify-between text-2xs text-slate-500 font-mono">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-205'}`} />
                        ))}
                      </div>
                      <button onClick={() => onReact(book.id, 'like')} className="bg-white hover:bg-slate-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 font-bold transition flex items-center gap-1 text-[10px]">
                        <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500/10" /><span>{book.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-3xs">
            <div className="space-y-3">
              <span className="text-[9px] bg-slate-900 text-slate-200 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit">Widget OSINT</span>
              <h4 className="text-xs font-bold text-slate-900 font-sans">Sincronización con viajeinteligencia.com</h4>
              <p className="text-3xs text-slate-600 leading-relaxed font-sans">
                Embebe este feed en cualquier post de <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-mono font-bold">viajeinteligencia.com</code>.
              </p>
              <div className="space-y-1 pt-1">
                <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Iframe embed:</span>
                <pre className="bg-slate-900 text-indigo-300 p-2.5 rounded-lg text-[9px] font-mono overflow-x-auto border border-slate-950 max-h-36 select-all">
{`<iframe 
  src="${window.location.origin}/api/widget/viaje" 
  style="border:none; width:100%; height:450px; border-radius:16px;" 
  title="Travellers Books">
</iframe>`}
                </pre>
              </div>
              <a href="/api/books" target="_blank" className="block text-[10px] text-center font-bold text-indigo-650 bg-indigo-50 border border-indigo-200 rounded-lg p-2 hover:bg-indigo-100/60 transition">
                Probar API REST (/api/books) ↗
              </a>
            </div>
            <div className="p-3 bg-white border border-indigo-100 rounded-xl">
              <span className="block text-[9px] font-bold text-indigo-900 font-sans uppercase mb-1">RGPD:</span>
              <p className="text-[10px] text-slate-500 font-sans leading-normal">
                El widget filtra solo reseñas con etiqueta <code className="bg-slate-100 font-mono p-0.5 rounded text-indigo-850">"Viaje"</code> aprobadas por Admin.
              </p>
            </div>
          </div>
        </div>

        {/* Project Gutenberg */}
        <div className="border-t border-slate-100 pt-8 space-y-6 animate-fade-in" id="gutenberg-classics-section">
          <div>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
              📚 Project Gutenberg
            </span>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-650 shrink-0" />
              Clásicos de Viaje de Dominio Público
            </h3>
          </div>
          <div className="flex gap-2">
            {(['all','es','en'] as const).map(lang => (
              <button key={lang} onClick={() => setGutenbergLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${gutenbergLang === lang ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {lang === 'all' ? '🌍 Todos' : lang === 'es' ? '🇪🇸 Castellano' : '🇬🇧 Inglés'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGutenbergClassics.map((classic) => {
              const bookExistsInMural = books.some(b => b.gutenbergId === classic.gutenbergId);
              return (
                <div key={classic.gutenbergId} className={`bg-slate-50/60 p-5 rounded-2xl border transition relative flex flex-col justify-between ${bookExistsInMural ? 'border-indigo-200 bg-indigo-50/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                  {bookExistsInMural && (
                    <span className="absolute top-3 right-3 text-[9px] bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded-full uppercase">✓ En Mural</span>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{classic.emoji}</span>
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-705 font-mono uppercase font-bold px-1.5 py-0.5 rounded">#{classic.gutenbergId}</span>
                        <span className="text-[9px] ml-1.5 font-bold text-slate-500 font-mono">{classic.language === 'es' ? '🇪🇸' : '🇬🇧'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug font-sans">{classic.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Por <strong>{classic.author}</strong></p>
                    </div>
                    <p className="text-2xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">&ldquo;{classic.comment}&rdquo;</p>
                    <div className="text-[9px] font-sans text-slate-500 leading-normal">💡 <strong>Para:</strong> {classic.recommendation}</div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-150 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a href={classic.gutenbergLink} target="_blank" rel="noreferrer" className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[9px] font-semibold font-mono text-center border border-slate-200 flex items-center justify-center gap-1 transition">
                        <ExternalLink className="w-2.5 h-2.5" />Gutenberg ↗
                      </a>
                      <a href={classic.gutenbergTextLink} target="_blank" rel="noreferrer" className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-semibold font-mono text-center border border-indigo-200 flex items-center justify-center gap-1 transition">
                        <Download className="w-2.5 h-2.5" />Ver Gratis 🡥
                      </a>
                    </div>
                    <button onClick={() => handleImportClassic(classic.gutenbergId)} disabled={importingId === classic.gutenbergId || bookExistsInMural}
                      className={`w-full py-2 px-3 rounded-lg text-2xs font-bold font-sans flex items-center justify-center gap-1.5 transition ${bookExistsInMural ? 'bg-emerald-50 text-emerald-800 border border-emerald-250 cursor-not-allowed' : 'bg-indigo-650 text-white hover:bg-indigo-700 active:scale-[0.98]'}`}>
                      {bookExistsInMural ? <>✓ Publicado en el Muro</> : importingId === classic.gutenbergId ? <>Importando...</> : <><Plus className="w-3.5 h-3.5" />Importar al Muro</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── TAB: BENTO ──────────────────────────────────────────────────────────────
  if (activeTab === 'bento') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-5 border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 md:pb-0">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${filterCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {cat === 'All' ? '📂 Todas' : cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar título, autor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 transition" />
          </div>
        </div>
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-6">
            <p className="text-slate-400 font-mono text-xs">No se encontraron lecturas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <motion.div layoutId={`radial-card-${book.id}`} key={book.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${getCoverColor(book.coverColor)}`}>
                <div>
                  <div className="flex items-center justify-between border-b border-dotted border-slate-200 pb-3.5 mb-4">
                    <span className="text-3xl">{book.emoji}</span>
                    <span className={`px-2.5 py-0.5 text-2xs font-bold font-mono rounded-full ${getCatTheme(book.category)}`}>{book.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight tracking-tight">{book.title}</h3>
                  <p className="text-2xs text-slate-500 font-mono mt-0.5">Escrito por {book.author}</p>
                  <p className="text-xs text-slate-800 mt-4 leading-relaxed italic font-sans bg-white/50 p-3 rounded-xl border border-slate-200/50">&ldquo;{book.comment}&rdquo;</p>
                  <div className="mt-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">💡 {book.recommendation}</p>
                  </div>
                  <div className="mt-2 text-2xs text-indigo-600 font-mono italic line-clamp-1">✨ {book.aiSummary}</div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onReact(book.id, 'like')} className="bg-white/80 hover:bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border border-slate-200 shadow-3xs">
                      <Heart className="w-3 h-3 fill-rose-500/10" /><span>{book.likes || 0}</span>
                    </button>
                    {book.editToken === userToken && (
                      <button onClick={() => onDelete(book.id)} className="bg-red-50 hover:bg-red-100 text-red-650 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition border border-red-200">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── TAB: MURAL (DEFAULT) ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10 border-b border-slate-850 pb-5 mb-8">
          <div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-2xs font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
              Visualizador Excéntrico
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              Mural Concéntrico
            </h2>
            <p className="text-xs text-slate-400 max-w-xl font-sans mt-1">
              Las últimas novedades en el <strong className="text-white">Núcleo Central</strong>. Las más antiguas fluyen hacia la <strong className="text-white">Periferia Exterior</strong>.
            </p>
          </div>
          <div className="text-2xs text-slate-500 bg-slate-950/65 border border-slate-800 p-2.5 rounded-xl font-mono self-start">
            🛡 <span className="text-indigo-300 font-bold">Anti-Fraude Activo</span>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 font-mono text-xs">Mural vacío. Sé el primero en registrar una lectura.</p>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col gap-8">

            {/* ── LEVEL 1: Núcleo — último libro, tarjeta grande ── */}
            <div className="flex flex-col items-center">
              <div className="text-center mb-3">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] uppercase font-mono tracking-widest rounded-full border border-amber-500/40 font-bold">
                  🌌 NÚCLEO ACTIVO (Más Reciente)
                </span>
              </div>
              <div className="w-full max-w-2xl relative">
                <div className="absolute -inset-4 border border-dashed border-indigo-500/20 rounded-2xl pointer-events-none animate-pulse" />
                {books.slice(0, 1).map((book) => (
                  <motion.div layoutId={`radial-card-${book.id}`} key={book.id}
                    className={`rounded-2xl border-2 p-4 shadow-lg relative transition hover:shadow-indigo-500/10 ${getCoverColor(book.coverColor)}`}>
                    <div className="flex items-center justify-between gap-2 mb-3.5 border-b border-dotted border-slate-300 pb-3">
                      <span className="text-3xl">{book.emoji}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-slate-900 text-white rounded-full">{book.category}</span>
                        <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">Novedad Central</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900 leading-snug">{book.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Por {book.author}</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans mt-2 bg-white/70 p-2 rounded-lg border border-slate-200/60 italic">&ldquo;{book.comment}&rdquo;</p>
                    <div className="mt-3 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <p className="text-xs text-slate-600 line-clamp-2">💡 {book.recommendation}</p>
                    </div>
                    <p className="mt-2 text-2xs font-mono text-indigo-600 italic line-clamp-1">✨ {book.aiSummary}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-205">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-4 h-4 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        {book.repeat && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100/50 px-1.5 py-0.5 rounded">
                            <Recycle className="w-3 h-3" /> Repetiría
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onReact(book.id, 'like')} className="bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 border border-slate-200 shadow-xs transition">
                          <Heart className="w-3.5 h-3.5 fill-rose-500/20" /><span>{book.likes || 0}</span>
                        </button>
                        <button onClick={() => onReact(book.id, 'dislike')} className="bg-white/80 hover:bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 border border-slate-200 shadow-xs transition">
                          <ThumbsDown className="w-3.5 h-3.5" /><span>{book.dislikes || 0}</span>
                        </button>
                        {book.editToken === userToken && (
                          <button onClick={() => onDelete(book.id)} className="bg-red-50 hover:bg-red-100 text-red-650 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-red-200 transition">
                            <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Purga RGPD</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Divider L1→L2 */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-750 to-transparent" />
              <span className="relative px-3 py-1 bg-slate-950 border border-slate-800 text-[9px] text-slate-400 font-mono rounded-full">
                Órbita Media · Nivel II
              </span>
            </div>

            {/* ── LEVEL 2: Órbita media — tarjeta compacta (emoji + título + autor + estrellas + like) ── */}
            {books.slice(1, 4).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {books.slice(1, 4).map((book) => (
                  <motion.div layoutId={`radial-card-${book.id}`} key={book.id}
                    className={`rounded-xl border p-3 shadow-sm flex flex-col gap-2 transition hover:scale-[1.01] ${getCoverColor(book.coverColor)}`}>
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{book.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{book.title}</h4>
                          <p className="text-[10px] text-slate-500 font-mono truncate">Por {book.author}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full shrink-0 ml-1 ${getCatTheme(book.category)}`}>
                        {book.category}
                      </span>
                    </div>
                    {/* Footer row: stars + like + delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onReact(book.id, 'like')} className="bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 px-2 py-1 rounded text-[10px] font-mono font-medium flex items-center gap-0.5 border border-slate-200">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500/15" /><span>{book.likes || 0}</span>
                        </button>
                        {book.editToken === userToken && (
                          <button onClick={() => onDelete(book.id)} className="bg-red-50 hover:bg-red-100 text-red-650 px-2 py-1 rounded text-[10px] border border-red-200">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Divider L2→L3 */}
            {books.length > 4 && (
              <>
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                  <span className="relative px-3 py-1 bg-slate-950 border border-slate-800 text-[9px] text-slate-400 font-mono rounded-full">
                    Órbita Periférica Exterior · Lecturas Consolidadas
                  </span>
                </div>

                {/* ── LEVEL 3: Chips horizontales ── */}
                <div className="flex flex-col gap-2">
                  {books.slice(4).map((book) => (
                    <motion.div layoutId={`radial-card-${book.id}`} key={book.id}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 transition hover:border-slate-700">
                      <span className="text-lg shrink-0">{book.emoji}</span>
                      <span className="text-xs font-bold text-white truncate flex-1" title={book.title}>{book.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0 hidden sm:block">Por {book.author}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded shrink-0 bg-slate-800 text-slate-300`}>{book.category}</span>
                      <span className="text-amber-400 font-bold font-mono text-[10px] shrink-0">{book.rating}★</span>
                      <button onClick={() => onReact(book.id, 'like')} className="text-slate-400 hover:text-rose-500 flex items-center gap-0.5 text-[10px] font-mono shrink-0">
                        <Heart className="w-2.5 h-2.5" /><span>{book.likes || 0}</span>
                      </button>
                      {book.editToken === userToken && (
                        <button onClick={() => onDelete(book.id)} className="text-slate-600 hover:text-red-500 shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
