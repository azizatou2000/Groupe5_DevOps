# Bibliothèque Numerique DIT

Plateforme de gestion de la bibliothèque academique du Dakar Institute of Technology.
Architecture microservices avec 3 services Django independants communiquant via API REST.

## Architecture

```
bibliothèque-dit/
├── users-service/          # Microservice Utilisateurs (port 8001)
│   ├── config/             # Settings, URLs, WSGI
│   ├── users/              # Models, Views, Serializers, Auth JWT
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── books-service/          # Microservice Livres (port 8002)
│   ├── config/
│   ├── books/              # Models, Views, Serializers, Auth inter-service
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── borrowings-service/     # Microservice Emprunts (port 8003)
│   ├── config/
│   ├── borrowings/         # Models, Views, Serializers, Client HTTP
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── docker-compose.yml      # Orchestration de tous les services
├── Jenkinsfile             # Pipeline CI/CD
└── README.md
```

## Communication inter-services

Les microservices communiquent entre eux via des appels HTTP REST :

- Le **books-service** valide les tokens JWT en appelant le **users-service** (GET /api/users/me/)
- Le **borrowings-service** valide les tokens via le **users-service**
- Le **borrowings-service** consulte et met a jour les livres via le **books-service** (GET/PATCH /api/books/{id}/)

Tous les services partagent la meme base de donnees PostgreSQL mais ont leurs propres tables.

## Lancement avec Docker Compose

```bash
# Construire et demarrer tous les services
docker-compose up --build -d

# Verifier les logs
docker-compose logs -f

# Logs d'un service specifique
docker-compose logs -f users-service
docker-compose logs -f books-service
docker-compose logs -f borrowings-service

# Arreter tous les services
docker-compose down
```

## Installation locale (sans Docker)

### Pre-requis

- Python 3.10+
- PostgreSQL installe et demarre
- Base de donnees creee : `createdb bibliotheque_dit`

### Demarrer chaque service

Terminal 1 - Users Service :
```bash
cd users-service
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
python manage.py makemigrations users
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

Terminal 2 - Books Service :
```bash
cd books-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations books
python manage.py migrate
python manage.py runserver 8002
```

Terminal 3 - Borrowings Service :
```bash
cd borrowings-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations borrowings
python manage.py migrate
python manage.py runserver 8003
```

## Documentation Swagger

Chaque microservice a sa propre documentation :

- Users Service : http://localhost:8001/swagger/
- Books Service : http://localhost:8002/swagger/
- Borrowings Service : http://localhost:8003/swagger/

## Endpoints

### Users Service (port 8001)

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/token/ | Obtenir un token JWT |
| POST | /api/token/refresh/ | Rafraichir le token |
| POST | /api/users/ | Creer un utilisateur |
| GET | /api/users/ | Lister les utilisateurs |
| GET | /api/users/{id}/ | Consulter un utilisateur |
| GET | /api/users/me/ | Mon profil |
| PATCH | /api/users/me/ | Modifier mon profil |

### Books Service (port 8002)

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/books/ | Lister les livres |
| POST | /api/books/ | Ajouter un livre |
| GET | /api/books/{id}/ | Consulter un livre |
| PUT | /api/books/{id}/ | Modifier un livre |
| DELETE | /api/books/{id}/ | Supprimer un livre |
| GET | /api/books/?search=terme | Recherche titre/auteur/ISBN |

### Borrowings Service (port 8003)

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/borrowings/ | Lister les emprunts |
| POST | /api/borrowings/borrow/ | Emprunter un livre |
| POST | /api/borrowings/{id}/return/ | Retourner un livre |
| GET | /api/borrowings/my-history/ | Mon historique |
| GET | /api/borrowings/late/ | Emprunts en retard |

## Flux d'utilisation

1. Creer un utilisateur : POST sur users-service:8001/api/users/
2. Se connecter : POST sur users-service:8001/api/token/ -> recuperer le token
3. Utiliser le token (Bearer) pour acceder aux books-service et borrowings-service
4. Ajouter des livres : POST sur books-service:8002/api/books/
5. Emprunter un livre : POST sur borrowings-service:8003/api/borrowings/borrow/
6. Retourner un livre : POST sur borrowings-service:8003/api/borrowings/{id}/return/

## Pipeline CI/CD (Jenkins)

Le Jenkinsfile execute :

1. Recuperation du code depuis GitHub
2. Tests unitaires de chaque microservice
3. Build des images Docker
4. Deploiement avec docker-compose
5. Verification de l'accessibilite des 3 services

## Technologies

- Python 3.12 / Django 5.1 / Django REST Framework
- PostgreSQL 16
- JWT (djangorestframework-simplejwt)
- Swagger (drf-yasg)
- Docker / Docker Compose
- Jenkins (CI/CD)
- requests (communication inter-services HTTP)
