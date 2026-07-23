FROM node:22

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
# Copiar el directorio prisma para poder generar el cliente
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Exponer el puerto de NestJS
EXPOSE 3000

# Iniciar en modo desarrollo, corriendo migraciones y seed antes
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:dev"]
