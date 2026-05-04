import knowledgeEntries from "@/data/alzheimer_data.json";

export type ChatLanguage = "fr" | "ar" | "en";

export interface ChatbotReply {
  answer: string;
  language: ChatLanguage;
  source: string;
  confidence: number;
  disclaimer: string;
}

interface KnowledgeEntry {
  id: number;
  theme: string;
  question_fr: string;
  question_darija: string;
  answer_fr: string;
  answer_darija: string;
}

interface ExpertRule {
  intents: string[];
  answers: Record<ChatLanguage, string>;
  source: string;
  confidence: number;
}

const DOCUMENT_KNOWLEDGE_BASE = knowledgeEntries as KnowledgeEntry[];

const WELCOME_MESSAGES: Record<ChatLanguage, string> = {
  fr: "Bonjour. Je suis votre assistant Alzheimer. J'utilise maintenant votre base documentaire pour repondre sur les symptomes, la securite, les soins, la communication et la prevention.",
  ar: "مرحبا. أنا مساعدك الخاص بالزهايمر. كنستعمل دابا القاعدة المعرفية ديالك باش نجاوب على الأعراض، السلامة، العناية اليومية، التواصل والوقاية.",
  en: "Hello. I am your Alzheimer support assistant. I now use your knowledge base to answer questions about symptoms, safety, daily care, communication, and prevention.",
};

const LANGUAGE_CHANGED_MESSAGES: Record<ChatLanguage, string> = {
  fr: "Langue changee en francais. Posez votre question quand vous voulez.",
  ar: "تم تغيير اللغة إلى العربية. اطرح سؤالك في أي وقت.",
  en: "Language changed to English. Ask your question anytime.",
};

export const QUICK_QUESTIONS: Record<ChatLanguage, string[]> = {
  fr: [
    "Quels sont les premiers signes de la maladie d'Alzheimer ?",
    "Comment faire manger une personne qui refuse la nourriture ?",
    "Que faire si le malade se perd dans sa propre maison ?",
    "Comment parler avec un malade qui repete toujours la meme question ?",
    "Est-ce qu'on peut prevenir ou retarder l'Alzheimer ?",
  ],
  ar: [
    "واش هوما أول علامات مرض الزهايمر؟",
    "كيفاش نخلي المريض ياكل إذا كان يرفض الأكل؟",
    "شنوة نعملوا إذا كان المريض يضيع في داره؟",
    "كيفاش نهضر مع مريض يعاود نفس السؤال برشا مرات؟",
    "واش ينجم الإنسان يمنع أو يبطئ مرض الزهايمر؟",
  ],
  en: [
    "What are the first signs of Alzheimer's disease?",
    "How can I help a patient who refuses to eat?",
    "What should I do if the patient gets lost at home?",
    "How should I talk to a patient who repeats the same question?",
    "Can Alzheimer's be prevented or delayed?",
  ],
};

