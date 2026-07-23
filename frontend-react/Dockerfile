FROM node:22

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Correr el servidor de desarrollo exponiendo el host
CMD ["npm", "run", "dev", "--", "--host"]
