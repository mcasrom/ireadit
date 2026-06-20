import React, { useState } from 'react';
import { X, Gift, Share2, Twitter, Facebook, Copy, Check } from 'lucide-react';
import { BookReview } from '../types';

interface ShareGiftModalProps {
  book: BookReview;
  onClose: () => void;
}

export default function ShareGiftModal({ book, onClose }: ShareGiftModalProps) {
  const [copied, setCopied] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const stars = book.rating || 5;
  const shareUrl = 'https://ireadit.viajeinteligencia.com';
  const shareText = `📚 Te recomiendo esta lectura: "${book.title}" de ${book.author} ${'⭐'.repeat(stars)}\n\n"${(book.comment || '').slice(0, 120)}..."\n\n📖 Descúbrelo en ireadit.viajeinteligencia.com`;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => window.open(
    'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText + '\n' + shareUrl),
    '_blank', 'noopener,noreferrer'
  );

  const handleTwitter = () => window.open(
    'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(shareUrl),
    '_blank', 'noopener,noreferrer'
  );

  const handleFacebook = () => window.open(
    'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) + '&quote=' + encodeURIComponent(shareText),
    '_blank', 'noopener,noreferrer'
  );

  const handleNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Te recomiendo: ${book.title}`, text: shareText, url: shareUrl }); }
      catch (_) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Recomendar esta lectura</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Card preview regalo */}
          <div
            className="relative rounded-2xl overflow-hidden border border-amber-200 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #44403c 100%)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 60%)' }} />

            <div className="relative p-5 flex gap-4">
              {/* Portada */}
              <div className="shrink-0">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title}
                    className="w-16 h-24 object-cover rounded-lg shadow-lg border border-white/10"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-16 h-24 bg-stone-700 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-3xl">{book.emoji || '📖'}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Share2 className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Te recomiendo este libro</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{book.title}</h3>
                <p className="text-stone-400 text-xs mt-0.5">{book.author}</p>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < stars ? 'text-amber-400' : 'text-stone-600'}`}>★</span>
                  ))}
                </div>
                {book.comment && (
                  <p className="text-stone-300 text-xs mt-2 leading-relaxed line-clamp-2 italic">
                    "{book.comment.slice(0, 100)}{book.comment.length > 100 ? '…' : ''}"
                  </p>
                )}
              </div>

              {/* Foto usuario */}
              {userPhoto && (
                <div className="shrink-0 self-start">
                  <img src={userPhoto} alt={userName || 'Yo'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow" />
                  {userName && (
                    <p className="text-xs text-center text-amber-300 mt-1 font-semibold truncate w-10">{userName}</p>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 pb-3 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">ireadit.viajeinteligencia.com</span>
              <span className="text-xs text-stone-500">📚 Ireadit</span>
            </div>
          </div>

          {/* Personalización opcional */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personalizar (opcional)</p>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg hover:border-slate-500 transition text-xs text-slate-500 hover:text-slate-700">
                <span>📷</span>
                {userPhoto ? 'Cambiar foto' : 'Tu foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              <input
                type="text"
                placeholder="Tu nombre (ej. Miguel)"
                value={userName}
                onChange={e => setUserName(e.target.value.slice(0, 20))}
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Botones RRSS */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compartir en</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition">
                💬 WhatsApp
              </button>
              <button onClick={handleTwitter}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition">
                <Twitter className="w-3.5 h-3.5" /> X / Twitter
              </button>
              <button onClick={handleFacebook}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition">
                <Facebook className="w-3.5 h-3.5" /> Facebook
              </button>
              {'share' in navigator ? (
                <button onClick={handleNative}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition">
                  <Share2 className="w-3.5 h-3.5" /> Más opciones
                </button>
              ) : (
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar texto'}
                </button>
              )}
            </div>
            <button onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs rounded-xl transition hover:border-slate-400">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Mensaje copiado!' : 'Copiar mensaje al portapapeles'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
