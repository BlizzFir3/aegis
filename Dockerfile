# ==========================================
# Stage 1: Build (Compilation TypeScript)
# ==========================================
FROM node:20-alpine AS builder

# Définition du répertoire de travail
WORKDIR /usr/src/app

# Copie stricte des fichiers nécessaires à l'installation des dépendances
COPY package*.json ./

# Installation complète (incluant les devDependencies nécessaires pour le build)
RUN npm ci

# Copie du code source et de la configuration TypeScript
COPY tsconfig.json ./
COPY src/ ./src/

# Compilation du code (génère le dossier /dist)
RUN npm run build

# ==========================================
# Stage 2: Production (Image finale allégée)
# ==========================================
FROM node:20-alpine AS production

# Variables d'environnement par défaut pour la production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copie uniquement des définitions de paquets
COPY package*.json ./

# Installation UNIQUEMENT des dépendances de production (--omit=dev)
RUN npm ci --omit=dev && npm cache clean --force

# Récupération du dossier compilé depuis l'étape de build
COPY --from=builder /usr/src/app/dist ./dist

# Création d'un utilisateur non-root pour des raisons de sécurité
# (Les processus ne doivent jamais tourner en root dans un conteneur)
RUN chown -R node:node /usr/src/app
USER node

# Le port d'écoute (informatif)
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/server.js"]