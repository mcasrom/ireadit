import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BookForm from './components/BookForm';
import BoardOfFame from './components/BoardOfFame';
import PrivacyGdprTab from './components/PrivacyGdprTab';
import TrendingBooks from './components/TrendingBooks';
import { BookReview } from './types';
import { BookOpen, AlertCircle, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  
  // Tab Routing
  const [activeTab, setActiveTab] = useState<string>('mural');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Author Token (Stored locally to support instant self-service GDPR purges)
  const [userToken, setUserToken] = useState<string>('');

  // Flash Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // 1. Initialize or obtain existing author token
    let storedToken = localStorage.getItem('ireadit-author-token');
    if (!storedToken) {
      storedToken = "author-" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('ireadit-author-token', storedToken);
    }
    setUserToken(storedToken);

    // 2. Initial fetch
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setErrorHeader(null);
    try {
      const res = await fetch('/api/books');
      if (!res.ok) {
        throw new Error("No se pudo estructurar el mural. Valida el estado del servidor Express.");
      }
      const data = await res.json();
      setBooks(data);
    } catch (e: any) {
      setErrorHeader("No se pudo conectar con el servidor backend de Ireadit. Comprueba si el servidor Express está activo y escuchando en el puerto 3000.");
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (id: string, type: 'like' | 'dislike') => {
    try {
      const res = await fetch(`/api/books/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        // optimistically update state with new reactions count
        setBooks(prev => prev.map(b => {
          if (b.id === id) {
            return {
              ...b,
              likes: type === 'like' ? (b.likes || 0) + 1 : b.likes,
              dislikes: type === 'dislike' ? (b.dislikes || 0) + 1 : b.dislikes
            };
          }
          return b;
        }));
      }
    } catch (e) {
      console.error("Failed to post emoji action:", e);
    }
  };

  const handleDeleteBook = async (id: string) => {
    const confirmation = window.confirm("¿Seguro de que deseas borrar definitivamente esta lectura? Al hacerlo, ejercerás tu Derecho al Olvido (RGPD) borrando todo rastro de tu autoría de la base de datos.");
    if (!confirmation) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken: userToken })
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification('error', data.error || "No se pudo realizar el borrado de la base de datos.");
        return;
      }

      showNotification('success', "¡Registro purgado con éxito! Derecho al olvido garantizado.");
      fetchBooks();
    } catch (e) {
      showNotification('error', "Fallo de conexión. No se pudo procesar la solicitud de borrado.");
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white antialiased text-slate-800">
      
      {/* Real-time Toast Notifications */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-slide-in max-w-sm">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-2.5 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold leading-relaxed">{notification.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header component */}
      <Header 
        books={books}
        onRefresh={fetchBooks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsFormOpen(true)}
      />


      {/* Hero Section */}
      {activeTab === 'mural' && (
        <div className="relative w-full overflow-hidden" style={{height: '420px'}}>
          <img
            src="/hero-bg.jpg"
            alt="Lee más. Descubre más. Viaja más."
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-50/95 via-stone-50/70 to-transparent" />
          <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center gap-5">
            <div className="max-w-lg">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-800 leading-tight tracking-tight">
                Lee más.<br />
                Descubre más.<br />
                Viaja más.
              </h1>
              <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-sm">
                oreadit <span className="text-stone-400 font-mono text-xs">(oh read it)</span> es tu espacio
                para llevar un registro de tus lecturas, compartir reseñas y descubrir nuevos mundos.
              </p>
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  Añadir lectura
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className="px-5 py-2.5 border border-stone-300 bg-white/80 hover:bg-white text-stone-700 text-sm font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <span>▶</span> Ver tendencias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Handling banner */}
        {errorHeader && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 mb-8 text-sm text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <p className="font-semibold">Error de comunicación con el Backend:</p>
              <p className="text-xs text-amber-700 mt-1 leading-normal font-mono">{errorHeader}</p>
              <button 
                onClick={fetchBooks}
                className="mt-2.5 px-3 py-1 bg-amber-600 text-white rounded-lg text-2xs font-semibold hover:bg-amber-700 transition"
              >
                Reintentar Conexión
              </button>
            </div>
          </div>
        )}

        {/* Global Loading state */}
        {loading && books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200">
              <BookOpen className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <p className="text-xs font-mono text-slate-500">Sincronizando registros de lectura y cargando mural...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Display relevant tab component */}
            {activeTab === 'trending' ? (
              <TrendingBooks />
            ) : activeTab === 'gdpr' ? (
              <PrivacyGdprTab 
                userToken={userToken} 
                onRefresh={fetchBooks}
              />
            ) : (
              <BoardOfFame 
                books={books}
                onReact={handleReact}
                onDelete={handleDeleteBook}
                userToken={userToken}
                activeTab={activeTab}
                onRefresh={fetchBooks}
              />
            )}

          </div>
        )}

      </main>

      {/* Slide-over Form model */}
      <BookForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitSuccess={() => {
          showNotification('success', "Lectura procesada, clasificada y publicada en el núcleo de la fama.");
          fetchBooks();
        }}
        userToken={userToken}
      />

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>© {new Date().getFullYear()} Ireadit. Todos los derechos reservados. No tracking, 100% portable.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-700 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Express + Vite + Gemini
            </span>
          </p>
        </div>
      </footer>

    </div>
  );
}
