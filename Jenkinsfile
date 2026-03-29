pipeline {
    agent any

    stages {

        stage('Recuperation du code') {
            steps {
                echo 'Clonage du depot GitHub...'
                checkout scm
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker de chaque microservice...'
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
            echo 'Pipeline execute avec succes ! Tous les microservices sont deployes.'
        }
        failure {
            echo 'Le pipeline a echoue. Verifiez les logs.'
            sh 'docker-compose logs || true'
        }
    }
}
```

Remplace le contenu de ton Jenkinsfile par ca, puis :
```
git add Jenkinsfile
git commit -m "Jenkinsfile simplifie pour Jenkins Docker"
git push