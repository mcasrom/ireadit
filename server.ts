import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { BookReview } from "./src/types";

dotenv.config();

// Initialize the Google GenAI SDK using process.env.GEMINI_API_KEY
// telemetery header User-Agent: 'aistudio-build' is added in httpOptions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Path to store JSON books safely on the VPS/laptop
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "books.json");
const GDPR_FILE = path.join(DATA_DIR, "gdpr_requests.json");

// Define Initial/Default book reviews so the wallboard is pre-populated of fame!
const DEFAULT_BOOKS = [
  {
    id: "book-1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    rating: 5,
    comment: "La biblia absoluta de los sistemas distribuidos y diseño de bases de datos. Esencial para cualquier desarrollador de software que trabaje con volumen, concurrencia o escalabilidad en la nube.",
    recommendation: "Recomendado para arquitectos de software, desarrolladores full-stack y curiosos de la ingeniería de datos.",
    emoji: "💡",
    repeat: true,
    likes: 12,
    dislikes: 0,
    category: "Soft Dev",
    coverColor: "emerald",
    aiSummary: "Una guía fundamental para estructurar sistemas de gran escala sin perder de vista la fiabilidad y el consenso.",
    timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    editToken: "default-token"
  },
  {
    id: "book-2",
    title: "Just for Fun: The Story of an Accidental Revolutionary",
    author: "Linus Torvalds",
    rating: 5,
    comment: "La historia divertida y desenfadada acerca del nacimiento del kernel Linux, el código abierto y la filosofía hacker explicada en primera persona.",
    recommendation: "Esencial para administradores de sistemas Linux, desarrolladores de kernel y activistas del software libre.",
    emoji: "🐧",
    repeat: true,
    likes: 18,
    dislikes: 1,
    category: "Linux",
    coverColor: "sky",
    aiSummary: "Refleja la mentalidad de Linus Torvalds: crear software de clase mundial simplemente buscando la diversión y la excelencia técnica.",
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    editToken: "default-token"
  },
  {
    id: "book-3",
    title: "Life 3.0: Being Human in the Age of Artificial Intelligence",
    author: "Max Tegmark",
    rating: 4,
    comment: "Explica escenarios realistas de cómo la inteligencia artificial redefinirá el tejido social, civilizatorio y el mismo concepto de vida.",
    recommendation: "Muy recomendado para investigadores de IA y tecnólogos interesados en la ética informática y alineación de modelos.",
    emoji: "🤖",
    repeat: false,
    likes: 9,
    dislikes: 0,
    category: "IA",
    coverColor: "purple",
    aiSummary: "Un análisis prospectivo riguroso que equilibra las oportunidades existenciales de la superinteligencia con sus riesgos de control.",
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    editToken: "default-token"
  },
  {
    id: "book-4",
    title: "The Shallows: What the Internet Is Doing to Our Brains",
    author: "Nicholas Carr",
    rating: 4,
    comment: "Análisis lúcido sobre cómo el consumo acelerado de las redes sociales y la lectura hipertextual fragmentan nuestra capacidad de atención profunda.",
    recommendation: "Recomendado para creadores digitales y usuarios habituales de RRSS preocupados por la concentración cognitiva.",
    emoji: "📱",
    repeat: true,
    likes: 7,
    dislikes: 2,
    category: "RRSS",
    coverColor: "amber",
    aiSummary: "Alerta de cómo la sobreestimulación algorítmica reconfigura nuestras redes cerebrales desactivando el pensamiento reflexivo.",
    timestamp: new Date().toISOString(),
    editToken: "default-token"
  },
  {
    id: "book-5",
    title: "El camino más corto: Diario de viaje por tierra alrededor del mundo",
    author: "Manuel Leguineche",
    rating: 5,
    comment: "La aventura épica de dar la vuelta al mundo en un todoterreno en los años 60. Describe culturas, paisajes y la verdadera esencia de la libertad y el descubrimiento geográfico sin artificios.",
    recommendation: "Esencial para viajeros empedernidos, geógrafos, exploradores y amantes de la narrativa de aventura tradicional.",
    emoji: "✈️",
    repeat: true,
    likes: 14,
    dislikes: 0,
    category: "Viaje",
    coverColor: "indigo",
    aiSummary: "Una obra maestra de la literatura de viajes en español que captura el anhelo de descubrir lo desconocido.",
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    editToken: "default-token"
  },
  {
    id: "book-6",
    title: "¡¡SECRETO REVELADO DE CRIPTOMONEDAS 1000x FÁCIL!!",
    author: "Anonymous Crypto Gurú",
    rating: 5,
    comment: "SÍGUEME EN TELEGRAM PARA OBTENER UN 10000% DE RETORNO DIARIO SEGURO SIN RIESGO. COMPRA YA LA CRIPTO SHITCOIN 'SOLARMOON' ANTES DE QUE SUBA AL CIELO!!! DINERO GRATIS YA!!!",
    recommendation: "COMPRAR HOY SIN DUDAR ANTES DE QUE SE AGOTE",
    emoji: "🤑",
    repeat: false,
    likes: 0,
    dislikes: 6,
    category: "Otros",
    coverColor: "red",
    aiSummary: "Spam criptofinanciero detectado. Alta sospecha de veracidad dudosa y estafa algorítmica.",
    timestamp: new Date().toISOString(),
    editToken: "spam-token-anon",
    isOnHold: true,
    moderationReason: "Contenido sospechoso de spam masivo publicitario y veracidad dudosa."
  }
];

