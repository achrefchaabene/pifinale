"""
NeuroDetect Lab - ML Service
Analyse parallele de plusieurs modeles IA pour la detection de la maladie d'Alzheimer
Le meilleur score est retenu automatiquement
Port : 5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import time
import traceback

app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(os.path.expanduser("~"), "Downloads")

CLASSES = [
    "Non Demented",
    "Very Mild Demented",
    "Mild Demented",
    "Moderate Demented",
]

MODEL_CONFIGS = {
    "BestModel": {
        "candidate_paths": [
            os.path.join(BASE_DIR, "models", "best_model.h5"),
            os.path.join(DOWNLOADS_DIR, "best_model.h5"),
        ],
        "input_size": (224, 224),
        "preprocess": "rescale",
        "description": "Best Model - Modele CNN principal ajoute a la comparaison multi-modele",
    },
    "EfficientNetB0": {
        "candidate_paths": [
            os.path.join(BASE_DIR, "models", "efficientnetb0_alzheimer.h5"),
        ],
        "input_size": (224, 224),
        "preprocess": "efficientnet",
        "description": "EfficientNet-B0 - Architecture legere haute precision",
    },
    "EfficientNetB3": {
        "candidate_paths": [
            os.path.join(BASE_DIR, "models", "efficientnetb3_alzheimer.h5"),
            os.path.join(DOWNLOADS_DIR, "efficientnetb3_alzheimer.h5"),
        ],
        "input_size": (300, 300),
        "preprocess": "efficientnet",
        "description": "EfficientNet-B3 - Variante plus profonde pour une analyse plus fine",
    },
    "AlzheimerCNN": {
        "candidate_paths": [
            os.path.join(BASE_DIR, "models", "alzheimer_cnn_model.h5"),
            os.path.join(DOWNLOADS_DIR, "alzheimer_cnn_model.h5"),
        ],
        "input_size": (224, 224),
        "preprocess": "rescale",
        "description": "CNN Alzheimer - Modele convolutionnel specialise IRM",
    },
    "EfficientNetB4": {
        "candidate_paths": [
            os.path.join(BASE_DIR, "models", "best_model_B4_alzheimer.h5"),
            os.path.join(DOWNLOADS_DIR, "best_model_B4_alzheimer.h5"),
        ],
        "input_size": (380, 380),
        "preprocess": "rescale",
        "description": "EfficientNet-B4 - Modele plus large pour une analyse detaillee",
    },
    "UltraBestModel": {
        "candidate_paths": [
            os.path.join(BASE_DIR, "models", "ultra_best_model.h5"),
            os.path.join(DOWNLOADS_DIR, "ultra_best_model.h5"),
        ],
        "input_size": (224, 224),
        "preprocess": "rescale",
        "description": "Ultra Best Model - Modele additionnel optimise pour la comparaison multi-modele",
    },
}

loaded_models = {}


def resolve_model_path(model_name: str) -> str | None:
    for candidate in MODEL_CONFIGS[model_name]["candidate_paths"]:
        if os.path.exists(candidate):
            return candidate
    return None


def load_all_models():
    """Charge tous les modeles .h5 disponibles."""
    try:
        import tensorflow as tf
        from tensorflow.keras.models import load_model
        from tensorflow.keras.layers import Dense

        print("TensorFlow version:", tf.__version__)

        class CompatibleDense(Dense):
            @classmethod
            def from_config(cls, config):
                config = dict(config)
                config.pop("quantization_config", None)
                return super().from_config(config)

        for name, cfg in MODEL_CONFIGS.items():
            path = resolve_model_path(name)
            if path:
                try:
                    loaded_models[name] = load_model(
                        path,
                        compile=False,
                        custom_objects={"Dense": CompatibleDense},
                    )
                    print(f"  OK {name} charge depuis {path}")
                except Exception as e:
                    print(f"  ECHEC chargement {name}: {e}")
            else:
                expected = ", ".join(cfg["candidate_paths"])
                print(f"  WARNING {name}: fichier introuvable ({expected}) -> mode simulation")
    except ImportError:
        print("  WARNING TensorFlow non installe -> tous les modeles en mode simulation")


def preprocess_image(image_bytes: bytes, model_name: str) -> np.ndarray:
    cfg = MODEL_CONFIGS[model_name]
    size = cfg["input_size"]
    mode = cfg["preprocess"]

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(size, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)

    if mode in {"efficientnet", "rescale"}:
        arr /= 255.0

    return np.expand_dims(arr, axis=0)


def simulate_prediction(model_name: str, image_bytes: bytes) -> list:
    """
    Genere des probabilites realistes basees sur les statistiques de l'image.
    Chaque modele a un biais legerement different pour simuler la diversite.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    arr = np.array(img.resize((64, 64)), dtype=np.float32)
    mean_px = float(np.mean(arr))
    std_px = float(np.std(arr))

    biases = {
        "EfficientNetB0": np.array([4.0, 2.5, 1.5, 1.0]),
        "EfficientNetB3": np.array([4.2, 2.3, 1.7, 1.1]),
        "AlzheimerCNN": np.array([3.8, 2.7, 1.8, 1.2]),
        "EfficientNetB4": np.array([4.35, 2.2, 1.75, 1.05]),
        "UltraBestModel": np.array([4.1, 2.4, 1.85, 1.0]),
    }
    base = biases.get(model_name, np.ones(4))

    brightness_factor = mean_px / 255.0
    contrast_factor = min(std_px / 80.0, 1.0)
    weight = base * (0.6 + brightness_factor * 0.4) * (1.0 - contrast_factor * 0.2)

    seed = int((mean_px * 100 + std_px * 10 + sum(ord(c) for c in model_name)) % 9999)
    np.random.seed(seed)
    probs = np.random.dirichlet(np.maximum(weight, 0.1))
    np.random.seed(None)
    return probs.tolist()


