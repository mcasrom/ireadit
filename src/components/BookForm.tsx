import React, { useState, useEffect } from 'react';
import { CaptchaData } from '../types';
import { X, Loader2, Sparkles, ShieldCheck, RefreshCw, Star, Info } from 'lucide-react';

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  userToken: string;
}

const EMOJI_OPTIONS = ["📖", "🐧", "🤖", "💡", "💻", "🔥", "🧠", "📈", "🛡️", "🔮", "🍕", "🎭"];

export default function BookForm({ isOpen, onClose, onSubmitSuccess, userToken }: BookFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📖');
  const [repeat, setRepeat] = useState(true);
  const [gdprChecked, setGdprChecked] = useState(false);

  // Captcha State
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  // Action status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Fetch captcha on component open
  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
      setErrorMsg(null);
      setErrorReason(null);
    }
  }, [isOpen]);

  const fetchCaptcha = async () => {
    setLoadingCaptcha(true);
    setCaptchaAnswer('');
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      setCaptcha(data);
    } catch (e) {
      console.error("Error retrieving custom math captcha:", e);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorReason(null);

    if (!gdprChecked) {
      setErrorMsg("Debes aceptar el consentimiento de tratamiento de datos RGPD para publicar.");
      return;
    }

    if (!captchaAnswer) {
      setErrorMsg("Completa la verificación matemática (Anti-Bots).");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          rating,
          comment,
          recommendation,
          emoji: selectedEmoji,
          repeat,
          captchaId: captcha?.id,
          captchaAnswer,
          userToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Ocurrió un error al enviar tu lectura.");
        if (data.reason) {
          setErrorReason(data.reason);
        }
        // If wrong captcha, refresh captcha
        if (data.error && data.error.includes("captcha")) {
          fetchCaptcha();
        }
        setSubmitting(false);
        return;
      }

      // Success! Clear fields
      setTitle('');
      setAuthor('');
      setRating(5);
      setComment('');
      setRecommendation('');
      setSelectedEmoji('📖');
      setRepeat(true);
      setGdprChecked(false);
      
      onClose();
      onSubmitSuccess();
    } catch (err) {
      setErrorMsg("No se pudo conectar con el servidor. Valida tu conexión local o Docker.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="book-form-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-full max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 bg-slate-905 border-b border-slate-100 flex items-center justify-between col-span-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
                Registrar un Libro Leído
              </h2>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">
                La entrada será validada por Inteligencia Artificial en tiempo real.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Input Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans uppercase mb-1">
                Título del Libro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. El Alquimista / Clean Code / Dune"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition duration-150"
              />
            </div>

            {/* Input Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans uppercase mb-1">
                Autor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Robert C. Martin"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition duration-150"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans uppercase mb-1">
                Tu Valoración <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    type="button"
                    key={stars}
                    onClick={() => setRating(stars)}
                    className="p-1 text-amber-400 hover:scale-110 transition duration-100"
                  >
                    <Star 
                      className={`w-7 h-7 ${
                        stars <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-sm font-mono text-slate-500 ml-2 font-bold">
                  ({rating}/5 estrellas)
                </span>
              </div>
            </div>

            {/* Quick Comment Emoji Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans uppercase mb-1">
                Emoji Comentario / Reacción Rápida
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {EMOJI_OPTIONS.map((emo) => (
                  <button
                    type="button"
                    key={emo}
                    onClick={() => setSelectedEmoji(emo)}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition duration-100 ${
                      selectedEmoji === emo 
                        ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans uppercase mb-1">
                Comentario Literario Personal <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="¿Qué te pareció este libro? Comparte tus aprendizajes clave, críticas técnicas u opiniones..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition duration-150"
              />
            </div>

            {/* Recommendation (Lo Aconsejable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 font-sans uppercase mb-1">
                ¿A quién se lo aconsejas? (Lo imprescindible) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Recomendado para ingenieros que sufren de fatiga de microservicios"
                value={recommendation}
                onChange={e => setRecommendation(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition duration-150"
              />
            </div>

            {/* Repeat read recommendation */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <span className="block text-xs font-semibold text-slate-800">¿Repetirías la lectura?</span>
                <span className="text-2xs text-slate-400">¿Es un libro que leerías una segunda vez?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={repeat} 
                  onChange={e => setRepeat(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>

            {/* 1st Defense Layer: Security Math Captcha (Anti spam automatizado) */}
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold text-amber-800 font-mono uppercase tracking-wider flex items-center gap-1">
                  🛡️ Capa Anti-Fraude Bot - Captcha local
                </span>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="text-amber-700 hover:text-amber-900 flex items-center gap-0.5 text-2xs"
                  title="Recargar pregunta"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>

              {captcha ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800 font-sans">
                    {captcha.question}
                  </p>
                  <input
                    type="number"
                    required
                    placeholder="Resultado"
                    value={captchaAnswer}
                    onChange={e => setCaptchaAnswer(e.target.value)}
                    className="w-24 text-xs font-mono font-bold border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-slate-900 focus:outline` focus:bg-white bg-white text-center"
                  />
                </div>
              ) : (
                <p className="text-2xs text-slate-400">Cargando verificación anti-bots...</p>
              )}
            </div>

            {/* 2nd Defense Layer explaining AI Audit */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-2xs text-slate-500 leading-relaxed font-sans">
                <strong className="text-slate-700">Módulo de Fraudes por Inteligencia Artificial (Gemini):</strong> Su aporte será clasificado y depurado por un modelo avanzado de lenguaje de Google en el backend. Las entradas con palabras soeces, publicidad masiva o texto insustancial (spam hack) serán autobloqueadas para cuidar la calidad del wallboard de la fama.
              </div>
            </div>

            {/* GDPR Consent Box */}
            <div className="relative flex items-start gap-2 pt-1">
              <div className="flex items-center h-5">
                <input
                  id="gdpr"
                  type="checkbox"
                  required
                  checked={gdprChecked}
                  onChange={e => setGdprChecked(e.target.checked)}
                  className="w-4 h-4 border-slate-300 text-slate-900 rounded focus:ring-slate-900"
                />
              </div>
              <div className="text-2xs">
                <label htmlFor="gdpr" className="font-semibold text-slate-800 leading-none">
                  Acepto publicar esta reseña en el mural público
                </label>
                <p className="text-slate-400 mt-0.5 font-sans leading-relaxed">
                  Autorizo el tratamiento de datos y entiendo que puedo suprimir definitivamente este registro en cualquier momento ejerciendo mi <strong className="text-slate-700">Derecho al Olvido (RGPD de la UE)</strong> usando mi Token Autor del navegador.
                </p>
              </div>
            </div>

            {/* Display Errors with Full AI Context if available */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>⚠️ Error de Validación:</span>
                </div>
                <p>{errorMsg}</p>
                {errorReason && (
                  <div className="mt-1 bg-white p-2 rounded border border-red-150 text-2xs text-red-650 leading-normal font-mono">
                    <span className="block font-bold mb-0.5">Motivo del filtro (IA Moderación):</span>
                    {errorReason}
                  </div>
                )}
              </div>
            )}

            {/* Author Token Reminder footer */}
            <div className="text-center py-2 border-t border-dotted border-slate-100 flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Token de autor activo: {userToken.substring(0, 8)}...</span>
            </div>

          </form>

          {/* Action buttons footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1 transition duration-150 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Validando con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Publicar en Mural</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
