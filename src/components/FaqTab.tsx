import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: "¿Cómo añado un libro?",
    a: "Pulsa el botón \"Añadir lectura\", busca tu libro por título o autor (Open Library + Google Books) o introdúcelo manualmente. Rellena la reseña, supera el captcha anti-bots y Gemini validará el contenido antes de publicarlo en el mural."
  },
  {
    q: "¿Qué es el token de autor?",
    a: "Un identificador único generado automáticamente en tu navegador la primera vez que visitas Ireadit. Te permite borrar tus propias reseñas ejerciendo tu Derecho al Olvido (RGPD). Nadie más puede eliminar tus entradas. Guárdalo si cambias de dispositivo."
  },
  {
    q: "¿Cómo funciona la moderación por IA?",
    a: "Cada reseña pasa por Gemini antes de publicarse. El modelo detecta spam, publicidad, insultos o texto sin sentido literario y lo rechaza automáticamente con una explicación del motivo. Las entradas válidas se clasifican por categoría y se genera un resumen automático."
  },
  {
    q: "¿Qué son los libros Gutenberg?",
    a: "Clásicos de dominio público del Project Gutenberg, curados por el equipo de Ireadit. Puedes importarlos al mural con un clic desde el tab Viajeros. Todos son descargables y legibles gratis en línea."
  },
  {
    q: "¿Puedo borrar mi reseña?",
    a: "Sí. Si tienes tu token de autor (visible en el formulario cuando publicaste), puedes borrarla desde el tab RGPD introduciendo el título y tu email — la eliminación es inmediata. Sin token, envía una solicitud formal y un responsable de datos la gestiona en un máximo de 24 horas."
  },
  {
    q: "¿Qué es el filtro de países en Viajeros?",
    a: "En el tab Viajeros puedes filtrar libros por el país que tratan. Al añadir un libro de viaje, rellena el campo opcional \"País que trata el libro\" (ej. Japón, Marruecos, Perú) y aparecerá automáticamente en el selector de países del catálogo."
  },
  {
    q: "¿Está conectado con viajeinteligencia.com?",
    a: "Sí. Ireadit es parte del ecosistema viajeinteligencia.com. Los libros de la categoría Viaje alimentan un widget embebible para otros sitios, y el catálogo está pensado para integrarse con las rutas y análisis de destinos de la plataforma principal."
  },
  {
    q: "¿Cómo funciona el sistema de valoraciones?",
    a: "Cada libro del mural tiene un botón ★ que despliega las valoraciones de la comunidad. Puedes dejar tu puntuación (1-5 estrellas) y un comentario con tu nickname. Antes de publicarse, cada valoración pasa por un filtro de moderación automática: primero un filtro de palabras local y después Gemini revisa el contenido para garantizar que es una opinión literaria genuina. Las valoraciones aprobadas aparecen de inmediato con media, distribución de estrellas y el historial de la comunidad."
  }
];

export default function FaqTab() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6 pb-5 border-b border-slate-100">
        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-mono text-2xs font-bold rounded-full uppercase tracking-wider block w-fit mb-2">
          ❓ Preguntas frecuentes
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">FAQ — Ireadit</h2>
        <p className="text-xs text-slate-500 mt-1">Todo lo que necesitas saber para sacarle partido al mural de lecturas.</p>
      </div>

      <div className="space-y-1">
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-slate-100 last:border-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left flex items-center justify-between gap-4 py-4 group"
            >
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition leading-snug">
                {faq.q}
              </span>
              {open === i
                ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              }
            </button>
            {open === i && (
              <p className="text-sm text-slate-600 leading-relaxed pb-4 pr-8">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
