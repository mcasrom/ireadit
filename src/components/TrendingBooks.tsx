import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, ExternalLink, BookOpen, Globe, RefreshCw } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="w-full h-40 bg-slate-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
        <div className="h-2 bg-slate-100 rounded animate-pulse w-1/2 mt-1" />
      </div>
    </div>
  );
}

function OLBookCard({ book, rank }: { book: any; rank: number }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title}
            className="w-full h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          #{rank}
        </span>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight">{book.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{book.author}</p>
        {book.firstPublished && (
          <p className="text-xs text-slate-400 font-mono mt-1">{book.firstPublished}</p>
        )}
        {book.openLibraryKey && (
          <a href={`https://openlibrary.org${book.openLibraryKey}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Open Library <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function ESBookCard({ book, rank }: { book: any; rank: number }) {
  const isLatam = book.region === 'latam';
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title}
            className="w-full h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className={`w-full h-40 flex items-center justify-center ${isLatam ? 'bg-gradient-to-br from-amber-50 to-orange-100' : 'bg-gradient-to-br from-indigo-50 to-blue-100'}`}>
            <BookOpen className={`w-10 h-10 ${isLatam ? 'text-amber-300' : 'text-indigo-300'}`} />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          #{rank}
        </span>
        {book.country && (
          <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isLatam ? 'bg-amber-500/80 text-white' : 'bg-indigo-500/80 text-white'}`}>
            {book.country}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-tight">{book.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{book.author}</p>
        {book.year && (
          <p className="text-xs text-slate-400 font-mono mt-1">{book.year}</p>
        )}
        {book.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{book.description}</p>
        )}
        {book.googleBooksId && (
          <a href={`https://books.google.com/books?id=${book.googleBooksId}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Google Books <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function TrendingBooks() {
  const [mainTab, setMainTab]   = useState<'global' | 'castellano'>('global');
  const [period, setPeriod]     = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [esSource, setEsSource] = useState<'all' | 'spain' | 'latam'>('all');
  const [olData,    setOlData]    = useState<any>(null);
  const [esData,    setEsData]    = useState<any>(null);
  const [olLoading, setOlLoading] = useState(false);
  const [esLoading, setEsLoading] = useState(false);
  const cache = useRef<Record<string, { data: any; ts: number }>>({});
  const CACHE_MS = 5 * 60 * 1000;

  const fetchOL = useCallback(async (p: string) => {
    const key = `ol_${p}`;
    const hit = cache.current[key];
    if (hit && Date.now() - hit.ts < CACHE_MS) { setOlData(hit.data); return; }
    setOlLoading(true);
    try {
      const r = await fetch(`/api/trending/${p}`);
      const d = await r.json();
      cache.current[key] = { data: d, ts: Date.now() };
      setOlData(d);
    } catch {}
    finally { setOlLoading(false); }
  }, []);

  const fetchES = useCallback(async (s: string) => {
    const key = `es_${s}`;
    const hit = cache.current[key];
    if (hit && Date.now() - hit.ts < CACHE_MS) { setEsData(hit.data); return; }
    setEsLoading(true);
    try {
      const r = await fetch(`/api/trending-es?source=${s}`);
      const d = await r.json();
      cache.current[key] = { data: d, ts: Date.now() };
      setEsData(d);
    } catch {}
    finally { setEsLoading(false); }
  }, []);

  useEffect(() => { fetchOL(period); }, [period]);
  useEffect(() => { if (mainTab === 'castellano') fetchES(esSource); }, [mainTab, esSource]);

  const handleRefresh = () => {
    cache.current = {};
    if (mainTab === 'global') fetchOL(period);
    else fetchES(esSource);
  };

  const isLoading = mainTab === 'global' ? olLoading : esLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Libros Trending</h2>
        </div>
        <button onClick={handleRefresh} disabled={isLoading}
          title="Forzar actualización"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4 w-fit">
        {([
          { key: 'global',     label: '🌍 Global',     sub: 'Open Library' },
          { key: 'castellano', label: '🇪🇸 Castellano', sub: 'España · LatAm' },
        ] as const).map(({ key, label, sub }) => (
          <button key={key} onClick={() => setMainTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${mainTab === key ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">{sub}</span>
          </button>
        ))}
      </div>

      {mainTab === 'global' && (
        <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 mb-4 w-fit">
          {(['daily','weekly','monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${period === p ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {p === 'daily' ? 'Hoy' : p === 'weekly' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      )}

      {mainTab === 'castellano' && (
        <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 mb-4 w-fit">
          {([
            { key: 'all',   label: 'Todos' },
            { key: 'spain', label: '🇪🇸 España' },
            { key: 'latam', label: '🌎 LatAm' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setEsSource(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${esSource === key ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div>
          <p className="text-xs text-slate-400 font-mono mb-3 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {mainTab === 'castellano' ? 'Buscando libros en español…' : 'Consultando Open Library…'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {!isLoading && mainTab === 'global' && olData?.works?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {olData.works.map((book: any, i: number) => (
            <OLBookCard key={i} book={book} rank={i + 1} />
          ))}
        </div>
      )}

      {!isLoading && mainTab === 'castellano' && esData?.works?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {esData.works.map((book: any, i: number) => (
            <ESBookCard key={i} book={book} rank={i + 1} />
          ))}
        </div>
      )}

      {!isLoading && mainTab === 'castellano' && !esData?.works?.length && (
        <div className="text-center py-12 text-slate-400">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No se pudieron cargar los libros.</p>
          <button onClick={handleRefresh} className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Reintentar
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6 font-mono">
        {mainTab === 'global'
          ? `Open Library · ${period} · ${olData?.works?.length ?? 0} libros`
          : `Google Books + LatAm curado · ${esData?.works?.length ?? 0} libros`}
      </p>
    </div>
  );
}