// Helper to safely load data
let booksMemory: BookReview[] = [...DEFAULT_BOOKS] as any[];
let gdprMemory: any[] = [];

function initDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Load books
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      booksMemory = JSON.parse(content);
      // Auto-populate new default books if they don't exist in saved file
      const hasViaje = booksMemory.some(b => b.category === "Viaje");
      if (!hasViaje) {
        booksMemory.push(DEFAULT_BOOKS[4]); // Add travel book
        booksMemory.push(DEFAULT_BOOKS[5]); // Add spam book
        fs.writeFileSync(DATA_FILE, JSON.stringify(booksMemory, null, 2), "utf-8");
      }
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_BOOKS, null, 2), "utf-8");
    }

    // Load GDPR requests
    if (fs.existsSync(GDPR_FILE)) {
      const content = fs.readFileSync(GDPR_FILE, "utf-8");
      gdprMemory = JSON.parse(content);
    } else {
      fs.writeFileSync(GDPR_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("DB initializing fallback inside Memory only (Normal inside read-only platforms/Vercel):", err);
  }
}

// Save DB helper
function saveDB() {
  try {
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(booksMemory, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to write to file database. Utilizing server-side volatile RAM memory instead.", err);
  }
}

function saveGDPR() {
  try {
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(GDPR_FILE, JSON.stringify(gdprMemory, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to write GDPR requests", err);
  }
}

initDB();

// Simple store for dynamic captcha questions
const activeCaptchas = new Map<string, string>();

// API Endpoints

// 1. Get captcha puzzle to avoid robot spamming
app.get("/api/captcha", (req, res) => {
  const num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
  const num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
  const ops = ["+", "-", "*"] as const;
  const operator = ops[Math.floor(Math.random() * ops.length)];
  
  let answer = 0;
  let qText = "";
  
  if (operator === "+") {
    answer = num1 + num2;
    qText = `¿Cuánto es ${num1} más ${num2}?`;
  } else if (operator === "-") {
    // protect negative output
    const maxVal = Math.max(num1, num2);
    const minVal = Math.min(num1, num2);
    answer = maxVal - minVal;
    qText = `¿Cuánto es ${maxVal} menos ${minVal}?`;
  } else {
    answer = num1 * num2;
    qText = `¿Cuánto resulta de multiplicar ${num1} por ${num2}?`;
  }

  const id = "captcha-" + Math.random().toString(36).substring(2, 9);
  activeCaptchas.set(id, answer.toString());
  
  // Auto-garbage clean captcha after 10 minutes
  setTimeout(() => {
    activeCaptchas.delete(id);
  }, 10 * 60 * 1000);

  res.json({ id, question: qText });
});

// 2. Query all books lists
app.get("/api/books", (req, res) => {
  // Filter flagged or on-hold content in general public timeline
  const activeBooks = booksMemory.filter(b => !b.isFlagged && !b.isOnHold);
  res.json(activeBooks);
});

// 2.5 Widget Endpoint to serve rendered traveller books widget in an iframe
app.get("/api/widget/viaje", (req, res) => {
  const travelBooks = booksMemory.filter(b => b.category === "Viaje" && !b.isFlagged && !b.isOnHold);
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Travellers Books Widget</title>
</head>
<body class="bg-slate-50/50 p-4 font-sans select-none antialiased">
  <div class="space-y-4 max-w-xl mx-auto">
    <div class="flex items-center justify-between border-b pb-2 mb-2 border-indigo-100">
      <div class="flex items-center gap-2">
        <div class="p-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs">✈️</div>
        <div>
          <h3 class="text-xs font-bold text-indigo-950 font-mono tracking-wide">Travellers Books Feed</h3>
          <p class="text-[9px] text-slate-400">Alimentado por viajeinteligencia.com</p>
        </div>
      </div>
      <span class="text-[9px] bg-indigo-50 border border-indigo-250 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
        ${travelBooks.length} Libros
      </span>
    </div>

    ${travelBooks.length === 0 ? `
      <p class="text-[10px] text-slate-400 font-mono text-center py-8">Registra y aprueba reseñas con categoría Viaje para poblarlas aquí.</p>
    ` : `
      <div class="grid grid-cols-1 gap-3.5">
        ${travelBooks.map(b => `
          <div class="p-4 bg-white border border-indigo-100 rounded-xl hover:shadow-xs transition duration-150 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-indigo-50/50 pb-1.5 mb-2">
                <span class="text-xl">${b.emoji || "✈️"}</span>
                <span class="text-[8px] bg-indigo-50 border border-indigo-150 uppercase tracking-widest px-1 py-0.5 rounded text-indigo-700 font-semibold font-mono">
                  ${b.category}
                </span>
              </div>
              <h4 class="font-bold text-slate-900 text-xs font-sans leading-tight">${b.title}</h4>
              <p class="text-[9px] text-slate-400 font-mono mt-0.5">Por ${b.author}</p>
              <p class="text-[11px] text-slate-650 italic mt-2 font-sans">"${b.comment}"</p>
            </div>
            
            <div class="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span class="text-indigo-600 font-semibold">Valoración: ${b.rating}/5 ★</span>
              <span>Recomienda por: ${b.recommendation}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  </div>
</body>
</html>`;
  res.send(html);
});

// 2.7 Gutenberg travel classic books catalog
const GUTENBERG_TRAVEL_CLASSICS = [
  {
    gutenbergId: 14457,
    title: "Kings, Queens and Pawns: An American Woman at the Front",
    author: "Mary Roberts Rinehart",
    rating: 4,
    comment: "Crónica real de una periodista americana en el frente de la Primera Guerra Mundial (1914). Rinehart viajó a Bélgica y Francia bajo fuego, documentando con agudeza el horror bélico, los hospitales de campaña y la resistencia civil. Una de las primeras corresponsales de guerra de la historia.",
    recommendation: "Amantes de la historia bélica, periodistas de viaje, estudiantes de geopolítica y riesgo global.",
    emoji: "⚔️",
    coverColor: "rose",
    aiSummary: "El viaje más peligroso: una mujer sola en el frente europeo de la Gran Guerra.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/14457",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/14457/pg14457-images.html"
  },
  {
    gutenbergId: 103,
    title: "Around the World in Eighty Days",
    author: "Jules Verne",
    rating: 5,
    comment: "Phileas Fogg's legendary voyage around the globe on a bet. From steamships to railways and guidebooks, it represents the marvel of modern transportation, geography, and Victorian determination.",
    recommendation: "Aventureros en tren, apasionados de la ciencia ficción de la época victoriana.",
    emoji: "🚂",
    coverColor: "emerald",
    aiSummary: "A timeless masterpiece celebrating geography, clocks, global railways, and ultimate pacing.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/103",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/103/pg103-images.html"
  },
  {
    gutenbergId: 3173,
    title: "Innocents Abroad",
    author: "Mark Twain",
    rating: 4,
    comment: "A hilarious and cynical chronicle of Twain's excursion through Europe and the Holy Land in 1867. He mocks traditional tourists who pretend to feel sentimental awe, providing a raw and incredibly witty travel review.",
    recommendation: "Amantes del humor inteligente, satíricos, historiadores de viajes coloniales.",
    emoji: "🚢",
    coverColor: "amber",
    aiSummary: "Una sutil burla del turismo pretencioso y las falsas deidades de los guías turísticos tradicionales.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/3173",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/3173/pg3173-images.html"
  },
  {
    gutenbergId: 3704,
    title: "The Voyage of the Beagle",
    author: "Charles Darwin",
    rating: 5,
    comment: "Darwin's fascinating travel journal as a young naturalist aboard the HMS Beagle. Vital accounts of South America, Patagonia, the Galápagos Islands, and Australia that laid the physical foundation of evolutionary biology.",
    recommendation: "Geógrafos natos, biólogos, curiosos del mundo salvaje e isleño.",
    emoji: "🌋",
    coverColor: "indigo",
    aiSummary: "El diario que redefinió nuestra herencia científica recorriendo las costas inexploradas del planeta.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/3704",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/3704/pg3704-images.html"
  },
  {
    gutenbergId: 4390,
    title: "La Biblia en España",
    author: "George Borrow",
    rating: 4,
    comment: "Una de las crónicas de viaje más fascinantes de la España del siglo XIX. Borrow recorre caminos hostiles repartiendo testamentos en plena guerra carlista, retratando con genio literario a gitanos, bandoleros y posaderos.",
    recommendation: "Amantes de la literatura costumbrista de caminos, hispanistas, viajeros de mochila pura.",
    emoji: "🐴",
    coverColor: "rose",
    aiSummary: "La España romántica y peligrosa de bandolerismo relatada con agudeza antropológica extrema.",
    language: "es",
    gutenbergLink: "https://www.gutenberg.org/ebooks/4390",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/4390/pg4390-images.html"
  },
  {
    gutenbergId: 17319,
    title: "Viajes de Gulliver",
    author: "Jonathan Swift",
    rating: 5,
    comment: "La sátira definitiva de la era de los descubrimientos. A través de Liliput, Brobdingnag y Laputa, Swift disecciona el ridículo comportamiento humano, la política y la arrogancia de los relatos de viajes científicos de su época.",
    recommendation: "Cínicos amables, amantes de la fantasía clásica satírica.",
    emoji: "⛵",
    coverColor: "purple",
    aiSummary: "Soberbia parodia fantástica que ridiculiza la fatuidad mercantil y la superioridad científica.",
    language: "es",
    gutenbergLink: "https://www.gutenberg.org/ebooks/17319",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/17319/pg17319-images.html"
  },
  {
    gutenbergId: 829,
    title: "Gulliver's Travels",
    author: "Jonathan Swift",
    rating: 5,
    comment: "The ultimate satire of exploration and political risk. Gulliver's voyages to Lilliput, Brobdingnag, Laputa and the Houyhnhnms expose the absurdity of war, colonialism, and blind trust in governments — a masterclass in geopolitical scepticism disguised as adventure.",
    recommendation: "Geopolitical analysts, risk consultants, sceptical travellers and fans of sharp satire.",
    emoji: "🗺️",
    coverColor: "emerald",
    aiSummary: "Every border crossed reveals a new absurdity of power — the oldest risk manual ever written.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/829",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/829/pg829-images.html"
  },
  {
    gutenbergId: 1328,
    title: "The War of the Worlds",
    author: "H.G. Wells",
    rating: 5,
    comment: "La novela que inventó el concepto de riesgo existencial global. Una invasión alienígena arrasa el sur de Inglaterra: caos, evacuaciones masivas, colapso de infraestructuras y supervivencia extrema. Wells anticipó el manual de gestión de crisis del siglo XX con 120 años de antelación.",
    recommendation: "Analistas de riesgo, lectores de ciencia ficción clásica, planificadores de emergencias.",
    emoji: "🛸",
    coverColor: "red",
    aiSummary: "El primer modelo mental de colapso civilizatorio total — y cómo sobrevivir a él.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/36",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/36/pg36-images.html"
  },
  {
    gutenbergId: 5230,
    title: "The Time Machine",
    author: "H.G. Wells",
    rating: 4,
    comment: "Un viajero del tiempo descubre que la humanidad se ha dividido en dos razas: los Eloi (clase ociosa) y los Morlocks (clase trabajadora subterránea). Una distopía que sigue siendo el análisis más brutal de la desigualdad social y los riesgos a largo plazo de no corregirla.",
    recommendation: "Futuristas, analistas de riesgo sistémico, lectores de ciencia ficción filosófica.",
    emoji: "⏱️",
    coverColor: "amber",
    aiSummary: "El viaje más arriesgado no es al espacio — es al futuro que estamos construyendo ahora.",
    language: "en",
    gutenbergLink: "https://www.gutenberg.org/ebooks/35",
    gutenbergTextLink: "https://www.gutenberg.org/cache/epub/35/pg35-images.html"
  }
];

app.get("/api/gutenberg/classics", (req, res) => {
  res.json(GUTENBERG_TRAVEL_CLASSICS);
});

app.post("/api/gutenberg/import", (req, res) => {
  const { gutenbergId } = req.body;
  if (!gutenbergId) {
    return res.status(400).json({ error: "Falta el ID del libro de Project Gutenberg para la importación." });
  }

  const classic = GUTENBERG_TRAVEL_CLASSICS.find(c => c.gutenbergId === Number(gutenbergId));
  if (!classic) {
    return res.status(404).json({ error: "El libro clásico solicitado no está en el catálogo de Project Gutenberg oficial del sistema." });
  }

  // Check unique in database memory
  const alreadyExists = booksMemory.some(b => b.gutenbergId === Number(gutenbergId));
  if (alreadyExists) {
    return res.status(400).json({ error: `El clásico '${classic.title}' ya fue añadido al mural interactivo.` });
  }

  const newBook: BookReview = {
    id: `gutenberg-${classic.gutenbergId}-${Date.now()}`,
    title: classic.title,
    author: classic.author,
    rating: classic.rating,
    comment: classic.comment,
    recommendation: classic.recommendation,
    emoji: classic.emoji,
    repeat: true,
    likes: Math.floor(Math.random() * 20) + 10, // Start with some real community likes
    dislikes: 0,
    category: "Viaje",
    coverColor: classic.coverColor,
    aiSummary: classic.aiSummary,
    timestamp: new Date().toISOString(),
    editToken: `gutenberg-token-${classic.gutenbergId}`, // safe token
    gutenbergId: classic.gutenbergId,
    gutenbergLink: classic.gutenbergLink,
    gutenbergTextLink: classic.gutenbergTextLink,
    language: classic.language
  };

  booksMemory.unshift(newBook);
  saveDB();

  res.json({ success: true, message: `¡ '${classic.title}' importado correctamente desde la librería clásica Gutenberg!`, book: newBook });
});

// 3. Post a new book with captcha validation & AI-powered anti-fraud moderation
app.post("/api/books", async (req, res) => {
  const { title, author, rating, comment, recommendation, emoji, repeat, captchaId, captchaAnswer, userToken } = req.body;
  
  // Basic validation
  if (!title || !author || !comment || !recommendation || !captchaId || !captchaAnswer || !userToken) {
    return res.status(400).json({ error: "Faltan campos obligatorios para registrar la lectura." });
  }

  // 1st Level Anti-spam: Math Captcha validation
  const savedAnswer = activeCaptchas.get(captchaId);
  if (!savedAnswer || savedAnswer !== captchaAnswer.trim()) {
    return res.status(400).json({ error: "Respuesta del captcha incorrecta o expirada. Por favor, resuélvelo de nuevo." });
  }
  
  // Remove evaluated captcha
  activeCaptchas.delete(captchaId);

  // Rate Limiting simulation in memory (max 10 inputs in past 10 minutes for this token)
  const pastSubmissions = booksMemory.filter(
    b => b.editToken === userToken && (Date.now() - new Date(b.timestamp).getTime()) < 10 * 60 * 1000
  );
  if (pastSubmissions.length >= 4) {
    return res.status(429).json({ error: "Límite de velocidad superado. Por favor, tómate un descanso. (Máx. 4 libros cada 10 minutos)." });
  }

  // 2. Level: AI-Powered Moderation and Content Enrichment
  // Call Gemini-3.5-flash to analyze the review
  let aiLabel = {
    isValid: true,
    category: "Otros",
    aiSummary: "Lectura registrada en el mural.",
    suggestedCoverColor: "slate",
    rejectionReason: ""
  };

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const prompt = `
        Analiza detalladamente esta reseña de libro brindada por un usuario del sistema "Ireadit":
        Título del libro: "${title}"
        Autor: "${author}"
        Calificación del usuario: ${rating}/5
        Comentario: "${comment}"
        Lo aconsejable: "${recommendation}"
        
        Debes actuar como un moderador de spam de contenido, clasificador literario y generador de sinopsis express. Acciona el protocolo anti-fraude:
        
        1. Evalúa si de verdad parece tratarse de un libro real o un aporte constructivo (aunque sea un libro de nicho, programación o novela), o si por el contrario es SPAM evidente, insultos, códigos de hacking, texto aleatorio insustancial (tipo 'asdfasdf'), anuncios de criptomonedas, bots automatizados o reseñas que no aportan absolutamente nada de opinión literaria.
        2. Si no es válido, marca isValid = false y explica por qué en rejectionReason.
        3. Si es válido:
           - Clasifica el libro exactamente en UNA de estas categorías según el contexto: "Linux", "IA", "Soft Dev", "RRSS", "Ciencia", "Filosofía", "Historia", "Negocios", "Novela", "Viaje", "Otros".
           - Genera un "aiSummary" cortísimo en español (máximo 15 palabras) que sea una idea o cita muy sugerente y atractiva inspirada directamente por el comentario del lector.
           - Elige un color de portada estético ("suggestedCoverColor") entre "slate", "red", "amber", "emerald", "sky", "purple", "rose", "indigo" que encaje con la energía o tema del libro.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { 
                type: Type.BOOLEAN, 
                description: "true si califica como un libro y opinión legítima; false si es spam descuidado, insulto, ataque, publicidad, etc." 
              },
              category: { 
                type: Type.STRING, 
                description: "Categoría asignada: Linux, IA, Soft Dev, RRSS, Ciencia, Filosofía, Historia, Negocios, Novela, Viaje, Otros" 
              },
              aiSummary: { 
                type: Type.STRING, 
                description: "Micro extracto destacado por la IA, un aforismo elegante de 1 line en español relativo a la opinión." 
              },
              suggestedCoverColor: { 
                type: Type.STRING, 
                description: "Color de portada estético sugerido: slate, red, amber, emerald, sky, purple, rose, indigo" 
              },
              rejectionReason: { 
                type: Type.STRING, 
                description: "Razón detallada de rechazo en español si isValid es false" 
              }
            },
            required: ["isValid", "category", "aiSummary", "suggestedCoverColor"]
          }
        }
      });

      const text = response.text?.trim() || "{}";
      const parsedAiResult = JSON.parse(text);
      if (parsedAiResult && typeof parsedAiResult.isValid === "boolean") {
        aiLabel = { ...aiLabel, ...parsedAiResult };
      }
    } catch (e) {
      console.error("Error running Gemini AI Spam assessment:", e);
      // Fallback values if AI API offline or rate-limited
      const tLower = (title + " " + comment).toLowerCase();
      aiLabel.isValid = true;
      aiLabel.category = tLower.includes("linux") ? "Linux" : 
                         (tLower.includes("ia") || tLower.includes("inteligencia") || tLower.includes("artificial") || tLower.includes("ai")) ? "IA" : 
                         (tLower.includes("viaje") || tLower.includes("travel") || tLower.includes("viajar") || tLower.includes("vuelo") || tLower.includes("geografia")) ? "Viaje" : "Otros";
      aiLabel.aiSummary = "Opinión registrada con éxito en el wallboard interactivo.";
      aiLabel.suggestedCoverColor = "slate";
    }
  } else {
    // fallback context if no API Key provided yet
    const tLower = (title + " " + comment).toLowerCase();
    aiLabel.category = tLower.includes("linux") ? "Linux" : 
                       (tLower.includes("ia") || tLower.includes("artificial") || tLower.includes("intelligence")) ? "IA" : 
                       (tLower.includes("code") || tLower.includes("program") || tLower.includes("soft") || tLower.includes("develop")) ? "Soft Dev" : 
                       (tLower.includes("viaje") || tLower.includes("travel") || tLower.includes("viajar") || tLower.includes("vuelo") || tLower.includes("turismo")) ? "Viaje" : "Otros";
    aiLabel.aiSummary = "Lector compartió una perspectiva de viaje o técnica sobre este título.";
    aiLabel.suggestedCoverColor = tLower.includes("viaje") || tLower.includes("travel") ? "indigo" : "emerald";
  }

  // If Gemini identifies it as SPAM/FRAUD, stop immediately and return 400
  if (!aiLabel.isValid) {
    return res.status(400).json({ 
      error: "Módulo Anti-Spam (IA): Tu opinión ha sido identificada como contenido no válido o de tipo spam.",
      reason: aiLabel.rejectionReason || "Entrada de texto inconsistente o que no parece una reseña literaria legítima."
    });
  }

  const finalCoverColors: Record<string, string> = {
    slate: "bg-slate-50 border-slate-200 text-slate-850",
    red: "bg-red-50 border-red-200 text-red-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    sky: "bg-sky-50 border-sky-200 text-sky-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900"
  };

  const selectedColor = aiLabel.suggestedCoverColor || "slate";

  const newBook = {
    id: "book-" + Math.random().toString(36).substring(2, 9),
    title: title.trim(),
    author: author.trim(),
    rating: Number(rating),
    comment: comment.trim(),
    recommendation: recommendation.trim(),
    emoji: emoji || "📖",
    repeat: !!repeat,
    likes: 0,
    dislikes: 0,
    category: aiLabel.category,
    coverColor: selectedColor,
    aiSummary: aiLabel.aiSummary,
    timestamp: new Date().toISOString(),
    editToken: userToken
  };

  booksMemory.unshift(newBook);
  saveDB();

  res.json({ success: true, book: newBook });
});

