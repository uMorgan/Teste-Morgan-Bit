# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- Desenvolvimento (hot-reload via tsx watch) ----------
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
# Popula o banco (idempotente) e sobe a API em modo watch
CMD ["sh", "-c", "npm run seed && npm run dev"]

# ---------- Build ----------
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# ---------- Produção (imagem enxuta, sem devDependencies) ----------
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
