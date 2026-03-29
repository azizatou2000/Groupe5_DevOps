# Utilisation de Node 20
FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers
COPY . .

# Exposition du port de développement Vite
EXPOSE 5173

# Commande pour lancer Vite en écoutant sur toutes les interfaces (0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]