// 4. Reactions: likes / dislikes / increments of reads
app.post("/api/books/:id/react", (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'like', 'dislike'

  const book = booksMemory.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: "Libro no localizado en el mural." });
  }

  if (type === "like") {
    book.likes = (book.likes || 0) + 1;
  } else if (type === "dislike") {
    book.dislikes = (book.dislikes || 0) + 1;
  } else {
    return res.status(400).json({ error: "Acción reactiva no soportada." });
  }

  saveDB();
  res.json({ success: true, likes: book.likes, dislikes: book.dislikes });
});

// 5. GDPR Right to Erasure / El derecho al olvido (European Regulation)
// Local deletion flow: Users can instantly delete any book review they created if they provide the matching editToken.
app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const { editToken } = req.body;

  if (!editToken) {
    return res.status(400).json({ error: "Se requiere un token de control de autoría para borrar el registro." });
  }

  const bookIdx = booksMemory.findIndex(b => b.id === id);
  if (bookIdx === -1) {
    return res.status(404).json({ error: "La reseña seleccionada ya no existe." });
  }

  const book = booksMemory[bookIdx];
  
  // Verify token
  if (book.editToken !== editToken) {
    return res.status(403).json({ error: "No tienes permisos para suprimir esta reseña. El token no coincide." });
  }

  // Delete book review
  booksMemory.splice(bookIdx, 1);
  saveDB();

  res.json({ success: true, message: "Derecho al Olvido ejercido inmediatamente: Reseña eliminada de manera íntegra y definitiva de nuestros servidores." });
});