def run_model(model_name: str, image_bytes: bytes) -> dict:
    t0 = time.time()
    mode = "real"

    if model_name in loaded_models:
        try:
            arr = preprocess_image(image_bytes, model_name)
            raw = loaded_models[model_name].predict(arr, verbose=0)[0]
            probs = raw.tolist()
        except Exception as e:
            print(f"  WARNING erreur inference {model_name}: {e}")
            probs = simulate_prediction(model_name, image_bytes)
            mode = "simulated"
    else:
        probs = simulate_prediction(model_name, image_bytes)
        mode = "simulated"

    prob_dict = {cls: round(float(p), 4) for cls, p in zip(CLASSES, probs)}
    best_class = max(prob_dict, key=prob_dict.get)
    confidence = prob_dict[best_class]
    elapsed_ms = round((time.time() - t0) * 1000)

    return {
        "prediction": best_class,
        "confidence": round(confidence, 4),
        "probabilities": prob_dict,
        "inference_time_ms": elapsed_ms,
        "mode": mode,
        "description": MODEL_CONFIGS[model_name]["description"],
    }


def select_best_model(results: dict) -> tuple[str, dict, list[str]]:
    """
    Selection du modele final:
    1. priorite aux modeles reels
    2. a l'interieur du groupe retenu, plus forte confiance
    """
    real_models = [name for name, result in results.items() if result.get("mode") == "real"]
    candidate_names = real_models or list(results.keys())
    ranked = sorted(candidate_names, key=lambda name: results[name]["confidence"], reverse=True)
    best_name = ranked[0]
    return best_name, results[best_name], ranked


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "loaded_models": list(loaded_models.keys()),
        "simulated_models": [m for m in MODEL_CONFIGS if m not in loaded_models],
        "total_models": len(MODEL_CONFIGS),
    })


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "Aucun fichier fourni"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Fichier vide"}), 400

    try:
        image_bytes = file.read()
    except Exception as e:
        return jsonify({"error": f"Impossible de lire le fichier: {e}"}), 400

    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        return jsonify({"error": "Format image invalide"}), 400

    results = {}
    for model_name in MODEL_CONFIGS:
        try:
            results[model_name] = run_model(model_name, image_bytes)
        except Exception as e:
            traceback.print_exc()
            results[model_name] = {
                "prediction": "Non Demented",
                "confidence": 0.25,
                "probabilities": {c: 0.25 for c in CLASSES},
                "inference_time_ms": 0,
                "mode": "error",
                "error": str(e),
                "description": MODEL_CONFIGS[model_name]["description"],
            }

    best_model_name, best, ranked = select_best_model(results)
    total_ms = sum(r.get("inference_time_ms", 0) for r in results.values())
    real_count = sum(1 for result in results.values() if result.get("mode") == "real")
    simulated_count = len(results) - real_count
    selection_note = (
        "Selection prioritaire parmi les modeles reels."
        if real_count > 0
        else "Aucun modele reel disponible, selection parmi les modeles simules."
    )

    return jsonify({
        "prediction": best["prediction"],
        "confidence": best["confidence"],
        "probabilities": best["probabilities"],
        "best_model": best_model_name,
        "explanation": (
            f"Analyse de {len(results)} modeles IA completee en {total_ms}ms. "
            f"{selection_note} "
            f"Modeles reels: {real_count}, modeles simules: {simulated_count}. "
            f"Meilleur resultat : {best_model_name} avec "
            f"{best['confidence'] * 100:.1f}% de confiance pour '{best['prediction']}'."
        ),
        "all_models": results,
        "ranked_models": ranked,
        "total_models": len(results),
        "total_time_ms": total_ms,
    })


if __name__ == "__main__":
    print("\nNeuroDetect Lab - Service ML demarrage")
    print("=" * 50)
    load_all_models()
    print("=" * 50)
    print(f"Service disponible sur http://0.0.0.0:5001 ({len(MODEL_CONFIGS)} modeles configures)\n")
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)