const EXPERT_RULES: ExpertRule[] = [
  {
    intents: [
      "tombe",
      "chute",
      "ne se reveille pas",
      "inconscient",
      "sang",
      "saignement",
      "urgence",
      "grave",
      "etouffe",
      "ne parle plus",
      "fall",
      "unconscious",
      "bleeding",
      "emergency",
      "choking",
      "not waking up",
      "طيحة",
      "خطر",
      "مستعجلة",
      "ما كيهضرش",
      "ما كايفيقش",
      "دم",
    ],
    answers: {
      fr: "En cas de chute, perte de connaissance, saignement important ou difficulte a respirer, appelez immediatement les urgences. Ne deplacez pas la personne avant de verifier sa respiration et sa securite.",
      ar: "إلى كانت طيحة، فقدان وعي، نزيف مهم ولا صعوبة فالتنفس، خاص الاتصال بالإسعاف فورا. ما تحركوش المريض حتى تتاكدوا من التنفس والسلامة ديالو.",
      en: "If there is a fall, loss of consciousness, major bleeding, or breathing difficulty, call emergency services immediately. Do not move the person before checking breathing and immediate safety.",
    },
    source: "Systeme expert (securite)",
    confidence: 1,
  },
  {
    intents: ["symptome", "signe", "diagnostic", "oubli", "اعراض", "تشخيص", "symptom", "diagnosis"],
    answers: {
      fr: "Les premiers signes peuvent inclure des oublis repetes, des difficultes de langage, une confusion dans le temps ou les lieux et des changements de comportement. Seul un professionnel de sante peut confirmer le diagnostic.",
      ar: "الأعراض الأولى تقدر تكون نسيان متكرر، صعوبة فالكلام، خلط فالزمان ولا المكان، وتغيرات فالسلوك. التشخيص النهائي خاصو يكون عند طبيب.",
      en: "Early signs can include repeated forgetfulness, language difficulty, confusion about time or place, and behavior changes. Only a clinician can confirm the diagnosis.",
    },
    source: "Systeme expert",
    confidence: 0.96,
  },
  {
    intents: ["agressif", "colere", "crie", "agite", "frappe", "violent", "عنيف", "غش", "agitated", "aggressive"],
    answers: {
      fr: "Face a l'agitation, gardez une voix calme, reduisez le bruit et evitez de contredire directement la personne. Essayez de rediriger son attention vers une activite familiere ou apaisante.",
      ar: "إلى كان المريض معصب ولا عدواني، بقا هادئ، نقص الضجيج، وما تعاندوش مباشرة. حاول تحول الانتباه ديالو لحاجة مألوفة وكتريحو.",
      en: "If the person is agitated, stay calm, reduce noise, and avoid direct confrontation. Try redirecting attention toward something familiar and soothing.",
    },
    source: "Systeme expert",
    confidence: 0.94,
  },
  {
    intents: ["medicament", "traitement", "ordonnance", "دواء", "علاج", "medicine", "treatment", "prescription"],
    answers: {
      fr: "Les traitements actuels peuvent soulager ou ralentir certains symptomes, mais ils ne guerissent pas la maladie. Le choix du traitement doit toujours etre valide par un neurologue ou un geriatre.",
      ar: "العلاجات الحالية تقدر تخفف أو تبطئ بعض الأعراض، ولكن ما كتشافيش المرض. اختيار الدواء خاصو يكون مع طبيب مختص.",
      en: "Current treatments may ease or slow some symptoms, but they do not cure the disease. Treatment choice should always be confirmed by a specialist.",
    },
    source: "Systeme expert",
    confidence: 0.93,
  },
  {
    intents: ["fatigue", "epuise", "burn out", "n'en peux plus", "تعبت", "فديت", "caregiver", "exhausted"],
    answers: {
      fr: "Votre sante compte aussi. Essayez d'organiser des relais, de prendre des pauses regulieres et de demander de l'aide a la famille ou a des professionnels si l'epuisement augmente.",
      ar: "الصحة ديالك مهمة حتى هي. حاول تلقى من يعاونك، دير فترات راحة، وطلب الدعم من العائلة أو من المختصين إذا زاد عليك العياء.",
      en: "Your health matters too. Try to organize backup support, take regular breaks, and ask family or professionals for help if exhaustion is building up.",
    },
    source: "Systeme expert",
    confidence: 0.91,
  },
  {
    intents: ["prevenir", "eviter", "sport", "recherche", "تجنب", "بحوث", "prevent", "exercise", "prevention"],
    answers: {
      fr: "Une activite physique reguliere, une alimentation equilibree, un bon sommeil et la stimulation cognitive sont parmi les meilleures mesures pour proteger le cerveau.",
      ar: "الرياضة بانتظام، الماكلة المتوازنة، النوم المزيان، والتحفيز الذهني من احسن الحوايج باش نحافظو على الدماغ.",
      en: "Regular exercise, balanced nutrition, good sleep, and cognitive stimulation are among the best ways to protect brain health.",
    },
    source: "Systeme expert",
    confidence: 0.9,
  },
];

const ALZHEIMER_TOPIC_KEYWORDS: Record<ChatLanguage, string[]> = {
  fr: ["alzheimer", "demence", "memoire", "oubli"],
  ar: ["الزهايمر", "ألزهايمر", "الخرف", "النسيان"],
  en: ["alzheimer", "dementia", "memory", "forgetfulness"],
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 1);
}

