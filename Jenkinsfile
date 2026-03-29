pipeline {
    agent any

    stages {

        stage('Recuperation du code') {
            steps {
                echo 'Clonage du depot GitHub...'
                git branch: 'develop', url: 'https://github.com/azizatou2000/Groupe5_DevOps.git'
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker...'
                sh 'docker-compose build'
            }
        }

        stage('Deploiement') {
            steps {
                echo 'Arret des anciens conteneurs...'
                sh 'docker-compose down || true'
                echo 'Deploiement avec Docker Compose...'
                sh 'docker-compose up -d'
            }
        }

        stage('Verification du deploiement') {
            steps {
                echo 'Attente du demarrage des services...'
                sh 'sleep 20'
                echo 'Verification des conteneurs...'
                sh 'docker-compose ps'
            }
        }
    }

    post {
        success {
            echo 'Pipeline execute avec succes !'
        }
        failure {
            echo 'Le pipeline a echoue.'
            sh 'docker-compose logs || true'
        }
    }
}