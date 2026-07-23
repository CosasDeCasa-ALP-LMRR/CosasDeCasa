# ---- Base Node ----
FROM node:22.2.0-alpine AS base
WORKDIR /app

# ---- Dependencias ----
FROM base AS deps
COPY package.json package-lock.json ./
# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# ---- Build ----
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar NestJS
RUN npm run build

# Eliminar dependencias de desarrollo para aligerar la imagen
RUN npm prune --production

# ---- Producción ----
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production

# Copiar build, dependencias y prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Script de arranque: Corre migraciones, ejecuta el seed, e inicia el server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