function detectLanguage(message: string): ChatLanguage {
  if (/[\u0600-\u06FF]/.test(message)) return "ar";

  const lowered = normalize(message);
  if (["what", "how", "help", "caregiver", "treatment", "prevent", "memory"].some((token) => lowered.includes(token))) {
    return "en";
  }

  return "fr";
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

function disclaimer(language: ChatLanguage) {
  if (language === "ar") return "هذا الجواب ما كيعوضش الاستشارة الطبية.";
  if (language === "en") return "This answer does not replace professional medical care.";
  return "Cette reponse ne remplace pas une consultation medicale.";
}

function defaultAlzheimerReply(language: ChatLanguage) {
  if (language === "ar") {
    return "مرض الزهايمر كيأثر خصوصا على الذاكرة، التوجه، اللغة وبعض السلوكات. من العلامات الشائعة النسيان المتكرر، التخلاط فالزمان ولا المكان، صعوبة فإيجاد الكلمات، وتبدل فالمزاج ولا فالاستقلالية.";
  }

  if (language === "en") {
    return "Alzheimer's disease mainly affects memory, orientation, language, and behavior. Common signs include repeated forgetfulness, confusion about time or place, word-finding difficulty, and changes in mood or independence.";
  }

  return "La maladie d'Alzheimer touche surtout la memoire, l'orientation, le langage et certains comportements. Les signes frequents sont les oublis repetes, la confusion dans le temps ou l'espace, les difficultes a trouver les mots et des changements d'humeur ou d'autonomie.";
}

function translateDocumentAnswer(entry: KnowledgeEntry, language: ChatLanguage) {
  if (language === "ar") return entry.answer_darija;
  if (language === "en") return `Document-based answer: ${entry.answer_fr}`;
  return entry.answer_fr;
}

function scoreKnowledgeEntry(query: string, entry: KnowledgeEntry) {
  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) return 0;

  const questionFr = normalize(entry.question_fr);
  const questionDarija = normalize(entry.question_darija);
  const answerFr = normalize(entry.answer_fr);
  const answerDarija = normalize(entry.answer_darija);
  const theme = normalize(entry.theme);

  const phraseBonus =
    questionFr.includes(query) || questionDarija.includes(query)
      ? 0.45
      : questionFr.startsWith(query) || questionDarija.startsWith(query)
        ? 0.3
        : 0;

  let questionHits = 0;
  let answerHits = 0;
  let themeHits = 0;

  for (const token of queryTokens) {
    if (questionFr.includes(token) || questionDarija.includes(token)) questionHits += 1;
    if (answerFr.includes(token) || answerDarija.includes(token)) answerHits += 1;
    if (theme.includes(token)) themeHits += 1;
  }

  const questionScore = questionHits / queryTokens.length;
  const answerScore = answerHits / queryTokens.length;
  const themeScore = themeHits / queryTokens.length;

  return Math.min(1, phraseBonus + questionScore * 0.55 + answerScore * 0.3 + themeScore * 0.15);
}

function findKnowledgeMatch(userMessage: string) {
  const normalizedQuery = normalize(userMessage);
  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of DOCUMENT_KNOWLEDGE_BASE) {
    const score = scoreKnowledgeEntry(normalizedQuery, entry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore < 0.34) {
    return null;
  }

  return { entry: bestEntry, score: bestScore };
}

function findExpertMatch(userMessage: string) {
  const normalizedMessage = normalize(userMessage);
  return EXPERT_RULES.find((rule) => includesAny(normalizedMessage, rule.intents)) || null;
}

export function getWelcomeMessage(language: ChatLanguage) {
  return WELCOME_MESSAGES[language];
}

export function getLanguageChangedMessage(language: ChatLanguage) {
  return LANGUAGE_CHANGED_MESSAGES[language];
}

export function generateChatbotReply(userMessage: string, selectedLanguage?: ChatLanguage): ChatbotReply {
  const message = userMessage.trim();
  const language = selectedLanguage ?? detectLanguage(message);

  const expertMatch = findExpertMatch(message);
  if (expertMatch?.source === "Systeme expert (securite)") {
    return {
      answer: expertMatch.answers[language],
      language,
      source: expertMatch.source,
      confidence: expertMatch.confidence,
      disclaimer: disclaimer(language),
    };
  }

  const knowledgeMatch = findKnowledgeMatch(message);
  if (knowledgeMatch) {
    return {
      answer: translateDocumentAnswer(knowledgeMatch.entry, language),
      language,
      source: `Base documentaire Alzheimer - ${knowledgeMatch.entry.theme}`,
      confidence: knowledgeMatch.score,
      disclaimer: disclaimer(language),
    };
  }

  if (expertMatch) {
    return {
      answer: expertMatch.answers[language],
      language,
      source: expertMatch.source,
      confidence: expertMatch.confidence,
      disclaimer: disclaimer(language),
    };
  }

  const normalizedMessage = normalize(message);
  if (includesAny(normalizedMessage, ALZHEIMER_TOPIC_KEYWORDS[language])) {
    return {
      answer: defaultAlzheimerReply(language),
      language,
      source: "Systeme expert",
      confidence: 0.72,
      disclaimer: disclaimer(language),
    };
  }

  return {
    answer:
      language === "ar"
        ? "نقدر نعاونك فالأعراض، العلاجات، السلامة، العناية اليومية، التواصل، الوقاية ودعم المرافقين. حاول تسولني سؤال أكثر دقة باش نعطيك جواب أوضح."
        : language === "en"
          ? "I can help with symptoms, treatments, safety, daily care, communication, prevention, and caregiver support. Ask a more specific question for a clearer answer."
          : "Je peux vous aider sur les symptomes, les traitements, la securite, les soins du quotidien, la communication, la prevention et le soutien aux aidants. Posez une question plus precise pour une reponse plus ciblee.",
    language,
    source: "Fallback",
    confidence: 0.42,
    disclaimer: disclaimer(language),
  };
}

export function generateChatbotResponse(userMessage: string, language: ChatLanguage) {
  return generateChatbotReply(userMessage, language).answer;
}
