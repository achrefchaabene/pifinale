from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from typing import Any


DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chatbot_data.json")

LANGUAGE_ALIASES = {
    "fr": "fr",
    "fr-fr": "fr",
    "french": "fr",
    "ar": "ar",
    "ar-ma": "ar",
    "darija": "ar",
    "arabic": "ar",
    "en": "en",
    "en-us": "en",
    "english": "en",
}

STOPWORDS = {
    "fr": {"le", "la", "les", "de", "des", "du", "un", "une", "et", "ou", "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "dans", "pour", "avec", "sur", "que", "quoi", "comment", "est", "sont", "mon", "ma", "mes", "au", "aux"},
    "en": {"the", "a", "an", "and", "or", "to", "for", "with", "of", "is", "are", "what", "how", "i", "you", "my", "in", "on", "at"},
    "ar": {"شنو", "كيفاش", "واش", "مع", "في", "فال", "على", "من", "ديال", "الى", "ولا", "انا", "هو", "هي"},
}

ALZHEIMER_TOPIC_KEYWORDS = {
    "fr": ["alzheimer", "maladie d'alzheimer", "maladie alzheimer", "demence", "memoire"],
    "en": ["alzheimer", "alzheimer's", "dementia", "memory loss"],
    "ar": ["الزهايمر", "ألزهايمر", "الخرف", "النسيان"],
}

EXPERT_RULES = [
    {
        "intent": "emergency",
        "keywords": [
            "tombe", "tombé", "chute", "inconscient", "ne se reveille pas", "ne parle plus",
            "sang", "urgence", "grave", "etouffe", "stroke", "unconscious", "bleeding", "fall",
            "طيحة", "خطر", "مستعجلة", "ما كيهضرش", "ما كايفيقش",
        ],
        "responses": {
            "fr": "En cas de chute, perte de connaissance, difficulte a respirer ou saignement important, appelez immediatement les urgences. Ne deplacez pas la personne sans verifier sa respiration.",
            "ar": "إلى كان سقوط، فقدان الوعي، صعوبة فالتنفس، ولا نزيف مهم، خاص الاتصال بالإسعاف فورا ومراقبة التنفس.",
            "en": "If there is a fall, loss of consciousness, breathing difficulty, or major bleeding, call emergency services immediately and check breathing before moving the person.",
        },
        "source": "Systeme expert",
    },
    {
        "intent": "symptoms",
        "keywords": ["symptome", "symptômes", "signe", "oubli", "memoire", "diagnostic", "اعراض", "تشخيص", "symptom", "memory"],
        "responses": {
            "fr": "Les signes frequents incluent les oublis repetes, la desorientation, les difficultes de langage et certains changements de comportement. Le diagnostic doit etre confirme par un medecin.",
            "ar": "من الاعراض الشائعة النسيان المتكرر، التيه، صعوبات اللغة، وتغيرات فالسلوك. التشخيص النهائي خاصو يكون عند الطبيب.",
            "en": "Common signs include repeated forgetfulness, disorientation, language difficulty, and behavior changes. A clinician should confirm the diagnosis.",
        },
        "source": "Systeme expert",
    },
    {
        "intent": "behavior",
        "keywords": ["agressif", "agite", "colere", "crie", "frappe", "violent", "عنيف", "صياح", "agitated", "aggressive"],
        "responses": {
            "fr": "Face a l'agitation, gardez une voix calme, evitez la contradiction et reduisez les stimulations autour du patient. Essayez de rediriger son attention vers quelque chose de familier.",
            "ar": "إلى كان المريض معصب ولا عدواني، بقا هادئ، ما تعاندوش، ونقص الضجيج وحول الانتباه ديالو لشي حاجة مألوفة.",
            "en": "If the patient is agitated, stay calm, avoid arguing, reduce stimulation, and redirect attention toward something familiar.",
        },
        "source": "Systeme expert",
    },
    {
        "intent": "treatment",
        "keywords": ["medicament", "traitement", "ordonnance", "pilule", "دواء", "medicine", "treatment", "drug"],
        "responses": {
            "fr": "Les traitements actuels peuvent ralentir certains symptomes sans guerir la maladie. Ils doivent etre prescrits et suivis par un specialiste.",
            "ar": "العلاجات الحالية كتقدر تخفف بعض الاعراض ولكن ما كتشافيش المرض، ولازم تكون تحت متابعة طبيب مختص.",
            "en": "Current treatments may slow some symptoms but do not cure the disease, and they should be managed by a specialist.",
        },
        "source": "Systeme expert",
    },
    {
        "intent": "caregiver",
        "keywords": ["fatigue", "epuise", "burn-out", "n'en peux plus", "تعبت", "فديت", "caregiver", "exhausted"],
        "responses": {
            "fr": "Votre sante compte aussi. Essayez d'obtenir du relais, de programmer des pauses et de demander de l'aide a votre entourage ou a une structure de soutien.",
            "ar": "الصحة ديالك مهمة حتى هي. حاول تلقى من يبدلك شوية، دير راحة، وطلب الدعم من العائلة ولا من المختصين.",
            "en": "Your health matters too. Try to get backup support, schedule breaks, and ask family or care services for help.",
        },
        "source": "Systeme expert",
    },
]


def normalize_language(language: str | None) -> str:
    if not language:
        return "fr"
    return LANGUAGE_ALIASES.get(language.strip().lower(), "fr")


def detect_language(message: str) -> str:
    if re.search(r"[\u0600-\u06FF]", message):
        return "ar"

    lowered = message.lower()
    english_markers = ["what", "how", "help", "treatment", "memory", "patient", "caregiver"]
    if any(marker in lowered for marker in english_markers):
        return "en"
    return "fr"


def tokenize(text: str, language: str) -> set[str]:
    tokens = re.findall(r"[\w\u0600-\u06FF']+", text.lower())
    stopwords = STOPWORDS.get(language, set())
    return {token for token in tokens if len(token) > 1 and token not in stopwords}


def lexical_similarity(query: str, candidate: str, language: str) -> float:
    query_tokens = tokenize(query, language)
    candidate_tokens = tokenize(candidate, language)
    if not query_tokens or not candidate_tokens:
        return 0.0

    overlap = len(query_tokens & candidate_tokens)
    return (2 * overlap) / (len(query_tokens) + len(candidate_tokens))


@lru_cache(maxsize=1)
def load_knowledge_base() -> list[dict[str, Any]]:
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def expert_system_filter(message: str, language: str) -> dict[str, str] | None:
    normalized = message.lower()
    for rule in EXPERT_RULES:
        if any(keyword in normalized for keyword in rule["keywords"]):
            return {
                "answer": rule["responses"][language],
                "source": rule["source"],
                "intent": rule["intent"],
            }
    return None


def is_alzheimer_topic(message: str, language: str) -> bool:
    normalized = message.lower()
    return any(keyword in normalized for keyword in ALZHEIMER_TOPIC_KEYWORDS.get(language, []))


def default_alzheimer_response(language: str) -> str:
    responses = {
        "fr": "La maladie d'Alzheimer touche surtout la memoire, l'orientation, le langage et certains comportements. Les symptomes frequents sont les oublis repetes, la confusion dans le temps ou l'espace, les difficultes a trouver les mots et des changements d'humeur ou d'autonomie.",
        "ar": "مرض الزهايمر كيأثر خصوصا على الذاكرة، التوجه، اللغة، وبعض السلوكات. من الأعراض الشائعة النسيان المتكرر، التخلاط فالزمان ولا المكان، صعوبة فإيجاد الكلمات، وتغيرات فالمزاج ولا فالاستقلالية.",
        "en": "Alzheimer's disease mainly affects memory, orientation, language, and behavior. Common symptoms include repeated forgetfulness, confusion about time or place, word-finding difficulty, and changes in mood or independence.",
    }
    return responses[language]


def semantic_match(message: str, language: str) -> tuple[dict[str, Any] | None, float]:
    knowledge = load_knowledge_base()
    best_item = None
    best_score = 0.0

    question_key = {
        "fr": "question_fr",
        "ar": "question_darija",
        "en": "question_en",
    }[language]

    for item in knowledge:
        score = lexical_similarity(message, item[question_key], language)
        if score > best_score:
            best_item = item
            best_score = score

    return best_item, best_score


def build_response(message: str, language: str | None = None) -> dict[str, Any]:
    clean_message = (message or "").strip()
    if not clean_message:
        raise ValueError("Le message est vide.")

    final_language = normalize_language(language) if language else detect_language(clean_message)

    expert_response = expert_system_filter(clean_message, final_language)
    if expert_response:
        return {
            "answer": expert_response["answer"],
            "language": final_language,
            "source": expert_response["source"],
            "confidence": 1.0,
            "matched_question": None,
            "disclaimer": medical_disclaimer(final_language),
        }

    if is_alzheimer_topic(clean_message, final_language):
        return {
            "answer": default_alzheimer_response(final_language),
            "language": final_language,
            "source": "Systeme expert",
            "confidence": 0.78,
            "matched_question": None,
            "disclaimer": medical_disclaimer(final_language),
        }

    matched_item, score = semantic_match(clean_message, final_language)
    if matched_item and score >= 0.18:
        answer_key = {
            "fr": "answer_fr",
            "ar": "answer_darija",
            "en": "answer_en",
        }[final_language]
        question_key = {
            "fr": "question_fr",
            "ar": "question_darija",
            "en": "question_en",
        }[final_language]
        return {
            "answer": matched_item[answer_key],
            "language": final_language,
            "source": "Base de connaissances",
            "confidence": round(score, 3),
            "matched_question": matched_item[question_key],
            "disclaimer": medical_disclaimer(final_language),
        }

    fallback_messages = {
        "fr": "Je peux vous aider sur les symptomes, les traitements, la communication, les activites, la prevention et le soutien aux aidants. Posez une question plus precise si vous voulez une reponse mieux ciblee.",
        "ar": "نقدر نعاونك فالأعراض، العلاجات، التواصل، الأنشطة، الوقاية، ودعم المرافقين. سولني سؤال أكثر دقة باش نعطيك جواب أوضح.",
        "en": "I can help with symptoms, treatments, communication, activities, prevention, and caregiver support. Ask a more specific question for a more targeted answer.",
    }

    return {
        "answer": fallback_messages[final_language],
        "language": final_language,
        "source": "Fallback",
        "confidence": round(score, 3),
        "matched_question": None,
        "disclaimer": medical_disclaimer(final_language),
    }


def medical_disclaimer(language: str) -> str:
    disclaimers = {
        "fr": "Cette reponse ne remplace pas une consultation medicale.",
        "ar": "هذا الجواب ما كيبدلش الاستشارة الطبية.",
        "en": "This answer does not replace professional medical care.",
    }
    return disclaimers[language]
