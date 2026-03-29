# Bibliothèque Numérique DIT

Plateforme de gestion de la bibliothèque académique du **Dakar Institute of Technology**.
Architecture microservices : 3 services Django indépendants + 1 frontend React, orchestrés par Docker Compose.

---

## Table des matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Démarrage rapide avec Docker Compose](#démarrage-rapide-avec-docker-compose)
4. [Démarrage local sans Docker](#démarrage-local-sans-docker)
5. [Endpoints API](#endpoints-api)
6. [Rôles utilisateurs](#rôles-utilisateurs)
7. [Tests](#tests)
8. [Pipeline CI/CD Jenkins](#pipeline-cicd-jenkins)
9. [Technologies](#technologies)

---

## Architecture

```
Groupe5_DevOps/
├── backend/
│   ├── users-service/        # Gestion des utilisateurs          → port 8000
│   │   ├── config/           # settings.py, urls.py, wsgi.py
│   │   ├── users/            # models, views, serializers, tests
│   │   ├── Dockerfile
│   │   ├── manage.py
│   │   └── requirements.txt
│   ├── books-service/        # Gestion du catalogue de livres    → port 8001
│   │   ├── config/
│   │   ├── books/
│   │   ├── Dockerfile
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── borrowings-service/   # Gestion des emprunts/retours      → port 8002
│       ├── config/
│       ├── borrowings/
│       ├── Dockerfile
│       ├── manage.py
│       └── requirements.txt
├── frontend/                 # Interface React + Vite + Tailwind → port 5173
│   ├── src/
│   │   ├── App.jsx           # Application principale (SPA)
│   │   └── assets/
│   ├── public/               # Fichiers statiques (logo, favicon)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── Jenkinsfile
└── dit_logo.png
```

### Communication inter-services

```
Frontend (5173)
    │
    ├──► Users Service    (8000)   — authentification, création de compte
    ├──► Books Service    (8001)   — catalogue de livres
    └──► Borrowings Service (8002) — emprunts et retours
              │
              └──► Books Service (8001)  — vérifier dispo + mettre à jour les copies
```

Chaque service possède sa propre base de données SQLite. Le service borrowings appelle le service books via HTTP (`BOOKS_SERVICE_URL`) pour vérifier la disponibilité et mettre à jour les stocks.

---

## Compatibilité plateforme

Le projet fonctionne sur **Ubuntu/Linux**, **macOS** et **Windows**. Quelques points à connaître selon votre système :

### Windows

| Problème | Solution |
|----------|----------|
| Fins de ligne CRLF qui cassent les scripts bash dans Docker | Le fichier `.gitattributes` à la racine force automatiquement LF au clone — ne pas le supprimer |
| `source venv/bin/activate` inexistant | Utiliser `venv\Scripts\activate` à la place |
| `python3` introuvable | Utiliser `python` (sans le `3`) — vérifier avec `python --version` |
| Docker ne démarre pas | Installer [Docker Desktop](https://www.docker.com/products/docker-desktop/) avec le backend **WSL2** activé |
| Ports bloqués par le pare-feu | Autoriser les ports 8000, 8001, 8002, 5173 dans Windows Defender |

> **Recommandation Windows** : utiliser Docker Compose plutôt que le mode local. Le développement local sous Windows nécessite WSL2 ou Git Bash pour les commandes `source`.

### macOS (Intel)

Aucune particularité — les commandes du README fonctionnent telles quelles.

### macOS Apple Silicon (M1 / M2 / M3)

Les images Docker Python et Node sont compilées pour `amd64`. Sans précaution elles tournent en émulation (lent) ou refusent de démarrer.

Le `docker-compose.yml` inclut déjà `platform: linux/amd64` sur chaque service pour résoudre ce problème. Si vous voyez l'avertissement `WARNING: The requested image's platform does not match`, c'est normal — Rosetta 2 assure la compatibilité automatiquement.

Pour de meilleures performances sur Apple Silicon, vous pouvez retirer les lignes `platform: linux/amd64` du `docker-compose.yml` : Docker choisira alors l'image ARM native si disponible.

---

## Prérequis

### Pour Docker (recommandé)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24 (Windows / Mac) ou Docker Engine ≥ 24 (Linux)
- Docker Compose ≥ 2 (inclus dans Docker Desktop)

### Pour le développement local
- Python 3.10+
- Node.js 20+ et npm

---

## Démarrage rapide avec Docker Compose

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd Groupe5_DevOps

# Construire et démarrer tous les services
docker-compose up --build -d

# Vérifier que tout tourne
docker-compose ps

# Consulter les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

| Service           | URL                          |
|-------------------|------------------------------|
| Frontend          | http://localhost:5173        |
| Users Service     | http://localhost:8000/swagger/ |
| Books Service     | http://localhost:8001/swagger/ |
| Borrowings Service| http://localhost:8002/swagger/ |

---

## Démarrage local sans Docker

Ouvrir **4 terminaux** depuis la racine du projet.

### Terminal 1 — Users Service (port 8000)

```bash
cd backend/users-service
python3 -m venv venv
source venv/bin/activate          # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Terminal 2 — Books Service (port 8001)

```bash
cd backend/books-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8001
```

### Terminal 3 — Borrowings Service (port 8002)

```bash
cd backend/borrowings-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
BOOKS_SERVICE_URL=http://localhost:8001 python manage.py runserver 0.0.0.0:8002
```

### Terminal 4 — Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Ouvrir **http://localhost:5173** dans le navigateur.

---

## Endpoints API

### Users Service — `http://localhost:8000/api/users`

| Méthode | Endpoint                      | Description                              |
|---------|-------------------------------|------------------------------------------|
| POST    | `/`                           | Créer un compte utilisateur              |
| GET     | `/`                           | Lister tous les utilisateurs             |
| GET     | `/{id}/`                      | Consulter un utilisateur                 |
| GET     | `/me/`                        | Profil de l'utilisateur connecté         |
| PATCH   | `/me/`                        | Modifier son profil                      |
| POST    | `/login/`                     | Authentification (email + mot de passe)  |
| POST    | `/reset-password/`            | Réinitialiser le mot de passe            |

**Exemple — Créer un compte :**
```json
POST /api/users/
{
  "email": "etudiant@dit.sn",
  "password": "motdepasse123",
  "password_confirm": "motdepasse123",
  "first_name": "Amadou",
  "last_name": "Diallo",
  "user_type": "STUDENT"
}
```

**Exemple — Connexion :**
```json
POST /api/users/login/
{
  "email": "etudiant@dit.sn",
  "password": "motdepasse123"
}
→ Retourne les données de l'utilisateur
```

**Exemple — Réinitialisation du mot de passe :**
```json
POST /api/users/reset-password/
{
  "email": "etudiant@dit.sn",
  "new_password": "nouveaumotdepasse123",
  "confirm_password": "nouveaumotdepasse123"
}
```

---

### Books Service — `http://localhost:8001/api/books`

| Méthode | Endpoint                        | Description                             |
|---------|---------------------------------|-----------------------------------------|
| GET     | `/`                             | Lister tous les livres                  |
| POST    | `/`                             | Ajouter un livre                        |
| GET     | `/{id}/`                        | Consulter un livre                      |
| PATCH   | `/{id}/`                        | Modifier un livre                       |
| DELETE  | `/{id}/`                        | Supprimer un livre                      |
| GET     | `/?search=terme`                | Recherche par titre / auteur / ISBN     |
| GET     | `/?available=true`              | Filtrer les livres disponibles          |

**Exemple — Ajouter un livre :**
```json
POST /api/books/
{
  "title": "Python pour les Data Scientists",
  "author": "Moussa Sow",
  "isbn": "978-2-123456-78-9",
  "total_copies": 5
}
```

---

### Borrowings Service — `http://localhost:8002/api/borrowings`

| Méthode | Endpoint              | Description                          |
|---------|-----------------------|--------------------------------------|
| GET     | `/`                   | Lister tous les emprunts             |
| GET     | `/?status=ACTIVE`     | Filtrer par statut (ACTIVE/RETURNED) |
| POST    | `/borrow/`            | Emprunter un livre                   |
| POST    | `/{id}/return/`       | Retourner un livre                   |

**Exemple — Emprunter un livre :**
```json
POST /api/borrowings/borrow/
{
  "book_id": 1,
  "user_id": 42,
  "user_email": "etudiant@dit.sn",
  "due_date": "2026-04-28T00:00:00Z"
}
```

---

## Rôles utilisateurs

Le système gère 3 types de comptes, sélectionnés à la création :

| Rôle        | `user_type`  | Accès                                                              |
|-------------|--------------|---------------------------------------------------------------------|
| Étudiant    | `STUDENT`    | Consulter le catalogue, emprunter un livre, retourner ses emprunts |
| Professeur  | `PROFESSOR`  | Consulter le catalogue, emprunter un livre, retourner ses emprunts |
| Administratif | `ADMIN`    | Accès complet : gestion membres, catalogue, emprunts               |

> Le contrôle des accès est appliqué côté frontend selon le champ `user_type` retourné par `/api/users/login/`.

---

## Tests

Chaque microservice dispose de tests unitaires et d'intégration exécutables indépendamment.

```bash
# Users Service — 17 tests
cd backend/users-service
source venv/bin/activate
python manage.py test --verbosity=2

# Books Service
cd backend/books-service
source venv/bin/activate
python manage.py test --verbosity=2

# Borrowings Service — 11 tests (avec mocks du books-service)
cd backend/borrowings-service
source venv/bin/activate
python manage.py test --verbosity=2
```

Les tests du service borrowings utilisent `unittest.mock.patch` pour simuler les appels HTTP vers le books-service, garantissant des tests isolés et déterministes.

---

## Pipeline CI/CD Jenkins

Le `Jenkinsfile` à la racine du projet définit un pipeline en 5 étapes :

1. **Récupération du code** — `checkout scm`
2. **Tests des 3 microservices** — exécutés en parallèle
3. **Build des images Docker** — `docker-compose build`
4. **Déploiement** — `docker-compose up -d`
5. **Vérification** — health-check sur les 4 services

### Prérequis Jenkins

- Plugin **Pipeline** installé
- Docker et Docker Compose disponibles sur l'agent Jenkins
- Node.js 20 disponible sur l'agent (ou via le plugin NodeJS)

### Configurer le pipeline

1. Créer un nouveau job Jenkins de type **Pipeline**
2. Dans *Pipeline > Definition*, choisir **Pipeline script from SCM**
3. Renseigner l'URL du dépôt Git
4. Le `Jenkinsfile` est automatiquement détecté à la racine

---

## Technologies

| Couche      | Technologie                              |
|-------------|------------------------------------------|
| Backend     | Python 3.10, Django 5, Django REST Framework |
| Base de données | SQLite (par service, embarquée)     |
| Frontend    | React 18, Vite, Tailwind CSS, Axios      |
| API Docs    | Swagger (drf-yasg)                       |
| Auth        | Session par vérification email/password côté serveur (`django.contrib.auth.authenticate`) |
| Conteneurs  | Docker, Docker Compose                   |
| CI/CD       | Jenkins                                  |
| Proxy       | Nginx (frontend en production Docker)    |