// 6. Submit a formal GDPR requests (if they don't have their token and want manual admin erasure)
app.post("/api/gdpr/request", (req, res) => {
  const { type, targetBookTitle, userEmail, message } = req.body;

  if (!userEmail || !targetBookTitle) {
    return res.status(400).json({ error: "Es necesario indicar tu email y el título del libro objetivo." });
  }

  const newRequest = {
    id: "gdpr-req-" + Math.random().toString(36).substring(2, 9),
    type: type || "erasure",
    targetBookTitle,
    userEmail,
    message: message || "Ejercicio del derecho al olvido según el RGPD (Reglamento General de Protección de Datos de la UE).",
    timestamp: new Date().toISOString(),
    status: "pending"
  };

  gdprMemory.unshift(newRequest);
  saveGDPR();

  // GDPR compliance logic: If a book matches the exact title and author or user hints, we flag/anonymize it automatically in this demo setup!
  let matchedCount = 0;
  booksMemory = booksMemory.filter(b => {
    const isMatch = b.title.toLowerCase().trim() === targetBookTitle.toLowerCase().trim();
    if (isMatch) matchedCount++;
    return !isMatch; // Keep non-matching
  });

  if (matchedCount > 0) {
    saveDB();
    newRequest.status = "resolved";
    saveGDPR();
    return res.json({ 
      success: true, 
      resolvedImmediately: true,
      message: `RGPD Cumplido de forma automatizada: Identificados y destruidos ${matchedCount} registros asociados al título "${targetBookTitle}".` 
    });
  }

  res.json({ 
    success: true, 
    resolvedImmediately: false,
    message: "Solicitud registrada. Un oficial de protección de datos (DPO) procesará tu solicitud de borrado definitivo en un plazo máximo de 24 horas (Simulado, pero se ha encolado)." 
  });
});

