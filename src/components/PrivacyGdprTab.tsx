import React, { useState } from 'react';
import { Shield, Key, Mail, Trash2, CheckCircle2, UserCheck, AlertCircle, HelpCircle, Smartphone, Globe, Cpu, Sparkles, BookOpen, Lock, Unlock, Terminal, Download, Copy, Check, Server } from 'lucide-react';

interface PrivacyGdprTabProps {
  userToken: string;
  onRefresh: () => void;
}

export default function PrivacyGdprTab({ userToken, onRefresh }: PrivacyGdprTabProps) {
  const [email, setEmail] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [userReason, setUserReason] = useState('Deseo retirar definitivamente mi reseña literaria de este servidor.');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // PWA Demo status
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // Admin and deployment options states
  const [adminPassword, setAdminPassword] = useState('');
  const [expectedPassword, setExpectedPassword] = useState('admin123');
  const [currentVerifiedPassword, setCurrentVerifiedPassword] = useState('admin123');
  const [tempNewPassword, setTempNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Admin Moderation States
  const [adminBooks, setAdminBooks] = useState<any[]>([]);
  const [loadingAdminBooks, setLoadingAdminBooks] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const fetchAdminBooks = async (pwd = currentVerifiedPassword) => {
    setLoadingAdminBooks(true);
    setAdminError(null);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminBooks(data);
      } else {
        const err = await res.json();
        setAdminError(err.error || "Sesión caducada o contraseña inválida en el servidor.");
      }
    } catch (err) {
      setAdminError("Error de red al recopilar registros completos.");
    } finally {
      setLoadingAdminBooks(false);
    }
  };

  const handleUnlockAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminBooks(data);
        setCurrentVerifiedPassword(adminPassword);
        setExpectedPassword(adminPassword);
        setAdminUnlocked(true);
        setAdminPassword('');
      } else {
        const errData = await res.json();
        alert(errData.error || "Contraseña de administrador incorrecta. La clave inicial por defecto es 'admin123'.");
      }
    } catch (err) {
      alert("Error de comunicación para validar el acceso admin.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPass = tempNewPassword.trim();
    if (newPass.length < 4) {
      alert("La clave debe tener al menos 4 caracteres.");
      return;
    }
    
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentVerifiedPassword, newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentVerifiedPassword(newPass);
        setExpectedPassword(newPass);
        setIsChangingPass(false);
        setTempNewPassword('');
        alert("¡Contraseña de administrador actualizada con éxito en el servidor y sincronizada con el panel!");
        fetchAdminBooks(newPass);
      } else {
        alert(data.error || "No se pudo actualizar la contraseña.");
      }
    } catch (err) {
      alert("Error al sincronizar la contraseña con el servidor.");
    }
  };

  const handleApproveBook = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/books/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentVerifiedPassword })
      });
      if (res.ok) {
        fetchAdminBooks();
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || "Fallo durante la aprobación.");
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const handleHoldBook = async (id: string) => {
    const reason = prompt("Introduce la razón específica para retener esta reseña (Ej. sospecha de veracidad dudosa, spam comercial, lenguaje inadecuado):");
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      alert("Debes indicar una justificación de hold.");
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/books/${id}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentVerifiedPassword, reason: reason.trim() })
      });
      if (res.ok) {
        fetchAdminBooks();
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || "Fallo al poner en espera.");
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const handleDeleteBookAdmin = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas purgar esta lectura definitivamente de la base de datos? Se ejecutará una purga directa como Administrador de Datos.")) return;
    
    try {
      const res = await fetch(`/api/admin/books/${id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentVerifiedPassword })
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminBooks();
        onRefresh();
        alert(data.message || "Registro borrado.");
      } else {
        alert(data.error || "Fallo al purgar.");
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const handleCopyText = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!email || !bookTitle) {
      setErrorMsg("Por favor, introduce tu email y el título exacto del libro que deseas purgar.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/gdpr/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'erasure',
          targetBookTitle: bookTitle,
          userEmail: email,
          message: userReason
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Ocurrió un error al procesar tu reclamación de derecho al olvido.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(data.message);
      setBookTitle('');
      setEmail('');
      onRefresh(); // Refresh parent books to reflect instant removal if it happened
    } catch (e) {
      setErrorMsg("Error de red. No se pudo enlazar de forma segura con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-205 shadow-sm space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="px-2 py-0.5 bg-red-100/50 text-red-700 text-3xs font-bold font-mono tracking-wider rounded uppercase">
            Garantías Legales UE — RGPD Art. 17 & Trasparencia
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1 font-sans">
            Derecho al Olvido, PWA y Sobre Mí (About)
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            En un ecosistema libre, transparente y descentralizado, garantizamos a todos los usuarios el derecho inquebrantable a la supresión de toda información o reseña literaria registrada, así como la portabilidad de código.
          </p>
        </div>
      </div>

      {/* Grid: 2 columns with core logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Direct control of authorship tokens */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-slate-500" />
            1. Vía Autor (Control Autónomo Inmediato)
          </h3>
          
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <p className="text-xs text-slate-650 font-sans leading-relaxed">
              Cada vez que registras una opinión desde este navegador, el servidor asocia la autoría de forma segura a tu <strong className="text-slate-900">Token Personal de Autor</strong>. No rastreamos tu correo real ni tu dirección IP en las tarjetas públicas.
            </p>

            <div className="space-y-1">
              <span className="block text-2xs text-slate-400 font-mono uppercase tracking-wider">Tu Clave Autor (Navegador Local):</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={userToken}
                  className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono select-all focus:outline-none w-full text-slate-800 font-bold text-center"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-start gap-1.5 text-2xs text-slate-500 leading-normal">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-750 font-semibold">Autogestión total:</strong> Si visualizas una reseña que incluya este token, verás un botón rojo de <strong className="text-red-700 font-semibold">Purga RGPD</strong> en la tarjeta del mural. Al pulsarlo, el backend destruirá físicamente el registro de forma irreversible sin consultar a terceros.
              </span>
            </div>
          </div>

          <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 font-sans">¿Cómo evitamos la piratería y el spam?</h4>
            <p className="text-2xs text-indigo-850 font-sans leading-relaxed">
              Las firmas del wallboard están protegidas por algoritmos de <strong className="text-indigo-950 font-bold">Verificación Matemática</strong> que impiden que programas automáticos (bots) ataquen las cuotas de red. Adicionalmente, el análisis neural continuo de <strong className="text-indigo-950 font-bold font-mono">Gemini AI</strong> bloquea y denuncia textos sospechosos o falsos fraudes estéticos.
            </p>
          </div>
        </div>

        {/* Right Column: Formal request form */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-slate-500" />
            2. Vía Manual (Solicitud de Borrado Instantáneo)
          </h3>

          <form onSubmit={handleSubmitRequest} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
            <p className="text-xs text-slate-650 leading-relaxed font-sans">
              Si publicaste un libro de forma descuidada, perdiste tu Token Autor o deseas retirar un registro de inmediato, completa este formulario. El servidor posee un <strong className="text-slate-900">mecanismo automático</strong> de búsqueda y depuración física.
            </p>

            {/* Email field */}
            <div>
              <label className="block text-3xs font-bold font-sans text-slate-500 uppercase tracking-wider mb-1">
                Tu Correo electrónico de Contacto
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@web.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition"
              />
            </div>

            {/* Book Title */}
            <div>
              <label className="block text-3xs font-bold font-sans text-slate-500 uppercase tracking-wider mb-1">
                Título exacto del libro que deseas borrar
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Designing Data-Intensive Applications"
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition"
              />
            </div>

            {/* Deletion justification */}
            <div>
              <label className="block text-3xs font-bold font-sans text-slate-500 uppercase tracking-wider mb-1">
                Motivación jurídica / Comentario
              </label>
              <textarea
                rows={2}
                value={userReason}
                onChange={e => setUserReason(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition text-slate-600 font-sans"
              />
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-2xs text-red-700 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success notifications */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-2xs text-emerald-800 flex items-start gap-1 ml-1 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                <div className="leading-relaxed">
                  <strong className="block">¡Solicitud Procesada Exitosamente!</strong>
                  {successMsg}
                </div>
              </div>
            )}

            {/* Submit purge */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-2xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Ejercer Derecho al Olvido de Forma Directa</span>
            </button>
          </form>
        </div>

      </div>

      {/* NEW SECTION: PWA / WPA Progressive Web Client Capability */}
      <div className="border-t border-slate-100 pt-7 space-y-4">
        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          3. Cliente Tipo PWA (Progressive Web App) • Portabilidad sin Red
        </h3>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs text-slate-650 leading-relaxed font-sans">
              Ireadit está optimizado estructuralmente para funcionar como una <strong className="text-slate-800">PWA (Progressive Web App)</strong> de clase mundial. Esto te permite tener la misma velocidad y portabilidad de una app de smartphone nativa.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-2xs text-slate-600 leading-normal">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span><strong>Guardado en Pantalla de Inicio:</strong> Agrégala en Safari (Añadir a pantalla de inicio) o Chrome (Instalar Aplicación) para usarla a pantalla completa sin la barra del navegador.</span>
              </div>
              <div className="flex items-start gap-2 text-2xs text-slate-600 leading-normal">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span><strong>Interrupción Cero Offline:</strong> Guarda opiniones y clasificaciones literarias de forma local, sincronizando con el Express Server tan pronto se restablezca la conectividad.</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setPwaInstalled(true);
                setTimeout(() => setPwaInstalled(false), 4000);
              }}
              className="mt-3 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-2xs font-mono font-bold rounded-xl border border-indigo-200 transition"
            >
              {pwaInstalled ? "✨ ¡PWA Simulada e Instalada localmente!" : "⚙️ Forzar Simulación de Service Worker"}
            </button>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
              Configuración Técnica Viable
            </span>
            <p className="text-3xs font-mono text-slate-500 leading-normal">
              Puedes copiar y habilitar el siguiente manifiesto en tu directorio <code className="bg-slate-100 text-slate-800 p-0.5 rounded">public/manifest.json</code> para habilitarlo nativamente:
            </p>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-[9px] font-mono overflow-x-auto border border-slate-950 max-h-32 select-all scrollbar-thin">
{`{
  "name": "Ireadit - Mural de Lecturas Fetiche",
  "short_name": "Ireadit",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icon.png", "sizes": "512x512", "type": "image/png" }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* NEW SECTION: About Me (Sobre Mí) & Creator Info */}
      <div className="border-t border-slate-100 pt-7 space-y-4">
        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-amber-500" />
          4. Sobre Mí & Contacto de Soporte Literario
        </h3>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BookOpen className="w-48 h-48 text-white" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-full flex items-center justify-center font-bold text-slate-900 text-2xl tracking-tighter shrink-0 border-2 border-white shadow-xl">
              MC
            </div>
            
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Arquitecto Literario • Creador de Software</span>
              <h4 className="text-lg font-bold text-white font-sans">Viaje Inteligencia & Ireadit Project</h4>
              <p className="text-xs text-slate-300 max-w-xl font-sans leading-relaxed">
                ¡Hola! Soy el desarrollador detrás de <strong className="text-white">Ireadit</strong>. Creo fervientemente en un Internet libre de trackers, anuncios, cookies abusivas y muros de pago. Este mural nació bajo la filosofía de ofrecer un espacio de recomendación directo para las lecturas fetiche de la comunidad dev, impulsado por IA para descodificar las mejores ideas de manera neutra.
              </p>
            </div>
          </div>

          {/* Contact and Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-indigo-900/50 relative z-10 text-xs">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-indigo-900/30">
              <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Contacto para Derecho al Olvido / Ideas:</span>
              <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold select-all">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:ireadit@viajeinteligencia.com" className="hover:underline text-xs">ireadit@viajeinteligencia.com</a>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-2">
                Escríbeme directamente para solicitar borrados masivos, reportar comportamientos extraños de IA o simplemente conversar sobre buen software y libros de culto.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-indigo-900/30 space-y-1.5">
              <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Más Opciones Viables para Escalar esta App:</span>
              <ul className="text-3xs text-slate-300 leading-normal space-y-1 list-disc pl-3">
                <li><strong className="text-slate-100">Drizzle + SQLite Local:</strong> Sustituye la persistencia JSON volátil por un fichero SQLite local en tu VPS Hetzner o servidor local.</li>
                <li><strong className="text-slate-100">Feedback de IA Interactivo:</strong> Permitir iniciar chats en vivo con Gemini sobre la síntesis de un libro concreto del mural.</li>
                <li><strong className="text-slate-150">Exportar y Compartir (.txt):</strong> Un botón para descargar todas las notas en Markdown estructurado para Obsidian o Notion.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Admin & Deployment Console protected by custom password */}
      <div className="border-t border-slate-100 pt-7 space-y-4">
        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5 justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-slate-500" />
            5. Consola d'Infraestructura, Despliegue & Código (Admin)
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
            adminUnlocked 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse" 
              : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}>
            {adminUnlocked ? "🔓 Acceso Autorizado" : "🔒 Restringido por clave"}
          </span>
        </h3>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
          
          {/* Header Description */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-650 leading-relaxed font-sans">
              Esta sección contiene directivas avanzadas, plantillas de infraestructura descargables y scripts configurados para exportar o clonar <strong className="text-slate-900">Ireadit</strong> en servidores locales o proveedores cloud de producción (<strong className="text-slate-800">GitHub, Vercel, Hetzner VPS</strong>).
            </p>
            <p className="text-2xs text-slate-500 leading-normal font-sans">
              En cumplimiento de los requerimientos de seguridad y privacidad, esta documentación técnica sensible ha sido ocultada al usuario final. Requiere clave de administración para expandir.
            </p>
          </div>

          {/* Password Validation UI Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              
              {!adminUnlocked ? (
                <form onSubmit={handleUnlockAdmin} className="space-y-3 max-w-sm w-full">
                  <div>
                    <label className="block text-3xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Clave de Administrador:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Introduce tu clave técnica (Por defecto: admin123)"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl pl-3.5 pr-20 py-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition font-mono uppercase tracking-widest text-center"
                      />
                      <button
                        type="submit"
                        className="absolute right-1 top-1 bottom-1 px-3 bg-slate-900 hover:bg-slate-800 text-white text-3xs font-sans font-bold rounded-lg transition cursor-pointer select-none"
                      >
                        Autorizar
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-normal">
                    💡 La clave inicial configurada en el sistema es <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">admin123</code>.
                  </p>
                </form>
              ) : (
                <div className="space-y-3 max-w-sm w-full">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Unlock className="w-5 h-5 text-emerald-600 animate-bounce" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wide">¡Sesión de Desarrollador Desbloqueada!</span>
                  </div>
                  <p className="text-2xs text-slate-500 font-sans">
                    Ahora dispones de acceso completo para moderar aportes literarios y descargar las plantillas de despliegue a producción.
                  </p>
                  <button
                    onClick={() => {
                      setAdminUnlocked(false);
                      setAdminPassword('');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-sans font-bold rounded-lg transition cursor-pointer select-none"
                  >
                    🔒 Cerrar Sesión Segura
                  </button>
                </div>
              )}

              {/* Set custom expected password by Admin - Only active when unlocked */}
              {!adminUnlocked ? (
                <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 shrink-0 md:max-w-xs w-full flex flex-col items-center justify-center text-center py-6">
                  <Lock className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                  <span className="block text-3xs font-bold font-mono text-slate-400 uppercase tracking-wider">Ajustes de Clave Bloqueados</span>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Debe autorizar el acceso técnico antes de poder reconfigurar la clave de administrador.</p>
                </div>
              ) : (
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-150 shrink-0 md:max-w-xs w-full animate-fade-in">
                  {!isChangingPass ? (
                    <div className="space-y-2">
                      <span className="block text-3xs font-bold font-mono text-indigo-800 uppercase tracking-wider">Establecer Nueva Contraseña</span>
                      <p className="text-3xs text-slate-650 font-sans">¿Deseas personalizar la clave del panel de administración para este servidor local o Hetzner?</p>
                      <button
                        onClick={() => setIsChangingPass(true)}
                        className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-3xs font-sans font-bold rounded-lg transition shadow-xs cursor-pointer select-none"
                      >
                        🛠️ Personalizar Clave de Admin
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-2.5">
                      <span className="block text-3xs font-bold font-mono text-indigo-900 uppercase tracking-widest">Establecer Clave Nueva:</span>
                      <input
                        type="password"
                        required
                        placeholder="Nueva contraseña (mínimo 4)"
                        value={tempNewPassword}
                        onChange={(e) => setTempNewPassword(e.target.value)}
                        className="w-full text-3xs border border-indigo-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-center"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="submit"
                          className="py-1 bg-indigo-650 hover:bg-indigo-700 text-white text-3xs font-sans font-bold rounded-lg transition shadow-xs cursor-pointer select-none"
                        >
                          Establecer
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsChangingPass(false)}
                          className="py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-3xs font-sans font-bold rounded-lg transition cursor-pointer select-none"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* REVEAL CODE AND DIRECTIONS UPON VALID UNLOCK */}
          {adminUnlocked && (
            <div className="space-y-6 pt-2 animate-fade-in">
              
              {/* OSINT CONTENT MODERATION CENTER */}
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 space-y-4 border border-slate-950 shadow-lg" id="admin-osint-moderation-hud">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-450 text-3xs font-mono font-bold tracking-wider rounded uppercase">
                      OSINT Moderation Center
                    </span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 mt-1 font-sans">
                      <Shield className="w-5 h-5 text-rose-500" />
                      Centro de Control de Spam y Veracidad Dudosa
                    </h4>
                    <p className="text-3xs text-slate-400 font-sans leading-normal">
                      Supervisión de aportes literarios. Modera la veracidad de los libros o comentarios y aprueba o encola los que consideres sospechosos.
                    </p>
                  </div>
                  <button
                    onClick={() => fetchAdminBooks()}
                    disabled={loadingAdminBooks}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-3xs font-mono font-bold border border-slate-700 transition"
                  >
                    {loadingAdminBooks ? "Actualizando..." : "🔄 Recargar Consola"}
                  </button>
                </div>

                {loadingAdminBooks && adminBooks.length === 0 ? (
                  <p className="text-2xs font-mono text-slate-500 py-6 text-center">Sincronizando auditorías desde la base de datos local...</p>
                ) : adminError ? (
                  <p className="text-2xs text-rose-400 py-4 font-mono">⚠️ Error: {adminError}</p>
                ) : adminBooks.length === 0 ? (
                  <p className="text-2xs text-slate-500 py-6 font-mono text-center">No hay reseñas guardadas en el sistema actualmente.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Estado / Categoría</th>
                          <th className="py-2.5 px-3">Libro / Autor</th>
                          <th className="py-2.5 px-3">Comentario & Lo aconsejable</th>
                          <th className="py-2.5 px-3 text-right">Acciones de Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-805 divide-slate-800/50">
                        {adminBooks.map((b: any) => {
                          const hasIssue = b.isOnHold || b.isFlagged;
                          return (
                            <tr key={b.id} className={`hover:bg-slate-800/40 transition ${hasIssue ? 'bg-amber-950/20' : ''}`}>
                              <td className="py-3 px-3 align-top whitespace-nowrap">
                                <div className="space-y-1.5">
                                  {b.isOnHold ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      🟠 EN ESPERA / HOLD
                                    </span>
                                  ) : b.isFlagged ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                      🚨 RECHAZADO / SPAM
                                    </span>
                                  ) : (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      🟢 PÚBLICO LIVE
                                    </span>
                                  )}
                                  <div className="text-[10px] text-slate-400">
                                    Categoría: <strong className="text-white">{b.category === 'Viaje' ? '✈️ Viaje' : b.category}</strong>
                                  </div>
                                  <div className="text-[9px] text-slate-500">
                                    ★ {b.rating}/5 | {b.emoji || '📖'}
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-3 px-3 align-top max-w-[160px]">
                                <div className="font-bold text-white leading-tight font-sans text-xs">{b.title}</div>
                                <div className="text-[10px] text-slate-400 mt-1">Por {b.author}</div>
                                <div className="text-[9px] text-slate-500 mt-0.5 max-w-[150px] truncate">Token: {b.editToken?.substring(0, 8)}...</div>
                              </td>

                              <td className="py-3 px-3 align-top max-w-xs text-[11px] leading-relaxed">
                                <p className="text-slate-300 italic">"{b.comment}"</p>
                                <p className="text-[10px] text-slate-450 mt-1.5">
                                  💡 <span className="font-semibold text-slate-300">Aconsejable:</span> {b.recommendation}
                                </p>
                                {b.moderationReason && (
                                  <p className="mt-2 text-[10px] text-amber-400 bg-amber-950/40 p-1.5 rounded border border-amber-500/20 font-sans leading-normal">
                                    <strong>Justificación OSINT:</strong> {b.moderationReason}
                                  </p>
                                )}
                              </td>

                              <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                                <div className="flex flex-col gap-1 items-end">
                                  {hasIssue ? (
                                    <button
                                      onClick={() => handleApproveBook(b.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold font-sans transition cursor-pointer"
                                    >
                                      🟢 Aprobar Reseña
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleHoldBook(b.id)}
                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold font-sans transition cursor-pointer"
                                      title="Poner en hold por lenguaje o veracidad dudosa"
                                    >
                                      🟠 Poner En Espera
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleDeleteBookAdmin(b.id)}
                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold font-sans transition cursor-pointer"
                                    title="Destruir físicamente de la base de datos"
                                  >
                                    🗑️ Purgar Registro
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* INTERACTIVE DOWNLOAD DOCK */}
              <div className="bg-indigo-600 text-white rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-white/20 text-white text-3xs font-mono font-bold tracking-wider rounded uppercase">
                      Infraestructura Automática
                    </span>
                    <h4 className="text-sm font-bold mt-1 text-white">Generador y Descargador de Código para Entornos</h4>
                    <p className="text-3xs text-indigo-100 mt-1 max-w-lg">
                      Descarga los ficheros de configuración listos para inyectar en tu entorno local, colocar en la raíz dev para Vercel o registrar en el sistema daemon de tu servidor Hetzner.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleDownloadFile('.env.production', `# Configuración e Innovación para Ireadit Producción\nNODE_ENV=production\nPORT=3000\nGEMINI_API_KEY=introduce_tu_clave_de_google_aqui\n`)}
                      className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 text-white px-3 py-2 rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>.env.production</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile('vercel.json', `{\n  "version": 2,\n  "builds": [\n    {\n      "src": "server.ts",\n      "use": "@vercel/node"\n    },\n    {\n      "src": "package.json",\n      "use": "@vercel/static-build",\n      "config": { "distDir": "dist" }\n    }\n  ],\n  "routes": [\n    {\n      "src": "/api/(.*)",\n      "dest": "server.ts"\n    },\n    {\n      "src": "/(.*)",\n      "dest": "/dist/\$1"\n    }\n  ]\n}`)}
                      className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 text-white px-3 py-2 rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>vercel.json</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile('ireadit.service', `[Unit]\nDescription=Ireadit - Mural de Lecturas Literarias\nAfter=network.target\n\n[Service]\nType=simple\nUser=root\nWorkingDirectory=/var/www/ireadit\nExecStart=/usr/bin/npm run start\nRestart=on-failure\nEnvironment=NODE_ENV=production PORT=3000 GEMINI_API_KEY=tu_clave_secreta_aqui\n\n[Install]\nWantedBy=multi-user.target\n`)}
                      className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 text-white px-3 py-2 rounded-xl text-3xs font-mono font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>ireadit.service</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* THREE SEPARATE EXPLICATIVE BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                
                {/* COLUMN A: LOCAL / GITHUB */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-3xs">
                  <div className="space-y-2">
                    <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-150 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit font-sans">
                      Opción A: Local & GitHub
                    </span>
                    <h5 className="font-bold text-slate-900 font-sans">Preparación y Clonación Local</h5>
                    <p className="text-2xs text-slate-500">
                      Exporta el código de AI Studio (menú superior derecho {"→"} Configuración {"→"} "Exportar ZIP" o conecta con GitHub) y sigue las directivas del terminal:
                    </p>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] font-mono text-slate-650 space-y-1.5 border border-slate-205">
                      <div className="text-slate-800 font-bold block font-sans">1. Descomprimir e Instalar:</div>
                      <code className="block bg-slate-900 text-emerald-400 p-1.5 rounded select-all font-mono break-all leading-normal text-[9px]">
                        unzip ireadit-export.zip<br/>
                        cd ireadit-export<br/>
                        npm install
                      </code>
                      <div className="text-slate-800 font-bold block font-sans">2. Env Key:</div>
                      <p className="text-3xs font-sans">Copia <code className="bg-slate-100 px-0.5 rounded text-indigo-700">.env.example</code> a <code className="bg-slate-100 px-0.5 rounded text-indigo-705 font-bold">.env</code> e ingresa tu Gemini API Key:</p>
                      <code className="block bg-slate-900 text-emerald-400 p-1.5 rounded select-all font-mono break-all text-[9px]">
                        GEMINI_API_KEY=tu_clave_google
                      </code>
                      <div className="text-slate-800 font-bold block font-sans">3. Iniciar:</div>
                      <code className="block bg-slate-900 text-emerald-400 p-1.5 rounded select-all font-mono text-[9px]">
                        npm run dev
                      </code>
                    </div>
                  </div>
                  <div className="pt-2 text-3xs text-slate-400 font-mono italic leading-none">
                    * El servidor arranca en el puerto 3000 con recarga en caliente y enrutador Express automático para APIs.
                  </div>
                </div>

                {/* COLUMN B: VERCEL SERVERLESS */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-3xs">
                  <div className="space-y-2">
                    <span className="text-[10px] bg-indigo-50 text-indigo-805 border border-indigo-150 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit font-sans">
                      Opción B: Vercel Cloud
                    </span>
                    <h5 className="font-bold text-slate-900 font-sans">Despliegue Serverless Rápido</h5>
                    <p className="text-2xs text-slate-500">
                      Debido a que poseemos un servidor NodeJS Express personalizado (`server.ts`), para desplegar en Vercel de forma nativa debemos indicarle cómo enrutar las APIs usando un manifesto Serverless.
                    </p>
                    
                    <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] font-sans text-slate-650 space-y-2 border border-slate-205">
                      <p className="font-bold text-slate-800">Pasos sugeridos:</p>
                      <ol className="list-decimal pl-4.5 space-y-1.5 text-3xs leading-relaxed">
                        <li>Sube tu código limpio a un repositorio privado de <strong className="text-slate-900">GitHub</strong>.</li>
                        <li>Sincroniza el repositorio en tu panel de <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Vercel</a>.</li>
                        <li>Descarga el fichero <strong className="text-indigo-650">vercel.json</strong> de arriba y colócalo en el directorio raíz del proyecto.</li>
                        <li>En Vercel, agrega la variable de entorno: <br/>
                          <code className="bg-slate-900 text-pink-400 p-0.5 rounded font-mono font-bold block mt-1 text-[9px] select-all">GEMINI_API_KEY = tu_valor</code>
                        </li>
                        <li>¡Haz click en "Deploy"! Vercel construirá y enrutará automáticamente.</li>
                      </ol>
                    </div>
                  </div>
                  <div className="pt-2 text-3xs text-slate-400 font-mono italic leading-none">
                    * Vercel ejecutará server.ts como una Cloud Function sin coste, sirviendo dist/ de manera optimizada por CDN.
                  </div>
                </div>

                {/* COLUMN C: HETZNER VPS */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-3xs">
                  <div className="space-y-2">
                    <span className="text-[10px] bg-amber-50 text-amber-805 border border-amber-150 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit font-sans">
                      Opción C: Server Hetzner / Linux
                    </span>
                    <h5 className="font-bold text-slate-900 font-sans">Despliegue VPS en Producción</h5>
                    <p className="text-2xs text-slate-500">
                      La mejor alternativa para mantener un microservicio NodeJS corriendo 24/7 de forma autónoma sobre sistemas Debian/Ubuntu en Hetzner u OVH.
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] font-sans text-slate-650 space-y-2 border border-slate-205 font-mono">
                      <p className="font-bold text-slate-800 font-sans">Flujo de Despliegue:</p>
                      <ol className="list-decimal pl-4.5 space-y-1.5 text-3xs font-sans leading-relaxed">
                        <li>Copia el directorio compilado en <code className="bg-slate-105 text-slate-850 p-0.5 rounded">/var/www/ireadit</code>.</li>
                        <li>Construye la optimización para producción:
                          <code className="block bg-slate-900 text-emerald-400 p-1 rounded font-mono mt-1 text-[9px]">
                            npm run build
                          </code>
                        </li>
                        <li>Descarga e instala el fichero de servicio <strong className="text-indigo-650">ireadit.service</strong> en:
                          <code className="block bg-indigo-50 text-indigo-900 p-1 rounded break-all mt-1 font-mono text-[9px]">
                            /etc/systemd/system/ireadit.service
                          </code>
                        </li>
                        <li>Activa y arranca el demonio de fondo Linux:
                          <code className="block bg-slate-900 text-emerald-400 p-1 rounded mt-1 font-mono text-[9px]">
                            systemctl enable ireadit<br/>
                            systemctl start ireadit
                          </code>
                        </li>
                      </ol>
                    </div>
                  </div>
                  <div className="pt-2 text-3xs text-slate-400 font-mono italic leading-none font-sans">
                    * Configura un proxy reverso Nginx o Caddy en los puertos 80/443 para redirigir al microservicio en el puerto 3000.
                  </div>
                </div>

              </div>

              {/* SECURITY SUMMARY NOTIFICATION */}
              <div className="p-3.5 bg-amber-50 border border-amber-250 rounded-xl flex items-start gap-2.5 text-2xs text-amber-850 font-sans">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5 uppercase tracking-wide font-mono text-3xs">Atención al Administrador (Aislamiento de API Keys):</strong>
                  Nunca publiques tus API Keys secretas (<code className="bg-white/60 p-0.5 font-bold font-mono">GEMINI_API_KEY</code>) dentro de tu repositorio público de GitHub. La arquitectura de Ireadit está blindada para leer la clave desde variables del entorno (<code className="bg-white/60 p-0.5 font-bold font-mono">process.env</code>) y ejecutar la lógica de IA en el Express Server (es decir, server-side), impidiendo cualquier fuga de credenciales sobre el navegador Web final.
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Official Legal Explanatory Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 flex gap-3 text-2xs text-slate-500 leading-normal font-sans">
          <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <strong className="text-slate-800 block mb-1">Información Legal y Privacidad (UE 2016/679):</strong>
            De conformidad con el Reglamento General de Protección de Datos de la Unión Europea, garantizamos: (A) Transparencia absoluta; (B) No comercialización ni mercantilización de reseñas; (C) Destrucción física inmediata al revocar el token o solicitar el borrado vía formulario.
          </div>
        </div>

        {/* About Creator & Deployment Info */}
        <div className="p-5 bg-neutral-900 text-slate-200 rounded-2xl border border-neutral-850 flex flex-col justify-between text-2xs font-sans">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-amber-300 font-mono font-bold tracking-wide">
              <span>⚡ PERFIL DE ARQUITECTURA (ABOUT CREATOR)</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Diseñado de desarrollador a desarrollador. Solución ultraligera y portable pensada para testing en tu laptop local, ideal para desplegar como microservicio Node en instancias VPS (<span className="text-white">Hetzner / OVH</span>) o servidores Serverless como <span className="text-white">Vercel</span> de forma rápida con persistencia ágil JSON/SQLite o memoria volátil.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 text-[10px] text-slate-500 flex justify-between font-mono">
            <span>© {new Date().getFullYear()} Ireadit Project</span>
            <span className="text-slate-400">Linux • IA • Soft Dev • RRSS</span>
          </div>
        </div>
      </div>

    </div>
  );
}
