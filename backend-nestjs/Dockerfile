# ---- Producción (single-stage, más compatible con Back4App) ----
FROM node:22.2.0-alpine
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# CACHEBUST fuerza a Back4App a no usar capas cacheadas de builds anteriores
ARG CACHEBUST=1

# Copiar código fuente
COPY . .

# Generar Prisma Client y compilar TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Arranque: aplicar migraciones e iniciar la app compilada
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