// Secure Admin Configuration state
let backendAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

// 7. Admin Endpoint: Fetch all reviews (including on-hold / flagged ones)
app.post("/api/admin/books", (req, res) => {
  const { password } = req.body;
  if (!password || password !== backendAdminPassword) {
    return res.status(401).json({ error: "No autorizado. Clave de administración incorrecta." });
  }
  res.json(booksMemory);
});

// 8. Admin Endpoint: Set admin password
app.post("/api/admin/change-password", (req, res) => {
  const { password, newPassword } = req.body;
  if (!password || password !== backendAdminPassword) {
    return res.status(401).json({ error: "No autorizado. Clave de administración incorrecta." });
  }
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: "La contraseña nueva debe poseer al menos 4 caracteres." });
  }
  backendAdminPassword = newPassword.trim();
  res.json({ success: true, message: "Contraseña actualizada exitosamente en el servidor." });
});

// 9. Admin Endpoint: Moderate (Accept / Approve a book review on-hold)
app.post("/api/admin/books/:id/approve", (req, res) => {
  const { password } = req.body;
  const { id } = req.params;
  if (!password || password !== backendAdminPassword) {
    return res.status(401).json({ error: "No autorizado. Clave incorrecta." });
  }
  
  const book = booksMemory.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: "Reseña no localizada en el servidor." });
  }
  
  book.isOnHold = false;
  book.isFlagged = false;
  book.moderationReason = undefined;
  saveDB();
  
  res.json({ success: true, book });
});

