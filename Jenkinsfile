pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        USERS_PORT     = '8000'
        BOOKS_PORT     = '8001'
        BORROW_PORT    = '8002'
        FRONTEND_PORT  = '5173'
    }

    stages {

        stage('Récupération du code') {
            steps {
                echo 'Clonage du dépôt...'
                checkout scm
            }
        }

        stage('Tests des microservices') {
            parallel {

                stage('Tests — Users Service') {
                    steps {
                        echo 'Tests du microservice Utilisateurs (17 tests)...'
                        dir('backend/users-service') {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install --quiet -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        }
                    }
                }

                stage('Tests — Books Service') {
                    steps {
                        echo 'Tests du microservice Livres...'
                        dir('backend/books-service') {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install --quiet -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        }
                    }
                }

                stage('Tests — Borrowings Service') {
                    steps {
                        echo 'Tests du microservice Emprunts (11 tests, mocks HTTP)...'
                        dir('backend/borrowings-service') {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install --quiet -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        }
                    }
                }

            }
        }

        stage('Build du frontend') {
            steps {
                echo 'Installation des dépendances et build React/Vite...'
                dir('frontend') {
                    sh '''
                        npm ci --silent
                        npm run build
                    '''
                }
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker (users, books, borrowings, frontend)...'
                sh "${DOCKER_COMPOSE} build --no-cache"
            }
        }

        stage('Déploiement') {
            steps {
                echo 'Déploiement avec Docker Compose...'
                sh """
                    ${DOCKER_COMPOSE} down --remove-orphans || true
                    ${DOCKER_COMPOSE} up -d
                """
            }
        }

        stage('Vérification du déploiement') {
            steps {
                echo 'Health-check des 4 services...'
                sh """
                    echo 'Attente du démarrage des services...'
                    sleep 20

                    echo '--- Users Service (port ${USERS_PORT}) ---'
                    curl --fail --silent --max-time 10 http://localhost:${USERS_PORT}/swagger/ \
                        && echo 'OK' || (echo 'ERREUR: users-service inaccessible' && exit 1)

                    echo '--- Books Service (port ${BOOKS_PORT}) ---'
                    curl --fail --silent --max-time 10 http://localhost:${BOOKS_PORT}/swagger/ \
                        && echo 'OK' || (echo 'ERREUR: books-service inaccessible' && exit 1)

                    echo '--- Borrowings Service (port ${BORROW_PORT}) ---'
                    curl --fail --silent --max-time 10 http://localhost:${BORROW_PORT}/swagger/ \
                        && echo 'OK' || (echo 'ERREUR: borrowings-service inaccessible' && exit 1)

                    echo '--- Frontend (port ${FRONTEND_PORT}) ---'
                    curl --fail --silent --max-time 10 http://localhost:${FRONTEND_PORT}/ \
                        && echo 'OK' || (echo 'ERREUR: frontend inaccessible' && exit 1)

                    echo 'Tous les services sont opérationnels.'
                """
            }
        }

    }

    post {
        success {
            echo """
            ✔ Pipeline exécuté avec succès !
            ┌─────────────────────────────────────────┐
            │  Users Service    → http://localhost:${USERS_PORT}  │
            │  Books Service    → http://localhost:${BOOKS_PORT}  │
            │  Borrowings       → http://localhost:${BORROW_PORT}  │
            │  Frontend         → http://localhost:${FRONTEND_PORT} │
            └─────────────────────────────────────────┘
            """
        }
        failure {
            echo 'Le pipeline a échoué. Affichage des logs Docker...'
            sh "${DOCKER_COMPOSE} logs --tail=50 || true"
        }
        always {
            echo 'Nettoyage des environnements virtuels Python...'
            sh '''
                rm -rf backend/users-service/venv \
                       backend/books-service/venv \
                       backend/borrowings-service/venv \
                    || true
            '''
        }
    }
}
