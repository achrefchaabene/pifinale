const EUROPE_PMC_URL =
  'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=TITLE:%22Alzheimer%22%20OR%20ABSTRACT:%22Alzheimer%22&format=json&pageSize=6&sort_date:y';

const FALLBACK_ARTICLES = [
  {
    id: "fallback-1",
    title: "Nouvelles pistes pour mieux comprendre la progression d'Alzheimer",
    summary:
      "Article recent sur les biomarqueurs, l'imagerie cerebrale et les signes precoces a surveiller chez les patients a risque.",
    journal: "Veille scientifique Alzheimer",
    publishedAt: "2026-04-01",
    articleUrl: "https://www.alzheimers.gov/",
    authors: ["Equipe de veille clinique"],
    source: "Fallback",
  },
  {
    id: "fallback-2",
    title: "Memoire, sommeil et prevention: ce que montrent les etudes recentes",
    summary:
      "Une synthese utile pour les patients et les familles sur le sommeil, l'activite physique et la stimulation cognitive.",
    journal: "Revue prevention cognitive",
    publishedAt: "2026-03-15",
    articleUrl: "https://www.nia.nih.gov/health/alzheimers-and-dementia",
    authors: ["Cellule education patient"],
    source: "Fallback",
  },
  {
    id: "fallback-3",
    title: "Imagerie IRM et suivi du declin cognitif: tendances actuelles",
    summary:
      "Point rapide sur les recherches recentes liant les resultats d'IRM aux trajectoires cliniques de la maladie d'Alzheimer.",
    journal: "Observatoire neuro-imagerie",
    publishedAt: "2026-02-20",
    articleUrl: "https://www.alz.org/alzheimers-dementia/research_progress",
    authors: ["Equipe neuro-detect"],
    source: "Fallback",
  },
];

const thumbnailThemes = [
  { start: "#eff6ff", end: "#dbeafe", accent: "#2563eb", pill: "#bfdbfe" },
  { start: "#ecfdf5", end: "#d1fae5", accent: "#059669", pill: "#a7f3d0" },
  { start: "#fff7ed", end: "#ffedd5", accent: "#ea580c", pill: "#fed7aa" },
  { start: "#fef2f2", end: "#fee2e2", accent: "#dc2626", pill: "#fecaca" },
];

const createThumbnail = (title, index) => {
  const theme = thumbnailThemes[index % thumbnailThemes.length];
  const safeTitle = (title || "ALZ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 30);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.start}" />
          <stop offset="100%" stop-color="${theme.end}" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="28" fill="url(#g)" />
      <circle cx="248" cy="74" r="38" fill="${theme.pill}" opacity="0.95" />
      <circle cx="248" cy="74" r="19" fill="${theme.accent}" opacity="0.25" />
      <rect x="32" y="38" width="88" height="24" rx="12" fill="${theme.pill}" />
      <text x="46" y="54" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${theme.accent}">ALZHEIMER</text>
      <text x="32" y="124" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${theme.accent}">Science</text>
      <text x="32" y="154" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#0f172a">${safeTitle}</text>
      <rect x="32" y="182" width="144" height="12" rx="6" fill="${theme.pill}" />
      <rect x="32" y="202" width="108" height="12" rx="6" fill="${theme.pill}" opacity="0.8" />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const normalizeAuthors = (authorString) => {
  if (!authorString) return [];
  return authorString
    .split(/,|;|\band\b/gi)
    .map((author) => author.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const buildArticleUrl = (article) => {
  if (article.doi) return `https://doi.org/${article.doi}`;
  if (article.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`;
  if (article.id) return `https://europepmc.org/article/${article.source || "MED"}/${article.id}`;
  return "https://www.alzheimers.gov/";
};

const normalizeArticle = (article, index) => {
  const publishedAt =
    article.firstPublicationDate ||
    article.onlineDate ||
    article.electronicPublicationDate ||
    article.pubYear ||
    new Date().toISOString().slice(0, 10);

  return {
    id: `${article.source || "epmc"}-${article.id || article.pmid || index}`,
    title: article.title || "Article scientifique recent sur Alzheimer",
    summary:
      article.abstractText ||
      article.abstract ||
      "Consultez cet article scientifique recent pour mieux comprendre l'evolution, les symptomes et le suivi d'Alzheimer.",
    journal: article.journalTitle || article.journal || "Europe PMC",
    publishedAt,
    articleUrl: buildArticleUrl(article),
    authors: normalizeAuthors(article.authorString),
    source: article.source || "Europe PMC",
    imageUrl: createThumbnail(article.title, index),
  };
};

const buildFallbackPayload = () =>
  FALLBACK_ARTICLES.map((article, index) => ({
    ...article,
    imageUrl: createThumbnail(article.title, index),
  }));

exports.getLatestAlzheimerArticles = async (_req, res) => {
  try {
    const response = await fetch(EUROPE_PMC_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "neuro-detect-lab/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Europe PMC request failed with status ${response.status}`);
    }

    const data = await response.json();
    const rawArticles = data?.resultList?.result;

    if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
      throw new Error("No articles returned by Europe PMC");
    }

    const articles = rawArticles.slice(0, 6).map((article, index) => normalizeArticle(article, index));

    res.json({
      articles,
      source: "Europe PMC",
      fallback: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("getLatestAlzheimerArticles error:", error.message);
    res.json({
      articles: buildFallbackPayload(),
      source: "Fallback",
      fallback: true,
      fetchedAt: new Date().toISOString(),
    });
  }
};