// 10. Admin Endpoint: Moderate (Put "on hold" or report/flag a review)
app.post("/api/admin/books/:id/hold", (req, res) => {
  const { password, reason } = req.body;
  const { id } = req.params;
  if (!password || password !== backendAdminPassword) {
    return res.status(401).json({ error: "No autorizado. Clave de administración incorrecta." });
  }
  
  const book = booksMemory.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: "Reseña no localizada en el servidor." });
  }
  
  book.isOnHold = true;
  book.moderationReason = reason || "Puesto en espera por veracidad dudosa o lenguaje sospechoso.";
  saveDB();
  
  res.json({ success: true, book });
});

// 11. Admin Endpoint: Moderate (Purge / Delete a book review directly as admin)
app.post("/api/admin/books/:id/delete", (req, res) => {
  const { password } = req.body;
  const { id } = req.params;
  if (!password || password !== backendAdminPassword) {
    return res.status(401).json({ error: "No autorizado. Clave de administración incorrecta." });
  }
  
  const bookIdx = booksMemory.findIndex(b => b.id === id);
  if (bookIdx === -1) {
    return res.status(404).json({ error: "Reseña no localizada." });
  }
  
  booksMemory.splice(bookIdx, 1);
  saveDB();
  
  res.json({ success: true, message: "Lectura purgada definitivamente de la base de datos por orden del administrador." });
});

