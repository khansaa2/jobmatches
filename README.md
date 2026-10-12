# JobMatch

JobMatch est une application de gestion des offres d’emploi, de candidature et d’analyse de CV avec assistance prédictive. Le projet est structuré en trois modules :

- un backend Spring Boot pour l’authentification, les utilisateurs, les offres, les candidatures et les prédictions,
- un frontend React pour l’interface utilisateur,
- un service Python FastAPI pour l’analyse automatique des CV et la prédiction des métiers ou postes les plus pertinents.

## Objectif du projet

Le système permet à un utilisateur de :

- s’inscrire et se connecter,
- consulter les offres d’emploi,
- créer, modifier ou gérer des offres si l’utilisateur est administrateur,
- uploader un CV (PDF ou DOCX),
- analyser le CV via un modèle ML,
- obtenir des prédictions et recommandations de postes,
- suivre son historique de prédictions et de candidatures.

## Architecture du projet

### 1. Backend Java / Spring Boot

Dossier : `auth/`

Le backend est développé avec :

- Java 17
- Spring Boot 3.2.3
- Spring Security
- Spring Data JPA
- MySQL
- JWT pour l’authentification

Il expose notamment les API liées à :

- authentification : `/api/auth`
- offres d’emploi : `/api/job-offers`
- candidatures : `/api/job-applications`
- CV : `/api/cvs`
- analyse de CV : `/api/cv-analysis`
- prédictions : `/api/predictions`
- recommandations : `/api/recommendations`

### 2. Frontend React

Dossier : `jobmatches-frontend/`

Le frontend est construit avec :

- React 18
- React Router
- Bootstrap
- Bootstrap Icons
- Axios

Il fournit les écrans de :

- connexion / inscription,
- tableau de bord,
- liste des offres,
- gestion des offres pour l’admin,
- analyse des CV,
- historique des candidatures et recommandations.

### 3. Service ML Python

Dossier : `ml_api/`

Le service est réalisé avec :

- Python
- FastAPI
- scikit-learn
- pandas, numpy
- nltk
- PyPDF2 / python-docx

Ce service charge un modèle Random Forest entraîné sur des données de postes et analyse le texte d’un CV pour renvoyer les meilleurs job titles associés.

---

## Structure du dépôt

```text
pfa/
├── auth/                       # Backend Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── mvnw
├── jobmatches-frontend/        # Frontend React
│   ├── src/
│   ├── package.json
│   └── public/
├── ml_api/                     # API ML / FastAPI
│   ├── main.py
│   ├── train_model.py
│   ├── requirements.txt
│   ├── cv_rf_predictor.pkl
│   └── rf_label_encoder.pkl
├── README.md
└── .github/
```

---

## Prérequis

Avant de lancer le projet, vérifie que tu as bien :

- Java 17+
- Maven ou Maven Wrapper (`mvnw` fourni)
- Node.js 18+
- npm
- Python 3.10+
- MySQL 8

---

## Configuration

### Base de données MySQL

Le backend se connecte à une base MySQL nommée :

- `jobmatchdb`

Le fichier de configuration est :

- `auth/src/main/resources/application.properties`

Il contient par défaut :

- port du backend : `8081`
- URL JDBC MySQL : `jdbc:mysql://localhost:3306/jobmatchdb`
- JWT secret
- CORS autorisé pour `http://localhost:3000`

Assure-toi que MySQL est démarré localement et que la base `jobmatchdb` existe ou est créée automatiquement par Spring.

---

## Lancement du projet

### 1. Démarrer le backend

Dans le dossier `auth/` :

```bash
./mvnw spring-boot:run
```

Sous Windows :

```bash
mvnw.cmd spring-boot:run
```

Le backend démarre sur :

- `http://localhost:8081`

### 2. Démarrer le frontend

Dans le dossier `jobmatches-frontend/` :

```bash
npm install
npm start
```

Le frontend est accessible sur :

- `http://localhost:3000`

### 3. Démarrer le service ML

Dans le dossier `ml_api/` :

```bash
python -m venv venv
source venv/bin/activate    # Linux / Mac
# ou sur Windows : venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Le service ML est accessible sur :

- `http://localhost:8000`

---

## Utilisation

### Pour un utilisateur standard

- inscription,
- connexion,
- consultation des offres,
- dépôt de CV,
- analyse du CV,
- consultation des prédictions et recommandations.

### Pour un administrateur

- publication d’offres d’emploi,
- gestion des offres,
- vérification des candidatures / utilisateurs,
- suivi du système.

---

## Fonctionnement principal

1. L’utilisateur s’inscrit puis se connecte via le backend Spring Security.
2. Le frontend envoie les requêtes vers l’API backend REST.
3. Le backend stocke les données liées à l’utilisateur, aux offres et aux candidatures en base MySQL.
4. Pour l’analyse CV, le backend envoie les informations au service ML FastAPI.
5. Le service ML extrait les sections du CV, normalise le texte et applique le modèle entraîné.
6. Le backend conserve les prédictions et recommandations associées à l’utilisateur.

---

## Re-entraînement du modèle

Le script de formation est disponible dans :

- `ml_api/train_model.py`

Pour le relancer :

```bash
cd ml_api
python train_model.py
```

Ce script construit les fichiers :

- `cv_rf_predictor.pkl`
- `rf_label_encoder.pkl`

---

## Points de vigilance

- La base MySQL doit être accessible avant le lancement du backend.
- Le service ML doit tourner avant les appels de prédiction depuis le backend.
- Le frontend et le backend sont configurés pour communiquer sur `localhost` avec des ports différents : `3000` et `8081`.
- Les dépendances Python doivent être installées dans un environnement virtuel pour éviter les conflits de versions.

---

## Dépendances clés

### Backend

- Spring Boot
- Spring Security
- JPA
- MySQL connector
- JWT

### Frontend

- React
- React Router DOM
- Bootstrap
- Axios

### ML

- FastAPI
- scikit-learn
- pandas
- numpy
- nltk
- PyPDF2
- python-docx

---

## À retenir

Ce projet est un exemple complet de plateforme de recrutement assistée par intelligence artificielle, mélangeant :

- gestion utilisateurs,
- gestion d’offres d’emploi,
- analyse de CV,
- recommandations métier,
- interface web moderne.

C’est un projet de type SaaS interne / application de matching emploi.CV, avec séparation claire entre backend, frontend et moteur ML.

---

## Licence

Ce projet n’indique pas de licence explicite dans le dépôt. À vérifier avant toute diffusion ou mise en production.
