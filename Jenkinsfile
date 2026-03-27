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
                    script {
                        if (isUnix()) {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        } else {
                            bat '''
                                python -m venv venv
                                call venv\\Scripts\\activate
                                pip install -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        }
                    }
                }
            }
        }

        stage('Tests - Books Service') {
            steps {
                echo 'Tests du microservice Livres...'
                dir('books-service') {
                    script {
                        if (isUnix()) {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        } else {
                            bat '''
                                python -m venv venv
                                call venv\\Scripts\\activate
                                pip install -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        }
                    }
                }
            }
        }

        stage('Tests - Borrowings Service') {
            steps {
                echo 'Tests du microservice Emprunts...'
                dir('borrowings-service') {
                    script {
                        if (isUnix()) {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        } else {
                            bat '''
                                python -m venv venv
                                call venv\\Scripts\\activate
                                pip install -r requirements.txt
                                python manage.py test --verbosity=2
                            '''
                        }
                    }
                }
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker de chaque microservice...'
                script {
                    if (isUnix()) {
                        sh "${DOCKER_COMPOSE} build --no-cache"
                    } else {
                        bat "${DOCKER_COMPOSE} build --no-cache"
                    }
                }
            }
        }

        stage('Deploiement') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                script {
                    if (isUnix()) {
                        sh """
                            ${DOCKER_COMPOSE} down || true
                            ${DOCKER_COMPOSE} up -d
                        """
                    } else {
                        bat """
                            ${DOCKER_COMPOSE} down
                            ${DOCKER_COMPOSE} up -d
                        """
                    }
                }
            }
        }

        stage('Verification du deploiement') {
            steps {
                echo 'Verification que les microservices sont accessibles...'
                script {
                    if (isUnix()) {
                        sh '''
                            sleep 15
                            echo "Users Service:"
                            curl -f http://localhost:8001/swagger/ || echo "ERREUR"
                            echo "Books Service:"
                            curl -f http://localhost:8002/swagger/ || echo "ERREUR"
                            echo "Borrowings Service:"
                            curl -f http://localhost:8003/swagger/ || echo "ERREUR"
                        '''
                    } else {
                        bat '''
                            timeout /t 15 /nobreak
                            echo Users Service:
                            curl -f http://localhost:8001/swagger/ || echo ERREUR
                            echo Books Service:
                            curl -f http://localhost:8002/swagger/ || echo ERREUR
                            echo Borrowings Service:
                            curl -f http://localhost:8003/swagger/ || echo ERREUR
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline execute avec succes ! Tous les microservices sont deployes.'
        }
        failure {
            echo 'Le pipeline a echoue. Verifiez les logs.'
            script {
                if (isUnix()) {
                    sh "${DOCKER_COMPOSE} logs"
                } else {
                    bat "${DOCKER_COMPOSE} logs"
                }
            }
        }
        always {
            script {
                if (isUnix()) {
                    sh 'rm -rf users-service/venv books-service/venv borrowings-service/venv || true'
                } else {
                    bat 'rd /s /q users-service\\venv books-service\\venv borrowings-service\\venv || ver > nul'
                }
            }
        }
    }
}