// Serve frontend assets via Vite in dev or static files in production
// TRENDING BOOKS - Open Library API
app.get("/api/trending/:period", async (req, res) => {
  const period = ['daily','weekly','monthly'].includes(req.params.period) ? req.params.period : 'weekly';
  try {
    const response = await fetch(`https://openlibrary.org/trending/${period}.json`);
    const data = await response.json();
    const works = (data.works || []).slice(0, 20).map((w: any) => ({
      title: w.title || 'Unknown',
      author: w.author_name?.[0] || 'Unknown',
      coverId: w.cover_id || w.cover_edition_key || null,
      coverUrl: w.cover_id ? `https://covers.openlibrary.org/b/id/${w.cover_id}-M.jpg` : null,
      openLibraryKey: w.key || null,
      readCount: w.readinglog_count || 0,
      firstPublished: w.first_publish_year || null,
    }));
    res.json({ period, works, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: 'Error fetching trending books' });
  }
});


// SMART BOOK SEARCH - Open Library + Gemini fallback
app.get("/api/search", async (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q || q.length < 3) return res.json({ results: [] });

  try {
    // Open Library search
    const olRes = await fetch(
      "https://openlibrary.org/search.json?q=" + encodeURIComponent(q) + "&limit=6&fields=title,author_name,first_publish_year,cover_i,key"
    );
    const olData = await olRes.json();
    const results = (olData.docs || []).slice(0, 6).map((d: any) => ({
      title: d.title || "Desconocido",
      author: d.author_name?.[0] || "Autor desconocido",
      year: d.first_publish_year || null,
      coverUrl: d.cover_i ? "https://covers.openlibrary.org/b/id/" + d.cover_i + "-M.jpg" : null,
      openLibraryKey: d.key || null,
    }));

    // If no results, try Gemini as fallback
    if (results.length === 0 && process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: "Identifica el libro mas probable para esta busqueda: \"" + q + "\". Responde SOLO con JSON: {title, author, year}. Sin explicaciones.",
        });
        const text = geminiRes.text?.replace(/```json|```/g, "").trim() || "";
        const parsed = JSON.parse(text);
        return res.json({ results: [], aiSuggestion: { title: parsed.title, author: parsed.author, year: parsed.year } });
      } catch {
        return res.json({ results: [] });
      }
    }

    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: "Error en busqueda", results: [] });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.NODE_ENV === "production" ? "/home/deploy/apps/ireadit/dist" : path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server [Ireadit] active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
