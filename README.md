# NeuroDetect Lab

Plateforme de detection assistee de la maladie d'Alzheimer a partir d'images IRM, avec interface patient, espace medecin, backend Node.js et service Python pour l'analyse IA.

## Apercu

Le projet est organise en 3 parties principales :

- `neuro-detect-lab-main` : frontend React + Vite + TypeScript
- `backend` : API REST Node.js + Express + MongoDB
- `ml_service` : service Python Flask pour l'inference multi-modeles

Fonctionnalites principales :

- authentification patient / medecin
- televersement et analyse d'IRM
- comparaison de plusieurs modeles IA
- historique medical et reanalyse
- messagerie patient-medecin
- rendez-vous
- assistant patient avec rappels, proches et journal
- PWA installable et base mobile Android via Capacitor

## Architecture

```text
Frontend (Vite/React)
        |
        v
Backend API (Express, port 5000)
        |
        v
ML Service (Flask, port 5001)
        |
        v
Modeles .h5 + MongoDB
```

Le frontend appelle l'API backend via `VITE_API_URL`.

Le backend appelle le service ML via `ML_SERVICE_URL` ou, par defaut, `http://localhost:5001`.

## Structure du depot

```text
pifinale/
|-- backend/
|   |-- controllers/
|   |-- models/
|   |-- routes/
|   |-- config/
|   |-- server.js
|   `-- package.json
|-- ml_service/
|   |-- app.py
|   |-- chatbot_service.py
|   |-- models/
|   `-- requirements.txt
|-- neuro-detect-lab-main/
|   |-- src/
|   |-- public/
|   |-- android/
|   `-- package.json
`-- README.md
```

## Technologies

- Frontend : React 18, Vite, TypeScript, Tailwind CSS, React Router, React Query
- Backend : Node.js, Express, Mongoose, Multer, CORS
- ML : Flask, TensorFlow, NumPy, Pillow
- Base de donnees : MongoDB
- Mobile : Capacitor Android

## Prerequis

- Node.js 18+ recommande
- npm
- Python 3.10+ recommande
- MongoDB local ou distant

Optionnel pour Android :

- Android Studio
- Java / SDK Android / Gradle

## Variables d'environnement

### Frontend

Fichier : `neuro-detect-lab-main/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend

Fichier : `backend/.env`

```env
MONGO_URI=mongodb://localhost:27017/neurodb
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:8082,http://127.0.0.1:8082
ML_SERVICE_URL=http://localhost:5001
```

Note : `ML_SERVICE_URL` est optionnelle dans le code, mais il est conseille de la definir explicitement.

## Installation

### 1. Frontend

```bash
cd neuro-detect-lab-main
npm install
```

### 2. Backend

```bash
cd backend
npm install
```

### 3. Service ML

```bash
cd ml_service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Lancement en developpement

Ouvrir 3 terminaux.

### Terminal 1 : service ML

```bash
cd ml_service
.venv\Scripts\activate
python app.py
```

Service disponible sur `http://localhost:5001`

### Terminal 2 : backend

```bash
cd backend
npm run dev
```

API disponible sur `http://localhost:5000`

### Terminal 3 : frontend

```bash
cd neuro-detect-lab-main
npm run dev
```

Application disponible en general sur `http://localhost:8080` ou le port Vite affiche dans le terminal.

## Endpoints utiles

### Backend

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/predict`
- `GET /api/history`
- `GET /api/patients`
- `GET /api/patients/:id/irm`
- `POST /api/patient/:id/reanalyze`
- `GET /api/assistant/me`
- `POST /api/appointments`

### ML service

- `GET /health`
- `POST /predict`

## Comptes et roles

Le systeme gere au minimum 2 roles :

- `user` : patient
- `doctor` : medecin

Le backend retourne actuellement un `token` simplifie base sur l'identifiant utilisateur. Il s'agit d'une logique de developpement et non d'une authentification JWT complete.

## Analyse IA

Le service `ml_service` charge plusieurs modeles `.h5` si disponibles :

- `BestModel`
- `EfficientNetB0`
- `EfficientNetB3`
- `AlzheimerCNN`
- `EfficientNetB4`
- `UltraBestModel`

Si certains modeles ou TensorFlow ne sont pas disponibles, le service passe en mode simulation pour permettre au projet de continuer a fonctionner.

Les classes predites sont :

- `Non Demented`
- `Very Mild Demented`
- `Mild Demented`
- `Moderate Demented`

## Tests et scripts utiles

### Frontend

```bash
cd neuro-detect-lab-main
npm run dev
npm run build
npm run test
npm run lint
```

### Backend

```bash
cd backend
npm run dev
npm start
```

## Android / PWA

Le frontend inclut :

- une PWA installable
- un `service worker`
- une page de telechargement APK
- une configuration Capacitor Android

Pour preparer la version Android :

```bash
cd neuro-detect-lab-main
npm run build
npx cap sync android
```

Puis ouvrir le dossier `android/` dans Android Studio.

## Points d'attention

- le depot contient des dossiers `node_modules`, fichiers de build et artefacts locaux qui ne sont normalement pas versionnes
- plusieurs routes et messages melangent francais et anglais
- l'authentification est volontairement simple pour le developpement
- le service ML peut fonctionner en mode reel ou en mode simule selon les modeles disponibles

## Ameliorations possibles

- ajouter une vraie authentification JWT + hash des mots de passe
- separer les configurations dev / prod
- ajouter Docker Compose pour lancer les 3 services
- ajouter des tests backend et des tests d'integration
- nettoyer les fichiers generes du depot
- documenter un jeu de donnees de demonstration

## Auteur

Projet de fin d'etudes / PFA autour de la detection d'Alzheimer et du suivi patient-medecin.
