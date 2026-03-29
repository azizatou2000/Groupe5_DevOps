pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "biblio"
    }

    stages {

        stage('Recuperation du code') {
            steps {
                echo 'Clonage du depot GitHub...'
                git branch: 'develop', url: 'https://github.com/azizatou2000/Groupe5_DevOps.git'
            }
        }

        stage('Clean Docker') {
            steps {
                echo 'Nettoyage complet de Docker...'
                sh '''
                # Stopper tous les conteneurs biblio (toutes builds confondues)
                docker ps -q --filter "name=biblio" | xargs -r docker stop || true
                docker ps -aq --filter "name=biblio" | xargs -r docker rm || true


                # Down de la stack courante + volumes
                docker-compose down --volumes --remove-orphans || true
                docker system prune -f || true
                '''
            }
        }

        stage('Build & Deploy') {
            steps {
                echo 'Build et lancement des conteneurs...'
                sh '''
                docker-compose up -d --build
                '''
            }
        }

        stage('Verification du deploiement') {
            steps {
                echo 'Attente du demarrage des services...'
                sh 'sleep 20'

                echo 'Etat des conteneurs :'
                sh 'docker-compose ps'

                echo 'Verification rapide des logs :'
                sh 'docker-compose logs --tail=50'
            }
        }
    }

    post {
        success {
            echo 'Pipeline execute avec succes !'
        }

        failure {
            echo 'Le pipeline a echoue. Affichage des logs...'
            sh '''
            docker-compose ps
            docker-compose logs --tail=100
            '''
        }

        always {
            echo 'Nettoyage final (optionnel)...'
        }
    }
}