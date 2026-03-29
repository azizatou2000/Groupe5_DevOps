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
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
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
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
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
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install -r requirements.txt
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker de chaque microservice...'
                sh "${DOCKER_COMPOSE} build --no-cache"
            }
        }

        stage('Deploiement') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                sh """
                    ${DOCKER_COMPOSE} down || true
                    ${DOCKER_COMPOSE} up -d
                """
            }
        }

        stage('Verification du deploiement') {
            steps {
                echo 'Verification que les microservices sont accessibles...'
                sh '''
                    sleep 15
                    echo "Users Service:"
                    curl -f http://localhost:8001/swagger/ || echo "ERREUR"
                    echo "Books Service:"
                    curl -f http://localhost:8002/swagger/ || echo "ERREUR"
                    echo "Borrowings Service:"
                    curl -f http://localhost:8003/swagger/ || echo "ERREUR"
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline execute avec succes ! Tous les microservices sont deployes.'
        }
        failure {
            echo 'Le pipeline a echoue. Verifiez les logs.'
            sh "${DOCKER_COMPOSE} logs"
        }
        always {
            sh 'rm -rf users-service/venv books-service/venv borrowings-service/venv || true'
        }
    }
}
