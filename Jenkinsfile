pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
    }

    stages {
        stage('Recuperation du code') {
            steps {
                echo 'Clonage du depot GitHub...'
                checkout scm
            }
        }

        stage('Tests - Users Service') {
            steps {
                echo 'Tests du microservice Utilisateurs...'
                dir('users-service') {
                    // On force BAT car nous sommes sur Windows
                    bat '''
                        python -m venv venv
                        call venv\\Scripts\\activate
                        pip install -r requirements.txt
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        stage('Tests - Books Service') {
            steps {
                echo 'Tests du microservice Livres...'
                dir('books-service') {
                    bat '''
                        python -m venv venv
                        call venv\\Scripts\\activate
                        pip install -r requirements.txt
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        stage('Tests - Borrowings Service') {
            steps {
                echo 'Tests du microservice Emprunts...'
                dir('borrowings-service') {
                    bat '''
                        python -m venv venv
                        call venv\\Scripts\\activate
                        pip install -r requirements.txt
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker de chaque microservice...'
                bat "${DOCKER_COMPOSE} build --no-cache"
            }
        }

        stage('Deploiement') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                bat """
                    ${DOCKER_COMPOSE} down
                    ${DOCKER_COMPOSE} up -d
                """
            }
        }

        stage('Verification du deploiement') {
            steps {
                echo 'Verification que les microservices sont accessibles...'
                // timeout est l'equivalent de sleep sur Windows
                bat '''
                    timeout /t 20 /nobreak
                    echo "Users Service:"
                    curl -I http://localhost:8001/swagger/ || echo "ERREUR"
                    echo "Books Service:"
                    curl -I http://localhost:8002/swagger/ || echo "ERREUR"
                    echo "Borrowings Service:"
                    curl -I http://localhost:8003/swagger/ || echo "ERREUR"
                '''
            }
        }
    }

    post {
        success {
            echo ' Pipeline execute avec succes ! Tous les microservices sont deployes.'
        }
        failure {
            echo ' Le pipeline a echoue. Verifiez les logs.'
            bat "${DOCKER_COMPOSE} logs"
        }
        always {
            // Nettoyage des dossiers venv (format Windows)
            bat 'if exist users-service\\venv rd /s /q users-service\\venv'
            bat 'if exist books-service\\venv rd /s /q books-service\\venv'
            bat 'if exist borrowings-service\\venv rd /s /q borrowings-service\\venv'
        }
    }
}