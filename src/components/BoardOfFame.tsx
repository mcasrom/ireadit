import React, { useState, useEffect } from 'react';
import { BookReview } from '../types';
import { Heart, ThumbsDown, Recycle, Star, Calendar, Trash2, Shield, Search, ArrowUpRight, Award, Compass, HelpCircle, BookOpen, Download, ExternalLink, Globe, Plus } from 'lucide-react';
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

  // Extract categories dynamically
  const allCategories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  // Map of categories and aesthetic labels
  const categoryThemeMap: Record<string, string> = {
    Linux: "bg-amber-100 border-amber-200 text-amber-800",
    IA: "bg-purple-100 border-purple-200 text-purple-800",
    "Soft Dev": "bg-emerald-100 border-emerald-200 text-emerald-800",
    RRSS: "bg-sky-100 border-sky-200 text-sky-800",
    Novela: "bg-rose-100 border-rose-200 text-rose-800",
    Viaje: "bg-indigo-100 border-indigo-200 text-indigo-800 font-bold",
    Otros: "bg-slate-100 border-slate-200 text-slate-700"
  };

  const getCatTheme = (cat: string) => categoryThemeMap[cat] || "bg-slate-100 border-slate-200 text-slate-700";

  // Cover background styles for aesthetic cards
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

  // Filter & Search Logic (for bento grid)
  const filteredBooks = books.filter(b => {
    const matchesCat = filterCategory === 'All' || b.category === filterCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate popularity ranking: rating * 3 + likes
  const popularBooks = [...books].sort((x, y) => {
    const valX = (x.likes || 0) + (x.rating * 3);
    const valY = (y.likes || 0) + (y.rating * 3);
    return valY - valX;
  });

  // Conditional rendering for Popularity list
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
            Ponderado según el total de valoraciones positivas brindadas por la comunidad. ¡Los de mayor densidad de conocimiento e ideas de la comunidad lideran el podio!
          </p>
        </div>

        {popularBooks.length === 0 ? (
          <p className="text-center py-12 text-xs text-slate-400 font-mono">No hay lecturas registradas para realizar análisis.</p>
        ) : (
          <div className="space-y-4">
            {popularBooks.map((book, index) => {
              const score = (book.likes || 0) + (book.rating * 3);
              return (
                <div key={book.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-2xl transition duration-150">
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
                      <button
                        onClick={() => onReact(book.id, 'like')}
                        className="bg-white hover:bg-slate-150 text-slate-700 px-2.5 py-1.5 rounded-lg text-2xs font-mono font-bold flex items-center gap-1 border border-slate-200 transition"
                      >
                        <Heart className="w-3" />
                        <span>{book.likes || 0}</span>
                      </button>
                      
                      {book.editToken === userToken && (
                        <button
                          onClick={() => onDelete(book.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-650 px-2.5 py-1.5 rounded-lg text-2xs transition border border-red-200 font-semibold"
                          title="Purga inmediata (RGPD)"
                        >
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

  // Conditional rendering for Travellers Books Widget / Section
  if (activeTab === 'viajeros') {
    const travelBooks = books.filter(b => b.category === 'Viaje');
    
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-205 shadow-sm space-y-8 animate-fade-in" id="traveller-books-panel">
        
        {/* Header Ribbon */}
        <div className="border-b border-slate-100 pb-5">
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-2xs font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
            ✈️ Ecosistema viajeinteligencia.com
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                Travellers Books / Libros de Viaje
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Espacio curado de literatura de aventura, crónicas, geopolítica del viajero y cartografías del descubrimiento. El escaparate perfecto para alimentar la inteligencia de viaje.
              </p>
            </div>
            
            {/* Embedded simulation flag */}
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-1 rounded-lg border border-emerald-200">
              ● API Widget Ready
            </span>
          </div>
        </div>

        {/* Core Layout Grid: Books on Left, Embed Widget Generator on Right! */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Travel books list (2 columns of the grid) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              📖 Catálogo Activo para viajeinteligencia.com ({travelBooks.length} libros)
            </h3>
            
            {travelBooks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-150 rounded-2xl">
                <p className="text-xs text-slate-400 font-mono">
                  No hay libros registrados aún en la categoría "Viaje". Al registrar un libro desde el botón principal, la inteligencia artificial de Gemini lo clasificará automáticamente dentro de "Viaje" si el comentario trata de expediciones, turismo o distancias.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travelBooks.map((book) => (
                  <div key={book.id} className="p-5 bg-gradient-to-tr from-indigo-50/20 to-white border border-indigo-150 rounded-2xl flex flex-col justify-between shadow-3xs hover:-translate-y-0.5 hover:shadow-xs transition duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-100/40">
                        <span className="text-2xl">{book.emoji || "✈️"}</span>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded">
                            Traveller Book
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-indigo-50 text-indigo-700 font-bold uppercase rounded">
                            {book.coverColor}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-bold text-slate-900 leading-tight font-sans">{book.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Por {book.author}</p>
                      
                      <p className="text-xs text-slate-755 mt-3 italic font-sans leading-relaxed bg-white/60 p-2.5 rounded-lg border border-indigo-100/20">
                        &ldquo;{book.comment}&rdquo;
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-indigo-50/60 flex items-center justify-between text-2xs text-slate-500 font-mono">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-205'}`} />
                        ))}
                      </div>

                      <button
                        onClick={() => onReact(book.id, 'like')}
                        className="bg-white hover:bg-slate-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 font-bold transition flex items-center gap-1 text-[10px]"
                      >
                        <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500/10" />
                        <span>{book.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: HTML / Iframe Embed Widget Generator (1 column of the grid) */}
          <div className="bg-slate-50 border border-slate-200 p-5.5 rounded-2xl flex flex-col justify-between space-y-4 shadow-3xs">
            <div className="space-y-3">
              <span className="text-[9px] bg-slate-900 text-slate-200 border border-slate-950 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
                Widget Integrador OSINT
              </span>
              <h4 className="text-xs font-bold text-slate-900 font-sans">Sincronización con viajeinteligencia.com</h4>
              <p className="text-3xs text-slate-600 leading-relaxed font-sans">
                Puedes embeber este feed curado en cualquier post o landing page de <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-mono font-bold">viajeinteligencia.com</code>. Las reseñas de viaje aprobadas por el Admin se reflejarán de manera instantánea en tu ecosistema sin configuraciones adicionales de base de datos.
              </p>

              {/* Code Snippet */}
              <div className="space-y-1 pt-1">
                <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Gesto de Integración por Iframe (Recomendado):</span>
                <pre className="bg-slate-900 text-indigo-300 p-2.5 rounded-lg text-[9px] font-mono overflow-x-auto border border-slate-950 max-h-36 scrollbar-thin select-all">
{`<iframe 
  src="${window.location.origin}/api/widget/viaje" 
  style="border:none; width:100%; height:450px; border-radius:16px;" 
  title="Travellers Books Widget">
</iframe>`}
                </pre>
              </div>

              {/* API JSON Endpoint link */}
              <div className="space-y-1 pb-1">
                <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-wider">Feed JSON de API REST del Widget:</span>
                <a 
                  href="/api/books" 
                  target="_blank" 
                  className="block text-[10px] text-center font-bold text-indigo-650 bg-indigo-50 border border-indigo-200 rounded-lg p-2 hover:bg-indigo-100/60 transition"
                >
                  Probar API REST (/api/books) ↗
                </a>
              </div>
            </div>

            <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-1.5">
              <span className="block text-[9px] font-bold text-indigo-900 font-sans uppercase">Anotación para el DPO / RGPD:</span>
              <p className="text-[10px] text-slate-500 font-sans leading-normal">
                El widget filtra automáticamente solo las reseñas marcadas con la etiqueta <code className="bg-slate-100 font-mono p-0.5 rounded text-indigo-850">"Viaje"</code> y que estén aprobadas por el Admin (sin hold activo).
              </p>
            </div>
          </div>

        </div>

        {/* Project Gutenberg Integration Section */}
        <div className="border-t border-slate-100 pt-8 space-y-6 animate-fade-in" id="gutenberg-classics-section">
          <div>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
              📚 Biblioteca Pública Project Gutenberg
            </span>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-650 shrink-0" />
              Clásicos de Viaje de Project Gutenberg (Más Buscados en Inglés y Castellano)
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Colección curada de las bitácoras, crónicas de exploración, y relatos de viajes más leídos e influyentes de dominio público. Descarga su edición literaria completa de manera gratuita o incorpórala instantáneamente al muro para validarla con nuestra IA.
            </p>
          </div>

          {/* Language filters and info */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setGutenbergLang('all')}
                className={`px-3 py-1.5 transition rounded-lg text-xs font-semibold cursor-pointer ${
                  gutenbergLang === 'all' 
                    ? 'bg-slate-900 border border-slate-900 text-white shadow-sm font-bold' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🌍 Todos los idiomas
              </button>
              <button
                onClick={() => setGutenbergLang('es')}
                className={`px-3 py-1.5 transition rounded-lg text-xs font-semibold cursor-pointer ${
                  gutenbergLang === 'es' 
                    ? 'bg-indigo-600 border border-indigo-600 text-white shadow-sm font-bold' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🇪🇸 Castellano
              </button>
              <button
                onClick={() => setGutenbergLang('en')}
                className={`px-3 py-1.5 transition rounded-lg text-xs font-semibold cursor-pointer ${
                  gutenbergLang === 'en' 
                    ? 'bg-emerald-600 border border-emerald-600 text-white shadow-sm font-bold' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🇬🇧 Inglés (English)
              </button>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Enlace de lectura HTML por cortesía de gutenberg.org
            </span>
          </div>

          {/* Classics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGutenbergClassics.map((classic) => {
              const bookExistsInMural = books.some(b => b.gutenbergId === classic.gutenbergId);
              return (
                <div 
                  key={classic.gutenbergId} 
                  className={`bg-slate-50/60 p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    bookExistsInMural ? 'border-indigo-200 bg-indigo-50/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Exists Badge */}
                  {bookExistsInMural && (
                    <span className="absolute top-3 right-3 text-[9px] bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded-full shadow-3xs uppercase">
                      ✓ En Mural
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{classic.emoji}</span>
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-705 font-mono uppercase font-bold px-1.5 py-0.5 rounded">
                          Gutenberg #{classic.gutenbergId}
                        </span>
                        <span className="text-[9px] ml-1.5 font-sans font-bold text-slate-500 font-mono">
                          {classic.language === 'es' ? '🇪🇸 Castellano' : '🇬🇧 Inglés'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug font-sans">{classic.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Por <strong>{classic.author}</strong></p>
                    </div>

                    <p className="text-2xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                      &ldquo;{classic.comment}&rdquo;
                    </p>

                    <div className="text-[9px] font-sans text-slate-500 leading-normal">
                      💡 <strong>Aconsejable para:</strong> {classic.recommendation}
                    </div>
                  </div>

                  {/* Gutenberg actions */}
                  <div className="mt-5 pt-3 border-t border-slate-150 flex flex-col gap-2">
                    
                    {/* Read & Download buttons row */}
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={classic.gutenbergLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[9px] font-semibold font-mono text-center border border-slate-200 flex items-center justify-center gap-1 transition select-none"
                        title="Ver ficha completa y formatos EPUB/Kindle en Project Gutenberg"
                      >
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        Gutenberg ↗
                      </a>
                      <a 
                        href={classic.gutenbergTextLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-semibold font-mono text-center border border-indigo-200 flex items-center justify-center gap-1 transition select-none hover:text-indigo-900"
                        title="Ver libro gratis de Gutenberg en formato HTML / Reseña directa"
                      >
                        <Download className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                        Ver Gratis 🡥
                      </a>
                    </div>

                    {/* Fast add button */}
                    <button
                      onClick={() => handleImportClassic(classic.gutenbergId)}
                      disabled={importingId === classic.gutenbergId || bookExistsInMural}
                      className={`w-full py-2 px-3 rounded-lg text-2xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                        bookExistsInMural 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-250 cursor-not-allowed'
                          : 'bg-indigo-650 text-white hover:bg-indigo-700 active:scale-[0.98]'
                      }`}
                    >
                      {bookExistsInMural ? (
                        <>✓ Publicado en el Muro</>
                      ) : importingId === classic.gutenbergId ? (
                        <>Importando clásico...</>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Importar Reseña al Muro 
                        </>
                      )}
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

  // Conditional rendering for the traditional/Bento view
  if (activeTab === 'bento') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-5 border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 md:pb-0">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition duration-150 ${
                  filterCategory === cat
                    ? 'bg-slate-900 border border-slate-900 text-white shadow-sm'
                    : 'text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-100'
                }`}
              >
                {cat === 'All' ? '📂 Todas las categorías' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar título, autor u opinión..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 transition"
            />
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-6">
            <p className="text-slate-400 font-mono text-xs text-center">No se encontraron lecturas que coincidan con la búsqueda o filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <motion.div
                layoutId={`radial-card-${book.id}`}
                key={book.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${getCoverColor(book.coverColor)}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-dotted border-slate-200 pb-3.5 mb-4">
                    <span className="text-3xl" role="img" aria-label="Book emoji">{book.emoji}</span>
                    <span className={`px-2.5 py-0.5 text-2xs font-bold font-mono rounded-full ${getCatTheme(book.category)}`}>
                      {book.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-tight tracking-tight">{book.title}</h3>
                  <p className="text-2xs text-slate-500 font-mono mt-0.5">Escrito por {book.author}</p>

                  <p className="text-xs text-slate-800 mt-4 leading-relaxed italic font-sans bg-white/50 p-3 rounded-xl border border-slate-200/50">
                    &ldquo;{book.comment}&rdquo;
                  </p>

                  <div className="mt-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">💡 {book.recommendation}</p>
                  </div>

                  <div className="mt-2 text-2xs text-indigo-600 font-mono italic line-clamp-1">✨ {book.aiSummary}</div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReact(book.id, 'like')}
                      className="bg-white/80 hover:bg-white text-slate-700 hover:text-rose-650 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border border-slate-200 shadow-3xs"
                    >
                      <Heart className="w-3 h-3 fill-rose-500/10" />
                      <span>{book.likes || 0}</span>
                    </button>
                    {book.editToken === userToken && (
                      <button
                        onClick={() => onDelete(book.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-650 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition border border-red-200"
                        title="Eliminar de manera inmediata (Derecho al olvido)"
                      >
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

  return (
    <div className="space-y-6">
      
      {/* 🌀 LAYOUT 1: Radial Concentric Spiral Board */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Info label explaining centrifugal layout */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10 border-b border-slate-850 pb-5 mb-8">
          <div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-2xs font-bold rounded-full uppercase tracking-wider block w-fit mb-1">
              Visualizador Excéntrico
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              Mural Concéntrico (Del Centro hacia el Exterior)
            </h2>
            <p className="text-xs text-slate-400 max-w-xl font-sans mt-1">
              Las últimas novedades literarias se posicionan en el <strong className="text-white">Núcleo Central</strong>. Conforme maduran las publicaciones, estas fluyen gravitacionalmente hacia la <strong className="text-white">Periferia Exterior</strong>, creando una cronología circular interactiva que emula mapas estelares.
            </p>
          </div>
          <div className="text-2xs text-slate-500 bg-slate-950/65 border border-slate-800 p-2.5 rounded-xl font-mono self-start">
            🛡️ <span className="text-indigo-300 font-bold">Anti-Fraude Activo</span>: Filtro neural de spam.
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 font-mono text-xs">Mural vacío. Sé el primero en registrar una lectura técnica de valor en el núcleo.</p>
          </div>
        ) : (
          /* Real Center-to-Exterior Concentric Visual Grid */
          <div className="relative z-10 flex flex-col gap-8">
            
            {/* The Radial Map Structure */}
            <div className="flex flex-col gap-10">
              
              {/* LEVEL 1: Absolute Center Core (Latest 1 Landmark / Peak Highlight) */}
              <div className="flex flex-col items-center">
                <div className="text-center mb-3">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] uppercase font-mono tracking-widest rounded-full border border-amber-500/40 font-bold">
                    🌌 NÚCLEO ACTIVO (Más Reciente)
                  </span>
                </div>

                <div className="w-full max-w-2xl relative">
                  {/* Decorative orbital line */}
                  <div className="absolute -inset-4 border border-dashed border-indigo-500/20 rounded-2xl pointer-events-none animate-pulse" />
                  
                  {/* Majestic Center Card */}
                  {books.slice(0, 1).map((book) => (
                    <motion.div
                      layoutId={`radial-card-${book.id}`}
                      key={book.id}
                      className={`rounded-2xl border-2 p-5 sm:p-7 shadow-2xl relative transition hover:shadow-indigo-500/10 ${getCoverColor(book.coverColor)}`}
                    >
                      {/* Top ribbon */}
                      <div className="flex items-center justify-between gap-2 mb-3.5 border-b border-dotted border-slate-300 pb-3">
                        <span className="text-3xl">{book.emoji}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-slate-900 text-white rounded-full">
                            {book.category}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                            Novedad Central
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">{book.title}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Por {book.author}</p>

                      {/* User opinion comment */}
                      <p className="text-sm text-slate-800 leading-relaxed font-sans mt-3.5 bg-white/70 p-3 rounded-lg border border-slate-205/60 italic">
                        &ldquo;{book.comment}&rdquo;
                      </p>

                      {/* Recommend box */}
                      <div className="mt-4 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider mb-1">
                          <Compass className="w-3.5 h-3.5 text-amber-300" /> lo imprescindible aconsejable
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{book.recommendation}</p>
                      </div>

                      {/* AI Micro Quote */}
                      <div className="mt-3.5 flex items-center gap-1.5 text-2xs font-mono text-indigo-700 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                        <span className="font-bold flex items-center gap-0.5">💡 Resumen IA:</span>
                        <span className="italic">{book.aiSummary}</span>
                      </div>

                      {/* Reaction Bar & GDPR Self Purge control */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-205">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
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
                          {/* Likes */}
                          <button
                            onClick={() => onReact(book.id, 'like')}
                            className="bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 border border-slate-200 shadow-xs transition"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-500/20 hover:scale-110" />
                            <span>{book.likes || 0}</span>
                          </button>
                          {/* Dislikes */}
                          <button
                            onClick={() => onReact(book.id, 'dislike')}
                            className="bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 border border-slate-200 shadow-xs transition"
                          >
                            <ThumbsDown className="w-3.5 h-3.5 hover:scale-110" />
                            <span>{book.dislikes || 0}</span>
                          </button>

                          {/* Self-service GDPR Immediate deletion */}
                          {book.editToken === userToken && (
                            <button
                              onClick={() => onDelete(book.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-red-200 transition"
                              title="Destrucción de datos inmediata - Derecho al Olvido"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Purga RGPD</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Orbital Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-750 to-transparent" />
                <span className="relative px-3 py-1 bg-slate-950 border border-slate-800 text-[9px] text-slate-400 font-mono rounded-full leading-none">
                  Órbita Media (Concéntrico Nivel II)
                </span>
              </div>

              {/* LEVEL 2: Intermediate Orbital ring (Books 2 to 5) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.slice(1, 4).length === 0 ? (
                  <div className="col-span-full text-center py-4 text-xs text-slate-500 font-mono">
                    Registra más lecturas para ensanchar el radio secundario del mural.
                  </div>
                ) : (
                  books.slice(1, 4).map((book) => (
                    <motion.div
                      layoutId={`radial-card-${book.id}`}
                      key={book.id}
                      className={`rounded-2xl border p-4.5 shadow-md relative transition hover:scale-[1.01] ${getCoverColor(book.coverColor)}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2 pb-2 border-b border-dotted border-slate-250">
                        <span className="text-2xl">{book.emoji}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-white rounded">
                          {book.category}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">{book.title}</h4>
                      <p className="text-2xs text-slate-500 font-mono">Por {book.author}</p>

                      <p className="text-xs text-slate-700 mt-2 line-clamp-3 italic font-sans">
                        &ldquo;{book.comment}&rdquo;
                      </p>

                      <div className="mt-3.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-white text-2xs">
                        <span className="font-bold text-amber-400 block border-b border-slate-800 pb-1 mb-1 font-mono uppercase tracking-wide">💡 Aconsejable</span>
                        <p className="line-clamp-2 text-slate-300 leading-relaxed font-sans">{book.recommendation}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-205 pt-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Likes */}
                          <button
                            onClick={() => onReact(book.id, 'like')}
                            className="bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 px-2.5 py-1 rounded text-2xs font-mono font-medium flex items-center gap-0.5 border border-slate-200 shadow-2xs"
                          >
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500/15" />
                            <span>{book.likes || 0}</span>
                          </button>
                          
                          {book.editToken === userToken && (
                            <button
                              onClick={() => onDelete(book.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 px-2 py-1 rounded text-2xs font-semibold flex items-center border border-red-200"
                              title="Destrucción inmediata"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Orbital Outside Divider & Level 3 */}
              {books.length > 4 && (
                <>
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                    <span className="relative px-3 py-1 bg-slate-950 border border-slate-800 text-[9px] text-slate-400 font-mono rounded-full leading-none">
                      Órbita Periférica Exterior (Lecturas Consolidadas)
                    </span>
                  </div>

                  {/* LEVEL 3: Outer Ring / Oldest Books represented smaller */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {books.slice(4).map((book) => (
                      <motion.div
                        layoutId={`radial-card-${book.id}`}
                        key={book.id}
                        className="bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl p-3 flex flex-col justify-between transition hover:scale-[1.02]"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xl">{book.emoji}</span>
                            <span className="px-1.5 py-0.5 text-[8px] font-mono bg-slate-800 text-slate-300 rounded uppercase">
                              {book.category}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white truncate" title={book.title}>{book.title}</h5>
                          <p className="text-[10px] text-slate-500 truncate">Por {book.author}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed italic">&ldquo;{book.comment}&rdquo;</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between gap-1 text-[10px] font-mono">
                          <span className="text-amber-400 font-bold">{book.rating} ★</span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onReact(book.id, 'like')}
                              className="text-slate-400 hover:text-rose-500 p-0.5 flex items-center"
                            >
                              <Heart className="w-2.5 h-2.5 mr-0.5" />
                              <span>{book.likes || 0}</span>
                            </button>
                            {book.editToken === userToken && (
                              <button
                                onClick={() => onDelete(book.id)}
                                className="text-slate-500 hover:text-red-500 p-0.5"
                                title="Borrado físico definitivo"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
